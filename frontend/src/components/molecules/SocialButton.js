/**
 * SocialButton — an outlined third-party sign-in button (e.g. Continue with
 * Google). The provider glyph is a neutral monogram chip (a real brand asset
 * replaces it when the integration lands).
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} [props.monogram] single-letter provider mark (e.g. 'G')
 * @param {string} [props.icon] icon name (alternative to a monogram)
 * @param {boolean} [props.disabled]
 * @param {() => void} props.onPress
 */
import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { controlHeight } from '../../constants/layout';
import { usePressScale } from '../../animations';
import { Icon, Text } from '../atoms';

function SocialButton({ label, monogram, icon, disabled = false, onPress }) {
  const press = usePressScale();
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[styles.button, disabled && styles.disabled]}
      >
        <View style={styles.mark}>
          {icon ? (
            <Icon name={icon} size="sm" color="primary" />
          ) : (
            <Text variant="button" color="primary">
              {monogram}
            </Text>
          )}
        </View>
        <Text variant="button" color="primary" style={styles.label}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: controlHeight.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  mark: {
    width: 24,
    height: 24,
    borderRadius: radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  label: { textTransform: 'none' },
  disabled: { opacity: 0.45 },
});

export default SocialButton;
