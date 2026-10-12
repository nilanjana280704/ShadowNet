/**
 * SafeAreaWrapper — applies safe-area insets on chosen edges over the tactical
 * background. Thin wrapper around react-native-safe-area-context.
 *
 * @param {object} props
 * @param {Array<'top'|'bottom'|'left'|'right'>} [props.edges=['top','bottom']]
 * @param {string} [props.background=colors.background] background color token/raw
 * @param {object} [props.style]
 * @param {React.ReactNode} props.children
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme';

function SafeAreaWrapper({
  edges = ['top', 'bottom'],
  background = colors.background,
  style,
  children,
  ...rest
}) {
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.fill, { backgroundColor: background }, style]}
      {...rest}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});

export default SafeAreaWrapper;
