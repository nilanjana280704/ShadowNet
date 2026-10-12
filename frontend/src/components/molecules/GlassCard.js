/**
 * GlassCard — translucent glassmorphism panel for use over a busy/animated
 * background. Use sparingly for emphasis. Optional gradient sheen.
 *
 * @param {object} props
 * @param {keyof import('../../theme/spacing').spacing|number} [props.padding='lg']
 * @param {boolean} [props.sheen=true] apply a subtle top-lit gradient
 * @param {() => void} [props.onPress]
 * @param {object} [props.style]
 * @param {React.ReactNode} props.children
 */
import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing as spacingTokens } from '../../theme';
import { usePressScale } from '../../animations';
import { GradientContainer } from '../layout';

function GlassCard({ padding = 'lg', sheen = true, onPress, style, children, ...rest }) {
  const press = usePressScale({ to: 0.98 });
  const pad = typeof padding === 'number' ? padding : spacingTokens[padding];

  const inner = sheen ? (
    <GradientContainer gradient="surface" style={[styles.fill, { padding: pad }]}>
      {children}
    </GradientContainer>
  ) : (
    <View style={[styles.fill, { padding: pad }]}>{children}</View>
  );

  const frame = [styles.base, style];

  if (!onPress) {
    return (
      <View style={frame} {...rest}>
        {inner}
      </View>
    );
  }

  return (
    <Animated.View style={press.style}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={frame}
        {...rest}
      >
        {inner}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.glassSurface,
    overflow: 'hidden',
    ...shadows.glass,
  },
  fill: { flex: 0 },
});

export default GlassCard;
