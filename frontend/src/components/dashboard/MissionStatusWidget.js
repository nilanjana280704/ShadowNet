/**
 * MissionStatusWidget — the dashboard's headline panel: overall operational
 * posture plus a compact row of key readouts. Rendered on the glass surface.
 *
 * @param {object} props
 * @param {'operational'|'degraded'|'critical'} [props.posture='operational']
 * @param {number} [props.nodes]
 * @param {number} [props.coverageKm]
 * @param {number} [props.activeAlerts]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { Divider, StatusIndicator, Text } from '../atoms';
import { GlassCard } from '../molecules';

const POSTURE = {
  operational: { status: 'nominal', label: 'OPERATIONAL', color: 'success' },
  degraded: { status: 'warning', label: 'DEGRADED', color: 'warning' },
  critical: { status: 'critical', label: 'CRITICAL', color: 'error' },
};

function Readout({ label, value, unit }) {
  return (
    <View style={styles.readout}>
      <View style={styles.valueRow}>
        <Text variant="telemetry" color="primary">
          {value}
        </Text>
        {unit ? (
          <Text variant="telemetrySmall" color="muted" style={styles.unit}>
            {unit}
          </Text>
        ) : null}
      </View>
      <Text variant="caption" color="muted">
        {label}
      </Text>
    </View>
  );
}

function MissionStatusWidget({ posture = 'operational', nodes, coverageKm, activeAlerts }) {
  const p = POSTURE[posture] || POSTURE.operational;
  return (
    <GlassCard>
      <View style={styles.header}>
        <View>
          <Text variant="label" color="muted">
            Mission Status
          </Text>
          <Text variant="displayM" color={p.color}>
            {p.label}
          </Text>
        </View>
        <StatusIndicator status={p.status} live />
      </View>
      <Divider spacing={spacing.md} />
      <View style={styles.readouts}>
        <Readout label="NODES" value={nodes ?? '--'} />
        <Readout label="COVERAGE" value={coverageKm ?? '--'} unit="KM" />
        <Readout label="ALERTS" value={activeAlerts ?? '--'} />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  readouts: { flexDirection: 'row', justifyContent: 'space-between' },
  readout: { gap: spacing.xxs },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xxs },
  unit: { marginBottom: 1 },
});

export default MissionStatusWidget;
