/**
 * ErrorCard — a compact inline error banner for forms (e.g. failed sign-in).
 * Softly tinted, with an icon and optional dismiss.
 *
 * @param {object} props
 * @param {string} props.message
 * @param {'error'|'warning'} [props.tone='error']
 * @param {() => void} [props.onDismiss]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { Icon, IconButton, Text } from '../atoms';

const TONE = {
  error: { bg: colors.tint.errorBg, border: colors.tint.errorBorder, icon: 'error', color: 'error' },
  warning: { bg: colors.tint.warningBg, border: colors.tint.warningBorder, icon: 'warning', color: 'warning' },
};

function ErrorCard({ message, tone = 'error', onDismiss }) {
  const t = TONE[tone] || TONE.error;
  if (!message) return null;
  return (
    <View style={[styles.card, { backgroundColor: t.bg, borderColor: t.border }]}>
      <Icon name={t.icon} size="sm" color={t.color} />
      <Text variant="bodySmall" color={t.color} style={styles.message}>
        {message}
      </Text>
      {onDismiss ? (
        <IconButton icon="close" size="sm" color={t.color} accessibilityLabel="Dismiss" onPress={onDismiss} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.m,
    borderWidth: 1,
  },
  message: { flex: 1 },
});

export default ErrorCard;
