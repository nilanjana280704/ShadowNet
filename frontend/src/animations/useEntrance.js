/**
 * ShadowNet — Entrance animation hooks.
 * Fade, scale, and slide entrances. Each returns an animated `style` object to
 * spread onto an Animated.View. All respect reduce-motion (snap to final).
 */
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import { duration, easing } from './tokens';
import { useReducedMotion } from './useReducedMotion';

/**
 * Fade + rise in.
 * @param {object} [opts]
 * @param {boolean} [opts.enabled=true] run on mount
 * @param {number} [opts.delay=0]
 * @param {number} [opts.distance=12] rise distance in dp
 */
export function useFadeIn({ enabled = true, delay = 0, distance = 12 } = {}) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(enabled ? 0 : 1)).current;

  useEffect(() => {
    if (!enabled) return undefined;
    if (reduced) {
      progress.setValue(1);
      return undefined;
    }
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: duration.base,
      delay,
      easing: easing.decelerate,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [enabled, delay, reduced, progress]);

  return {
    opacity: progress,
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [distance, 0],
        }),
      },
    ],
  };
}

/**
 * Scale + fade in (emphasis entrance for cards, badges, modals).
 * @param {object} [opts]
 * @param {number} [opts.from=0.92] initial scale
 */
export function useScaleIn({ enabled = true, delay = 0, from = 0.92 } = {}) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(enabled ? 0 : 1)).current;

  useEffect(() => {
    if (!enabled) return undefined;
    if (reduced) {
      progress.setValue(1);
      return undefined;
    }
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: duration.base,
      delay,
      easing: easing.emphasized,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [enabled, delay, reduced, progress]);

  return {
    opacity: progress,
    transform: [
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [from, 1] }) },
    ],
  };
}

/**
 * Slide in from an edge.
 * @param {object} [opts]
 * @param {'left'|'right'|'top'|'bottom'} [opts.from='bottom']
 * @param {number} [opts.distance=24]
 */
export function useSlideIn({ enabled = true, delay = 0, from = 'bottom', distance = 24 } = {}) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(enabled ? 0 : 1)).current;

  useEffect(() => {
    if (!enabled) return undefined;
    if (reduced) {
      progress.setValue(1);
      return undefined;
    }
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: duration.slow,
      delay,
      easing: easing.emphasized,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [enabled, delay, reduced, progress]);

  const axis = from === 'left' || from === 'right' ? 'translateX' : 'translateY';
  const sign = from === 'left' || from === 'top' ? -1 : 1;

  return {
    opacity: progress,
    transform: [
      {
        [axis]: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [sign * distance, 0],
        }),
      },
    ],
  };
}

export default { useFadeIn, useScaleIn, useSlideIn };
