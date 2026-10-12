/**
 * authService — the single API the app (Redux thunks) uses for authentication.
 * Delegates to the configured provider (Firebase or mock) and persists the
 * session. Swapping providers or adding biometric/MFA happens here, not in the
 * UI.
 */
import { AUTH_CONFIG } from '../../config';
import { tokenStorage } from '../storage/tokenStorage';
import { firebaseProvider } from './firebaseProvider';
import { mockProvider } from './mockProvider';

function provider() {
  return AUTH_CONFIG.useFirebase ? firebaseProvider : mockProvider;
}

export const authService = {
  async signIn(credentials) {
    const session = await provider().signIn(credentials);
    await tokenStorage.saveSession(session);
    return session;
  },

  async signUp(details) {
    const session = await provider().signUp(details);
    await tokenStorage.saveSession(session);
    return session;
  },

  async resetPassword(details) {
    await provider().resetPassword(details);
  },

  async verifyOtp(details) {
    return provider().verifyOtp(details);
  },

  async signOut() {
    await provider().signOut();
    await tokenStorage.clearSession();
  },

  /** Restore a persisted, non-expired session (persistent login). */
  async restoreSession() {
    const session = await tokenStorage.getSession();
    if (!session?.token) return null;
    if (session.expiresAt && session.expiresAt < Date.now()) {
      await tokenStorage.clearSession();
      return null;
    }
    return session;
  },

  /** Subscribe to auth-state changes (Firebase live listener; noop for mock). */
  subscribe(callback) {
    return provider().subscribe(callback);
  },
};

export default authService;
