/**
 * IconButton — a tappable icon with an accessible touch target.
 *
 * @param {object} props
 * @param {string} props.icon icon name (constants/icons)
 * @param {'solid'|'ghost'|'glass'} [props.variant='ghost']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.color] icon color token (defaults per variant)
 * @param {string} props.accessibilityLabel required for a11y
 * @param {boolean} [props.disabled=false]
 * @param {() => void} props.onPress
 */
import React from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

import { colors, radius, hitTarget } from '../../theme';
import { usePressScale } from '../../animations';
import Icon from './Icon';

const BOX = StyleSheet.create({
  sm: { width: 36, height: 36 },
  md: { width: hitTarget.min, height: hitTarget.min },
  lg: { width: hitTarget.comfortable, height: hitTarget.comfortable },
});

const ICON_SIZE = { sm: 'sm', md: 'md', lg: 'lg' };

const VARIANT = StyleSheet.create({
  solid: { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
  ghost: { backgroundColor: colors.transparent, borderColor: colors.transparent },
  glass: { backgroundColor: colors.glassSurface, borderColor: colors.border },
});

function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  color = 'primary',
  accessibilityLabel,
  disabled = false,
  onPress,
  style,
  ...rest
}) {
  const press = usePressScale();
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[styles.base, BOX[size], VARIANT[variant], disabled && styles.disabled, style]}
        {...rest}
      >
        <Icon name={icon} size={ICON_SIZE[size]} color={color} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.m,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.45 },
});

export default IconButton;
