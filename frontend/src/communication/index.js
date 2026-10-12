/**
 * ShadowNet — Communication engine public API.
 *
 * The app should import ONLY from here (and the constants). Internals — the
 * transport layer, managers, routing, and message services — are not part of the
 * public surface and can change without touching feature code.
 *
 *   Layered architecture:
 *   UI → CommunicationService → CommunicationManager → { Discovery, Connection,
 *        Routing, Messages } → TransportManager → Transports (Wi-Fi/BLE/LoRa)
 */
export { communicationService, default } from './CommunicationService';
export { commStorage } from './storage/commStorage';
export {
  TransportType,
  TransportState,
  ConnectionState,
  MessageState,
  MessagePriority,
  DeviceStatus,
  CommEvent,
  TRANSPORT_META,
} from './core/constants';
// True only when real native Wi-Fi Direct/BLE are linked and active — false
// means discovery/connections are simulated (dev/emulator/test). The UI uses
// this to never present simulated devices as if they were real nearby people.
export { TransportFactory } from './transport';
