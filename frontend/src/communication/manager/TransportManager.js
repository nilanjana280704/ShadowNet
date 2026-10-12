/**
 * TransportManager — owns the set of transports and presents them as one. It
 * creates transports via the factory, initializes them in priority order,
 * re-emits their events upward (tagged with transport), and exposes unified
 * discovery/connect/send. Higher layers talk to this, never to a transport.
 */
import EventEmitter from '../core/EventEmitter';
import { TRANSPORT_META, TransportEvent } from '../core/constants';
import { TransportFactory } from '../transport';

const RELAYED_EVENTS = [
  TransportEvent.DEVICE_FOUND,
  TransportEvent.DEVICE_UPDATED,
  TransportEvent.DEVICE_LOST,
  TransportEvent.CONNECTED,
  TransportEvent.DISCONNECTED,
  TransportEvent.MESSAGE,
  TransportEvent.MESSAGE_ACKNOWLEDGED,
  TransportEvent.STATE_CHANGED,
];

export default class TransportManager extends EventEmitter {
  constructor(simulator, factory = TransportFactory) {
    super();
    this.simulator = simulator;
    this.factory = factory;
    this.transports = new Map();
  }

  async initialize(types = this.factory.types()) {
    const ordered = [...types].sort(
      (a, b) => TRANSPORT_META[a].priority - TRANSPORT_META[b].priority
    );
    for (const type of ordered) {
      const transport = this.factory.create(type, this.simulator);
      RELAYED_EVENTS.forEach((event) => transport.on(event, (payload) => this.emit(event, payload)));
      await transport.initialize();
      this.transports.set(type, transport);
    }
  }

  getTransport(type) {
    return this.transports.get(type);
  }

  getByPriority() {
    return Array.from(this.transports.values()).sort(
      (a, b) => a.meta.priority - b.meta.priority
    );
  }

  getStatuses() {
    return this.getByPriority().map((t) => t.getStatus());
  }

  async startDiscovery(types = Array.from(this.transports.keys())) {
    await Promise.all(types.map((type) => this.transports.get(type)?.startDiscovery()));
  }

  async stopDiscovery(types = Array.from(this.transports.keys())) {
    await Promise.all(types.map((type) => this.transports.get(type)?.stopDiscovery()));
  }

  connect(type, deviceId) {
    return this.getTransport(type).connect(deviceId);
  }

  disconnect(type, deviceId) {
    return this.getTransport(type).disconnect(deviceId);
  }

  send(type, deviceId, packet) {
    return this.getTransport(type).send(deviceId, packet);
  }

  async dispose() {
    await this.stopDiscovery();
    this.transports.forEach((t) => t.removeAllListeners());
    this.transports.clear();
    this.removeAllListeners();
  }
}
