/**
 * CountdownTimer — the armed SOS state: a big countdown ring and a large,
 * unmissable Cancel button. Gives the user a clear, easy way to stop before the
 * alert goes out.
 *
 * @param {object} props
 * @param {number} props.seconds remaining seconds
 * @param {number} props.total total seconds
 * @param {() => void} props.onCancel
 */
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, radius, spacing, glow } from '../../../theme';
import { usePulse } from '../../../animations';
import { Button, ProgressRing, Text } from '../../../components';

function CountdownTimer({ seconds, total, onCancel }) {
  const pulse = usePulse();
  const value = total > 0 ? seconds / total : 0;

  return (
    <View style={styles.wrap}>
      <Animated.View style={[glow(colors.glow.sos, 16), pulse]}>
        <ProgressRing value={value} centerValue={seconds} label="sending in" size={180} tone="error" valueColor="error" />
      </Animated.View>
      <Text variant="headingM" color="primary" align="center">
        Sending SOS…
      </Text>
      <Text variant="body" color="secondary" align="center" style={styles.hint}>
        Tap cancel now if you're safe.
      </Text>
      <Button label="Cancel" variant="ghost" size="lg" fullWidth icon="close" onPress={onCancel} style={styles.cancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.md },
  hint: { maxWidth: 280 },
  cancel: { marginTop: spacing.sm, borderRadius: radius.l },
});

export default CountdownTimer;
