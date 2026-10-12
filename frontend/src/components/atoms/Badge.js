/**
 * Badge — compact status/count label.
 *
 * @param {object} props
 * @param {string|number} [props.label] badge text (omit for a dot badge)
 * @param {'neutral'|'primary'|'success'|'warning'|'error'|'info'|'critical'} [props.tone='neutral']
 * @param {boolean} [props.dot=false] render a small dot instead of text
 * @param {boolean} [props.outline=false] outlined instead of filled
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import Text from './Text';

const TONE = {
  neutral: { bg: colors.surfaceElevated, fg: 'secondary', border: colors.border },
  primary: { bg: colors.tint.primaryBg, fg: 'accent', border: colors.tint.primaryBorder },
  success: { bg: colors.tint.successBg, fg: 'success', border: colors.tint.successBorder },
  warning: { bg: colors.tint.warningBg, fg: 'warning', border: colors.tint.warningBorder },
  error: { bg: colors.tint.errorBg, fg: 'error', border: colors.tint.errorBorder },
  info: { bg: colors.tint.infoBg, fg: 'info', border: colors.tint.infoBorder },
  critical: { bg: colors.tint.criticalBg, fg: 'critical', border: colors.tint.criticalBorder },
};

function Badge({ label, tone = 'neutral', dot = false, outline = false }) {
  const t = TONE[tone] || TONE.neutral;

  if (dot) {
    return <View style={[styles.dot, { backgroundColor: colors[tone] || colors.textMuted }]} />;
  }

  const fillStyle = { backgroundColor: outline ? colors.transparent : t.bg, borderColor: t.border };
  return (
    <View style={[styles.badge, fillStyle]}>
      <Text variant="badge" color={t.fg}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radius.s,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.circle,
  },
});

export default Badge;
