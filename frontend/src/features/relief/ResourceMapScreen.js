/**
 * ResourceMapScreen — the Relief Network's full-screen offline map. Floating
 * glass search with ranked results, a browse rail into every category, a layer
 * control, zoom/recenter controls, animated route planning (shortest / safest /
 * alternative), and a docked preview card for the selected entity.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { colors, radius, spacing, zIndex } from '../../theme';
import { Icon, IconButton, StatusIndicator, Text } from '../../components';
import {
  activeRouteSet,
  allReliefEntities,
  clearMapSelection,
  findReliefEntity,
  initCommunication,
  initRelief,
  layerToggled,
  mapRoutesCleared,
  planRoutesTo,
  selectMapEntity,
} from '../../redux';
import { MAP_LAYERS, ReliefCategory } from './constants';
import { ResourceService, SearchService } from './services';
import { USER_GEO } from './mockData';
import {
  LayerToggle,
  MapCanvas,
  MapPreviewCard,
  MapSearch,
  ResourceCard,
  ResourceChip,
  RouteCard,
} from './components';

// Browse rail → category list routes.
const BROWSE = [
  { route: 'SafeZones', label: 'Safe zones', icon: 'shield', tone: 'success' },
  { route: 'Shelters', label: 'Shelters', icon: 'shelter', tone: 'success' },
  { route: 'MedicalAssistance', label: 'Medical', icon: 'medical', tone: 'error' },
  { route: 'FoodWater', label: 'Food & water', icon: 'food', tone: 'warning' },
  { route: 'VolunteerNetwork', label: 'Volunteers', icon: 'volunteer', tone: 'accent' },
  { route: 'ReliefCenters', label: 'Relief centers', icon: 'lifebuoy', tone: 'analytics' },
  { route: 'DangerZones', label: 'Danger', icon: 'danger', tone: 'critical' },
];

const SPAN_DEFAULT = 3200;
const SPAN_MIN = 1000;
const SPAN_MAX = 6200;
// Coverage beyond this swallows the viewport and reads as nothing.
const COVERAGE_DISPLAY_CAP_M = 1400;

function ResourceMapScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const layers = useSelector((s) => s.maps.layers);
  const selectedId = useSelector((s) => s.maps.selectedId);
  const routes = useSelector((s) => s.maps.routes);
  const activeRouteKind = useSelector((s) => s.maps.activeRouteKind);
  const offlineRegion = useSelector((s) => s.maps.offlineRegion);
  const coverageEngineM = useSelector((s) => s.networkState.coverageM);
  const entities = useSelector(allReliefEntities);
  const selected = useSelector((s) => (selectedId ? findReliefEntity(s, selectedId) : null));

  const [query, setQuery] = useState('');
  const [spanM, setSpanM] = useState(SPAN_DEFAULT);

  useEffect(() => {
    dispatch(initRelief());
    dispatch(initCommunication());
  }, [dispatch]);

  // Deep link: another screen asked for directions to an entity.
  const focusId = route?.params?.focusId;
  useEffect(() => {
    if (!focusId) return;
    dispatch(planRoutesTo(focusId));
    navigation.setParams({ focusId: undefined });
  }, [focusId, dispatch, navigation]);

  const visibleEntities = useMemo(() => {
    const cats = new Set([ReliefCategory.SOS]); // SOS is never hidden
    MAP_LAYERS.forEach((layer) => {
      if (layers[layer.key]) layer.categories.forEach((c) => cats.add(c));
    });
    return entities.filter((e) => cats.has(e.category));
  }, [entities, layers]);

  const dangerZones = useMemo(
    () => (layers.danger ? entities.filter((e) => e.category === ReliefCategory.DANGER) : []),
    [entities, layers.danger]
  );

  const results = useMemo(() => SearchService.search(entities, query, 6), [entities, query]);
  const recommended = useMemo(() => ResourceService.recommendForYou(entities, { limit: 5 }), [entities]);
  const activeRoute = routes.find((r) => r.kind === activeRouteKind) || null;
  const center = selected?.geo || USER_GEO;

  const onSelectResult = (entity) => {
    setQuery('');
    dispatch(selectMapEntity(entity.id));
  };

  const zoom = (factor) => setSpanM((s) => Math.min(SPAN_MAX, Math.max(SPAN_MIN, Math.round(s * factor))));

  return (
    <View style={styles.screen}>
      <MapCanvas
        entities={visibleEntities}
        center={center}
        spanM={spanM}
        selectedId={selectedId}
        route={activeRoute}
        dangerZones={dangerZones}
        coverageM={layers.coverage ? Math.min(coverageEngineM || 0, COVERAGE_DISPLAY_CAP_M) : 0}
        userGeo={USER_GEO}
        onSelect={(id) => dispatch(selectMapEntity(id))}
        onPressBackground={() => dispatch(clearMapSelection())}
      />

      {/* Top overlay: search, browse rail, offline pill */}
      <View style={[styles.topOverlay, { paddingTop: insets.top + spacing.sm }]} pointerEvents="box-none">
        <MapSearch value={query} onChangeText={setQuery} results={results} onSelect={onSelectResult} />
        {/* Hidden once something is selected or a route is showing, so the
            bottom card/strip isn't competing with this rail for attention. */}
        {!selected && routes.length === 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
            style={styles.railScroller}
          >
            {BROWSE.map((b) => (
              <ResourceChip
                key={b.route}
                label={b.label}
                icon={b.icon}
                tone={b.tone}
                onPress={() => navigation.navigate(b.route)}
              />
            ))}
          </ScrollView>
        ) : null}
        <View style={styles.offlinePill}>
          <Text variant="caption" color="secondary">
            Sample data — shelters, medical, and danger zones shown here are not live.
          </Text>
        </View>
        {offlineRegion?.ready ? (
          <View style={styles.offlinePill}>
            <StatusIndicator status="nominal" live={false} size={8} />
            <Text variant="caption" color="secondary">
              Offline map · {offlineRegion.name}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Right controls: layers + zoom + recenter */}
      <View style={styles.controls} pointerEvents="box-none">
        <LayerToggle layers={layers} onToggle={(key) => dispatch(layerToggled(key))} />
        <IconButton icon="zoomIn" variant="glass" color="secondary" accessibilityLabel="Zoom in" onPress={() => zoom(1 / 1.45)} />
        <IconButton icon="zoomOut" variant="glass" color="secondary" accessibilityLabel="Zoom out" onPress={() => zoom(1.45)} />
        <IconButton icon="locate" variant="glass" color="accent" accessibilityLabel="Center on me" onPress={() => dispatch(clearMapSelection())} />
      </View>

      {/* Bottom overlay: route options + selection preview */}
      <View style={[styles.bottomOverlay, { paddingBottom: insets.bottom + spacing.sm }]} pointerEvents="box-none">
        {routes.length > 0 ? (
          <View style={styles.routeStrip}>
            <View style={styles.routeHeader}>
              <Text variant="label" color="muted">
                Walking routes
              </Text>
              <IconButton icon="close" size="sm" variant="glass" color="muted" accessibilityLabel="Clear route" onPress={() => dispatch(mapRoutesCleared())} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routeCards}>
              {routes.map((r) => (
                <RouteCard key={r.kind} route={r} selected={r.kind === activeRouteKind} onPress={(kind) => dispatch(activeRouteSet(kind))} />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {selected ? (
          <MapPreviewCard
            entity={selected}
            onDetails={() => navigation.navigate('ResourceDetails', { entityId: selected.id })}
            onRoute={() => dispatch(planRoutesTo(selected.id))}
            onClose={() => dispatch(clearMapSelection())}
          />
        ) : routes.length === 0 && recommended.length > 0 ? (
          // Smart resource recommendation: fills the dock while nothing is selected.
          <View style={styles.recommendStrip}>
            <View style={styles.recommendHeader}>
              <Icon name="ai" size="sm" color="accent" />
              <Text variant="label" color="accent">
                Recommended for you (sample data)
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendCards}>
              {recommended.map((entity) => (
                <View key={entity.id} style={styles.recommendCard}>
                  <ResourceCard entity={entity} compact onPress={() => dispatch(selectMapEntity(entity.id))} />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    zIndex: zIndex.sticky,
  },
  railScroller: { flexGrow: 0 },
  rail: { gap: spacing.sm, paddingVertical: spacing.xxs },
  offlinePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glassSurfaceStrong,
  },
  controls: {
    position: 'absolute',
    right: spacing.md,
    bottom: 220,
    alignItems: 'flex-end',
    gap: spacing.sm,
    zIndex: zIndex.raised,
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    zIndex: zIndex.sticky,
  },
  routeStrip: { gap: spacing.xs },
  routeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  routeCards: { gap: spacing.sm },
  recommendStrip: { gap: spacing.xs },
  recommendHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  recommendCards: { gap: spacing.sm },
  recommendCard: { width: 260 },
});

export default ResourceMapScreen;
