/**
 * communicationSlice — engine lifecycle: initialized flag, discovering flag,
 * and any engine error. Feature UI reads these to enable/disable controls.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = { initialized: false, discovering: false, error: null };

const communicationSlice = createSlice({
  name: 'communication',
  initialState,
  reducers: {
    engineStateSet(state, action) {
      state.initialized = Boolean(action.payload?.initialized);
    },
    discoveringSet(state, action) {
      state.discovering = action.payload;
    },
    engineError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { engineStateSet, discoveringSet, engineError } = communicationSlice.actions;
export default communicationSlice.reducer;
