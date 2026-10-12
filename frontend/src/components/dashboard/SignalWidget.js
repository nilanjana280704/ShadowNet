/**
 * SignalWidget — link signal strength panel.
 *
 * @param {object} props
 * @param {number} props.level 0..4
 * @param {boolean} [props.scanning=false]
 * @param {number} [props.rssi] optional dBm reading
 * @param {() => void} [props.onPress]
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { SignalIndicator, Text } from '../atoms';
import { Card } from '../molecules';

function SignalWidget({ level = 0, scanning = false, rssi, onPress }) {
  return (
    <Card variant="surface" padding="md" onPress={onPress}>
      <View style={styles.header}>
        <Text variant="label" color="muted">
          Signal
        </Text>
        <SignalIndicator level={level} scanning={scanning} />
      </View>
      <SignalIndicator level={level} scanning={scanning} showLabel />
      {typeof rssi === 'number' ? (
        <Text variant="telemetrySmall" color="secondary" style={styles.rssi}>
          {rssi} dBm
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  rssi: { marginTop: spacing.xs },
});

export default SignalWidget;
