/**
 * RouteLine — a routed path between waypoints, drawn as an SVG polyline with an
 * animated dash flow to indicate direction. Presentational overlay.
 *
 * @param {object} props
 * @param {Array<{x:number,y:number}>} props.points waypoints in the overlay's
 *        coordinate space
 * @param {number} props.width overlay width (dp)
 * @param {number} props.height overlay height (dp)
 * @param {'primary'|'secondary'|'navigation'} [props.tone='navigation']
 * @param {boolean} [props.animated=true] animate the dash flow
 */
import React from 'react';
import { Animated } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { colors } from '../../theme';
import { useRouteAnimation } from '../../animations';

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

const TONE = {
  primary: colors.primary,
  secondary: colors.secondary,
  navigation: colors.navigation,
};

function RouteLine({ points = [], width, height, tone = 'navigation', animated = true }) {
  const flow = useRouteAnimation({ enabled: animated });
  const color = TONE[tone] || colors.navigation;
  const pointStr = points.map((p) => `${p.x},${p.y}`).join(' ');
  const dashOffset = flow.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  if (points.length < 2) return null;

  return (
    <Svg width={width} height={height}>
      <AnimatedPolyline
        points={pointStr}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={[8, 8]}
        strokeDashoffset={dashOffset}
      />
      {points.map((p, i) => (
        <Circle
          key={`${p.x}-${p.y}-${i}`}
          cx={p.x}
          cy={p.y}
          r={i === 0 || i === points.length - 1 ? 4 : 2.5}
          fill={color}
        />
      ))}
    </Svg>
  );
}

export default RouteLine;
