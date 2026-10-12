/**
 * uiSlice — transient UI state shared across screens: a global loading overlay
 * and a toast message. Keeps presentation state out of feature components.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  overlayVisible: false,
  overlayMessage: null,
  toast: null, // { message, severity }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showOverlay(state, action) {
      state.overlayVisible = true;
      state.overlayMessage = action.payload || null;
    },
    hideOverlay(state) {
      state.overlayVisible = false;
      state.overlayMessage = null;
    },
    showToast(state, action) {
      state.toast = action.payload;
    },
    clearToast(state) {
      state.toast = null;
    },
  },
});

export const { showOverlay, hideOverlay, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;
