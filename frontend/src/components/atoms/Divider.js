/**
 * Divider — a hairline separator, optionally labelled (for section breaks).
 *
 * @param {object} props
 * @param {'horizontal'|'vertical'} [props.orientation='horizontal']
 * @param {string} [props.label] centered label (horizontal only)
 * @param {number} [props.spacing] vertical margin (dp) around a horizontal divider
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing as spacingTokens } from '../../theme';
import Text from './Text';

function Divider({ orientation = 'horizontal', label, spacing: gap = spacingTokens.md }) {
  if (orientation === 'vertical') {
    return <View style={styles.vertical} />;
  }
  if (label) {
    return (
      <View style={[styles.labelledRow, { marginVertical: gap }]}>
        <View style={styles.line} />
        <Text variant="label" color="muted" style={styles.label}>
          {label}
        </Text>
        <View style={styles.line} />
      </View>
    );
  }
  return <View style={[styles.horizontal, { marginVertical: gap }]} />;
}

const styles = StyleSheet.create({
  horizontal: { height: StyleSheet.hairlineWidth, backgroundColor: colors.divider },
  vertical: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: colors.divider },
  labelledRow: { flexDirection: 'row', alignItems: 'center', gap: spacingTokens.sm },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.divider },
  label: { letterSpacing: 1.5 },
});

export default Divider;
