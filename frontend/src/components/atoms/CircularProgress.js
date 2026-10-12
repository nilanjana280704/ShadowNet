/**
 * CircularProgress — determinate ring gauge with center content.
 * Ideal for mesh health, battery, coverage percentages.
 *
 * @param {object} props
 * @param {number} props.value 0..1 progress
 * @param {number} [props.size=88] diameter in dp
 * @param {number} [props.strokeWidth=6]
 * @param {'primary'|'success'|'warning'|'error'|'info'} [props.tone='primary']
 * @param {React.ReactNode} [props.children] center content (e.g. a Text value)
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../../theme';

const TONE = {
  primary: colors.primary,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,
};

function clamp(v) {
  return Math.max(0, Math.min(1, v || 0));
}

function CircularProgress({ value, size = 88, strokeWidth = 6, tone = 'primary', children }) {
  const pct = clamp(value);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.surfaceElevated}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={TONE[tone]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children ? <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});

export default CircularProgress;
