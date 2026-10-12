/**
 * ProgressBar — horizontal determinate progress track.
 *
 * @param {object} props
 * @param {number} props.value 0..1 progress
 * @param {'primary'|'success'|'warning'|'error'|'info'} [props.tone='primary']
 * @param {number} [props.height=6]
 * @param {string} [props.label] optional label shown above the bar
 * @param {boolean} [props.showValue=false] show a percentage on the right
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import Text from './Text';

const TONE = {
  primary: colors.primary,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,
};

const TONE_TEXT = {
  primary: 'accent',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
};

function clamp(v) {
  return Math.max(0, Math.min(1, v || 0));
}

function ProgressBar({ value, tone = 'primary', height = 6, label, showValue = false }) {
  const pct = clamp(value);
  return (
    <View style={styles.wrap}>
      {(label || showValue) && (
        <View style={styles.header}>
          {label ? (
            <Text variant="label" color="muted">
              {label}
            </Text>
          ) : (
            <View />
          )}
          {showValue ? (
            <Text variant="telemetrySmall" color={TONE_TEXT[tone]}>
              {Math.round(pct * 100)}%
            </Text>
          ) : null}
        </View>
      )}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <View
          style={[
            styles.fill,
            { width: `${pct * 100}%`, backgroundColor: TONE[tone], borderRadius: height / 2 },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  track: { backgroundColor: colors.surfaceElevated, overflow: 'hidden', borderRadius: radius.pill },
  fill: { height: '100%' },
});

export default ProgressBar;
