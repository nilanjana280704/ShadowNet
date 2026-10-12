/**
 * ShadowNet — Shadow & elevation system.
 *
 * `shadows.*` spread directly into a View style (iOS shadow* + Android
 * elevation). `elevation` is the raw numeric ladder for cases that only need
 * the Android value or a z-context reference. `glow()` builds a colored halo.
 */
import { colors } from './colors';

// Numeric elevation ladder (Android elevation / conceptual depth).
export const elevation = {
  none: 0,
  low: 2,
  medium: 6,
  high: 12,
  overlay: 20,
  modal: 24,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: elevation.none,
  },
  small: {
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: elevation.low,
  },
  medium: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: elevation.medium,
  },
  large: {
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: elevation.high,
  },
  floating: {
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 18 },
    elevation: elevation.overlay,
  },
  glass: {
    shadowColor: colors.secondary,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: elevation.medium,
  },
  modal: {
    shadowColor: '#000000',
    shadowOpacity: 0.6,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 24 },
    elevation: elevation.modal,
  },
};

// Glassmorphism surface presets (fill + hairline + intended blur radius).
export const glass = {
  panel: {
    backgroundColor: colors.glassSurface,
    borderColor: colors.border,
    borderWidth: 1,
    blurRadius: 18,
  },
  raised: {
    backgroundColor: colors.glassSurfaceStrong,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    blurRadius: 24,
  },
};

/**
 * Colored halo for status dots, active nodes, SOS beacons, focus rings.
 * @param {string} glowColor - an rgba from colors.glow.*
 * @param {number} [radius=12]
 */
export const glow = (glowColor, radius = 12) => ({
  shadowColor: glowColor,
  shadowOpacity: 1,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: 0 },
  elevation: 0,
});

export default { shadows, elevation, glass, glow };
