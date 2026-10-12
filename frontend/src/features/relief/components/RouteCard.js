/**
 * RouteCard — a selectable route option (Shortest / Safest / Alternative) with
 * walking time, distance, and a safety meter. Shown as a horizontal strip when
 * a route is being planned.
 *
 * @param {object} props
 * @param {object} props.route { kind, distanceM, walkMin, safety }
 * @param {boolean} [props.selected]
 * @param {(kind:string) => void} props.onPress
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../../theme';
import { Badge, Icon, ProgressBar, Text } from '../../../components';
import { ROUTE_META } from '../constants';
import { MapsService } from '../services';

function RouteCard({ route, selected = false, onPress }) {
  const meta = ROUTE_META[route.kind];
  const safetyTone = route.safety >= 0.85 ? 'success' : route.safety >= 0.65 ? 'warning' : 'error';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${meta.label} route, ${route.walkMin} minutes${route.recommended ? ', recommended' : ''}`}
      onPress={() => onPress(route.kind)}
      style={[styles.card, selected ? styles.selected : styles.idle]}
    >
      <View style={styles.header}>
        <Icon name={meta.icon} size="sm" color={selected ? 'accent' : meta.tone} />
        <Text variant="subtitle" color={selected ? 'accent' : 'primary'} style={styles.headerLabel}>
          {meta.label}
        </Text>
      </View>
      {route.recommended ? (
        <View style={styles.recommended}>
          <Badge label="Recommended" tone="primary" />
        </View>
      ) : null}
      <View style={styles.timeRow}>
        <Text variant="headingM" color="primary">
          {route.walkMin}
        </Text>
        <Text variant="caption" color="muted" style={styles.minLabel}>
          min walk
        </Text>
      </View>
      <Text variant="caption" color="secondary">
        {MapsService.formatDistance(route.distanceM)}
      </Text>
      <View style={styles.safety}>
        <ProgressBar value={route.safety} tone={safetyTone} height={4} />
        <Text variant="caption" color="muted">
          Safety
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 148,
    borderRadius: radius.l,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xxs,
    ...shadows.medium,
  },
  idle: { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong },
  selected: { backgroundColor: colors.overlay.primary16, borderColor: colors.borderAccent },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  headerLabel: { flexShrink: 1 },
  recommended: { alignSelf: 'flex-start', marginTop: spacing.xxs },
  timeRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xxs, marginTop: spacing.xxs },
  minLabel: { marginBottom: 2 },
  safety: { gap: 3, marginTop: spacing.xs },
});

export default RouteCard;
