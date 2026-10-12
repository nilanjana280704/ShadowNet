/**
 * profileSlice — the user's safety profile (name, emergency contact, blood
 * group, medical notes, home location, language, notification preference).
 * `complete` gates the profile-setup step in navigation.
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { tokenStorage } from '../../services';

export const saveProfile = createAsyncThunk('profile/save', async (profile) => {
  const payload = { ...profile, setupComplete: true };
  await tokenStorage.saveProfile(payload);
  return payload;
});

const initialState = {
  data: null,
  complete: false,
  saving: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    /** Applied at boot from persisted profile. */
    setProfileData(state, action) {
      state.data = action.payload;
      state.complete = Boolean(action.payload?.setupComplete);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.data = action.payload;
        state.complete = true;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error?.message || null;
      })
      // Reset on sign-out without importing authSlice (avoids a cycle).
      .addMatcher(
        (action) => action.type === 'auth/signOut/fulfilled',
        () => initialState
      );
  },
});

export const { setProfileData } = profileSlice.actions;
export default profileSlice.reducer;
