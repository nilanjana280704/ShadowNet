/**
 * Loader — inline activity spinner with an optional label.
 *
 * @param {object} props
 * @param {'small'|'large'} [props.size='small']
 * @param {string} [props.color='accent'] spinner color token
 * @param {string} [props.label] optional caption under the spinner
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { resolveColor } from '../../utils/theme';
import Text from './Text';

function Loader({ size = 'small', color = 'accent', label }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size={size} color={resolveColor(color, undefined)} />
      {label ? (
        <Text variant="caption" color="muted" align="center">
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
});

export default Loader;
