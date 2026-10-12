/**
 * CoverageRadiusWidget — coverage reach with an ambient radar sweep motif.
 *
 * @param {object} props
 * @param {number} props.radiusKm coverage radius in km
 * @param {number} [props.nodesInRange]
 * @param {() => void} [props.onPress]
 */
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { colors, spacing } from '../../theme';
import { useRadarSweep } from '../../animations';
import { Text } from '../atoms';
import { Card, SectionHeader } from '../molecules';

const R = 44;

function CoverageRadiusWidget({ radiusKm = 0, nodesInRange, onPress }) {
  const sweep = useRadarSweep();
  return (
    <Card variant="surface" onPress={onPress}>
      <SectionHeader eyebrow="Reach" title="Coverage Radius" />
      <View style={styles.row}>
        <View style={styles.radar}>
          <Svg width={R * 2} height={R * 2}>
            <Circle cx={R} cy={R} r={R - 2} stroke={colors.border} strokeWidth={1} fill="none" />
            <Circle cx={R} cy={R} r={(R - 2) * 0.66} stroke={colors.border} strokeWidth={1} fill="none" />
            <Circle cx={R} cy={R} r={(R - 2) * 0.33} stroke={colors.border} strokeWidth={1} fill="none" />
            <Circle cx={R} cy={R} r={2.5} fill={colors.secondary} />
          </Svg>
          <Animated.View style={[styles.sweep, sweep]}>
            <Svg width={R * 2} height={R * 2}>
              <Line x1={R} y1={R} x2={R} y2={4} stroke={colors.secondary} strokeWidth={2} />
            </Svg>
          </Animated.View>
        </View>
        <View style={styles.meta}>
          <View style={styles.valueRow}>
            <Text variant="telemetryL" color="telemetry">
              {radiusKm}
            </Text>
            <Text variant="telemetry" color="muted" style={styles.unit}>
              KM
            </Text>
          </View>
          {typeof nodesInRange === 'number' ? (
            <Text variant="bodySmall" color="secondary">
              {nodesInRange} nodes in range
            </Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  radar: { width: R * 2, height: R * 2, alignItems: 'center', justifyContent: 'center' },
  sweep: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  meta: { gap: spacing.xs, flexShrink: 1 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xxs },
  unit: { marginBottom: 2 },
});

export default CoverageRadiusWidget;
