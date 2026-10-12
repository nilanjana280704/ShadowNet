/**
 * EmergencyTile — a large, selectable grid tile (icon + label) used for quick
 * help categories and broadcast needs. One-tap, big target.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.icon
 * @param {string} [props.tone='accent']
 * @param {boolean} [props.selected]
 * @param {() => void} props.onPress
 */
import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../../theme';
import { usePressScale } from '../../../animations';
import { Icon, Text } from '../../../components';

function EmergencyTile({ label, icon, tone = 'accent', selected = false, onPress }) {
  const press = usePressScale({ to: 0.95 });
  return (
    <Animated.View style={[styles.wrap, press.style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        onPress={onPress}
        style={[styles.tile, selected && styles.selected]}
      >
        <View style={styles.iconChip}>
          <Icon name={icon} size="lg" color={tone} strokeWidth={2} />
        </View>
        <Text variant="subtitle" color="primary" align="center" numberOfLines={2}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  tile: {
    minHeight: 112,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.small,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.overlay.primary08 },
  iconChip: {
    width: 52,
    height: 52,
    borderRadius: radius.m,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EmergencyTile;
