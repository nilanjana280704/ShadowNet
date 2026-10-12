/**
 * SignalChip — a compact signal-strength chip (bars + optional label) for use in
 * conversation tiles and headers.
 *
 * @param {object} props
 * @param {number} props.level 0..4
 * @param {'nearby'|'relayed'|'offline'} [props.proximity]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import SignalIndicator from './SignalIndicator';
import Text from './Text';

const PROXIMITY = {
  nearby: { label: 'Nearby', color: 'connected' },
  relayed: { label: 'Relayed', color: 'info' },
  offline: { label: 'Offline', color: 'muted' },
};

function SignalChip({ level, proximity }) {
  const p = proximity ? PROXIMITY[proximity] : null;
  return (
    <View style={styles.chip}>
      <SignalIndicator level={level} />
      {p ? (
        <Text variant="caption" color={p.color}>
          {p.label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 3,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceElevated,
  },
});

export default SignalChip;
