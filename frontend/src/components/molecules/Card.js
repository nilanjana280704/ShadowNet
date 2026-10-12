/**
 * Card — the base surface container. Optionally pressable and glowing.
 * Other cards (Status/Network/Metric/Alert/Glass) compose this.
 *
 * @param {object} props
 * @param {'surface'|'elevated'|'outline'} [props.variant='surface']
 * @param {keyof import('../../theme/spacing').spacing|number} [props.padding='lg']
 * @param {string} [props.glowColor] an rgba from colors.glow.* for a halo
 * @param {() => void} [props.onPress] makes the card pressable
 * @param {object} [props.style]
 * @param {React.ReactNode} props.children
 */
import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing as spacingTokens, glow } from '../../theme';
import { usePressScale } from '../../animations';

const VARIANT = StyleSheet.create({
  surface: { backgroundColor: colors.surface, borderColor: colors.border, ...shadows.medium },
  elevated: { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong, ...shadows.large },
  outline: { backgroundColor: colors.transparent, borderColor: colors.border },
});

function Card({ variant = 'surface', padding = 'lg', glowColor, onPress, style, children, ...rest }) {
  const press = usePressScale({ to: 0.98 });
  const pad = typeof padding === 'number' ? padding : spacingTokens[padding];
  const cardStyle = [
    styles.base,
    VARIANT[variant],
    { padding: pad },
    glowColor && glow(glowColor, 16),
    style,
  ];

  if (!onPress) {
    return (
      <View style={cardStyle} {...rest}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View style={press.style}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={cardStyle}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.l, borderWidth: 1 },
});

export default Card;
