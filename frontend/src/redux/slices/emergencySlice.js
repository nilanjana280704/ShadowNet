/**
 * emergencySlice — Emergency Center data: nearby volunteers/shelters/medical
 * camps, danger zones, and the unified emergency history timeline.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  volunteers: [],
  shelters: [],
  medical: [],
  dangerZones: [],
  history: [],
};

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    emergencySeeded(state, action) {
      const { volunteers, shelters, medical, dangerZones, history } = action.payload;
      state.volunteers = volunteers;
      state.shelters = shelters;
      state.medical = medical;
      state.dangerZones = dangerZones;
      state.history = history;
    },
    historyAdded(state, action) {
      state.history.unshift(action.payload);
    },
  },
});

export const { emergencySeeded, historyAdded } = emergencySlice.actions;
export default emergencySlice.reducer;
