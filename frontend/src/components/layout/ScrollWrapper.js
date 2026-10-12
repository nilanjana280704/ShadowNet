/**
 * ScrollWrapper — a themed vertical ScrollView with sensible defaults
 * (hidden indicators option, consistent content padding, keyboard handling).
 *
 * @param {object} props
 * @param {boolean} [props.padded=false] apply vertical content padding
 * @param {object} [props.contentContainerStyle]
 * @param {React.ReactNode} props.children
 */
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { spacing } from '../../theme';

function ScrollWrapper({ padded = false, contentContainerStyle, children, ...rest }) {
  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={[
        padded && styles.paddedContent,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  paddedContent: { paddingVertical: spacing.lg },
});

export default ScrollWrapper;
