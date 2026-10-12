/**
 * ShadowNet — Animation presets.
 * Declarative timing configs for common transitions. Feed the returned config
 * into Animated.timing(value, config). Keeps durations/easing consistent.
 */
import { duration, easing } from './tokens';

export const presets = {
  fadeIn: { toValue: 1, duration: duration.base, easing: easing.decelerate, useNativeDriver: true },
  fadeOut: { toValue: 0, duration: duration.fast, easing: easing.accelerate, useNativeDriver: true },
  scaleIn: { toValue: 1, duration: duration.base, easing: easing.emphasized, useNativeDriver: true },
  scaleOut: { toValue: 0, duration: duration.fast, easing: easing.accelerate, useNativeDriver: true },
  slideIn: { toValue: 0, duration: duration.slow, easing: easing.emphasized, useNativeDriver: true },
  slideOut: { toValue: 1, duration: duration.base, easing: easing.accelerate, useNativeDriver: true },
  press: { toValue: 0.96, duration: duration.instant, easing: easing.standard, useNativeDriver: true },
  release: { toValue: 1, duration: duration.fast, easing: easing.decelerate, useNativeDriver: true },
};

export default presets;
