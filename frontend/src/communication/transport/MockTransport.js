/**
 * MockTransport — shared mock implementation of the transport contract, driven
 * by the injected NetworkSimulator. The concrete transports (Wi-Fi Direct, BLE,
 * LoRa) extend this and differ only by type/metadata. A real native transport
 * would instead extend BaseTransport directly and implement these against the
 * platform APIs — nothing above the transport layer would change.
 */
import BaseTransport from './BaseTransport';
import { TransportEvent, TransportState } from '../core/constants';
import { debugLog } from '../core/debugLog';

export default class MockTransport extends BaseTransport {
  constructor(type, simulator) {
    super(type);
    this.simulator = simulator;
    this._devices = new Map();
    this._connected = new Set();
    this._stopDiscovery = null;
  }

  async initialize() {
    debugLog('mockTransport:initialize — NOT using native radio', { transport: this.type });
    this.setState(TransportState.IDLE);
  }

  async startDiscovery() {
    if (this._stopDiscovery) return;
    this.setState(TransportState.DISCOVERING);
    this._stopDiscovery = this.simulator.startDiscovery(this.type, {
      onFound: (device) => {
        this._devices.set(device.id, device);
        this.emit(TransportEvent.DEVICE_FOUND, device);
      },
      onUpdate: (update) => {
        const existing = this._devices.get(update.id);
        if (!existing) return;
        const merged = { ...existing, ...update };
        this._devices.set(update.id, merged);
        this.emit(TransportEvent.DEVICE_UPDATED, merged);
      },
    });
  }

  async stopDiscovery() {
    this._stopDiscovery?.();
    this._stopDiscovery = null;
    if (this.state === TransportState.DISCOVERING) {
      this.setState(this._connected.size > 0 ? TransportState.CONNECTED : TransportState.IDLE);
    }
  }

  async connect(deviceId) {
    const device = this._devices.get(deviceId);
    if (!device) throw new Error(`Unknown device ${deviceId}`);
    this.setState(TransportState.CONNECTING);
    const result = await this.simulator.connect(device);
    this._connected.add(deviceId);
    this.setState(TransportState.CONNECTED);
    this.emit(TransportEvent.CONNECTED, { deviceId, transport: this.type, ...result });
    return result;
  }

  async disconnect(deviceId) {
    this._connected.delete(deviceId);
    if (this._connected.size === 0 && this.state === TransportState.CONNECTED) {
      this.setState(TransportState.IDLE);
    }
    this.emit(TransportEvent.DISCONNECTED, { deviceId, transport: this.type });
  }

  async send(deviceId, packet) {
    const device = this._devices.get(deviceId);
    if (!device) throw new Error(`Unknown device ${deviceId}`);
    const result = await this.simulator.send(device, this.type);
    // Echo an acknowledgement upward so higher layers can simulate receipt.
    this.emit(TransportEvent.MESSAGE, {
      kind: 'ack',
      deviceId,
      transport: this.type,
      packetId: packet?.id,
      ...result,
    });
    return result;
  }
}
