/**
 * ShadowNet — Animation tokens.
 * Durations (ms) and easing curves. Motion is functional: it communicates
 * state change. Consume these instead of literal timings.
 */
import { Easing } from 'react-native';

export const duration = {
  instant: 90,
  fast: 160,
  base: 240,
  slow: 400,
  deliberate: 700,

  // Looping / ambient patterns
  pulse: 1600,
  signal: 1200,
  radar: 4000,
  ripple: 2000,
  scan: 1800,
  shimmer: 1400,
  route: 2200,
};

// Reusable easing functions (react-native Easing).
export const easing = {
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),
  emphasized: Easing.bezier(0.2, 0.0, 0, 1),
  linear: Easing.linear,
  sine: Easing.inOut(Easing.sin),
};

export default { duration, easing };
