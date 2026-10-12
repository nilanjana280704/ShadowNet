/**
 * CapacityIndicator — occupancy bar for shelters/relief centers. Tone shifts as
 * capacity fills (success → warning → error) and the label reads in plain
 * language ("40 of 120 spaces free").
 *
 * @param {object} props
 * @param {{total:number, used:number}} props.capacity
 * @param {string} [props.noun='spaces']
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import { ProgressBar, Text } from '../../../components';

function CapacityIndicator({ capacity, noun = 'spaces' }) {
  if (!capacity?.total) return null;
  const used = Math.min(capacity.used ?? 0, capacity.total);
  const free = capacity.total - used;
  const ratio = used / capacity.total;
  const tone = ratio >= 0.9 ? 'error' : ratio >= 0.7 ? 'warning' : 'success';

  return (
    <View style={styles.wrap}>
      <ProgressBar value={ratio} tone={tone} height={6} />
      <Text variant="caption" color={free === 0 ? 'error' : 'secondary'}>
        {free === 0 ? `Full — ${capacity.total} ${noun} taken` : `${free} of ${capacity.total} ${noun} free`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
});

export default CapacityIndicator;
