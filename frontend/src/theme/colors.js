/**
 * ShadowNet — Color tokens.
 *
 * Calm, trustworthy disaster-response palette: near-black grounds with a
 * restrained deep-forest-green brand, red reserved exclusively for SOS/
 * emergency states. Components consume the semantic tokens below (what a
 * color is *for*) — never the raw `palette` and never a literal hex.
 */

// Raw brand palette — internal. Do not import directly in components.
const palette = {
  black: '#0A0E0C',
  charcoal: '#0F1512',
  charcoalLight: '#141C17',
  charcoalElevated: '#1B2620',
  forest: '#1F4D38',
  forestDeep: '#153526',
  emerald: '#3E7A5C',
  green: '#4FBE85',
  greenStrong: '#46B876',
  amber: '#D9A441',
  amberDeep: '#B5822F',
  red: '#E5484D',
  redDeep: '#B9302F',
  white: '#F4F7F5',
  mist: '#9AA79E',
  ash: '#6B7A70',
};

export const colors = {
  palette,

  // Absence of color (token so components never inline the literal 'transparent')
  transparent: 'transparent',

  // Brand
  primary: palette.forest,
  primaryDeep: palette.forestDeep,
  secondary: palette.emerald,
  secondaryDeep: palette.forestDeep,

  // Grounds / surfaces (back to front)
  background: palette.black,
  backgroundAlt: palette.charcoal,
  surface: palette.charcoalLight,
  surfaceElevated: palette.charcoalElevated,
  glassSurface: 'rgba(20, 28, 23, 0.55)',
  glassSurfaceStrong: 'rgba(20, 28, 23, 0.72)',
  scrim: 'rgba(10, 14, 12, 0.72)',

  // Text
  textPrimary: palette.white,
  textSecondary: palette.mist,
  textMuted: palette.ash,
  textInverse: palette.black,
  textAccent: palette.green,

  // Lines
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',
  borderAccent: 'rgba(79, 190, 133, 0.35)',
  divider: 'rgba(255, 255, 255, 0.06)',

  // Semantic status
  success: palette.greenStrong,
  warning: palette.amber,
  error: palette.red,
  info: palette.green,

  // Network state — offline is neutral, never alarming; red stays SOS-only.
  networkConnected: palette.greenStrong,
  networkWeak: palette.amber,
  networkOffline: palette.ash,

  // Emergency — the only place red/orange appear in the UI.
  sos: palette.red,
  emergency: palette.red,
  critical: palette.redDeep,

  // Functional domains (feature-area accents)
  telemetry: palette.mist,
  maps: palette.green,
  navigation: palette.green,
  analytics: palette.emerald,

  // On-color text (legible foreground on a filled chip of that color)
  onPrimary: palette.white,
  onSecondary: palette.white,
  onSuccess: palette.black,
  onWarning: palette.black,
  onError: palette.white,
  onCritical: palette.white,

  // Glows — used sparingly now: only genuinely active SOS/countdown states,
  // not ambient decoration. Lower opacity than before by design.
  glow: {
    primary: 'rgba(79, 190, 133, 0.35)',
    secondary: 'rgba(62, 122, 92, 0.35)',
    success: 'rgba(70, 184, 118, 0.35)',
    warning: 'rgba(217, 164, 65, 0.35)',
    error: 'rgba(229, 72, 77, 0.45)',
    sos: 'rgba(229, 72, 77, 0.45)',
  },

  // Translucent overlays for pressed/hover/disabled states and scrims.
  overlay: {
    white04: 'rgba(255, 255, 255, 0.04)',
    white08: 'rgba(255, 255, 255, 0.08)',
    white12: 'rgba(255, 255, 255, 0.12)',
    white16: 'rgba(255, 255, 255, 0.16)',
    black24: 'rgba(0, 0, 0, 0.24)',
    black40: 'rgba(0, 0, 0, 0.40)',
    black60: 'rgba(0, 0, 0, 0.60)',
    primary08: 'rgba(79, 190, 133, 0.08)',
    primary16: 'rgba(79, 190, 133, 0.16)',
    secondary08: 'rgba(62, 122, 92, 0.08)',
    error08: 'rgba(229, 72, 77, 0.08)',
    error16: 'rgba(229, 72, 77, 0.16)',
  },

  // Soft status tints — low-alpha fills + borders for chips, badges, and state
  // surfaces. The canonical place these translucent values are defined.
  tint: {
    primaryBg: 'rgba(79, 190, 133, 0.14)',
    primaryBorder: 'rgba(79, 190, 133, 0.35)',
    successBg: 'rgba(70, 184, 118, 0.14)',
    successBorder: 'rgba(70, 184, 118, 0.35)',
    warningBg: 'rgba(217, 164, 65, 0.14)',
    warningBorder: 'rgba(217, 164, 65, 0.35)',
    errorBg: 'rgba(229, 72, 77, 0.14)',
    errorBorder: 'rgba(229, 72, 77, 0.40)',
    infoBg: 'rgba(79, 190, 133, 0.12)',
    infoBorder: 'rgba(79, 190, 133, 0.35)',
    criticalBg: 'rgba(185, 48, 47, 0.16)',
    criticalBorder: 'rgba(185, 48, 47, 0.45)',
  },

  // Signal-strength ramp (weak -> strong) — amber to green, never red (red is
  // reserved for SOS/emergency, not signal quality).
  signal: ['#D9A441', '#7FA98F', '#4FBE85', '#46B876'],
};

export default colors;
