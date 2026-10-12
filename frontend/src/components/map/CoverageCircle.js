/**
 * CoverageCircle — a translucent range overlay (e.g. mesh coverage, blast
 * radius) to lay over a map at a coordinate. Presentational.
 *
 * @param {object} props
 * @param {number} props.size diameter in dp
 * @param {'primary'|'secondary'|'success'|'warning'|'critical'|'sos'} [props.tone='secondary']
 * @param {number} [props.fillOpacity=0.12]
 */
import React from 'react';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../../theme';

const TONE = {
  primary: colors.primary,
  secondary: colors.secondary,
  success: colors.success,
  warning: colors.warning,
  critical: colors.critical,
  sos: colors.sos,
};

function CoverageCircle({ size, tone = 'secondary', fillOpacity = 0.12 }) {
  const color = TONE[tone] || colors.secondary;
  const r = size / 2;
  return (
    <Svg width={size} height={size}>
      <Circle cx={r} cy={r} r={r - 1} fill={color} fillOpacity={fillOpacity} stroke={color} strokeOpacity={0.5} strokeWidth={1.5} />
    </Svg>
  );
}

export default CoverageCircle;
