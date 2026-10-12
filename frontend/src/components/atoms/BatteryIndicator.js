/**
 * BatteryIndicator — battery glyph with a fill level and charging state. Fill
 * color shifts to warning/critical as the level drops.
 *
 * @param {object} props
 * @param {number} props.level charge 0..1
 * @param {boolean} [props.charging=false]
 * @param {boolean} [props.showValue=true] show a percentage label
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import Icon from './Icon';
import Text from './Text';

function clamp(v) {
  return Math.max(0, Math.min(1, v || 0));
}

function fillColor(level) {
  if (level <= 0.15) return colors.critical;
  if (level <= 0.35) return colors.warning;
  return colors.success;
}

function BatteryIndicator({ level, charging = false, showValue = true }) {
  const pct = clamp(level);
  const color = charging ? colors.info : fillColor(pct);

  return (
    <View style={styles.row}>
      <View style={styles.body}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
        {charging ? (
          <View style={styles.boltWrap}>
            <Icon name="zap" size="xs" color="inverse" strokeWidth={2.2} />
          </View>
        ) : null}
      </View>
      <View style={styles.cap} />
      {showValue ? (
        <Text variant="telemetrySmall" color="secondary" style={styles.value}>
          {Math.round(pct * 100)}%
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  body: {
    width: 30,
    height: 15,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    padding: 1.5,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: { height: '100%', borderRadius: 1 },
  boltWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  cap: {
    width: 2.5,
    height: 6,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: colors.borderStrong,
    marginLeft: 1,
  },
  value: { marginLeft: spacing.xs },
});

export default BatteryIndicator;
