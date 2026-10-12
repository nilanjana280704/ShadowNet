/**
 * Maps provider error codes (Firebase-style) to friendly message keys from
 * strings.errors, so the UI never shows raw backend codes.
 */
import { strings } from '../../localization';

const MAP = {
  'auth/invalid-email': strings.errors.invalidCredentials,
  'auth/user-not-found': strings.errors.invalidCredentials,
  'auth/wrong-password': strings.errors.invalidCredentials,
  'auth/invalid-credential': strings.errors.invalidCredentials,
  'auth/email-already-in-use': strings.errors.emailInUse,
  'auth/weak-password': strings.errors.weakPassword,
  'auth/network-request-failed': strings.errors.network,
};

export function mapAuthError(error) {
  const code = error?.code || '';
  return MAP[code] || error?.userMessage || strings.errors.generic;
}

/** Build an Error carrying a provider-style code for consistent mapping. */
export function authError(code, message) {
  const err = new Error(message || code);
  err.code = code;
  return err;
}

export default mapAuthError;
