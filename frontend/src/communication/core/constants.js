/**
 * Communication engine — shared enums and metadata. Single source for transport
 * types, states, events, message states, and priorities so no layer invents its
 * own string literals.
 */

export const TransportType = Object.freeze({
  WIFI_DIRECT: 'wifi-direct',
  BLE: 'ble',
  LORA: 'lora',
});

export const TransportState = Object.freeze({
  UNINITIALIZED: 'uninitialized',
  IDLE: 'idle',
  DISCOVERING: 'discovering',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
  UNAVAILABLE: 'unavailable',
});

// Events emitted by transports (and re-emitted upward by managers).
export const TransportEvent = Object.freeze({
  DEVICE_FOUND: 'deviceFound',
  DEVICE_LOST: 'deviceLost',
  DEVICE_UPDATED: 'deviceUpdated',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  MESSAGE: 'message',
  // Real per-packet delivery confirmation from the peer (native Wi-Fi Direct's
  // transport-level ack frame). Matches the native bridge event "packetDelivered".
  MESSAGE_ACKNOWLEDGED: 'packetDelivered',
  STATE_CHANGED: 'stateChanged',
});

// High-level events emitted by CommunicationService to the app/Redux.
export const CommEvent = Object.freeze({
  DEVICE_DISCOVERED: 'device:discovered',
  DEVICE_LOST: 'device:lost',
  DEVICE_UPDATED: 'device:updated',
  CONNECTION_CHANGED: 'connection:changed',
  ROUTE_CHANGED: 'route:changed',
  MESSAGE_QUEUED: 'message:queued',
  MESSAGE_UPDATED: 'message:updated',
  MESSAGE_RECEIVED: 'message:received',
  NETWORK_STATE: 'network:state',
  ENGINE_STATE: 'engine:state',
  // A peer's real app identity was received and validated after a connection
  // (see CommunicationManager._announceIdentity / packet.js IDENTITY type).
  PEER_IDENTIFIED: 'peer:identified',
});

// Lower value = higher priority. Routing prefers Wi-Fi Direct, then BLE, LoRa.
export const TRANSPORT_META = Object.freeze({
  [TransportType.WIFI_DIRECT]: {
    label: 'Wi-Fi Direct',
    priority: 1,
    maxRangeM: 200,
    throughputKbps: 25000,
    powerCost: 0.7,
    baseLatencyMs: 40,
    reliability: 0.95,
  },
  [TransportType.BLE]: {
    label: 'Bluetooth LE',
    priority: 2,
    maxRangeM: 80,
    throughputKbps: 1000,
    powerCost: 0.3,
    baseLatencyMs: 75,
    reliability: 0.9,
  },
  [TransportType.LORA]: {
    label: 'LoRa',
    priority: 3,
    maxRangeM: 5000,
    throughputKbps: 27,
    powerCost: 0.2,
    baseLatencyMs: 320,
    reliability: 0.82,
  },
});

export const ConnectionState = Object.freeze({
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  FAILED: 'failed',
  TIMEOUT: 'timeout',
});

export const MessageState = Object.freeze({
  QUEUED: 'queued',
  ENCRYPTING: 'encrypting',
  ROUTING: 'routing',
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  ACKNOWLEDGED: 'acknowledged',
  FAILED: 'failed',
  RETRYING: 'retrying',
  RECEIVED: 'received',
});

export const MessagePriority = Object.freeze({
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  EMERGENCY: 3,
});

export const DeviceStatus = Object.freeze({
  AVAILABLE: 'available',
  BUSY: 'busy',
  CONNECTED: 'connected',
  UNREACHABLE: 'unreachable',
});
