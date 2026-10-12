/**
 * queueSlice — count/ids/estimate of messages waiting for delivery, mirrored
 * from ChatService's queue:changed events. Powers the offline/queue banners.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = { count: 0, ids: [], estimate: null };

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    queueSet(state, action) {
      return { ...initialState, ...action.payload };
    },
  },
});

export const { queueSet } = queueSlice.actions;
export default queueSlice.reducer;
