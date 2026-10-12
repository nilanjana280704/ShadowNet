/**
 * ShadowNet — Layout constants.
 * Fixed sizes and screen metrics shared across components.
 */
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const screen = {
  width,
  height,
  isSmall: width < 360,
};

// Standard icon sizes (dp).
export const iconSize = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 44,
};

// Standard control heights (dp) — align with hitTarget tokens.
export const controlHeight = {
  sm: 40,
  md: 48,
  lg: 56,
};

// Avatar sizes (dp).
export const avatarSize = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96,
};

export default { screen, iconSize, controlHeight, avatarSize };
