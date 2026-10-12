/**
 * NearbyDevicesWidget — list of nearby mesh peers with per-device signal.
 *
 * @param {object} props
 * @param {Array<{id:string,name:string,transport?:string,signalLevel?:number}>} props.devices
 * @param {(device:object) => void} [props.onSelect]
 * @param {() => void} [props.onSeeAll]
 */
import React from 'react';
import { View } from 'react-native';

import { spacing } from '../../theme';
import { SignalIndicator } from '../atoms';
import { Card, Divider, EmptyState, ListItem, SectionHeader } from '../molecules';

const TRANSPORT_ICON = { mesh: 'mesh', wifi: 'wifi', bluetooth: 'bluetooth', lora: 'nodes' };

function NearbyDevicesWidget({ devices = [], onSelect, onSeeAll }) {
  return (
    <Card variant="surface">
      <SectionHeader
        eyebrow="Peers"
        title="Nearby Devices"
        actionIcon={onSeeAll ? 'forward' : undefined}
        onAction={onSeeAll}
        actionLabel="See all devices"
      />
      {devices.length === 0 ? (
        <EmptyState icon="nodes" title="No devices in range" message="Scanning for nearby mesh peers." />
      ) : (
        devices.map((d, i) => (
          <View key={d.id}>
            {i > 0 ? <Divider spacing={spacing.xxs} /> : null}
            <ListItem
              icon={TRANSPORT_ICON[d.transport] || 'nodes'}
              title={d.name}
              subtitle={d.transport ? d.transport.toUpperCase() : undefined}
              trailing={<SignalIndicator level={d.signalLevel ?? 0} />}
              onPress={onSelect ? () => onSelect(d) : undefined}
            />
          </View>
        ))
      )}
    </Card>
  );
}

export default NearbyDevicesWidget;
