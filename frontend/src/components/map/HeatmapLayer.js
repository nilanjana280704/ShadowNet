/**
 * HeatmapLayer — density overlay rendering soft radial blooms at points (e.g.
 * node density, incident concentration). Presentational overlay.
 *
 * @param {object} props
 * @param {Array<{x:number,y:number,intensity?:number}>} props.points
 * @param {number} props.width overlay width (dp)
 * @param {number} props.height overlay height (dp)
 * @param {'primary'|'critical'|'warning'} [props.tone='primary']
 * @param {number} [props.radius=48] bloom radius per point (dp)
 */
import React from 'react';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { colors } from '../../theme';

const TONE = {
  primary: colors.primary,
  critical: colors.critical,
  warning: colors.warning,
};

function HeatmapLayer({ points = [], width, height, tone = 'primary', radius = 48 }) {
  const color = TONE[tone] || colors.primary;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <RadialGradient id="sn-heat" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={color} stopOpacity="0.55" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      {points.map((p, i) => (
        <Circle
          key={`${p.x}-${p.y}-${i}`}
          cx={p.x}
          cy={p.y}
          r={radius * (p.intensity ?? 1)}
          fill="url(#sn-heat)"
        />
      ))}
    </Svg>
  );
}

export default HeatmapLayer;
