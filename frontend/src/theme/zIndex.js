/**
 * ShadowNet — Stacking order tokens.
 * Named layers so overlapping surfaces stack predictably app-wide.
 */
export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 100,
  dropdown: 1000,
  overlay: 2000,
  drawer: 2500,
  modal: 3000,
  toast: 4000,
  tooltip: 5000,
};

export default zIndex;
