/**
 * ConnectionManager — the connection lifecycle: connect with per-transport
 * retries and a timeout, fall through transports in priority order (transport
 * switching), track state per device, and auto-reconnect on unexpected drops.
 * Emits CONNECTION_CHANGED with the connection record.
 */
import EventEmitter from '../core/EventEmitter';
import { ConnectionState, TRANSPORT_META, TransportEvent } from '../core/constants';

export const ConnectionEvent = Object.freeze({ CHANGED: 'connection:changed' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default class ConnectionManager extends EventEmitter {
  constructor(transportManager, { timeoutMs = 4000, maxRetriesPerTransport = 2, backoffMs = 600 } = {}) {
    super();
    this.transportManager = transportManager;
    this.timeoutMs = timeoutMs;
    this.maxRetriesPerTransport = maxRetriesPerTransport;
    this.backoffMs = backoffMs;
    this.connections = new Map();
    this._intentionalDisconnect = new Set();

    // Auto-reconnect on unexpected transport disconnects.
    transportManager.on(TransportEvent.DISCONNECTED, ({ deviceId }) => {
      if (this._intentionalDisconnect.has(deviceId)) {
        this._intentionalDisconnect.delete(deviceId);
        return;
      }
      const conn = this.connections.get(deviceId);
      if (conn && conn.state === ConnectionState.CONNECTED && conn.device) {
        this._reconnect(conn.device);
      }
    });
  }

  _set(deviceId, state, patch = {}) {
    const conn = { ...(this.connections.get(deviceId) || { deviceId }), state, updatedAt: Date.now(), ...patch };
    this.connections.set(deviceId, conn);
    this.emit(ConnectionEvent.CHANGED, conn);
    return conn;
  }

  _order(device, preferred) {
    const list = [...(device.transports || [])].sort(
      (a, b) => TRANSPORT_META[a].priority - TRANSPORT_META[b].priority
    );
    if (preferred && list.includes(preferred)) {
      return [preferred, ...list.filter((t) => t !== preferred)];
    }
    return list;
  }

  async _withTimeout(promise) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(ConnectionState.TIMEOUT)), this.timeoutMs);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timer);
    }
  }

  async connect(device, preferred) {
    const order = this._order(device, preferred);
    this._set(device.id, ConnectionState.CONNECTING, { device, attempts: 0 });

    let attempts = 0;
    for (const transport of order) {
      for (let i = 0; i < this.maxRetriesPerTransport; i += 1) {
        attempts += 1;
        try {
          const result = await this._withTimeout(this.transportManager.connect(transport, device.id));
          return this._set(device.id, ConnectionState.CONNECTED, {
            device,
            transport,
            attempts,
            since: Date.now(),
            latencyMs: result?.latencyMs,
          });
        } catch {
          this._set(device.id, ConnectionState.RECONNECTING, { device, transport, attempts });
          await sleep(this.backoffMs * (i + 1));
        }
      }
    }
    return this._set(device.id, ConnectionState.FAILED, { device, attempts });
  }

  async _reconnect(device) {
    this._set(device.id, ConnectionState.RECONNECTING, { device });
    await this.connect(device, this.connections.get(device.id)?.transport);
  }

  async disconnect(deviceId) {
    const conn = this.connections.get(deviceId);
    if (!conn) return;
    this._intentionalDisconnect.add(deviceId);
    if (conn.transport) await this.transportManager.disconnect(conn.transport, deviceId);
    this._set(deviceId, ConnectionState.DISCONNECTED);
  }

  getConnection(deviceId) {
    return this.connections.get(deviceId);
  }

  getConnections() {
    return Array.from(this.connections.values());
  }

  isConnected(deviceId) {
    return this.connections.get(deviceId)?.state === ConnectionState.CONNECTED;
  }
}
