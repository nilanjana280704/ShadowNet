/**
 * ShelterCard — a nearby shelter with capacity, free space, distance, and a
 * directions action. Preset over EmergencyEntityCard.
 *
 * @param {object} props
 * @param {object} props.shelter
 * @param {(id:string) => void} [props.onNavigate]
 */
import React from 'react';

import { Button } from '../../../components';
import { EmergencyService } from '../services';
import EmergencyEntityCard from './EmergencyEntityCard';

function ShelterCard({ shelter, onNavigate }) {
  const open = shelter.status === 'open' && shelter.free > 0;
  return (
    <EmergencyEntityCard
      icon="shelter"
      tone="success"
      title={shelter.name}
      subtitle={`${shelter.free} of ${shelter.capacity} spaces free`}
      status={{ tone: open ? 'success' : 'error', label: open ? 'Open' : 'Full' }}
      metrics={[
        { label: 'Free', value: String(shelter.free) },
        { label: 'Distance', value: EmergencyService.formatDistance(shelter.distanceM) },
      ]}
      actions={
        onNavigate ? (
          <Button label="Directions" variant="ghost" icon="navigation" fullWidth onPress={() => onNavigate(shelter.id)} />
        ) : null
      }
    />
  );
}

export default ShelterCard;
