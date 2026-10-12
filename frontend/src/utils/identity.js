/**
 * identity — resolves the local device's display name from the actual
 * authenticated/profile state. Never falls back to another person's name or
 * a fabricated identity — only the real signed-in account, or a neutral
 * placeholder if no name is available yet.
 */

/**
 * @param {object} params
 * @param {object} [params.profile] state.profile.data (safety profile; the
 *   most recently user-edited name, since it can be changed after sign-up)
 * @param {object} [params.authUser] state.auth.user (the signed-in account)
 * @returns {string} a real name, or a neutral placeholder — never a fake one
 */
export function resolveDisplayName({ profile, authUser } = {}) {
  const profileName = typeof profile?.fullName === 'string' ? profile.fullName.trim() : '';
  if (profileName) return profileName;

  const authName = typeof authUser?.displayName === 'string' ? authUser.displayName.trim() : '';
  if (authName) return authName;

  return 'ShadowNet user';
}

export default resolveDisplayName;
