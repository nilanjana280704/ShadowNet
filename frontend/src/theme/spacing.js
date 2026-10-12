/**
 * ShadowNet — Spacing, radius, border, and hit-target tokens.
 * 4pt base grid. Consume these instead of literal numbers so rhythm stays
 * consistent across every screen.
 */

// Spacing scale (dp). Both numeric-key and t-shirt aliases are provided.
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,

  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

export const radius = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  pill: 999,
  circle: 9999,
};

export const borderWidth = {
  hairline: 1,
  thin: 1,
  thick: 2,
};

// Minimum interactive sizes — accessibility: large targets for gloved,
// high-stress use.
export const hitTarget = {
  min: 48,
  comfortable: 56,
  large: 72,
};

export default { spacing, radius, borderWidth, hitTarget };
