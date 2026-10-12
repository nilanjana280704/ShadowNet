/**
 * NetworkCard — link health summary: transport/state, signal strength, and
 * connected node count in one panel.
 *
 * @param {object} props
 * @param {'connected'|'weak'|'offline'} [props.state='connected']
 * @param {'mesh'|'wifi'|'bluetooth'|'lora'} [props.transport='mesh']
 * @param {number} [props.signalLevel=3] 0..4
 * @param {number} [props.nodeCount=0] connected peers
 * @param {() => void} [props.onPress]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { Divider, NetworkIndicator, SignalIndicator, Text } from '../atoms';
import Card from './Card';

const TRANSPORT_LABEL = { mesh: 'MESH', wifi: 'WI-FI DIRECT', bluetooth: 'BLE', lora: 'LORA' };

function NetworkCard({ state = 'connected', transport = 'mesh', signalLevel = 3, nodeCount = 0, onPress }) {
  return (
    <Card variant="surface" onPress={onPress}>
      <View style={styles.header}>
        <Text variant="label" color="muted">
          {TRANSPORT_LABEL[transport]}
        </Text>
        <NetworkIndicator state={state} transport={transport} />
      </View>
      <Divider spacing={spacing.md} />
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text variant="caption" color="muted">
            SIGNAL
          </Text>
          <SignalIndicator level={signalLevel} scanning={state === 'weak'} showLabel />
        </View>
        <View style={styles.stat}>
          <Text variant="caption" color="muted">
            NODES
          </Text>
          <Text variant="telemetry" color="connected">
            {nodeCount}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stats: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { gap: spacing.xs },
});

export default NetworkCard;
