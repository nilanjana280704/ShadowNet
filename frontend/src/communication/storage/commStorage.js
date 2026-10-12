/**
 * commStorage — offline persistence for the communication engine via
 * AsyncStorage. Stores known devices, connections, last routes, network state,
 * message history, queued messages, and pending retries as one blob so the app
 * can restore context after a restart. Persistence is best-effort and never
 * throws to callers.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@shadownet/comm';

const EMPTY = {
  knownDevices: [],
  connections: [],
  lastRoutes: [],
  networkState: null,
  history: [],
  queued: [],
  pendingRetries: [],
  updatedAt: 0,
};

export const commStorage = {
  async load() {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
    } catch {
      return { ...EMPTY };
    }
  },

  /** Persist a snapshot from CommunicationManager.getSnapshot(). */
  async persist(snapshot) {
    try {
      const payload = {
        knownDevices: snapshot.devices || [],
        connections: snapshot.connections || [],
        lastRoutes: snapshot.routes || [],
        networkState: snapshot.networkState || null,
        history: snapshot.messages?.sent || [],
        queued: snapshot.messages?.outgoing || [],
        pendingRetries: snapshot.messages?.retry || [],
        updatedAt: Date.now(),
      };
      await AsyncStorage.setItem(KEY, JSON.stringify(payload));
    } catch {
      // Best-effort; ignore write failures.
    }
  },

  async clear() {
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  },
};

export default commStorage;
