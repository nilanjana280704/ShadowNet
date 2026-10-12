/**
 * NetworkIndicator — compact transport + state readout (icon + label) colored
 * by connection state. Used in headers and cards to show link health.
 *
 * @param {object} props
 * @param {'connected'|'weak'|'offline'} [props.state='connected']
 * @param {'mesh'|'wifi'|'bluetooth'|'lora'} [props.transport='mesh']
 * @param {boolean} [props.showLabel=true]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import Icon from './Icon';
import Text from './Text';

const STATE = {
  connected: { color: 'connected', label: 'CONNECTED' },
  weak: { color: 'weak', label: 'WEAK LINK' },
  offline: { color: 'offline', label: 'OFFLINE' },
};

const TRANSPORT_ICON = {
  mesh: 'mesh',
  wifi: 'wifi',
  bluetooth: 'bluetooth',
  lora: 'nodes',
};

function NetworkIndicator({ state = 'connected', transport = 'mesh', showLabel = true }) {
  const s = STATE[state] || STATE.connected;
  const iconName = state === 'offline' ? 'wifiOff' : TRANSPORT_ICON[transport];

  return (
    <View style={styles.row}>
      <Icon name={iconName} size="sm" color={s.color} />
      {showLabel ? (
        <Text variant="label" color={s.color}>
          {s.label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});

export default NetworkIndicator;
