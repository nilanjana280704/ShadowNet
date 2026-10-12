/**
 * CommunicationManager — the orchestration layer. It wires the transport
 * manager, discovery, connection, routing, encryption, and message services
 * into one engine and exposes a small high-level API (discover, connect, send,
 * broadcast). It re-emits normalized CommEvents and maintains a derived network
 * state. Nothing above this layer knows a transport exists.
 */
import EventEmitter from '../core/EventEmitter';
import {
  CommEvent,
  ConnectionState,
  TRANSPORT_META,
  TransportEvent,
  TransportState,
} from '../core/constants';
import { networkHealthScore } from '../core/metrics';
import { COMM_CONFIG } from '../../config';
import { buildIdentityAnnouncement, isValidIdentityPayload, PacketType, serialize } from '../protocol/packet';
import NetworkSimulator from '../simulation/NetworkSimulator';
import TransportManager from './TransportManager';
import DeviceDiscoveryService, { DiscoveryEvent } from '../discovery/DeviceDiscoveryService';
import ConnectionManager, { ConnectionEvent } from '../connection/ConnectionManager';
import RoutingService from '../routing/RoutingService';
import EncryptionService from '../security/EncryptionService';
import MessageQueue from '../message/MessageQueue';
import MessageQueueService from '../message/MessageQueueService';
import RetryService from '../message/RetryService';
import commStorage from '../storage/commStorage';

export default class CommunicationManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.simulator = options.simulator || new NetworkSimulator();
    this.transportManager = new TransportManager(this.simulator);
    this.discovery = new DeviceDiscoveryService(this.transportManager);
    // Real Wi-Fi Direct/BLE connects can legitimately take much longer than the
    // ConnectionManager default (see COMM_CONFIG.connectTimeoutMs for why).
    this.connectionManager = new ConnectionManager(this.transportManager, {
      timeoutMs: COMM_CONFIG.connectTimeoutMs,
    });
    this.routing = new RoutingService();
    this.encryption = new EncryptionService();
    this.queue = new MessageQueue();
    this.messages = new MessageQueueService({
      queue: this.queue,
      encryption: this.encryption,
      routing: this.routing,
      connectionManager: this.connectionManager,
      transportManager: this.transportManager,
      retry: new RetryService(),
      getDevice: (id) => this.discovery.getDevice(id),
      getDevices: () => this.discovery.getDevices(),
    });

    this.initialized = false;
    this._restoredNetworkState = null;
    // The real authenticated local identity to announce on connect, set from
    // outside (Redux knows the signed-in user; this engine never touches
    // auth directly). Null until the app sets it — nothing is announced
    // before then, never a fabricated identity.
    this.localIdentity = null;
    this._wireEvents();
  }

  /**
   * Set the real local identity to announce to peers after connecting.
   * @param {{userId:string, displayName:string}|null} identity
   */
  setLocalIdentity(identity) {
    this.localIdentity = isValidIdentityPayload(identity) ? identity : null;
  }

  /** Best-effort, fire-and-forget identity announcement over a fresh connection. */
  _announceIdentity(device, transport) {
    if (!this.localIdentity || !device?.id || !transport) return;
    const wire = serialize(
      buildIdentityAnnouncement({
        from: this.localIdentity.userId,
        to: device.id,
        userId: this.localIdentity.userId,
        displayName: this.localIdentity.displayName,
      })
    );
    this.transportManager.send(transport, device.id, wire).catch(() => {
      // Best-effort: if this fails the peer simply stays unverified for now;
      // it is re-sent on every future (re)connection to that device.
    });
  }

  _wireEvents() {
    this.discovery.on(DiscoveryEvent.FOUND, (d) => {
      this.emit(CommEvent.DEVICE_DISCOVERED, d);
      this._emitNetworkState();
      // Network regained a reachable peer — resume any pending transmissions.
      this.messages.resume();
    });
    this.discovery.on(DiscoveryEvent.UPDATED, (d) => this.emit(CommEvent.DEVICE_UPDATED, d));
    this.discovery.on(DiscoveryEvent.LOST, (d) => {
      this.emit(CommEvent.DEVICE_LOST, d);
      this._emitNetworkState();
    });
    this.connectionManager.on(ConnectionEvent.CHANGED, (c) => {
      this.emit(CommEvent.CONNECTION_CHANGED, c);
      this._emitNetworkState();
      // A live connection means the network is back — flush pending messages,
      // and let this peer know who we really are (one-time per connection).
      if (c.state === ConnectionState.CONNECTED) {
        this.messages.resume();
        this._announceIdentity(c.device, c.transport);
      }
    });
    this.routing.on(CommEvent.ROUTE_CHANGED, (r) => this.emit(CommEvent.ROUTE_CHANGED, r));
    this.messages.on(CommEvent.MESSAGE_QUEUED, (m) => this.emit(CommEvent.MESSAGE_QUEUED, m));
    this.messages.on(CommEvent.MESSAGE_UPDATED, (m) => this.emit(CommEvent.MESSAGE_UPDATED, m));
    this.messages.on(CommEvent.MESSAGE_RECEIVED, (m) => this.emit(CommEvent.MESSAGE_RECEIVED, m));

    // Real inbound frames from peers (native transports emit these). A parsed
    // protocol packet is surfaced as MESSAGE_RECEIVED so the app can route it
    // (chat / SOS / broadcast) — this is how Phone B actually receives Phone A's
    // message. The mock simulator's per-packet delivery echo (`kind: 'ack'`) is
    // routed to MessageQueueService.acknowledge() below instead of being
    // ignored — it is a real (simulated) delivery signal, not a fabricated one.
    this.transportManager.on(TransportEvent.MESSAGE, (event) => {
      if (event?.kind === 'ack') {
        this.messages.acknowledge(event.packetId);
        return;
      }
      if (event?.kind !== 'inbound' || !event.packet) return;

      // Identity packets are a control message, not user content — validate
      // and surface as PEER_IDENTIFIED, never as a chat/SOS/broadcast message.
      if (event.packet.type === PacketType.IDENTITY) {
        if (isValidIdentityPayload(event.packet.payload)) {
          this.emit(CommEvent.PEER_IDENTIFIED, {
            deviceId: event.deviceId,
            userId: event.packet.payload.userId,
            displayName: event.packet.payload.displayName,
            verifiedAt: Date.now(),
          });
        }
        return;
      }

      this.emit(CommEvent.MESSAGE_RECEIVED, {
        from: event.packet.from,
        deviceId: event.deviceId,
        transport: event.transport,
        packet: event.packet,
      });
    });

    // Real per-packet delivery confirmation (currently native Wi-Fi Direct
    // only — its transport-level ack frame). Native BLE and mock's other paths
    // have no equivalent signal, so messages sent over them simply stay at
    // DELIVERED rather than being fabricated into ACKNOWLEDGED.
    this.transportManager.on(TransportEvent.MESSAGE_ACKNOWLEDGED, (event) => {
      this.messages.acknowledge(event?.packetId);
    });
  }

  async initialize() {
    if (this.initialized) return;
    await this.transportManager.initialize();
    await this._restoreState();
    this.initialized = true;
    this.emit(CommEvent.ENGINE_STATE, { initialized: true });
    this._emitNetworkState();
  }

  /**
   * Rehydrate persisted engine state (best-effort) so a restart resumes where
   * it left off. Order matters: known devices are seeded before messages so a
   * restored message can resolve its target and route; then the outgoing/retry/
   * pending-ack queues are restored and delivery is resumed. If the network is
   * not yet up, resumed messages fall into the retry queue and are re-driven
   * automatically when a peer is discovered or a connection is established
   * (see _wireEvents → messages.resume()).
   */
  async _restoreState() {
    let persisted;
    try {
      persisted = await commStorage.load();
    } catch {
      return;
    }
    if (!persisted) return;

    this.discovery.restore(persisted.knownDevices);
    this._restoredNetworkState = persisted.networkState || null;
    this.messages.restore(persisted);
    // Reconnect + resume: pending transmissions reconnect on demand as they drain.
    this.messages.resume();
  }

  startDiscovery() {
    // Live discovery supersedes any restored snapshot; drop it so it can't go stale.
    this._restoredNetworkState = null;
    this.discovery.start();
  }

  stopDiscovery() {
    this.discovery.stop();
  }

  connect(deviceId) {
    const device = this.discovery.getDevice(deviceId);
    if (!device) return Promise.reject(new Error(`Unknown device ${deviceId}`));
    return this.connectionManager.connect(device);
  }

  disconnect(deviceId) {
    return this.connectionManager.disconnect(deviceId);
  }

  send(to, text, options) {
    return this.messages.send(to, text, options);
  }

  broadcast(text, options) {
    return this.messages.broadcast(text, options);
  }

  getNetworkState() {
    const statuses = this.transportManager.getStatuses();
    const online = statuses.filter((s) => s.state !== TransportState.UNAVAILABLE && s.state !== TransportState.UNINITIALIZED);
    const deviceCount = this.discovery.getDevices().length;
    // Cold restart, before any live signal: surface the last persisted network
    // state so the app shows last-known context until discovery repopulates.
    if (this._restoredNetworkState && online.length === 0 && deviceCount === 0 && !this.discovery.isDiscovering()) {
      return this._restoredNetworkState;
    }
    const connections = this.connectionManager.getConnections();
    const connected = connections.filter((c) => c.state === ConnectionState.CONNECTED);
    const activeTransport = connected.length > 0
      ? [...connected].sort((a, b) => TRANSPORT_META[a.transport].priority - TRANSPORT_META[b.transport].priority)[0].transport
      : online.find((s) => s.state === TransportState.DISCOVERING)?.type || online[0]?.type || null;
    const coverageM = online.reduce((max, s) => Math.max(max, TRANSPORT_META[s.type].maxRangeM), 0);

    const state = {
      online: online.length > 0,
      activeTransport,
      transports: statuses,
      deviceCount,
      connectedCount: connected.length,
      coverageM,
      discovering: this.discovery.isDiscovering(),
    };
    // Rule-based intelligence: graded health for dashboards (see core/metrics).
    state.health = networkHealthScore(state);
    return state;
  }

  _emitNetworkState() {
    this.emit(CommEvent.NETWORK_STATE, this.getNetworkState());
  }

  getSnapshot() {
    return {
      initialized: this.initialized,
      transports: this.transportManager.getStatuses(),
      devices: this.discovery.getDevices(),
      connections: this.connectionManager.getConnections(),
      routes: this.routing.getLastRoutes(),
      messages: this.queue.snapshot(),
      networkState: this.getNetworkState(),
    };
  }

  async dispose() {
    this.stopDiscovery();
    this.messages.dispose();
    await this.transportManager.dispose();
    this.simulator.dispose();
    this.removeAllListeners();
    this.initialized = false;
  }
}
