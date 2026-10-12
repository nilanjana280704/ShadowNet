/**
 * debugLog — dev-only tracing for the discovery pipeline (transport selection,
 * native bridge calls, native events, device registry updates). No-ops in
 * production builds; never logs packet payloads or identity data, only
 * stage/transport/deviceId so it's safe to leave in place.
 */
export function debugLog(stage, data) {
  if (!__DEV__) return;
  console.log(`[ShadowNetDiscovery] ${stage}`, data ?? '');
}

export default debugLog;
