/**
 * CommLayerCard — one communication transport (Wi-Fi Direct, Bluetooth, LoRa)
 * with its live status, signal, and latency. Reusable across Network views.
 *
 * @param {object} props
 * @param {string} props.name transport name
 * @param {string} props.icon icon name
 * @param {'active'|'idle'} props.status
 * @param {number} props.signalLevel 0..4
 * @param {string} props.latency e.g. '42 ms'
 * @param {string} [props.range] short human description
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme';
import { Card, Icon, SignalIndicator, StatusIndicator, Text } from '../../../components';

function CommLayerCard({ name, icon, status, signalLevel, latency, range }) {
  const active = status === 'active';
  return (
    <Card variant="surface" padding="md">
      <View style={styles.row}>
        <View style={styles.iconChip}>
          <Icon name={icon} size="md" color={active ? 'accent' : 'muted'} />
        </View>
        <View style={styles.body}>
          <Text variant="title" color="primary">
            {name}
          </Text>
          {range ? (
            <Text variant="caption" color="muted">
              {range}
            </Text>
          ) : null}
        </View>
        <StatusIndicator status={active ? 'nominal' : 'offline'} label={active ? 'ACTIVE' : 'IDLE'} live={active} />
      </View>
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Text variant="caption" color="muted">
            SIGNAL
          </Text>
          <SignalIndicator level={signalLevel} scanning={active} />
        </View>
        <View style={styles.metaItem}>
          <Text variant="caption" color="muted">
            LATENCY
          </Text>
          <Text variant="telemetry" color="secondary">
            {latency}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.m,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.md },
  metaItem: { gap: spacing.xs },
});

export default CommLayerCard;
