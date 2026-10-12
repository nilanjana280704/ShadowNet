/**
 * ShadowNet — Gradient tokens.
 * Each entry is a { colors, start, end } spec ready for a linear-gradient
 * component (e.g. GradientContainer). Keep gradients subtle and purposeful.
 */
export const gradients = {
  // Deep operational backdrop (top -> bottom).
  backdrop: {
    colors: ['#071018', '#0D1B2A'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  // Primary accent sweep — CTAs, active routes.
  accent: {
    colors: ['#00E5A8', '#00C2FF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Critical wash — SOS / alarm surfaces.
  critical: {
    colors: ['#FF4D4F', '#7A1113'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Emergency wash.
  emergency: {
    colors: ['#FF7A1A', '#B23A00'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Surface sheen — subtle top-lit card fill.
  surface: {
    colors: ['#17324A', 'rgba(18, 38, 58, 0.35)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  // Radar / scan fade — translucent overlay.
  scan: {
    colors: ['rgba(0, 194, 255, 0)', 'rgba(0, 194, 255, 0.22)'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
};

export default gradients;
