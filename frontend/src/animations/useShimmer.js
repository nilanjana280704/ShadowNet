/**
 * ShadowNet — Shimmer / skeleton loading hooks.
 * A sweeping highlight for skeleton placeholders while data loads.
 */
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import { duration, easing } from './tokens';
import { useReducedMotion } from './useReducedMotion';

/**
 * Sweeping shimmer highlight across a skeleton of known width.
 * @param {number} width container width in dp
 * @returns animated style { transform:[{ translateX }] }
 */
export function useShimmer(width, { enabled = true } = {}) {
  const reduced = useReducedMotion();
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled || reduced) {
      value.setValue(0);
      return undefined;
    }
    const anim = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration: duration.shimmer,
        easing: easing.standard,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [enabled, reduced, value]);

  return {
    transform: [
      {
        translateX: value.interpolate({
          inputRange: [0, 1],
          outputRange: [-(width || 0), width || 0],
        }),
      },
    ],
  };
}

/**
 * Pulsing opacity for a static skeleton block (no measured width needed).
 * @returns animated style { opacity }
 */
export function useSkeletonPulse({ enabled = true } = {}) {
  const reduced = useReducedMotion();
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled || reduced) {
      value.setValue(0.5);
      return undefined;
    }
    const anim = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration: duration.shimmer,
        easing: easing.sine,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [enabled, reduced, value]);

  return { opacity: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.6, 0.3] }) };
}

export default { useShimmer, useSkeletonPulse };
