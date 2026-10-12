/**
 * ShadowNet — Theme resolver helpers.
 * Map friendly prop names to design tokens so components accept semantic values
 * (color="success", size="lg") instead of literals. Shared to avoid duplicating
 * the mapping in every component.
 */
import { colors } from '../theme';
import { iconSize as iconSizeToken } from '../constants/layout';

// Semantic text/foreground color names -> token values.
const COLOR_MAP = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  muted: colors.textMuted,
  inverse: colors.textInverse,
  accent: colors.primary,
  brand: colors.primary,
  brandSecondary: colors.secondary,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,
  sos: colors.sos,
  emergency: colors.emergency,
  critical: colors.critical,
  connected: colors.networkConnected,
  weak: colors.networkWeak,
  offline: colors.networkOffline,
  telemetry: colors.telemetry,
  maps: colors.maps,
  navigation: colors.navigation,
  analytics: colors.analytics,
  onPrimary: colors.onPrimary,
};

/**
 * Resolve a color prop to a token value.
 * @param {string} name semantic key (e.g. 'success') or a raw color string
 * @param {string} [fallback=colors.textPrimary]
 */
export function resolveColor(name, fallback = colors.textPrimary) {
  if (!name) return fallback;
  if (COLOR_MAP[name]) return COLOR_MAP[name];
  // Already a concrete color (hex / rgba) — pass through.
  if (typeof name === 'string' && (name.startsWith('#') || name.startsWith('rgb'))) {
    return name;
  }
  return fallback;
}

/**
 * Resolve an icon size prop (token key or number) to dp.
 * @param {string|number} size
 */
export function resolveIconSize(size = 'md') {
  if (typeof size === 'number') return size;
  return iconSizeToken[size] || iconSizeToken.md;
}

export { COLOR_MAP };
