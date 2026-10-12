/**
 * authSlice — authentication state and async actions.
 * status: 'restoring' (app boot) | 'authenticated' | 'unauthenticated'.
 * Thunks delegate to authService and normalize errors to friendly messages.
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { authService, mapAuthError } from '../../services';

export const signIn = createAsyncThunk('auth/signIn', async (credentials, { rejectWithValue }) => {
  try {
    return await authService.signIn(credentials);
  } catch (error) {
    return rejectWithValue(mapAuthError(error));
  }
});

export const signUp = createAsyncThunk('auth/signUp', async (details, { rejectWithValue }) => {
  try {
    return await authService.signUp(details);
  } catch (error) {
    return rejectWithValue(mapAuthError(error));
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (email, { rejectWithValue }) => {
  try {
    await authService.resetPassword({ email });
    return email;
  } catch (error) {
    return rejectWithValue(mapAuthError(error));
  }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (details, { rejectWithValue }) => {
  try {
    return await authService.verifyOtp(details);
  } catch (error) {
    return rejectWithValue(mapAuthError(error));
  }
});

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await authService.signOut();
});

const initialState = {
  status: 'restoring',
  user: null,
  token: null,
  submitting: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Applied at boot from a restored (or absent) persisted session. */
    sessionRestored(state, action) {
      const session = action.payload;
      if (session?.token) {
        state.status = 'authenticated';
        state.user = session.user;
        state.token = session.token;
      } else {
        state.status = 'unauthenticated';
        state.user = null;
        state.token = null;
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const onAuthPending = (state) => {
      state.submitting = true;
      state.error = null;
    };
    const onAuthSuccess = (state, action) => {
      state.submitting = false;
      state.status = 'authenticated';
      state.user = action.payload.user;
      state.token = action.payload.token;
    };
    const onAuthError = (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    };

    builder
      .addCase(signIn.pending, onAuthPending)
      .addCase(signIn.fulfilled, onAuthSuccess)
      .addCase(signIn.rejected, onAuthError)
      .addCase(signUp.pending, onAuthPending)
      .addCase(signUp.fulfilled, onAuthSuccess)
      .addCase(signUp.rejected, onAuthError)
      .addCase(resetPassword.pending, onAuthPending)
      .addCase(resetPassword.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(resetPassword.rejected, onAuthError)
      .addCase(verifyOtp.pending, onAuthPending)
      .addCase(verifyOtp.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(verifyOtp.rejected, onAuthError)
      .addCase(signOut.fulfilled, (state) => {
        state.status = 'unauthenticated';
        state.user = null;
        state.token = null;
        state.error = null;
      });
  },
});

export const { sessionRestored, clearError } = authSlice.actions;
export default authSlice.reducer;
