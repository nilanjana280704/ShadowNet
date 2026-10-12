/**
 * CommunicationStatus — a compact readiness summary of the communication engine:
 * per-transport state plus connected-device count. Reusable on dashboards and
 * the network screen.
 *
 * @param {object} props
 * @param {Array<{type:string,state:string,label:string}>} props.transports
 * @param {number} [props.connectedCount]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { TransportState } from '../../communication';
import { StatusIndicator, Text } from '../atoms';
import Card from './Card';

const STATE_TONE = {
  [TransportState.CONNECTED]: 'nominal',
  [TransportState.DISCOVERING]: 'info',
  [TransportState.CONNECTING]: 'info',
  [TransportState.IDLE]: 'offline',
  [TransportState.ERROR]: 'critical',
  [TransportState.UNAVAILABLE]: 'offline',
  [TransportState.UNINITIALIZED]: 'offline',
};

function CommunicationStatus({ transports = [], connectedCount = 0 }) {
  return (
    <Card variant="surface" padding="md">
      <View style={styles.header}>
        <Text variant="label" color="muted">
          Communication
        </Text>
        <Text variant="caption" color="muted">
          {connectedCount} connected
        </Text>
      </View>
      <View style={styles.rows}>
        {transports.map((t) => (
          <View key={t.type} style={styles.row}>
            <StatusIndicator status={STATE_TONE[t.state] || 'offline'} live={t.state === TransportState.DISCOVERING || t.state === TransportState.CONNECTED} size={8} />
            <Text variant="bodySmall" color="primary" style={styles.rowLabel}>
              {t.label}
            </Text>
            <Text variant="telemetrySmall" color="muted">
              {t.state}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  rows: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowLabel: { flex: 1 },
});

export default CommunicationStatus;
