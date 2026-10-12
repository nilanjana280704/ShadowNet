/**
 * MapMarker — a compact, category-colored map pin: an icon dot that scales up
 * and reveals a name pill when selected. SOS and danger markers pulse.
 * Positioned absolutely by MapCanvas at a projected point.
 *
 * @param {object} props
 * @param {object} props.entity relief entity
 * @param {boolean} [props.selected]
 * @param {(id:string) => void} props.onPress
 */
import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../../theme';
import { resolveColor } from '../../../utils/theme';
import { usePulse } from '../../../animations';
import { Icon, Text } from '../../../components';
import { CATEGORY_META, ReliefCategory } from '../constants';

const PULSING = [ReliefCategory.SOS, ReliefCategory.DANGER];

function MapMarker({ entity, selected = false, onPress }) {
  const meta = CATEGORY_META[entity.category] || CATEGORY_META[ReliefCategory.RELIEF];
  const tint = resolveColor(meta.tone, colors.primary);
  const pulse = usePulse({ enabled: PULSING.includes(entity.category) });

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      {PULSING.includes(entity.category) ? (
        <Animated.View style={[styles.halo, { backgroundColor: tint }, pulse]} />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${meta.label}: ${entity.name}`}
        onPress={() => onPress(entity.id)}
        hitSlop={8}
        style={[
          styles.dot,
          { backgroundColor: tint },
          selected && styles.dotSelected,
        ]}
      >
        <Icon name={meta.icon} size={selected ? 14 : 11} color="inverse" strokeWidth={2.4} />
      </Pressable>
      {selected ? (
        <View style={styles.labelPill}>
          <Text variant="caption" color="primary" numberOfLines={1}>
            {entity.name}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: radius.circle,
    opacity: 0.3,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.background,
    ...shadows.small,
  },
  dotSelected: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
  labelPill: {
    position: 'absolute',
    top: 34,
    maxWidth: 140,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.s,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
});

export default MapMarker;
