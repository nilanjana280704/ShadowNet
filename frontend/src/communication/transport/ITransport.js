/**
 * ITransport — the transport interface every transport MUST satisfy. JavaScript
 * has no interfaces, so this documents the contract and provides a runtime
 * conformance check used by the TransportFactory. Real native transports
 * (Wi-Fi Direct, BLE) implement the same surface, so nothing above the
 * transport layer changes when they replace the mocks.
 *
 * Required methods:
 *   initialize()                 -> Promise<void>
 *   startDiscovery()             -> Promise<void>   (emits DEVICE_FOUND/LOST)
 *   stopDiscovery()              -> Promise<void>
 *   connect(deviceId)            -> Promise<void>   (emits CONNECTED)
 *   disconnect(deviceId)         -> Promise<void>   (emits DISCONNECTED)
 *   send(deviceId, packet)       -> Promise<{ confidence:number, latencyMs:number }>
 *   getStatus()                  -> { type, state, label, priority }
 *   on(event, handler) / off(event, handler)        (event subscription)
 */
export const REQUIRED_TRANSPORT_METHODS = [
  'initialize',
  'startDiscovery',
  'stopDiscovery',
  'connect',
  'disconnect',
  'send',
  'getStatus',
  'on',
  'off',
];

/** Throw if `transport` does not implement the full ITransport surface. */
export function assertTransport(transport) {
  const missing = REQUIRED_TRANSPORT_METHODS.filter(
    (m) => typeof transport?.[m] !== 'function'
  );
  if (missing.length > 0) {
    throw new Error(`Transport is missing required methods: ${missing.join(', ')}`);
  }
  return transport;
}

export default assertTransport;
