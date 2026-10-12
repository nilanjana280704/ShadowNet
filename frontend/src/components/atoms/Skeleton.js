/**
 * Skeleton — animated placeholder block shown while data loads.
 *
 * @param {object} props
 * @param {number|string} [props.width='100%']
 * @param {number} [props.height=16]
 * @param {'xs'|'s'|'m'|'l'|'xl'|'pill'|'circle'} [props.radius='s']
 * @param {object} [props.style]
 */
import React from 'react';
import { Animated, StyleSheet } from 'react-native';

import { colors, radius as radiusTokens } from '../../theme';
import { useSkeletonPulse } from '../../animations';

function Skeleton({ width = '100%', height = 16, radius = 's', style }) {
  const pulse = useSkeletonPulse();
  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius: radiusTokens[radius] },
        pulse,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.surfaceElevated },
});

export default Skeleton;
