/**
 * QuickStatusTile — a small at-a-glance status pill for the home "Quick Status"
 * row (Emergency Contacts, Saved Locations, Offline Maps, Battery, Emergency
 * Mode). Icon + value + label; optional custom trailing (e.g. a toggle/badge).
 *
 * @param {object} props
 * @param {string} props.icon icon name
 * @param {string|number} props.value the headline value
 * @param {string} props.label short caption
 * @param {string} [props.tone='accent'] icon color token
 * @param {() => void} [props.onPress]
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../theme';
import { Icon, Text } from '../atoms';

function QuickStatusTile({ icon, value, label, tone = 'accent', onPress }) {
  const Container = onPress ? Pressable : View;
  return (
    <Container
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `${label}: ${value}` : undefined}
      style={styles.tile}
    >
      <View style={styles.iconChip}>
        <Icon name={icon} size="sm" color={tone} />
      </View>
      <Text variant="headingS" color="primary">
        {value}
      </Text>
      <Text variant="caption" color="muted" numberOfLines={1}>
        {label}
      </Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 120,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadows.small,
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: radius.m,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
});

export default QuickStatusTile;
