/**
 * GradientContainer — fills its area with a token gradient behind children.
 * Uses react-native-svg (no extra native dependency).
 *
 * @param {object} props
 * @param {keyof import('../../theme/gradients').gradients|object} [props.gradient='backdrop']
 *        gradient token name or a { colors, start, end } spec
 * @param {object} [props.style] container style
 * @param {React.ReactNode} props.children
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { gradients } from '../../theme';

const GRAD_ID = 'sn-grad';

function GradientContainer({ gradient = 'backdrop', style, children, ...rest }) {
  const spec = typeof gradient === 'string' ? gradients[gradient] : gradient;
  const stops = spec.colors;

  return (
    <View style={[styles.container, style]} {...rest}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient
            id={GRAD_ID}
            x1={`${spec.start.x * 100}%`}
            y1={`${spec.start.y * 100}%`}
            x2={`${spec.end.x * 100}%`}
            y2={`${spec.end.y * 100}%`}
          >
            {stops.map((c, i) => (
              <Stop
                key={`${c}-${i}`}
                offset={stops.length === 1 ? 0 : i / (stops.length - 1)}
                stopColor={c}
                stopOpacity={1}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${GRAD_ID})`} />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
});

export default GradientContainer;
