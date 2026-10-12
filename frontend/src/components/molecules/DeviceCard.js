/**
 * DeviceCard — a discovered nearby device: identity, best transport, signal,
 * distance, battery, and a connect / connected action. Presentational — the
 * device + connection come from Redux; actions are passed in.
 *
 * Identity honesty: the primary name slot only ever shows a *verified*
 * ShadowNet identity (received and validated over the connection). A raw
 * device/radio name (device.name — an OS-level Wi-Fi/Bluetooth name, not an
 * app identity) is never shown as if it were a person; until a real identity
 * packet arrives, this shows the neutral "Nearby device" and relegates the
 * radio name to a clearly-labeled secondary line.
 *
 * @param {object} props
 * @param {object} props.device merged device (id, name, kind, icon, signal,
 *        level, distanceM, battery, bestTransport)
 * @param {object} [props.connection] connection record (state, transport)
 * @param {{userId:string, displayName:string}} [props.identity] verified
 *        peer identity for this device, if one has been announced and
 *        validated — see redux state.verifiedPeers.byDeviceId
 * @param {(id:string) => void} [props.onConnect]
 * @param {(id:string) => void} [props.onMessage]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { ConnectionState, TRANSPORT_META } from '../../communication';
import { BatteryIndicator, Button, ConnectionStatusBadge, Icon, SignalIndicator, Text } from '../atoms';
import Card from './Card';

function formatDistance(m) {
  if (m == null) return '—';
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

function DeviceCard({ device, connection, identity, onConnect, onMessage }) {
  const state = connection?.state;
  const isConnected = state === ConnectionState.CONNECTED;
  const isBusy = state === ConnectionState.CONNECTING || state === ConnectionState.RECONNECTING;
  const transportLabel = TRANSPORT_META[device.bestTransport]?.label || '—';
  const verifiedName = identity?.displayName;

  return (
    <Card variant="surface" padding="md">
      <View style={styles.top}>
        <View style={styles.iconChip}>
          <Icon name={device.icon} size="md" color="secondary" />
        </View>
        <View style={styles.identity}>
          <Text variant="title" color="primary" numberOfLines={1}>
            {verifiedName || 'Nearby device'}
          </Text>
          <Text variant="caption" color="muted" numberOfLines={1}>
            {verifiedName ? transportLabel : `${device.name} · not verified`}
          </Text>
        </View>
        {state ? <ConnectionStatusBadge state={state} /> : <SignalIndicator level={device.level} />}
      </View>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Icon name="pin" size="xs" color="muted" />
          <Text variant="telemetrySmall" color="secondary">
            {formatDistance(device.distanceM)}
          </Text>
        </View>
        <BatteryIndicator level={device.battery ?? 0} />
        <SignalIndicator level={device.level} />
      </View>

      {isConnected ? (
        <Button label="Message" variant="ghost" icon="message" fullWidth onPress={() => onMessage?.(device.id)} style={styles.action} />
      ) : (
        <Button
          label={isBusy ? 'Connecting' : 'Connect'}
          variant="primary"
          icon="mesh"
          fullWidth
          loading={isBusy}
          onPress={() => onConnect?.(device.id)}
          style={styles.action}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.m,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  action: { marginTop: spacing.md },
});

export default DeviceCard;
