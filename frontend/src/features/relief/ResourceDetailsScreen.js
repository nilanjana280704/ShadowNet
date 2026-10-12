/**
 * ResourceDetailsScreen — the premium detail page every location opens into:
 * hero identity (icon, name, verified, status), photo placeholders, description,
 * category stats, capacity, facilities, contact/hours/updated rows, nearby
 * resources of the same kind, and a Directions action that jumps back to the
 * map with routes planned.
 */
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import { colors, radius, spacing } from '../../theme';
import {
  Badge,
  Button,
  Divider,
  EmptyState,
  GradientContainer,
  Icon,
  IconButton,
  ListItem,
  ScreenWrapper,
  ScrollWrapper,
  SectionHeader,
  StatusBadge,
  Text,
  Timestamp,
} from '../../components';
import { findReliefEntity } from '../../redux';
import { CATEGORY_META, FACILITY_ICON, ORG_META, ReliefCategory, STATUS_META } from './constants';
import { MapsService, MedicalService, ResourceService, VolunteerService } from './services';
import { CapacityIndicator, ResourceCard } from './components';

const NO_ROUTE = [ReliefCategory.DANGER, ReliefCategory.SOS, ReliefCategory.NODE];
const PHOTO_SLOTS = [0, 1, 2];

function nearbySelector(category) {
  return (s) => {
    switch (category) {
      case ReliefCategory.SHELTER:
        return s.shelter.ids.map((id) => s.shelter.byId[id]);
      case ReliefCategory.MEDICAL:
        return s.medical.ids.map((id) => s.medical.byId[id]);
      case ReliefCategory.VOLUNTEER:
        return s.volunteer.ids.map((id) => s.volunteer.byId[id]);
      case ReliefCategory.DANGER:
        return s.dangerZone.ids.map((id) => s.dangerZone.byId[id]);
      default:
        return s.resources.ids.map((id) => s.resources.byId[id]).filter((e) => e.category === category);
    }
  };
}

function ResourceDetailsScreen({ navigation, route }) {
  const entityId = route?.params?.entityId;
  const entity = useSelector((s) => findReliefEntity(s, entityId));
  const siblings = useSelector(entity ? nearbySelector(entity.category) : () => []);

  const nearby = useMemo(
    () =>
      ResourceService.sortByDistance((siblings || []).filter((e) => e.id !== entityId)).slice(0, 5),
    [siblings, entityId]
  );

  if (!entity) {
    return (
      <ScreenWrapper animatedBackground={false}>
        <View style={styles.missing}>
          <EmptyState icon="search" title="Not found" message="This location is no longer available." actionLabel="Go back" onAction={() => navigation.goBack()} />
        </View>
      </ScreenWrapper>
    );
  }

  const meta = CATEGORY_META[entity.category];
  const status = STATUS_META[entity.status];
  const stats = ResourceService.statsFor(entity);
  const routable = !NO_ROUTE.includes(entity.category);
  const isVolunteer = entity.category === ReliefCategory.VOLUNTEER;
  const org = entity.relief?.org ? ORG_META[entity.relief.org] : null;

  return (
    <ScreenWrapper animatedBackground={false} padded={false}>
      <View style={styles.header}>
        <IconButton icon="back" variant="glass" color="secondary" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
        <IconButton icon="map" variant="glass" color="accent" accessibilityLabel="Show on map" onPress={() => navigation.getParent()?.navigate('Safety', { screen: 'ResourceMap', params: { focusId: entity.id } })} />
      </View>

      <ScrollWrapper contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Icon name={meta.icon} size="xxl" color={meta.tone} strokeWidth={1.6} />
          </View>
          <View style={styles.heroTitleRow}>
            <Text variant="headingL" color="primary" style={styles.heroName}>
              {entity.name}
            </Text>
            {entity.verified ? <Icon name="success" size="sm" color="accent" /> : null}
          </View>
          <View style={styles.heroMeta}>
            <StatusBadge tone={isVolunteer ? VolunteerService.availabilityMeta(entity).tone : status.tone} label={isVolunteer ? VolunteerService.availabilityMeta(entity).label : status.label} solid />
            {org ? <Badge label={org.label} tone="info" /> : null}
            <Text variant="caption" color="muted">
              {meta.label} · {entity.area}
            </Text>
          </View>
          <Text variant="bodySmall" color="secondary">
            {MapsService.formatDistance(entity.distanceM)} away · {MapsService.walkMinutes(entity.distanceM)} min walk
          </Text>
        </View>

        {/* Photos (placeholder) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
          {PHOTO_SLOTS.map((i) => (
            <GradientContainer key={i} gradient="surface" style={styles.photo}>
              <Icon name={meta.icon} size="lg" color="muted" />
              <Text variant="caption" color="muted">
                Photo
              </Text>
            </GradientContainer>
          ))}
        </ScrollView>

        <View style={styles.body}>
          {entity.description ? (
            <Text variant="body" color="secondary">
              {entity.description}
            </Text>
          ) : null}

          {stats.length > 0 ? (
            <View style={styles.statsGrid}>
              {stats.map((s) => (
                <View key={s.label} style={styles.statCell}>
                  <Text variant="headingS" color="primary" numberOfLines={1}>
                    {s.value}
                  </Text>
                  <Text variant="caption" color="muted">
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {entity.capacity ? <CapacityIndicator capacity={entity.capacity} /> : null}

          {entity.category === ReliefCategory.MEDICAL ? (
            <View style={styles.inlineRow}>
              <Icon name="activity" size="sm" color="error" />
              <Text variant="bodySmall" color="secondary">
                {MedicalService.summary(entity)} · rating {MedicalService.rating(entity)}/5
              </Text>
            </View>
          ) : null}

          {entity.facilities?.length ? (
            <>
              <SectionHeader title="Facilities" />
              <View style={styles.facilities}>
                {entity.facilities.map((f) => (
                  <View key={f} style={styles.facility}>
                    <Icon name={FACILITY_ICON[f] || 'check'} size="xs" color="accent" />
                    <Text variant="bodySmall" color="secondary">
                      {f}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {entity.relief?.services?.length ? (
            <>
              <SectionHeader title="Services" />
              <View style={styles.facilities}>
                {entity.relief.services.map((svc) => (
                  <Badge key={svc} label={svc} tone="neutral" />
                ))}
              </View>
            </>
          ) : null}

          <Divider spacing={spacing.md} />

          {entity.hours ? <ListItem icon="clock" iconColor="secondary" title="Hours" value={entity.hours} /> : null}
          {entity.contact ? <ListItem icon="phone" iconColor="secondary" title="Contact" value={entity.contact} /> : null}
          <ListItem
            icon="refresh"
            iconColor="secondary"
            title="Last updated"
            trailing={<Timestamp date={entity.lastUpdated} relative variant="telemetry" color="secondary" />}
          />

          <View style={styles.actions}>
            {routable ? (
              <Button
                label="Directions"
                variant="primary"
                icon="route"
                size="lg"
                fullWidth
                onPress={() => navigation.getParent()?.navigate('Safety', { screen: 'ResourceMap', params: { focusId: entity.id } })}
              />
            ) : null}
            {isVolunteer ? (
              <Button
                label="Message volunteer"
                variant="ghost"
                icon="message"
                fullWidth
                onPress={() => navigation.getParent()?.navigate('Messages')}
              />
            ) : null}
          </View>

          {nearby.length > 0 ? (
            <>
              <SectionHeader title={`Nearby ${meta.plural.toLowerCase()}`} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nearbyRow}>
                {nearby.map((e) => (
                  <View key={e.id} style={styles.nearbyCard}>
                    <ResourceCard
                      entity={e}
                      stats={ResourceService.statsFor(e).slice(0, 2)}
                      compact
                      onPress={() => navigation.push('ResourceDetails', { entityId: e.id })}
                    />
                  </View>
                ))}
              </ScrollView>
            </>
          ) : null}
        </View>
      </ScrollWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  content: { paddingBottom: spacing.xxl },
  missing: { flex: 1, justifyContent: 'center' },
  hero: { alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  heroIcon: {
    width: 84,
    height: 84,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.lg },
  heroName: { textAlign: 'center', flexShrink: 1 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  photos: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  photo: {
    width: 148,
    height: 96,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  body: { paddingHorizontal: spacing.lg, gap: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCell: {
    minWidth: 96,
    flexGrow: 1,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: 2,
  },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  facilities: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  facility: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
  nearbyRow: { gap: spacing.sm, paddingRight: spacing.lg },
  nearbyCard: { width: 260 },
});

export default ResourceDetailsScreen;
