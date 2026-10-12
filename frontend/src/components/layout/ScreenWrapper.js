/**
 * ScreenWrapper — the standard screen shell.
 *
 * Composes the animated tactical background, safe-area insets, a status bar,
 * and consistent horizontal padding. Every screen should render inside this.
 *
 * @param {object} props
 * @param {boolean} [props.animatedBackground=false] use AnimatedBackground vs. flat fill.
 *   Flat is the calm default; only opt into the animated backdrop where motion
 *   genuinely communicates state (e.g. an active "searching" moment).
 * @param {boolean} [props.padded=true] apply default horizontal padding
 * @param {Array<'top'|'bottom'|'left'|'right'>} [props.edges]
 * @param {object} [props.style] inner content style
 * @param {React.ReactNode} props.children
 */
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme';
import AnimatedBackground from './AnimatedBackground';
import SafeAreaWrapper from './SafeAreaWrapper';

function ScreenWrapper({
  animatedBackground = false,
  padded = true,
  edges = ['top', 'bottom'],
  style,
  children,
}) {
  const content = (
    <SafeAreaWrapper edges={edges} background="transparent">
      <View style={[styles.content, padded && styles.padded, style]}>{children}</View>
    </SafeAreaWrapper>
  );

  return (
    <View style={styles.fill}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      {animatedBackground ? (
        <AnimatedBackground>{content}</AnimatedBackground>
      ) : (
        <View style={[styles.fill, styles.flat]}>{content}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flat: { backgroundColor: colors.background },
  content: { flex: 1 },
  padded: { paddingHorizontal: spacing.lg },
});

export default ScreenWrapper;
