/**
 * ShadowNet — Typography tokens.
 *
 * Three roles:
 *  - `display` (Chakra Petch): headings, tracked uppercase labels — tactical voice.
 *  - `mono` (JetBrains Mono): telemetry — numeric readouts, coordinates, hops,
 *    latency, timestamps; digits align in tabular displays.
 *  - `sans` (system): body prose, kept minimal.
 *
 * Fonts are bundled (assets/fonts) and linked via react-native.config.js.
 * RN maps fontWeight to custom families inconsistently on Android, so each
 * weight is referenced as its own family (e.g. ChakraPetch-SemiBold).
 *
 * `type` holds the full semantic scale. Every text style in the app must come
 * from here — no hardcoded fontSize / fontFamily.
 */
import { Platform } from 'react-native';

export const fontFamily = {
  display: 'ChakraPetch-Bold',
  displaySemibold: 'ChakraPetch-SemiBold',
  displayMedium: 'ChakraPetch-Medium',
  displayRegular: 'ChakraPetch-Regular',

  mono: 'JetBrainsMono-Regular',
  monoMedium: 'JetBrainsMono-Medium',
  monoBold: 'JetBrainsMono-Bold',

  sans: Platform.select({ ios: 'System', android: 'sans-serif' }),
  sansMedium: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
};

// Numeric weights for the system `sans` role only. Custom faces carry weight in
// the family name — do not also set fontWeight on them.
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const type = {
  // Display — hero headings (Chakra Petch)
  displayXL: { fontFamily: fontFamily.display, fontSize: 44, lineHeight: 48, letterSpacing: 0.5 },
  displayL: { fontFamily: fontFamily.display, fontSize: 36, lineHeight: 40, letterSpacing: 0.5 },
  displayM: { fontFamily: fontFamily.display, fontSize: 30, lineHeight: 36, letterSpacing: 0.5 },

  // Headings (Chakra Petch)
  headingXL: { fontFamily: fontFamily.display, fontSize: 28, lineHeight: 34, letterSpacing: 0.5 },
  headingL: { fontFamily: fontFamily.displaySemibold, fontSize: 24, lineHeight: 30 },
  headingM: { fontFamily: fontFamily.displaySemibold, fontSize: 20, lineHeight: 26 },
  headingS: { fontFamily: fontFamily.displaySemibold, fontSize: 18, lineHeight: 24 },

  // Titles / subtitles
  title: { fontFamily: fontFamily.displayMedium, fontSize: 16, lineHeight: 22, letterSpacing: 0.3 },
  subtitle: { fontFamily: fontFamily.sansMedium, fontSize: 14, lineHeight: 20, fontWeight: fontWeight.medium },

  // Body (system sans)
  bodyLarge: { fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular },
  body: { fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, fontWeight: fontWeight.regular },
  bodySmall: { fontFamily: fontFamily.sans, fontSize: 13, lineHeight: 18, fontWeight: fontWeight.regular },
  caption: { fontFamily: fontFamily.sans, fontSize: 12, lineHeight: 16, fontWeight: fontWeight.regular },

  // Interactive / meta (Chakra Petch for tactical labels)
  button: { fontFamily: fontFamily.displaySemibold, fontSize: 14, lineHeight: 18, letterSpacing: 0.8 },
  label: { fontFamily: fontFamily.displayMedium, fontSize: 12, lineHeight: 16, letterSpacing: 1.5, textTransform: 'uppercase' },
  badge: { fontFamily: fontFamily.displaySemibold, fontSize: 10, lineHeight: 12, letterSpacing: 1, textTransform: 'uppercase' },

  // Telemetry (JetBrains Mono)
  telemetryXL: { fontFamily: fontFamily.monoBold, fontSize: 44, lineHeight: 48, letterSpacing: 0.5 },
  telemetryL: { fontFamily: fontFamily.monoBold, fontSize: 30, lineHeight: 34, letterSpacing: 0.5 },
  telemetry: { fontFamily: fontFamily.monoMedium, fontSize: 16, lineHeight: 22, letterSpacing: 0.5 },
  telemetrySmall: { fontFamily: fontFamily.mono, fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
};

export const typography = { fontFamily, fontWeight, type };

export default typography;
