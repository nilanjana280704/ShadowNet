/**
 * NearbyUserChip — a compact avatar + name + signal for the "Nearby now" strip.
 *
 * @param {object} props
 * @param {object} props.user { name, signalLevel }
 * @param {() => void} props.onPress
 */
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { spacing } from '../../../theme';
import { Avatar, SignalIndicator, Text } from '../../../components';

function NearbyUserChip({ user, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={user.name} style={styles.chip}>
      <Avatar name={user.name} size="lg" status="connected" />
      <Text variant="caption" color="primary" numberOfLines={1} style={styles.name}>
        {user.name}
      </Text>
      <SignalIndicator level={user.signalLevel} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { alignItems: 'center', gap: spacing.xs, width: 76 },
  name: { maxWidth: 76, textAlign: 'center' },
});

export default NearbyUserChip;
