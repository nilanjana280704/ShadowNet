/**
 * checkInSlice — safe check-in history and the most recent check-in.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = { history: [], last: null };

const checkInSlice = createSlice({
  name: 'checkIn',
  initialState,
  reducers: {
    checkInAdded(state, action) {
      state.history.unshift(action.payload);
      state.last = action.payload;
    },
  },
});

export const { checkInAdded } = checkInSlice.actions;
export default checkInSlice.reducer;
