/**
 * TransportChip — labels the communication transport carrying a message/link
 * (Wi-Fi Direct, Bluetooth LE, LoRa) with an icon.
 *
 * @param {object} props
 * @param {string} props.transport TransportType value
 * @param {boolean} [props.compact] icon only
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { TRANSPORT_META, TransportType } from '../../communication';
import Icon from './Icon';
import Text from './Text';

const TRANSPORT_ICON = {
  [TransportType.WIFI_DIRECT]: 'wifi',
  [TransportType.BLE]: 'bluetooth',
  [TransportType.LORA]: 'nodes',
};

function TransportChip({ transport, compact = false }) {
  if (!transport) return null;
  const label = TRANSPORT_META[transport]?.label || transport;
  return (
    <View style={styles.chip}>
      <Icon name={TRANSPORT_ICON[transport] || 'nodes'} size="xs" color="secondary" />
      {compact ? null : (
        <Text variant="caption" color="secondary">
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default TransportChip;
