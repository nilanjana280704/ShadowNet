/**
 * AnimatedBackground — the ambient tactical backdrop.
 *
 * Layers a token gradient, a faint hairline grid, and an optional slow radar
 * sweep. Purely decorative but on-brand; the sweep honors reduce-motion. Place
 * as the first child of a screen with content stacked above it.
 *
 * @param {object} props
 * @param {boolean} [props.sweep=true] show the rotating radar sweep
 * @param {boolean} [props.grid=true] show the hairline grid
 * @param {object} [props.style]
 * @param {React.ReactNode} props.children
 */
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  Line,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { colors } from '../../theme';
import { useRadarSweep } from '../../animations';
import GradientContainer from './GradientContainer';

function AnimatedBackground({ sweep = true, grid = true, style, children }) {
  const sweepStyle = useRadarSweep({ enabled: sweep });

  return (
    <GradientContainer gradient="backdrop" style={[styles.fill, style]}>
      {grid ? (
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <Pattern
              id="sn-grid"
              width="56"
              height="56"
              patternUnits="userSpaceOnUse"
            >
              <Line x1="0" y1="0" x2="56" y2="0" stroke={colors.border} strokeWidth="1" />
              <Line x1="0" y1="0" x2="0" y2="56" stroke={colors.border} strokeWidth="1" />
            </Pattern>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#sn-grid)" />
        </Svg>
      ) : null}

      {sweep ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.sweepWrap, sweepStyle]}
        >
          <Svg width="100%" height="100%" viewBox="-100 -100 200 200">
            <Defs>
              <RadialGradient id="sn-sweep" cx="0" cy="0" r="100">
                <Stop offset="0" stopColor={colors.secondary} stopOpacity="0.10" />
                <Stop offset="1" stopColor={colors.secondary} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="-100" y="-100" width="100" height="200" fill="url(#sn-sweep)" />
          </Svg>
        </Animated.View>
      ) : null}

      <View style={styles.fill}>{children}</View>
    </GradientContainer>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  sweepWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnimatedBackground;
