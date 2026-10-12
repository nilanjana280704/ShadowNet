/**
 * NetworkHealthWidget — mesh health as a ring gauge with a status line.
 *
 * @param {object} props
 * @param {number} props.health 0..1 overall mesh health
 * @param {number} [props.nodeCount] connected nodes (context line)
 * @param {() => void} [props.onPress]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { CircularProgress, StatusIndicator, Text } from '../atoms';
import { Card, SectionHeader } from '../molecules';

function healthStatus(health) {
  if (health >= 0.75) return { status: 'nominal', label: 'NOMINAL', tone: 'success' };
  if (health >= 0.4) return { status: 'warning', label: 'DEGRADED', tone: 'warning' };
  return { status: 'critical', label: 'CRITICAL', tone: 'error' };
}

function NetworkHealthWidget({ health = 0, nodeCount, onPress }) {
  const s = healthStatus(health);
  return (
    <Card variant="surface" onPress={onPress}>
      <SectionHeader eyebrow="Mesh" title="Network Health" />
      <View style={styles.row}>
        <CircularProgress value={health} tone={s.tone} size={96} strokeWidth={7}>
          <Text variant="telemetryL" color={s.tone === 'success' ? 'success' : s.tone}>
            {Math.round(health * 100)}
          </Text>
          <Text variant="caption" color="muted">
            HEALTH
          </Text>
        </CircularProgress>
        <View style={styles.meta}>
          <StatusIndicator status={s.status} label={s.label} />
          {typeof nodeCount === 'number' ? (
            <Text variant="bodySmall" color="secondary">
              {nodeCount} active nodes
            </Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  meta: { gap: spacing.sm, flexShrink: 1 },
});

export default NetworkHealthWidget;
