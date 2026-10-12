/**
 * identitySlice (state key "verifiedPeers") — real app identities that
 * connected peers have actually announced over the communication engine,
 * keyed by deviceId. Nothing here is ever fabricated or assumed from a
 * device/radio name — only populated from a validated IDENTITY packet (see
 * communication/manager/CommunicationManager._wireEvents).
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = { byDeviceId: {} };

const identitySlice = createSlice({
  name: 'verifiedPeers',
  initialState,
  reducers: {
    /** A peer's identity was received and validated for this deviceId. */
    peerIdentified(state, action) {
      const { deviceId, userId, displayName, verifiedAt } = action.payload || {};
      if (!deviceId || !userId || !displayName) return;
      state.byDeviceId[deviceId] = { userId, displayName, verifiedAt: verifiedAt || Date.now() };
    },
    /** The device is gone entirely (not just disconnected) — forget it. */
    peerIdentityCleared(state, action) {
      delete state.byDeviceId[action.payload];
    },
  },
});

export const { peerIdentified, peerIdentityCleared } = identitySlice.actions;
export default identitySlice.reducer;
