/**
 * ShadowNet — Looping animation hooks.
 *
 * Ambient, information-bearing loops: pulse (live), radar sweep (scanning),
 * signal pulse, SOS ripple, node discovery, network scan, route flow. Each
 * respects reduce-motion by holding a resting value. Hooks return either an
 * animated `style` or a raw Animated.Value where a component needs to map it
 * itself (e.g. SVG props).
 */
import { useEffect, useMemo, useRef } from 'react';
import { Animated } from 'react-native';

import { duration, easing } from './tokens';
import { useReducedMotion } from './useReducedMotion';

/** Internal: drive a value 0->1 on a timed loop. */
function useLoopValue(loopDuration, enabled, reduced, curve = easing.linear) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled || reduced) {
      value.setValue(0);
      return undefined;
    }
    const anim = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration: loopDuration,
        easing: curve,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [loopDuration, enabled, reduced, curve, value]);
  return value;
}

/**
 * Breathing pulse for "live"/nominal indicators.
 * @returns animated style { opacity, transform:[{scale}] }
 */
export function usePulse({ enabled = true } = {}) {
  const reduced = useReducedMotion();
  const v = useLoopValue(duration.pulse, enabled, reduced, easing.sine);
  return {
    opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1, 0.5] }),
    transform: [
      { scale: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.15, 1] }) },
    ],
  };
}

/**
 * Rotating radar sweep.
 * @returns animated style { transform:[{ rotate }] }
 */
export function useRadarSweep({ enabled = true } = {}) {
  const reduced = useReducedMotion();
  const v = useLoopValue(duration.radar, enabled, reduced);
  return {
    transform: [
      { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
    ],
  };
}

/**
 * Quick signal pulse — for bars / connection scanning.
 * @returns animated style { opacity }
 */
export function useSignalPulse({ enabled = true } = {}) {
  const reduced = useReducedMotion();
  const v = useLoopValue(duration.signal, enabled, reduced, easing.sine);
  return { opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.35, 1, 0.35] }) };
}

/**
 * Expanding rings — SOS beacon / node discovery. Render one Animated.View per
 * returned style.
 * @param {object} [opts]
 * @param {number} [opts.count=3] number of concentric rings
 * @param {number} [opts.maxScale=3.2]
 * @returns array of animated styles { opacity, transform:[{scale}] }
 */
export function useRipple({ enabled = true, count = 3, maxScale = 3.2 } = {}) {
  const reduced = useReducedMotion();
  const values = useRef(
    Array.from({ length: count }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (!enabled || reduced) {
      values.forEach((v) => v.setValue(0));
      return undefined;
    }
    const anims = values.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay((duration.ripple / count) * i),
          Animated.timing(v, {
            toValue: 1,
            duration: duration.ripple,
            easing: easing.decelerate,
            useNativeDriver: true,
          }),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [enabled, reduced, count, values]);

  return useMemo(
    () =>
      values.map((v) => ({
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
        transform: [
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, maxScale] }) },
        ],
      })),
    [values, maxScale]
  );
}

/** Node discovery is a single expanding ring — alias over useRipple. */
export function useNodeDiscovery(opts = {}) {
  return useRipple({ count: 1, maxScale: 2.6, ...opts });
}

/**
 * Horizontal scan sweep across a container of known width.
 * @param {number} width container width in dp
 * @returns animated style { transform:[{ translateX }] }
 */
export function useNetworkScan(width, { enabled = true } = {}) {
  const reduced = useReducedMotion();
  const v = useLoopValue(duration.scan, enabled, reduced, easing.standard);
  return {
    transform: [
      {
        translateX: v.interpolate({
          inputRange: [0, 1],
          outputRange: [-(width || 0), width || 0],
        }),
      },
    ],
  };
}

/**
 * Route flow — a 0->1 value for animating SVG strokeDashoffset along a path.
 * Returned value is non-native-driven; bind it to an Animated SVG prop.
 * @returns Animated.Value (0..1)
 */
export function useRouteAnimation({ enabled = true } = {}) {
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
        duration: duration.route,
        easing: easing.linear,
        useNativeDriver: false,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [enabled, reduced, value]);
  return value;
}

export default {
  usePulse,
  useRadarSweep,
  useSignalPulse,
  useRipple,
  useNodeDiscovery,
  useNetworkScan,
  useRouteAnimation,
};
