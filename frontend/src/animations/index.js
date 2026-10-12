/**
 * ShadowNet — Animation system entry point.
 *   import { usePulse, useFadeIn, duration, easing } from 'src/animations';
 *
 * Tokens + presets + reusable hooks. All motion is functional and respects the
 * OS reduce-motion setting.
 */
export { duration, easing } from './tokens';
export { presets } from './presets';
export { useReducedMotion } from './useReducedMotion';
export { useFadeIn, useScaleIn, useSlideIn } from './useEntrance';
export {
  usePulse,
  useRadarSweep,
  useSignalPulse,
  useRipple,
  useNodeDiscovery,
  useNetworkScan,
  useRouteAnimation,
} from './useLoops';
export { useShimmer, useSkeletonPulse } from './useShimmer';
export { usePressScale } from './usePressScale';
