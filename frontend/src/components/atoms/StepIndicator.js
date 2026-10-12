/**
 * StepIndicator — progress segments for multi-step flows (onboarding, profile
 * setup). The active segment is accented and elongated.
 *
 * @param {object} props
 * @param {number} props.total number of steps
 * @param {number} props.current active step index (0-based)
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';

function StepIndicator({ total, current }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.seg, i === current ? styles.active : styles.inactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  seg: { height: 6, borderRadius: radius.pill },
  active: { width: 24, backgroundColor: colors.primary },
  inactive: { width: 6, backgroundColor: colors.borderStrong },
});

export default StepIndicator;
