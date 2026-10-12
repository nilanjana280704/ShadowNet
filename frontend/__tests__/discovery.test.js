/**
 * Nearby-device discovery checks — guards against the exact regression found on
 * real hardware: LoRa's mock transport ran unconditionally (no real LoRa radio
 * exists) and fed NetworkSimulator's fictional MOCK_DEVICES into the same merged
 * discovery registry real Wi-Fi Direct/BLE finds land in, so fabricated devices
 * ("Medical Camp", "Emergency Vehicle", …) appeared as if they were real nearby
 * people/services even on a native-transport build.
 */
import { TransportFactory } from '../src/communication/transport/TransportFactory';
import TransportManager from '../src/communication/manager/TransportManager';
import DeviceDiscoveryService, { DiscoveryEvent } from '../src/communication/discovery/DeviceDiscoveryService';
import EventEmitter from '../src/communication/core/EventEmitter';
import { TransportType, TransportEvent } from '../src/communication/core/constants';

test('TransportFactory never registers a LoRa transport (no consumer hardware; was the fabricated-device source)', () => {
  expect(TransportFactory.types()).not.toContain(TransportType.LORA);
  expect(() => TransportFactory.create(TransportType.LORA, {})).toThrow();
});

test('TransportManager.initialize() never creates a LoRa transport, so it is never discovered', async () => {
  const manager = new TransportManager({});
  await manager.initialize();
  expect(manager.getTransport(TransportType.LORA)).toBeUndefined();
  expect(manager.getTransport(TransportType.WIFI_DIRECT)).toBeDefined();
  expect(manager.getTransport(TransportType.BLE)).toBeDefined();
  await manager.dispose();
});

function buildDiscoveryService() {
  const transportManager = new EventEmitter();
  transportManager.startDiscovery = jest.fn();
  transportManager.stopDiscovery = jest.fn();
  const discovery = new DeviceDiscoveryService(transportManager);
  return { discovery, transportManager };
}

test('a brand-new device fires FOUND once; a later update for the same id fires UPDATED, not FOUND again', () => {
  const { discovery, transportManager } = buildDiscoveryService();
  const found = jest.fn();
  const updated = jest.fn();
  discovery.on(DiscoveryEvent.FOUND, found);
  discovery.on(DiscoveryEvent.UPDATED, updated);
  discovery.start();

  transportManager.emit(TransportEvent.DEVICE_FOUND, { id: 'dev-1', name: 'Peer', transport: TransportType.BLE, signal: 0.7 });
  expect(found).toHaveBeenCalledTimes(1);
  expect(updated).not.toHaveBeenCalled();

  transportManager.emit(TransportEvent.DEVICE_UPDATED, { id: 'dev-1', signal: 0.8 });
  expect(found).toHaveBeenCalledTimes(1);
  expect(updated).toHaveBeenCalledTimes(1);
});

test('the same device id found on two transports is deduplicated into one entry with both transports recorded', () => {
  const { discovery, transportManager } = buildDiscoveryService();
  discovery.start();

  transportManager.emit(TransportEvent.DEVICE_FOUND, { id: 'dev-1', name: 'Peer', transport: TransportType.WIFI_DIRECT, signal: 0.6 });
  transportManager.emit(TransportEvent.DEVICE_FOUND, { id: 'dev-1', name: 'Peer', transport: TransportType.BLE, signal: 0.5 });

  const devices = discovery.getDevices();
  expect(devices).toHaveLength(1);
  expect(devices[0].transports.sort()).toEqual([TransportType.BLE, TransportType.WIFI_DIRECT].sort());
});

test('no devices and no fabricated sample entries before anything is actually found', () => {
  const { discovery } = buildDiscoveryService();
  expect(discovery.getDevices()).toEqual([]);
  discovery.start();
  // Starting a scan must not itself manufacture any device — only a real
  // DEVICE_FOUND event (from the transport layer) may ever populate the registry.
  expect(discovery.getDevices()).toEqual([]);
});

test('a device lost on its only transport is removed from the registry entirely, not left as a stale entry', () => {
  const { discovery, transportManager } = buildDiscoveryService();
  const lost = jest.fn();
  discovery.on(DiscoveryEvent.LOST, lost);
  discovery.start();

  transportManager.emit(TransportEvent.DEVICE_FOUND, { id: 'dev-1', name: 'Peer', transport: TransportType.BLE });
  expect(discovery.getDevices()).toHaveLength(1);

  transportManager.emit(TransportEvent.DEVICE_LOST, { id: 'dev-1', transport: TransportType.BLE });
  expect(discovery.getDevices()).toHaveLength(0);
  expect(lost).toHaveBeenCalledWith({ id: 'dev-1' });
});

test('a device reachable on two transports stays listed when only one transport loses it', () => {
  const { discovery, transportManager } = buildDiscoveryService();
  const lost = jest.fn();
  discovery.on(DiscoveryEvent.LOST, lost);
  discovery.start();

  transportManager.emit(TransportEvent.DEVICE_FOUND, { id: 'dev-1', name: 'Peer', transport: TransportType.WIFI_DIRECT });
  transportManager.emit(TransportEvent.DEVICE_FOUND, { id: 'dev-1', name: 'Peer', transport: TransportType.BLE });

  transportManager.emit(TransportEvent.DEVICE_LOST, { id: 'dev-1', transport: TransportType.WIFI_DIRECT });
  expect(lost).not.toHaveBeenCalled();
  const devices = discovery.getDevices();
  expect(devices).toHaveLength(1);
  expect(devices[0].transports).toEqual([TransportType.BLE]);
});
