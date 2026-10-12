/**
 * OfflineBanner — the offline-experience strip: reassures the user their
 * messages will still send, and shows the queued count, estimated delivery, the
 * current communication layer, and nearby device count.
 *
 * @param {object} props
 * @param {number} [props.queued=0] messages waiting
 * @param {string} [props.estimate] e.g. '~30s'
 * @param {string} [props.transportLabel] current layer
 * @param {number} [props.nearby=0] nearby connected devices
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { Icon, Text } from '../atoms';

function OfflineBanner({ queued = 0, estimate, transportLabel, nearby = 0 }) {
  return (
    <View style={styles.banner}>
      <View style={styles.headerRow}>
        <Icon name="wifiOff" size="sm" color="warning" />
        <Text variant="label" color="warning">
          No internet — using local network
        </Text>
      </View>
      <Text variant="bodySmall" color="secondary">
        Your messages will send automatically when a device is in range.
      </Text>
      <View style={styles.stats}>
        <Text variant="telemetrySmall" color="secondary">
          {queued} queued
        </Text>
        {estimate ? (
          <Text variant="telemetrySmall" color="secondary">
            · {estimate} to clear
          </Text>
        ) : null}
        {transportLabel ? (
          <Text variant="telemetrySmall" color="secondary">
            · via {transportLabel}
          </Text>
        ) : null}
        <Text variant="telemetrySmall" color="secondary">
          · {nearby} nearby
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.tint.warningBorder,
    backgroundColor: colors.tint.warningBg,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});

export default OfflineBanner;
