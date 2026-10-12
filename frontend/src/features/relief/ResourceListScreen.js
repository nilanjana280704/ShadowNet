/**
 * ResourceListScreen — the shared list engine behind every relief category
 * (Safe Zones, Shelters, Medical, Food & Water, Volunteers, Relief Centers,
 * Danger Zones). One implementation, configured per route: search, a filter
 * sheet (distance + facility toggles), distance-sorted cards, and a map jump.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import {
  BottomSheet,
  Button,
  Chip,
  EmptyState,
  IconButton,
  ScreenWrapper,
  ScrollWrapper,
  SearchBar,
  Text,
  UnreadBadge,
} from '../../components';
import { initRelief, reliefFilterSet, reliefFiltersReset } from '../../redux';
import { useDisclosure } from '../../hooks';
import { DISTANCE_FILTERS, FILTER_TOGGLES, ReliefCategory } from './constants';
import { ResourceService } from './services';
import { MedicalCard, ResourceCard, ShelterCard, VolunteerCard } from './components';

// Per-route configuration. `select` builds the raw list from state.
const CONFIG = {
  safe: {
    title: 'Safe zones',
    subtitle: 'Open shelters and verified relief centers near you',
    empty: 'No safe zones match these filters.',
    select: (s) =>
      ResourceService.safeZones(
        s.shelter.ids.map((id) => s.shelter.byId[id]),
        s.resources.ids.map((id) => s.resources.byId[id]).filter((e) => e.category === ReliefCategory.RELIEF)
      ),
  },
  shelter: {
    title: 'Shelters',
    subtitle: 'Sleeping space, registration, and basic supplies',
    empty: 'No shelters match these filters.',
    select: (s) => s.shelter.ids.map((id) => s.shelter.byId[id]),
  },
  medical: {
    title: 'Medical assistance',
    subtitle: 'Field camps, triage points, and first aid',
    empty: 'No medical camps match these filters.',
    select: (s) => s.medical.ids.map((id) => s.medical.byId[id]),
  },
  foodwater: {
    title: 'Food & water',
    subtitle: 'Meals, drinking water, and hygiene supplies',
    empty: 'No food or water points match these filters.',
    select: (s) =>
      s.resources.ids
        .map((id) => s.resources.byId[id])
        .filter((e) => e.category === ReliefCategory.FOOD || e.category === ReliefCategory.WATER),
  },
  volunteer: {
    title: 'Volunteer network',
    subtitle: 'Verified people nearby who can help',
    empty: 'No volunteers match these filters.',
    select: (s) => s.volunteer.ids.map((id) => s.volunteer.byId[id]),
  },
  relief: {
    title: 'Relief centers',
    subtitle: 'Government, NGO, community, and military operations',
    empty: 'No relief centers match these filters.',
    select: (s) =>
      s.resources.ids.map((id) => s.resources.byId[id]).filter((e) => e.category === ReliefCategory.RELIEF),
  },
  danger: {
    title: 'Danger zones',
    subtitle: 'Stay clear of these areas and routes',
    empty: 'No active danger reports. Stay alert.',
    select: (s) => s.dangerZone.ids.map((id) => s.dangerZone.byId[id]),
  },
};

function CardFor({ entity, onPress }) {
  switch (entity.category) {
    case ReliefCategory.SHELTER:
      return <ShelterCard entity={entity} onPress={onPress} />;
    case ReliefCategory.MEDICAL:
      return <MedicalCard entity={entity} onPress={onPress} />;
    case ReliefCategory.VOLUNTEER:
      return <VolunteerCard entity={entity} onPress={onPress} />;
    default:
      return (
        <ResourceCard entity={entity} stats={ResourceService.statsFor(entity)} onPress={onPress} />
      );
  }
}

function ResourceListScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const category = route?.params?.category || 'shelter';
  const config = CONFIG[category] || CONFIG.shelter;

  const filters = useSelector((s) => s.resources.filters);
  const raw = useSelector(config.select);
  const filterSheet = useDisclosure(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(initRelief());
  }, [dispatch]);

  const list = useMemo(() => {
    const filtered = ResourceService.applyFilters(raw, filters);
    const searched = ResourceService.searchByName(filtered, query);
    return ResourceService.sortByDistance(searched);
  }, [raw, filters, query]);

  const activeFilterCount =
    FILTER_TOGGLES.filter((t) => filters[t.key]).length + (filters.distance !== 'any' ? 1 : 0);

  return (
    <ScreenWrapper animatedBackground={false}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconButton icon="back" variant="ghost" color="secondary" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
          <View style={styles.headerText}>
            <Text variant="headingM" color="primary">
              {config.title}
            </Text>
            <Text variant="caption" color="muted" numberOfLines={1}>
              {config.subtitle}
            </Text>
          </View>
        </View>
        <IconButton icon="map" variant="glass" color="accent" accessibilityLabel="View on map" onPress={() => navigation.getParent()?.navigate('Safety', { screen: 'ResourceMap' })} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchField}>
          <SearchBar value={query} onChangeText={setQuery} placeholder={`Search ${config.title.toLowerCase()}`} />
        </View>
        <View>
          <IconButton icon="filter" variant="glass" color={activeFilterCount ? 'accent' : 'secondary'} accessibilityLabel="Filters" onPress={filterSheet.open} />
          {activeFilterCount > 0 ? (
            <View style={styles.filterCount} pointerEvents="none">
              <UnreadBadge count={activeFilterCount} />
            </View>
          ) : null}
        </View>
      </View>

      <Text variant="caption" color="muted" style={styles.count}>
        {list.length} nearby · sorted by distance · sample data, not live
      </Text>

      <ScrollWrapper contentContainerStyle={styles.content}>
        {list.length === 0 ? (
          <EmptyState icon="search" title="Nothing found" message={config.empty} actionLabel="Reset filters" onAction={() => dispatch(reliefFiltersReset())} />
        ) : (
          list.map((entity) => (
            <CardFor key={entity.id} entity={entity} onPress={() => navigation.navigate('ResourceDetails', { entityId: entity.id })} />
          ))
        )}
      </ScrollWrapper>

      <BottomSheet visible={filterSheet.isOpen} title="Filters" onClose={filterSheet.close}>
        <Text variant="label" color="muted">
          Distance
        </Text>
        <View style={styles.chipRow}>
          {DISTANCE_FILTERS.map((d) => (
            <Chip
              key={d.key}
              label={d.label}
              selected={filters.distance === d.key}
              onPress={() => dispatch(reliefFilterSet({ key: 'distance', value: d.key }))}
            />
          ))}
        </View>
        <Text variant="label" color="muted" style={styles.togglesLabel}>
          Show only
        </Text>
        <View style={styles.chipRow}>
          {FILTER_TOGGLES.map((t) => (
            <Chip
              key={t.key}
              label={t.label}
              icon={t.icon}
              selected={Boolean(filters[t.key])}
              onPress={() => dispatch(reliefFilterSet({ key: t.key, value: !filters[t.key] }))}
            />
          ))}
        </View>
        <Button label="Reset all" variant="ghost" fullWidth onPress={() => dispatch(reliefFiltersReset())} style={styles.reset} />
      </BottomSheet>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  headerText: { flex: 1, gap: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  searchField: { flex: 1 },
  filterCount: { position: 'absolute', top: -6, right: -6 },
  count: { marginTop: spacing.sm, marginBottom: spacing.xs },
  content: { gap: spacing.sm, paddingBottom: spacing.xxl },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.md },
  togglesLabel: { marginTop: spacing.xs },
  reset: { marginTop: spacing.sm },
});

export default ResourceListScreen;
