/**
 * Network screen mock data. Realistic placeholder telemetry only — no live
 * backend. angle is 0..1 (fraction of a turn); dist is 0..1 (fraction of the
 * graph radius).
 */

export const meshNodes = [
  { id: 'n1', label: 'Priya', angle: 0.02, dist: 0.55, level: 4, transport: 'wifi' },
  { id: 'n2', label: 'Relay 2', angle: 0.19, dist: 0.86, level: 2, transport: 'lora' },
  { id: 'n3', label: 'Rahul', angle: 0.37, dist: 0.5, level: 3, transport: 'ble' },
  { id: 'n4', label: 'Aid Post', angle: 0.54, dist: 0.8, level: 3, transport: 'wifi' },
  { id: 'n5', label: 'Meera', angle: 0.71, dist: 0.44, level: 4, transport: 'ble' },
  { id: 'n6', label: 'Relay 1', angle: 0.88, dist: 0.82, level: 2, transport: 'lora' },
];

export const meshLinks = [
  [0, 3],
  [2, 4],
  [1, 5],
];

export const commLayers = [
  { key: 'wifi', name: 'Wi-Fi Direct', icon: 'wifi', status: 'active', signalLevel: 4, latency: '42 ms', range: 'High speed · short range' },
  { key: 'ble', name: 'Bluetooth LE', icon: 'bluetooth', status: 'active', signalLevel: 3, latency: '70 ms', range: 'Low power · short range' },
  { key: 'lora', name: 'LoRa', icon: 'nodes', status: 'idle', signalLevel: 2, latency: '310 ms', range: 'Low speed · long range' },
];

export const transmission = {
  successRate: 96,
  hopCount: 3,
  latencyMs: 84,
  packets: 1284,
};

export const networkHealth = {
  meshHealth: 0.9,
  nodeCount: 8,
  coverageKm: 2.4,
  // Low on purpose: demonstrates the smart battery recommendation.
  battery: 0.28,
  charging: false,
  packetLoss: 1.2,
  nodeDensity: 'Medium',
};

export const diagnostics = [
  { id: 'd1', label: 'Mesh routing', status: 'success', value: 'Optimal' },
  { id: 'd2', label: 'Encryption', status: 'success', value: 'AES-256' },
  { id: 'd3', label: 'LoRa gateway', status: 'warning', value: 'Idle' },
  { id: 'd4', label: 'Location services', status: 'success', value: 'On' },
];
