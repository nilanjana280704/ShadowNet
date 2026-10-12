/**
 * sosSlice — the live SOS state: status, countdown, and the real message ids
 * from the actual broadcast sent on activation. Delivery progress itself is
 * NOT stored here — it's derived live from state.messageQueue (the real
 * engine-reported state of those exact messages), never fabricated.
 */
import { createSlice } from '@reduxjs/toolkit';

import { SosStatus } from '../../features/emergency/constants';

const initialState = {
  id: null,
  status: SosStatus.IDLE,
  countdown: 0,
  activatedAt: null,
  // The real message ids this SOS broadcast actually sent — see
  // emergencyBridge.activateSOS / selectSosProgress.
  messageIds: [],
};

const sosSlice = createSlice({
  name: 'sos',
  initialState,
  reducers: {
    sosArmed(state, action) {
      state.status = SosStatus.ARMING;
      state.countdown = action.payload;
    },
    countdownTicked(state, action) {
      state.countdown = action.payload;
    },
    sosStatusSet(state, action) {
      const { id, status, activatedAt } = action.payload;
      if (id) state.id = id;
      if (status) state.status = status;
      if (activatedAt) state.activatedAt = activatedAt;
      if (status === SosStatus.CANCELLED || status === SosStatus.RESOLVED) {
        state.countdown = 0;
      }
    },
    /** The real messages actually sent for this SOS broadcast. */
    sosBroadcastSent(state, action) {
      state.messageIds = action.payload.messageIds || [];
    },
    sosReset() {
      return initialState;
    },
  },
});

export const {
  sosArmed,
  countdownTicked,
  sosStatusSet,
  sosBroadcastSent,
  sosReset,
} = sosSlice.actions;
export default sosSlice.reducer;
