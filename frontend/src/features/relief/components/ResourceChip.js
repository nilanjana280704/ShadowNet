/**
 * ResourceChip — a category chip (icon + label) for the map's browse rail and
 * filter rows. Slightly larger than the base Chip for glanceable one-handed use.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} [props.icon]
 * @param {string} [props.tone='accent'] icon tone when active
 * @param {boolean} [props.selected]
 * @param {() => void} props.onPress
 */
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing } from '../../../theme';
import { Icon, Text } from '../../../components';

function ResourceChip({ label, icon, tone = 'accent', selected = false, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.chip, selected ? styles.selected : styles.idle]}
    >
      {icon ? <Icon name={icon} size="sm" color={selected ? 'accent' : tone} /> : null}
      <Text variant="subtitle" color={selected ? 'accent' : 'primary'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    ...shadows.small,
  },
  idle: { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong },
  selected: { backgroundColor: colors.overlay.primary16, borderColor: colors.borderAccent },
});

export default ResourceChip;
