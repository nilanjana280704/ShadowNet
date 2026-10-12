/**
 * FAB — floating action button. Circular, elevated, glowing; for the single
 * primary action on a screen (e.g. arm SOS, add node).
 *
 * @param {object} props
 * @param {string} props.icon icon name (constants/icons)
 * @param {'primary'|'sos'} [props.variant='primary']
 * @param {'md'|'lg'} [props.size='lg']
 * @param {string} props.accessibilityLabel required for a11y
 * @param {() => void} props.onPress
 */
import React from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

import { colors, radius, shadows, glow } from '../../theme';
import { usePressScale } from '../../animations';
import Icon from './Icon';

const BOX = StyleSheet.create({
  md: { width: 52, height: 52 },
  lg: { width: 64, height: 64 },
});

const VARIANT = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  sos: { backgroundColor: colors.sos },
});

const GLOW = {
  primary: glow(colors.glow.primary, 18),
  sos: glow(colors.glow.sos, 22),
};

const FG = { primary: 'inverse', sos: 'onPrimary' };

function FAB({
  icon,
  variant = 'primary',
  size = 'lg',
  accessibilityLabel,
  onPress,
  style,
  ...rest
}) {
  const press = usePressScale({ to: 0.92 });
  return (
    <Animated.View style={[styles.wrap, GLOW[variant], press.style, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[styles.base, BOX[size], VARIANT[variant]]}
        {...rest}
      >
        <Icon name={icon} size="lg" color={FG[variant]} strokeWidth={2} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.circle, ...shadows.large },
  base: {
    borderRadius: radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FAB;
