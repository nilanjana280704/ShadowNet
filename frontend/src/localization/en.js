/**
 * English copy for ShadowNet. Centralized so screens contain no hardcoded
 * user-facing strings and so localization can be added later without touching
 * components. Access via `strings` from src/localization.
 */
export const en = {
  app: {
    name: 'ShadowNet',
    tagline: "Stay Connected. Even When the World Isn't.",
  },

  common: {
    next: 'Next',
    skip: 'Skip',
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    retry: 'Try again',
    continue: 'Continue',
    getStarted: 'Get started',
    loading: 'Just a moment…',
    optional: 'Optional',
    or: 'or',
  },

  onboarding: {
    slides: [
      {
        title: 'Works without internet',
        body: 'ShadowNet connects you to people nearby using your phone directly — no cell tower or Wi-Fi needed.',
      },
      {
        title: 'Help is one tap away',
        body: 'Send an SOS, broadcast an alert to everyone nearby, find safe zones, and reach volunteers in seconds.',
      },
      {
        title: 'Stronger together',
        body: 'Every nearby phone extends the network. The more people join, the further your message travels.',
      },
    ],
  },

  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to stay connected and safe.',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: 'Your password',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    submit: 'Sign in',
    google: 'Continue with Google',
    noAccount: "Don't have an account?",
    register: 'Create one',
  },

  register: {
    title: 'Create your account',
    subtitle: 'Set up ShadowNet so help is always within reach.',
    fullName: 'Full name',
    fullNamePlaceholder: 'Your full name',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    phone: 'Phone number',
    phonePlaceholder: '+1 555 000 1234',
    password: 'Password',
    passwordPlaceholder: 'Create a password',
    confirmPassword: 'Confirm password',
    confirmPlaceholder: 'Re-enter your password',
    acceptTerms: 'I agree to the Terms of Service and Privacy Policy',
    submit: 'Create account',
    haveAccount: 'Already have an account?',
    login: 'Sign in',
  },

  forgot: {
    title: 'Reset your password',
    subtitle: "Enter your email and we'll send you a reset link.",
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    submit: 'Send reset link',
    sentTitle: 'Check your email',
    sentBody: "If an account exists for {email}, a reset link is on its way. Follow it to choose a new password.",
    done: 'Back to sign in',
  },

  otp: {
    title: "Verify it's you",
    subtitle: 'Enter the 6-digit code we sent to {target}.',
    resend: 'Resend code',
    resendIn: 'Resend code in {seconds}s',
    submit: 'Verify',
    verified: 'Phone verified',
    changeTarget: 'Use a different number',
  },

  profile: {
    title: 'Set up your profile',
    subtitle: 'This helps responders assist you faster in an emergency.',
    photo: 'Add a profile photo',
    fullName: 'Full name',
    fullNamePlaceholder: 'Your full name',
    emergencyContact: 'Emergency contact',
    emergencyContactPlaceholder: 'Name and phone number',
    bloodGroup: 'Blood group',
    bloodGroupPlaceholder: 'Select blood group',
    medical: 'Medical conditions',
    medicalPlaceholder: 'Allergies, conditions, medication (optional)',
    homeLocation: 'Home location',
    homeLocationPlaceholder: 'City or area',
    language: 'Preferred language',
    notifications: 'Emergency notifications',
    notificationsHint: 'Get alerts about hazards and broadcasts near you.',
    submit: 'Save and continue',
    skip: 'Skip for now',
  },

  validation: {
    required: 'This field is required.',
    email: 'Enter a valid email address.',
    passwordShort: 'Use at least 8 characters.',
    passwordWeak: 'Include letters and numbers.',
    passwordMatch: 'Passwords do not match.',
    phone: 'Enter a valid phone number.',
    name: 'Enter your name.',
    terms: 'Please accept the terms to continue.',
    otp: 'Enter the 6-digit code.',
  },

  errors: {
    generic: 'Something went wrong. Please try again.',
    invalidCredentials: 'Email or password is incorrect.',
    emailInUse: 'An account already exists for this email.',
    network: 'You appear to be offline. Check your connection.',
    weakPassword: 'That password is too weak.',
  },

  session: {
    logout: 'Sign out',
    securing: 'Securing your session…',
  },
};

export default en;
