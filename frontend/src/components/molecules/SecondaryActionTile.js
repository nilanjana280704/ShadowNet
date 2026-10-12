/**
 * SecondaryActionTile — a compact, friendly shortcut tile (Emergency Contacts,
 * Volunteers, Resources, Missing Persons, Updates). Designed for a 2- or
 * 3-column grid.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.icon icon name
 * @param {string} [props.tone='accent'] icon color token
 * @param {string|number} [props.badge] optional count/badge
 * @param {() => void} props.onPress
 */
import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../theme';
import { usePressScale } from '../../animations';
import { Badge, Icon, Text } from '../atoms';

function SecondaryActionTile({ title, icon, tone = 'accent', badge, onPress, style }) {
  const press = usePressScale({ to: 0.96 });
  return (
    <Animated.View style={[styles.wrap, press.style, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={styles.tile}
      >
        <View style={styles.top}>
          <View style={styles.iconChip}>
            <Icon name={icon} size="md" color={tone} />
          </View>
          {badge !== undefined ? <Badge label={badge} tone="primary" /> : null}
        </View>
        <Text variant="subtitle" color="primary" numberOfLines={2}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, borderRadius: radius.l },
  tile: {
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
    minHeight: 104,
    justifyContent: 'space-between',
    ...shadows.small,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.m,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SecondaryActionTile;
