/**
 * tokenStorage — persistence for the auth session, profile, and onboarding
 * flags via AsyncStorage.
 *
 * NOTE: AsyncStorage is not encrypted. For production, the session token should
 * move to a secure store (iOS Keychain / Android Keystore, e.g. react-native-
 * keychain). This module is the single seam to swap for that — callers use its
 * API, not AsyncStorage directly.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  session: '@shadownet/session',
  profile: '@shadownet/profile',
  onboarded: '@shadownet/onboarded',
};

async function readJson(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function writeJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const tokenStorage = {
  /** Persist { user, token, expiresAt }. */
  async saveSession(session) {
    await writeJson(KEYS.session, session);
  },
  async getSession() {
    return readJson(KEYS.session);
  },
  async clearSession() {
    await AsyncStorage.removeItem(KEYS.session);
  },

  async saveProfile(profile) {
    await writeJson(KEYS.profile, profile);
  },
  async getProfile() {
    return readJson(KEYS.profile);
  },

  async setOnboarded(value) {
    await AsyncStorage.setItem(KEYS.onboarded, value ? '1' : '0');
  },
  async getOnboarded() {
    const v = await AsyncStorage.getItem(KEYS.onboarded);
    return v === '1';
  },

  /** Wipe everything (full sign-out / reset). */
  async clearAll() {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};

export default tokenStorage;
