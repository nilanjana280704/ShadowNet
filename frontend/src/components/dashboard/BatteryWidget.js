/**
 * BatteryWidget — device power panel with a large percentage and charge state.
 *
 * @param {object} props
 * @param {number} props.level charge 0..1
 * @param {boolean} [props.charging=false]
 * @param {() => void} [props.onPress]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { BatteryIndicator, Text } from '../atoms';
import { Card } from '../molecules';

function toneFor(level, charging) {
  if (charging) return 'info';
  if (level <= 0.15) return 'error';
  if (level <= 0.35) return 'warning';
  return 'success';
}

function BatteryWidget({ level = 0, charging = false, onPress }) {
  const tone = toneFor(level, charging);
  return (
    <Card variant="surface" padding="md" onPress={onPress}>
      <View style={styles.header}>
        <Text variant="label" color="muted">
          Battery
        </Text>
        <BatteryIndicator level={level} charging={charging} showValue={false} />
      </View>
      <View style={styles.valueRow}>
        <Text variant="telemetryL" color={tone}>
          {Math.round(level * 100)}
        </Text>
        <Text variant="telemetry" color="muted" style={styles.unit}>
          %
        </Text>
      </View>
      <Text variant="caption" color="muted">
        {charging ? 'Charging' : 'On battery'}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xxs, marginTop: spacing.xs },
  unit: { marginBottom: 2 },
});

export default BatteryWidget;
