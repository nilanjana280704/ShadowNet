/**
 * DeviceDiscoveryService — turns raw per-transport discovery events into a
 * single, merged registry of nearby devices. A device reachable on several
 * transports is one entry that tracks all reachable transports and its best
 * one (by priority, then signal). Emits high-level discovery events.
 */
import EventEmitter from '../core/EventEmitter';
import { TRANSPORT_META, TransportEvent } from '../core/constants';
import { debugLog } from '../core/debugLog';
import { signalToLevel } from '../core/metrics';
import { DEVICE_KIND_ICON } from '../simulation/mockDevices';

export const DiscoveryEvent = Object.freeze({
  FOUND: 'discovery:found',
  UPDATED: 'discovery:updated',
  LOST: 'discovery:lost',
});

function bestTransport(transports) {
  return [...transports].sort((a, b) => TRANSPORT_META[a].priority - TRANSPORT_META[b].priority)[0];
}

export default class DeviceDiscoveryService extends EventEmitter {
  constructor(transportManager) {
    super();
    this.transportManager = transportManager;
    this.devices = new Map();
    this._subs = [];
    this._discovering = false;
  }

  _upsert(raw) {
    const existing = this.devices.get(raw.id);
    const transports = new Set(existing?.transports || []);
    if (raw.transport) transports.add(raw.transport);

    const signal = raw.signal ?? existing?.signal ?? 0.5;
    const device = {
      id: raw.id,
      name: raw.name ?? existing?.name,
      kind: raw.kind ?? existing?.kind,
      icon: DEVICE_KIND_ICON[raw.kind ?? existing?.kind] || 'nodes',
      distanceM: raw.distanceM ?? existing?.distanceM,
      battery: raw.battery ?? existing?.battery,
      status: raw.status ?? existing?.status,
      signal,
      level: signalToLevel(signal),
      transports: Array.from(transports),
      bestTransport: bestTransport(transports),
      latencyMs: raw.latencyMs ?? existing?.latencyMs,
      lastSeen: Date.now(),
    };
    this.devices.set(device.id, device);
    debugLog('discoveryService:upsert', { id: device.id, name: device.name, transport: raw.transport, isNew: !existing });
    return { device, isNew: !existing };
  }

  /**
   * A transport reported this device unreachable. Only drop the one transport
   * that lost it — a device reachable on several transports stays listed (with
   * a recomputed bestTransport) until every transport has lost it. Only then is
   * it actually removed from the registry, so a gone-out-of-range device never
   * lingers as if it were still really nearby.
   */
  _removeTransport(raw) {
    const existing = this.devices.get(raw.id);
    if (!existing) return;
    const transports = existing.transports.filter((t) => t !== raw.transport);
    if (transports.length === 0) {
      this.devices.delete(raw.id);
      debugLog('discoveryService:lost', { id: raw.id });
      this.emit(DiscoveryEvent.LOST, { id: raw.id });
      return;
    }
    const device = { ...existing, transports, bestTransport: bestTransport(transports) };
    this.devices.set(raw.id, device);
    this.emit(DiscoveryEvent.UPDATED, device);
  }

  start() {
    if (this._discovering) return;
    this._discovering = true;
    this._subs.push(
      this.transportManager.on(TransportEvent.DEVICE_FOUND, (raw) => {
        const { device, isNew } = this._upsert(raw);
        this.emit(isNew ? DiscoveryEvent.FOUND : DiscoveryEvent.UPDATED, device);
      })
    );
    this._subs.push(
      this.transportManager.on(TransportEvent.DEVICE_UPDATED, (raw) => {
        const { device } = this._upsert(raw);
        this.emit(DiscoveryEvent.UPDATED, device);
      })
    );
    this._subs.push(
      this.transportManager.on(TransportEvent.DEVICE_LOST, (raw) => this._removeTransport(raw))
    );
    this.transportManager.startDiscovery();
  }

  stop() {
    if (!this._discovering) return;
    this._discovering = false;
    this._subs.forEach((off) => off());
    this._subs = [];
    this.transportManager.stopDiscovery();
  }

  /**
   * Seed known devices from persisted state after a restart, so restored
   * messages can resolve their target and route before live discovery re-finds
   * them. Best-effort and event-free; live discovery refreshes these entries.
   */
  restore(devices = []) {
    (devices || []).forEach((device) => {
      if (device && device.id && !this.devices.has(device.id)) {
        this.devices.set(device.id, device);
      }
    });
  }

  getDevices() {
    return Array.from(this.devices.values());
  }

  getDevice(id) {
    return this.devices.get(id);
  }

  isDiscovering() {
    return this._discovering;
  }
}
