/**
 * sessionSlice — cross-cutting session flags: whether onboarding has been seen,
 * the "remember me" preference, and the current OTP target (phone/email).
 */
import { createSlice } from '@reduxjs/toolkit';

import { tokenStorage } from '../../services';

/** Persist that onboarding is complete, then update state. */
export const completeOnboarding = () => async (dispatch) => {
  await tokenStorage.setOnboarded(true);
  dispatch(sessionSlice.actions.setOnboarded(true));
};

const initialState = {
  onboarded: false,
  rememberMe: true,
  otpTarget: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setOnboarded(state, action) {
      state.onboarded = action.payload;
    },
    setRememberMe(state, action) {
      state.rememberMe = action.payload;
    },
    setOtpTarget(state, action) {
      state.otpTarget = action.payload;
    },
  },
});

export const { setOnboarded, setRememberMe, setOtpTarget } = sessionSlice.actions;
export default sessionSlice.reducer;
