/**
 * StatusBadge — a labelled status pill with a colored dot. Generic status
 * presentation reused across emergency, network, and system contexts.
 *
 * @param {object} props
 * @param {'nominal'|'success'|'info'|'warning'|'critical'|'error'|'offline'} [props.tone='nominal']
 * @param {string} props.label
 * @param {boolean} [props.solid=false] filled pill instead of outlined
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import Text from './Text';

const TONE = {
  nominal: { dot: colors.networkConnected, text: 'connected', bg: colors.tint.primaryBg, border: colors.tint.primaryBorder },
  success: { dot: colors.success, text: 'success', bg: colors.tint.successBg, border: colors.tint.successBorder },
  info: { dot: colors.info, text: 'info', bg: colors.tint.infoBg, border: colors.tint.infoBorder },
  warning: { dot: colors.warning, text: 'warning', bg: colors.tint.warningBg, border: colors.tint.warningBorder },
  critical: { dot: colors.critical, text: 'critical', bg: colors.tint.criticalBg, border: colors.tint.criticalBorder },
  error: { dot: colors.error, text: 'error', bg: colors.tint.errorBg, border: colors.tint.errorBorder },
  offline: { dot: colors.networkOffline, text: 'muted', bg: colors.surfaceElevated, border: colors.border },
};

function StatusBadge({ tone = 'nominal', label, solid = false }) {
  const t = TONE[tone] || TONE.nominal;
  return (
    <View style={[styles.pill, { backgroundColor: solid ? t.bg : colors.transparent, borderColor: t.border }]}>
      <View style={[styles.dot, { backgroundColor: t.dot }]} />
      <Text variant="label" color={t.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: radius.circle },
});

export default StatusBadge;
