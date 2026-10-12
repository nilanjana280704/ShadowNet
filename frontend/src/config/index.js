/**
 * Central app configuration.
 * Environment-specific values live here; native Firebase config comes from
 * android/app/google-services.json and ios/GoogleService-Info.plist.
 */
export const APP_CONFIG = {
  API_BASE_URL: 'http://10.0.2.2:5000/api/v1', // Android emulator -> local backend
  API_TIMEOUT_MS: 15000,
};

/**
 * Authentication configuration.
 * `useFirebase` selects the real @react-native-firebase/auth provider. It stays
 * false until a Firebase project is configured (google-services.json /
 * GoogleService-Info.plist); until then the app runs on the AsyncStorage-backed
 * mock provider so the full flow works end-to-end.
 */
export const AUTH_CONFIG = {
  useFirebase: false,
  otpLength: 6,
  otpResendSeconds: 30,
  mockLatencyMs: 900,
};

/**
 * Communication engine configuration.
 * `useNativeTransports` swaps the mock Wi-Fi Direct / BLE transports for the
 * real Android native bridge (com.shadownet.comm). It only takes effect when
 * the native module is actually linked (a device build) — on an emulator or
 * when the module is absent, the engine transparently falls back to the mock
 * simulator so the app still runs. Flip to true for on-device offline testing.
 */
export const COMM_CONFIG = {
  useNativeTransports: true,
  serviceName: '_shadownet._tcp',
  dataPort: 8988, // Wi-Fi Direct group-owner TCP data port
  heartbeatMs: 5000,
  // Must be >= the native Wi-Fi Direct connect timeout (CONNECT_TIMEOUT_MS in
  // ShadowNetCommModule.kt, 30s) plus headroom: real PBC pairing only resolves
  // once WIFI_P2P_CONNECTION_CHANGED_ACTION reports groupFormed, which can take
  // tens of seconds (the peer's system dialog, radio negotiation). A shorter
  // JS-side timeout would abandon the attempt before native ever gets to fail
  // or succeed on its own.
  connectTimeoutMs: 32000,
};

export default APP_CONFIG;
