/**
 * LiveStatusPanel — the SOS live status: a real, event-driven delivery
 * progress ring plus honest readouts (devices reached, time elapsed,
 * signal). Deliberately plain-language — no transport/protocol detail, and
 * nothing here is simulated: `progress` must come from the actual state of
 * the messages this SOS broadcast really sent (see SOSScreen).
 *
 * @param {object} props
 * @param {object} props.progress { percent, devicesReached, total } — real,
 *   derived from state.messageQueue for this SOS's actual message ids
 * @param {number} [props.elapsedS] real seconds since activation
 * @param {number} [props.signalLevel]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme';
import { Divider, Icon, ProgressRing, SignalIndicator, Text } from '../../../components';

function Readout({ icon, label, value, valueNode }) {
  return (
    <View style={styles.readout}>
      <Icon name={icon} size="sm" color="secondary" />
      <Text variant="bodySmall" color="secondary" style={styles.readoutLabel}>
        {label}
      </Text>
      {valueNode || (
        <Text variant="telemetry" color="primary">
          {value}
        </Text>
      )}
    </View>
  );
}

function LiveStatusPanel({ progress, elapsedS = 0, signalLevel = 3 }) {
  const percent = progress?.percent ?? 0;
  const total = progress?.total ?? 0;

  return (
    <View style={styles.card}>
      <View style={styles.ringRow}>
        <ProgressRing
          value={percent / 100}
          centerValue={`${percent}%`}
          label="delivered"
          size={128}
          tone={percent >= 100 ? 'success' : 'primary'}
          valueColor={percent >= 100 ? 'success' : 'accent'}
        />
        <View style={styles.ringMeta}>
          <Text variant="label" color="muted">
            Live status
          </Text>
          <Text variant="body" color="secondary">
            {total > 0 ? 'Sending to everyone nearby.' : 'No nearby devices to send to yet.'}
          </Text>
        </View>
      </View>

      <Divider spacing={spacing.md} />

      <View style={styles.readouts}>
        <Readout icon="nodes" label="Devices reached" value={`${progress?.devicesReached ?? 0} of ${total}`} />
        <Readout icon="clock" label="Sending for" value={`${elapsedS}s`} />
        <Readout icon="signal" label="Signal strength" valueNode={<SignalIndicator level={signalLevel} />} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  ringRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  ringMeta: { flex: 1, gap: spacing.xs },
  readouts: { gap: spacing.md },
  readout: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  readoutLabel: { flex: 1 },
});

export default LiveStatusPanel;
