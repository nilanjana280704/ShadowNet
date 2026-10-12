/**
 * networkStateSlice — the derived network state (online, active transport,
 * transport statuses, coverage, counts), mirrored from engine NETWORK_STATE
 * events. Powers the network banner and status widgets.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  online: false,
  activeTransport: null,
  transports: [],
  deviceCount: 0,
  connectedCount: 0,
  coverageM: 0,
  discovering: false,
  // Rule-based network health (see communication/core/metrics.networkHealthScore).
  health: { score: 0, grade: 'poor', label: 'Poor' },
};

const networkStateSlice = createSlice({
  name: 'networkState',
  initialState,
  reducers: {
    networkStateSet(state, action) {
      return { ...state, ...action.payload };
    },
    networkStateReset() {
      return initialState;
    },
  },
});

export const { networkStateSet, networkStateReset } = networkStateSlice.actions;
export default networkStateSlice.reducer;
