/**
 * Chip — selectable filter / tag pill.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} [props.icon] optional leading icon name
 * @param {boolean} [props.selected=false]
 * @param {boolean} [props.disabled=false]
 * @param {() => void} [props.onPress]
 */
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import Icon from './Icon';
import Text from './Text';

function Chip({ label, icon, selected = false, disabled = false, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.base, selected ? styles.selected : styles.idle, disabled && styles.disabled]}
    >
      {icon ? (
        <Icon name={icon} size="xs" color={selected ? 'accent' : 'secondary'} />
      ) : null}
      <Text variant="caption" color={selected ? 'accent' : 'secondary'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  idle: { backgroundColor: colors.surface, borderColor: colors.border },
  selected: { backgroundColor: colors.overlay.primary16, borderColor: colors.borderAccent },
  disabled: { opacity: 0.45 },
});

export default Chip;
