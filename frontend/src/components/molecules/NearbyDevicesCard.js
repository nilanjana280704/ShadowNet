/**
 * NearbyDevicesCard — a section that lists discovered devices as DeviceCards,
 * with a scan control and a DiscoveryLoader/empty state. Presentational; state
 * and handlers are injected.
 *
 * @param {object} props
 * @param {Array<object>} props.devices merged devices
 * @param {Record<string, object>} [props.connections] connection by deviceId
 * @param {Record<string, object>} [props.identities] verified peer identity
 *        by deviceId (state.verifiedPeers.byDeviceId) — only ever populated
 *        from a validated identity exchange, never a device/radio name
 * @param {boolean} [props.discovering]
 * @param {() => void} props.onToggleScan
 * @param {(id:string) => void} [props.onConnect]
 * @param {(id:string) => void} [props.onMessage]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { Button, DiscoveryLoader } from '../atoms';
import DeviceCard from './DeviceCard';
import EmptyState from './EmptyState';
import SectionHeader from './SectionHeader';

function NearbyDevicesCard({ devices = [], connections = {}, identities = {}, discovering, onToggleScan, onConnect, onMessage }) {
  return (
    <View>
      <SectionHeader
        eyebrow="Nearby"
        title="Devices around you"
        actionIcon={discovering ? 'close' : 'refresh'}
        actionLabel={discovering ? 'Stop scanning' : 'Scan'}
        onAction={onToggleScan}
      />

      {devices.length === 0 ? (
        discovering ? (
          <DiscoveryLoader />
        ) : (
          <EmptyState
            icon="nodes"
            title="No devices yet"
            message="Start a scan to find people and services near you."
            actionLabel="Scan for devices"
            onAction={onToggleScan}
          />
        )
      ) : (
        <View style={styles.list}>
          {discovering ? <DiscoveryLoader label="Still scanning…" /> : null}
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              connection={connections[device.id]}
              identity={identities[device.id]}
              onConnect={onConnect}
              onMessage={onMessage}
            />
          ))}
        </View>
      )}

      {devices.length > 0 ? (
        <Button
          label={discovering ? 'Stop scanning' : 'Scan again'}
          variant="ghost"
          icon={discovering ? 'close' : 'refresh'}
          fullWidth
          onPress={onToggleScan}
          style={styles.scanBtn}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  scanBtn: { marginTop: spacing.md },
});

export default NearbyDevicesCard;
