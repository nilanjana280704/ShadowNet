/**
 * mockProvider — a fully working, offline auth backend for development and
 * demos when Firebase isn't configured. Simulates latency, issues a dev token,
 * and persists the session. Same interface as firebaseProvider.
 */
import { AUTH_CONFIG } from '../../config';
import { authError } from './errors';

const delay = (ms = AUTH_CONFIG.mockLatencyMs) => new Promise((r) => setTimeout(r, ms));

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) % 2147483647;
  return h.toString(16);
}

function makeUser({ email, fullName, phone }) {
  return {
    uid: `mock-${hash(email)}`,
    email,
    displayName: fullName || email.split('@')[0],
    phoneNumber: phone || null,
  };
}

function makeToken(uid) {
  // Dev-only pseudo token; a real JWT is issued by Firebase/backend in prod.
  return `mock.${uid}.${Date.now().toString(36)}`;
}

function session(user) {
  return {
    user,
    token: makeToken(user.uid),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
}

export const mockProvider = {
  async signIn({ email, password }) {
    await delay();
    // Demo hooks so error states are reachable without a real backend.
    if (email === 'demo@fail.com' || password === 'wrongpass') {
      throw authError('auth/invalid-credential');
    }
    return session(makeUser({ email }));
  },

  async signUp({ email, fullName, phone }) {
    await delay();
    if (email === 'taken@shadownet.app') throw authError('auth/email-already-in-use');
    return session(makeUser({ email, fullName, phone }));
  },

  async resetPassword() {
    await delay();
    // Always resolves — never reveal whether an email exists.
  },

  async verifyOtp({ code }) {
    await delay(600);
    if (code === '000000') throw authError('auth/invalid-verification-code');
    return true;
  },

  async signOut() {
    await delay(200);
  },

  /** Mock has no live listener; session restore is handled from storage. */
  subscribe() {
    return () => {};
  },
};

export default mockProvider;
