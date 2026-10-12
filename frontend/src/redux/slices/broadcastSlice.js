/**
 * broadcastSlice — the emergency broadcast history (newest first).
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = { history: [] };

const broadcastSlice = createSlice({
  name: 'broadcast',
  initialState,
  reducers: {
    broadcastsSeeded(state, action) {
      state.history = action.payload;
    },
    broadcastAdded(state, action) {
      state.history.unshift(action.payload);
    },
  },
});

export const { broadcastsSeeded, broadcastAdded } = broadcastSlice.actions;
export default broadcastSlice.reducer;
