/**
 * NetworkBanner — a slim status strip showing whether the local network is
 * active, the transport in use, and coverage. Colored by state.
 *
 * @param {object} props
 * @param {boolean} props.online
 * @param {string} [props.activeTransport] TransportType value
 * @param {number} [props.coverageM] coverage radius in metres
 * @param {number} [props.deviceCount]
 * @param {{grade:string,label:string}} [props.health] network health score
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { TRANSPORT_META } from '../../communication';
import { Badge, Icon, StatusIndicator, Text } from '../atoms';

function formatCoverage(m) {
  if (!m) return '—';
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

const HEALTH_BADGE_TONE = { excellent: 'success', good: 'primary', fair: 'warning', poor: 'error' };

function NetworkBanner({ online, activeTransport, coverageM, deviceCount, health }) {
  const transportLabel = TRANSPORT_META[activeTransport]?.label;
  return (
    <View style={[styles.banner, online ? styles.online : styles.offline]}>
      <StatusIndicator status={online ? 'nominal' : 'offline'} live={online} size={10} />
      <View style={styles.body}>
        <Text variant="label" color={online ? 'connected' : 'muted'}>
          {online ? 'Local network active' : 'Network offline'}
        </Text>
        {online ? (
          <Text variant="caption" color="muted">
            {transportLabel ? `${transportLabel} · ` : ''}
            {formatCoverage(coverageM)} coverage · {deviceCount ?? 0} nearby
          </Text>
        ) : null}
      </View>
      {online && health ? (
        <Badge label={health.label} tone={HEALTH_BADGE_TONE[health.grade] || 'neutral'} />
      ) : (
        <Icon name={online ? 'mesh' : 'wifiOff'} size="sm" color={online ? 'connected' : 'muted'} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.m,
    borderWidth: 1,
  },
  online: { backgroundColor: colors.overlay.primary08, borderColor: colors.borderAccent },
  offline: { backgroundColor: colors.surface, borderColor: colors.border },
  body: { flex: 1, gap: 2 },
});

export default NetworkBanner;
