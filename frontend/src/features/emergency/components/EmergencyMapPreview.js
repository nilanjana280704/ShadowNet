/**
 * EmergencyMapPreview — a compact tactical mini-map: the user at the centre with
 * nearby shelters, medical camps, volunteers, and danger zones plotted around
 * them, plus a legend. Tapping opens the full map (future). Positions are
 * derived from mock distances/bearings — presentational only.
 *
 * @param {object} props
 * @param {Array} [props.shelters]
 * @param {Array} [props.medical]
 * @param {Array} [props.volunteers]
 * @param {Array} [props.dangerZones]
 * @param {() => void} [props.onOpen]
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme';
import { Icon, StatusIndicator, Text } from '../../../components';

const LEGEND = [
  { label: 'Shelters', color: colors.success },
  { label: 'Medical', color: colors.error },
  { label: 'Volunteers', color: colors.info },
  { label: 'Danger', color: colors.critical },
];

function plot(items, color, startAngle) {
  return (items || []).map((item, i) => {
    const angle = startAngle + i * 0.9;
    const r = 0.18 + Math.min(0.24, ((item.distanceM || 500) / 2000) * 0.24);
    return {
      id: item.id,
      color,
      left: `${50 + Math.cos(angle) * r * 100}%`,
      top: `${50 + Math.sin(angle) * r * 100}%`,
    };
  });
}

function EmergencyMapPreview({ shelters, medical, volunteers, dangerZones, onOpen }) {
  const dots = [
    ...plot(shelters, colors.success, 0.4),
    ...plot(medical, colors.error, 1.8),
    ...plot(volunteers, colors.info, 3.2),
    ...plot(dangerZones, colors.critical, 4.7),
  ];

  return (
    <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel="Open emergency map" style={styles.card}>
      <View style={styles.map}>
        <View style={styles.ringOuter} />
        <View style={styles.ringInner} />
        {dots.map((d) => (
          <View key={d.id} style={[styles.dot, { left: d.left, top: d.top, backgroundColor: d.color }]} />
        ))}
        <View style={styles.user}>
          <StatusIndicator status="nominal" size={12} />
        </View>
        <View style={styles.openHint}>
          <Icon name="map" size="xs" color="secondary" />
          <Text variant="caption" color="secondary">
            Open map
          </Text>
        </View>
      </View>
      <View style={styles.legend}>
        {LEGEND.map((l) => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text variant="caption" color="secondary">
              {l.label}
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  map: {
    height: 200,
    borderRadius: radius.m,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  ringOuter: {
    position: 'absolute',
    left: '15%',
    top: '15%',
    right: '15%',
    bottom: '15%',
    borderRadius: radius.circle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ringInner: {
    position: 'absolute',
    left: '32%',
    top: '32%',
    right: '32%',
    bottom: '32%',
    borderRadius: radius.circle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: { position: 'absolute', width: 10, height: 10, borderRadius: radius.circle, marginLeft: -5, marginTop: -5 },
  user: { position: 'absolute', left: '50%', top: '50%', marginLeft: -6, marginTop: -6 },
  openHint: { position: 'absolute', right: spacing.sm, bottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, paddingHorizontal: spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: radius.circle },
});

export default EmergencyMapPreview;
