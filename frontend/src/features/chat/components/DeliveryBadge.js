/**
 * DeliveryBadge — an emergency-first delivery indicator. Unlike a messenger's
 * ticks, it names the state and (optionally) the transport carrying it, so the
 * user always knows exactly where a message stands. Relaying/retrying pulse.
 *
 * @param {object} props
 * @param {string} props.state DeliveryState value
 * @param {boolean} [props.showLabel=true]
 */
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { spacing } from '../../../theme';
import { usePulse } from '../../../animations';
import { Icon, Text } from '../../../components';
import { DeliveryState } from '../constants';

const META = {
  [DeliveryState.SENDING]: { icon: 'clock', color: 'muted', label: 'Sending', pulse: true },
  [DeliveryState.QUEUED]: { icon: 'clock', color: 'warning', label: 'Queued', pulse: false },
  [DeliveryState.RELAYING]: { icon: 'mesh', color: 'info', label: 'Relaying', pulse: true },
  [DeliveryState.DELIVERED]: { icon: 'check', color: 'success', label: 'Delivered', pulse: false },
  [DeliveryState.READ]: { icon: 'checkDouble', color: 'accent', label: 'Read', pulse: false },
  [DeliveryState.FAILED]: { icon: 'error', color: 'error', label: 'Failed', pulse: false },
  [DeliveryState.RETRYING]: { icon: 'refresh', color: 'warning', label: 'Retrying', pulse: true },
};

function DeliveryBadge({ state, showLabel = true }) {
  const m = META[state];
  const pulse = usePulse({ enabled: Boolean(m?.pulse) });
  if (!m) return null;

  return (
    <View style={styles.row}>
      <Animated.View style={m.pulse ? pulse : null}>
        <Icon name={m.icon} size="xs" color={m.color} strokeWidth={2.4} />
      </Animated.View>
      {showLabel ? (
        <Text variant="caption" color={m.color}>
          {m.label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
});

export default DeliveryBadge;
