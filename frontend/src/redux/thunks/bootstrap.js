/**
 * bootstrapApp — the app-launch thunk. Loads the onboarding flag, restores a
 * persisted session, and hydrates the profile, then marks auth resolved. Kept
 * separate from the slices so it can touch several of them without import
 * cycles.
 */
import { authService, tokenStorage } from '../../services';
import { sessionRestored } from '../slices/authSlice';
import { setProfileData } from '../slices/profileSlice';
import { setOnboarded } from '../slices/sessionSlice';

// Keep the splash on screen briefly so its animation reads, even if restore is
// instant.
const MIN_SPLASH_MS = 1200;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const bootstrapApp = () => async (dispatch) => {
  const startedAt = Date.now();

  const onboarded = await tokenStorage.getOnboarded();
  dispatch(setOnboarded(onboarded));

  const session = await authService.restoreSession();
  if (session) {
    const profile = await tokenStorage.getProfile();
    if (profile) dispatch(setProfileData(profile));
  }

  const elapsed = Date.now() - startedAt;
  if (elapsed < MIN_SPLASH_MS) await sleep(MIN_SPLASH_MS - elapsed);

  dispatch(sessionRestored(session));
};

export default bootstrapApp;
