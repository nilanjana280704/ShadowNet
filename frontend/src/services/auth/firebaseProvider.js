/**
 * firebaseProvider — the real @react-native-firebase/auth integration. Activated
 * by AUTH_CONFIG.useFirebase once a Firebase project is configured
 * (google-services.json / GoogleService-Info.plist).
 *
 * `auth` is required lazily inside each call so this module can be imported (and
 * bundled/tested) without the native module being present or initialized.
 */
function getAuth() {
  return require('@react-native-firebase/auth').default;
}

function mapUser(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    phoneNumber: user.phoneNumber,
  };
}

async function toSession(credentialUser) {
  const token = await credentialUser.getIdToken();
  return {
    user: mapUser(credentialUser),
    token,
    expiresAt: Date.now() + 1000 * 60 * 60, // Firebase ID tokens last ~1h; refreshed on demand
  };
}

export const firebaseProvider = {
  async signIn({ email, password }) {
    const cred = await getAuth()().signInWithEmailAndPassword(email, password);
    return toSession(cred.user);
  },

  async signUp({ email, password, fullName }) {
    const cred = await getAuth()().createUserWithEmailAndPassword(email, password);
    if (fullName) await cred.user.updateProfile({ displayName: fullName });
    return toSession(cred.user);
  },

  async resetPassword({ email }) {
    await getAuth()().sendPasswordResetEmail(email);
  },

  async verifyOtp() {
    // Phone/MFA verification is wired in a later milestone (confirmation.confirm).
    return true;
  },

  async signOut() {
    await getAuth()().signOut();
  },

  /** Live auth-state listener; returns an unsubscribe function. */
  subscribe(callback) {
    return getAuth()().onAuthStateChanged((user) => callback(mapUser(user)));
  },
};

export default firebaseProvider;
