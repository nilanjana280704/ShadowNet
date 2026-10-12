/**
 * SignalIndicator — four-bar signal strength meter. The active top bar pulses
 * while scanning. Bar colors follow the weak->strong signal ramp.
 *
 * @param {object} props
 * @param {number} props.level signal strength 0..4
 * @param {boolean} [props.scanning=false] pulse the leading bar
 * @param {boolean} [props.showLabel=false] show a text label (e.g. "STRONG")
 */
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { useSignalPulse } from '../../animations';
import Text from './Text';

const BAR_HEIGHTS = [8, 13, 18, 23];
const LEVEL_LABEL = ['NO SIGNAL', 'WEAK', 'FAIR', 'GOOD', 'STRONG'];

function barColor(index, level) {
  if (index >= level) return colors.surfaceElevated;
  return colors.signal[Math.min(index, colors.signal.length - 1)];
}

function SignalIndicator({ level, scanning = false, showLabel = false }) {
  const pulse = useSignalPulse({ enabled: scanning });
  const clamped = Math.max(0, Math.min(4, level || 0));

  return (
    <View style={styles.row}>
      <View style={styles.bars}>
        {BAR_HEIGHTS.map((h, i) => {
          const isLeading = scanning && i === clamped;
          return (
            <Animated.View
              key={h}
              style={[
                styles.bar,
                { height: h, backgroundColor: barColor(i, clamped) },
                isLeading ? pulse : null,
              ]}
            />
          );
        })}
      </View>
      {showLabel ? (
        <Text variant="telemetrySmall" color="secondary">
          {LEVEL_LABEL[clamped]}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 23 },
  bar: { width: 5, borderRadius: radius.xs },
});

export default SignalIndicator;
