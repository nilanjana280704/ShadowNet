/**
 * ShadowNet — Theme entry point.
 *
 * Single import surface for the Dark Tactical design system:
 *   import { theme } from 'src/theme';
 *   import { colors, type, spacing, radius, shadows } from 'src/theme';
 *
 * The design language is documented in docs/DesignSystem.md. Screens and
 * components must consume these tokens rather than hard-coding values.
 * Animation tokens/hooks live in src/animations.
 */
import { colors } from './colors';
import { gradients } from './gradients';
import { opacity } from './opacity';
import { typography, type, fontFamily, fontWeight } from './typography';
import { spacing, radius, borderWidth, hitTarget } from './spacing';
import { shadows, elevation, glass, glow } from './shadows';
import { zIndex } from './zIndex';

export const theme = {
  colors,
  gradients,
  opacity,
  typography,
  type,
  fontFamily,
  fontWeight,
  spacing,
  radius,
  borderWidth,
  hitTarget,
  shadows,
  elevation,
  glass,
  glow,
  zIndex,
};

export {
  colors,
  gradients,
  opacity,
  typography,
  type,
  fontFamily,
  fontWeight,
  spacing,
  radius,
  borderWidth,
  hitTarget,
  shadows,
  elevation,
  glass,
  glow,
  zIndex,
};

export default theme;
