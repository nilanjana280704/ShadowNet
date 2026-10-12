/**
 * Entity card presets — ShelterCard, MedicalCard, and VolunteerCard as thin
 * category presets over ResourceCard (stats derived by the domain services).
 * One card treatment, zero duplication.
 */
import React from 'react';

import { ResourceService, VolunteerService } from '../services';
import ResourceCard from './ResourceCard';

/**
 * ShelterCard — shelter preset: free spaces + walk time and the capacity bar.
 * @param {{entity:object, onPress?:()=>void}} props
 */
export function ShelterCard({ entity, onPress }) {
  return <ResourceCard entity={entity} stats={ResourceService.statsFor(entity)} onPress={onPress} />;
}

/**
 * MedicalCard — medical-camp preset: doctors, beds, blood availability.
 * @param {{entity:object, onPress?:()=>void}} props
 */
export function MedicalCard({ entity, onPress }) {
  return (
    <ResourceCard entity={entity} stats={ResourceService.statsFor(entity)} showCapacity={false} onPress={onPress} />
  );
}

/**
 * VolunteerCard — volunteer preset: availability status, response time, skills.
 * @param {{entity:object, onPress?:()=>void}} props
 */
export function VolunteerCard({ entity, onPress }) {
  return (
    <ResourceCard
      entity={entity}
      stats={ResourceService.statsFor(entity)}
      statusOverride={VolunteerService.availabilityMeta(entity)}
      showCapacity={false}
      onPress={onPress}
    />
  );
}
