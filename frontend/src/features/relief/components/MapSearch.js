/**
 * MapSearch — the floating glass search pill on the map plus a ranked results
 * dropdown (name, category, distance). Selecting a result pans the map to it.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(t:string) => void} props.onChangeText
 * @param {Array} props.results ranked entities (from SearchService)
 * @param {(entity:object) => void} props.onSelect
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../../theme';
import { Icon, SearchBar, Text } from '../../../components';
import { CATEGORY_META } from '../constants';
import { MapsService } from '../services';

function MapSearch({ value, onChangeText, results = [], onSelect }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <SearchBar value={value} onChangeText={onChangeText} placeholder="Search shelters, medical, food, volunteers" />
      </View>
      {value.trim().length > 0 && results.length > 0 ? (
        <View style={styles.results}>
          {results.map((entity) => {
            const meta = CATEGORY_META[entity.category];
            return (
              <Pressable
                key={entity.id}
                accessibilityRole="button"
                accessibilityLabel={`${entity.name}, ${meta.label}`}
                onPress={() => onSelect(entity)}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <Icon name={meta.icon} size="sm" color={meta.tone} />
                <View style={styles.rowBody}>
                  <Text variant="subtitle" color="primary" numberOfLines={1}>
                    {entity.name}
                  </Text>
                  <Text variant="caption" color="muted" numberOfLines={1}>
                    {meta.label} · {entity.area}
                  </Text>
                </View>
                <Text variant="telemetrySmall" color="secondary">
                  {MapsService.formatDistance(entity.distanceM)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  bar: { borderRadius: radius.pill, ...shadows.floating },
  results: {
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.xs,
    maxHeight: 320,
    overflow: 'hidden',
    ...shadows.floating,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  rowPressed: { backgroundColor: colors.overlay.white04 },
  rowBody: { flex: 1, gap: 1 },
});

export default MapSearch;
