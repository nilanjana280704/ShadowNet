/**
 * ShadowNet — usePressScale.
 * Tactile press feedback: scales a pressable down on press-in and back on
 * release. Returns { style, onPressIn, onPressOut } to wire to a Pressable.
 */
import { useRef } from 'react';
import { Animated } from 'react-native';

import { presets } from './presets';
import { useReducedMotion } from './useReducedMotion';

export function usePressScale({ to = 0.96 } = {}) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    if (reduced) return;
    Animated.timing(scale, { ...presets.press, toValue: to }).start();
  };
  const onPressOut = () => {
    if (reduced) return;
    Animated.timing(scale, presets.release).start();
  };

  return { style: { transform: [{ scale }] }, onPressIn, onPressOut };
}

export default usePressScale;
