/**
 * useTheme — access the design tokens from any component.
 * The theme is static (single dark tactical theme), so this simply returns the
 * shared token object. Centralizing access here means a future multi-theme
 * capability can be added without touching call sites.
 */
import { theme } from '../theme';

export function useTheme() {
  return theme;
}

export default useTheme;
