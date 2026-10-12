/**
 * ResourceCard — the rich base card for every relief entity. Identity row
 * (category icon chip, name + verified mark, status), a plain-language meta
 * line (distance · walk time · hours), category stat columns, facility chips,
 * and an optional capacity bar. Shelter/Medical/Volunteer cards are presets
 * over this — one card treatment across the Relief Network.
 *
 * @param {object} props
 * @param {object} props.entity relief entity
 * @param {Array<{label:string,value:string}>} [props.stats] stat columns
 * @param {{tone:string,label:string}} [props.statusOverride]
 * @param {boolean} [props.showCapacity]
 * @param {boolean} [props.compact] hide facilities/capacity (map preview)
 * @param {() => void} [props.onPress]
 */
import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../../theme';
import { usePressScale } from '../../../animations';
import { Icon, StatusBadge, Text } from '../../../components';
import { CATEGORY_META, FACILITY_ICON, STATUS_META } from '../constants';
import { MapsService } from '../services';
import CapacityIndicator from './CapacityIndicator';

const MAX_FACILITIES = 3;

function ResourceCard({ entity, stats = [], statusOverride, showCapacity = true, compact = false, onPress }) {
  const press = usePressScale({ to: 0.98 });
  const meta = CATEGORY_META[entity.category];
  const status = statusOverride || STATUS_META[entity.status];
  const facilities = compact ? [] : (entity.facilities || []).slice(0, MAX_FACILITIES);
  const extraFacilities = compact ? 0 : Math.max(0, (entity.facilities?.length ?? 0) - MAX_FACILITIES);

  const metaLine = [
    MapsService.formatDistance(entity.distanceM),
    `${MapsService.walkMinutes(entity.distanceM)} min walk`,
    entity.hours,
  ]
    .filter(Boolean)
    .join(' · ');

  const body = (
    <>
      <View style={styles.header}>
        <View style={styles.iconChip}>
          <Icon name={meta.icon} size="md" color={meta.tone} />
        </View>
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text variant="title" color="primary" numberOfLines={1} style={styles.name}>
              {entity.name}
            </Text>
            {entity.verified ? <Icon name="success" size="xs" color="accent" /> : null}
          </View>
          <Text variant="caption" color="muted" numberOfLines={1}>
            {metaLine}
          </Text>
        </View>
        {status ? <StatusBadge tone={status.tone} label={status.label} /> : null}
      </View>

      {stats.length > 0 ? (
        <View style={styles.stats}>
          {stats.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text variant="subtitle" color="primary" numberOfLines={1}>
                {s.value}
              </Text>
              <Text variant="caption" color="muted" numberOfLines={1}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {showCapacity && !compact ? <CapacityIndicator capacity={entity.capacity} /> : null}

      {facilities.length > 0 ? (
        <View style={styles.facilities}>
          {facilities.map((f) => (
            <View key={f} style={styles.facility}>
              <Icon name={FACILITY_ICON[f] || 'check'} size="xs" color="secondary" />
              <Text variant="caption" color="secondary" numberOfLines={1}>
                {f}
              </Text>
            </View>
          ))}
          {extraFacilities > 0 ? (
            <Text variant="caption" color="muted">
              +{extraFacilities} more
            </Text>
          ) : null}
        </View>
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.card}>{body}</View>;
  }

  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${meta.label}: ${entity.name}`}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={styles.card}
      >
        {body}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.small,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.m,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  name: { flexShrink: 1 },
  stats: { flexDirection: 'row', gap: spacing.xl },
  stat: { gap: 1, flexShrink: 1 },
  facilities: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  facility: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
});

export default ResourceCard;
