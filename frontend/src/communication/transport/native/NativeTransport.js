/**
 * NativeTransport — real transport implementation over the Android native
 * bridge. Extends BaseTransport (NOT MockTransport), implements the exact
 * ITransport surface, and translates native events into the same TransportEvent
 * stream the rest of the engine already consumes. Because it emits identical
 * events, discovery, connection management, routing, and the UI light up with
 * live data with zero changes above the transport layer.
 *
 * Wi-Fi Direct and BLE share this class; only the transport type differs
 * (NativeWifiDirectTransport / NativeBleTransport set it).
 */
import BaseTransport from '../BaseTransport';
import { TransportEvent, TransportState } from '../../core/constants';
import { debugLog } from '../../core/debugLog';
import { parsePacket } from '../../protocol/packet';
import { nativeCommBridge } from './NativeCommBridge';

export default class NativeTransport extends BaseTransport {
  constructor(type, bridge = nativeCommBridge) {
    super(type);
    this.bridge = bridge;
    this._devices = new Map();
    this._connected = new Set();
    this._unsubscribers = [];
  }

  /** Subscribe to native events that belong to THIS transport type. */
  _subscribe() {
    if (this._unsubscribers.length) return;
    const forMe = (handler) => (event) => {
      if (event.transport === this.type) handler(event);
    };

    this._unsubscribers.push(
      this.bridge.on(TransportEvent.DEVICE_FOUND, forMe((e) => {
        const device = { id: e.id, name: e.name, transport: this.type, signal: e.signal ?? 0.6 };
        this._devices.set(device.id, device);
        debugLog('nativeTransport:deviceFound', { transport: this.type, id: device.id, name: device.name });
        this.emit(TransportEvent.DEVICE_FOUND, device);
      })),
      this.bridge.on(TransportEvent.DEVICE_UPDATED, forMe((e) => {
        const existing = this._devices.get(e.id);
        if (!existing) return;
        const merged = { ...existing, signal: e.signal ?? existing.signal, latencyMs: e.latencyMs };
        this._devices.set(e.id, merged);
        this.emit(TransportEvent.DEVICE_UPDATED, merged);
      })),
      this.bridge.on(TransportEvent.DEVICE_LOST, forMe((e) => {
        this._devices.delete(e.id);
        this.emit(TransportEvent.DEVICE_LOST, { id: e.id, transport: this.type });
      })),
      this.bridge.on(TransportEvent.CONNECTED, forMe((e) => {
        this._connected.add(e.deviceId);
        this.setState(TransportState.CONNECTED);
        this.emit(TransportEvent.CONNECTED, { deviceId: e.deviceId, transport: this.type, latencyMs: e.latencyMs });
      })),
      this.bridge.on(TransportEvent.DISCONNECTED, forMe((e) => {
        this._connected.delete(e.deviceId);
        if (this._connected.size === 0 && this.state === TransportState.CONNECTED) {
          this.setState(TransportState.IDLE);
        }
        this.emit(TransportEvent.DISCONNECTED, { deviceId: e.deviceId, transport: this.type });
      })),
      this.bridge.on(TransportEvent.MESSAGE, forMe((e) => {
        // Inbound frame from a peer: parse and surface as a structured packet.
        const packet = parsePacket(e.data);
        if (!packet) return;
        this.emit(TransportEvent.MESSAGE, {
          kind: 'inbound',
          deviceId: e.deviceId,
          transport: this.type,
          packet,
        });
      })),
      this.bridge.on(TransportEvent.STATE_CHANGED, forMe((e) => {
        if (e.state && e.state !== this.state) this.setState(e.state);
      })),
      this.bridge.on(TransportEvent.MESSAGE_ACKNOWLEDGED, forMe((e) => {
        // Real transport-level delivery confirmation from the peer (currently
        // only emitted by the native Wi-Fi Direct implementation).
        this.emit(TransportEvent.MESSAGE_ACKNOWLEDGED, {
          deviceId: e.deviceId,
          transport: this.type,
          packetId: e.packetId,
        });
      }))
    );
  }

  async initialize() {
    this._subscribe();
    await this.bridge.initialize(this.type);
    this.setState(TransportState.IDLE);
  }

  async startDiscovery() {
    debugLog('nativeTransport:startDiscoveryRequested', { transport: this.type });
    this.setState(TransportState.DISCOVERING);
    await this.bridge.startDiscovery(this.type);
  }

  async stopDiscovery() {
    await this.bridge.stopDiscovery(this.type);
    if (this.state === TransportState.DISCOVERING) {
      this.setState(this._connected.size > 0 ? TransportState.CONNECTED : TransportState.IDLE);
    }
  }

  async connect(deviceId) {
    this.setState(TransportState.CONNECTING);
    try {
      const result = await this.bridge.connect(this.type, deviceId);
      this._connected.add(deviceId);
      this.setState(TransportState.CONNECTED);
      return { latencyMs: result?.latencyMs ?? 0 };
    } catch (error) {
      this.setState(this._connected.size > 0 ? TransportState.CONNECTED : TransportState.IDLE);
      throw error;
    }
  }

  async disconnect(deviceId) {
    this._connected.delete(deviceId);
    await this.bridge.disconnect(this.type, deviceId);
    if (this._connected.size === 0 && this.state === TransportState.CONNECTED) {
      this.setState(TransportState.IDLE);
    }
  }

  async send(deviceId, packet) {
    // `packet` here is the higher-layer send envelope { id, cipher, ... }. The
    // native layer transmits the serialized bytes and returns delivery metrics.
    const json = typeof packet === 'string' ? packet : JSON.stringify(packet);
    const result = await this.bridge.send(this.type, deviceId, json);
    return { confidence: result?.confidence ?? 0.9, latencyMs: result?.latencyMs ?? 0 };
  }

  removeAllListeners() {
    this._unsubscribers.forEach((off) => off());
    this._unsubscribers = [];
    super.removeAllListeners();
  }
}
