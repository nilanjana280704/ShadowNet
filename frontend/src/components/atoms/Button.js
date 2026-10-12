/**
 * Button — primary action control.
 *
 * @param {object} props
 * @param {string} props.label button text
 * @param {'primary'|'secondary'|'ghost'|'danger'|'glass'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.icon] leading icon name (constants/icons)
 * @param {boolean} [props.loading=false] show spinner, disable press
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.fullWidth=false] stretch to container width
 * @param {() => void} props.onPress
 */
import React from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { controlHeight } from '../../constants/layout';
import { usePressScale } from '../../animations';
import Icon from './Icon';
import Text from './Text';

const VARIANT = StyleSheet.create({
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  secondary: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  danger: { backgroundColor: colors.error, borderColor: colors.error },
  ghost: { backgroundColor: colors.transparent, borderColor: colors.borderStrong },
  glass: { backgroundColor: colors.glassSurface, borderColor: colors.border },
});

// Foreground (label + icon) color per variant.
const FG = {
  primary: 'inverse',
  secondary: 'inverse',
  danger: 'onPrimary',
  ghost: 'primary',
  glass: 'primary',
};

const SIZE = StyleSheet.create({
  sm: { height: controlHeight.sm, paddingHorizontal: spacing.md },
  md: { height: controlHeight.md, paddingHorizontal: spacing.lg },
  lg: { height: controlHeight.lg, paddingHorizontal: spacing.xl },
});

function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  style,
  ...rest
}) {
  const press = usePressScale();
  const isDisabled = disabled || loading;
  const fg = FG[variant];

  return (
    <Animated.View style={[fullWidth && styles.fullWidth, press.style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[
          styles.base,
          SIZE[size],
          VARIANT[variant],
          isDisabled && styles.disabled,
          style,
        ]}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={colors.textPrimary} size="small" />
        ) : (
          <View style={styles.row}>
            {icon ? <Icon name={icon} size="sm" color={fg} /> : null}
            <Text variant="button" color={fg} style={styles.label}>
              {label}
            </Text>
          </View>
        )}
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
    flexDirection: 'row',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  label: { textTransform: 'uppercase' },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.45 },
});

export default Button;
