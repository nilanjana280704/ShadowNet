/**
 * Realistic mock devices for development. Each entry models a nearby node the
 * engine can discover, with the transports that can reach it, a base signal,
 * distance, battery, and status. Replaced by real discovery results once native
 * transports land — the shape is what the rest of the engine consumes.
 */
import { DeviceStatus, TransportType } from '../core/constants';

export const MOCK_DEVICES = [
  {
    id: 'dev-priya',
    name: 'Priya (Family)',
    kind: 'family',
    transports: [TransportType.WIFI_DIRECT, TransportType.BLE],
    signal: 0.9,
    distanceM: 12,
    battery: 0.72,
    status: DeviceStatus.AVAILABLE,
  },
  {
    id: 'dev-volunteer',
    name: 'Rescue Volunteer',
    kind: 'volunteer',
    transports: [TransportType.WIFI_DIRECT, TransportType.BLE],
    signal: 0.72,
    distanceM: 85,
    battery: 0.55,
    status: DeviceStatus.AVAILABLE,
  },
  {
    id: 'dev-medcamp',
    name: 'Medical Camp',
    kind: 'medical',
    transports: [TransportType.WIFI_DIRECT, TransportType.LORA],
    signal: 0.6,
    distanceM: 320,
    battery: 0.9,
    status: DeviceStatus.AVAILABLE,
  },
  {
    id: 'dev-ambulance',
    name: 'Emergency Vehicle',
    kind: 'vehicle',
    transports: [TransportType.LORA, TransportType.BLE],
    signal: 0.5,
    distanceM: 900,
    battery: 0.8,
    status: DeviceStatus.BUSY,
  },
  {
    id: 'dev-rescue',
    name: 'Rescue Team Alpha',
    kind: 'rescue',
    transports: [TransportType.WIFI_DIRECT, TransportType.BLE, TransportType.LORA],
    signal: 0.66,
    distanceM: 210,
    battery: 0.6,
    status: DeviceStatus.AVAILABLE,
  },
];

/** Map a device kind to a semantic icon name (for UI). */
export const DEVICE_KIND_ICON = Object.freeze({
  family: 'user',
  volunteer: 'volunteer',
  medical: 'medical',
  vehicle: 'navigation',
  rescue: 'shield',
});

/** Devices reachable on a given transport. */
export function devicesForTransport(type) {
  return MOCK_DEVICES.filter((d) => d.transports.includes(type));
}
