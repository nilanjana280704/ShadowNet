/**
 * MedicalCard — a nearby medical camp with beds, specialty, distance, and a
 * directions action. Preset over EmergencyEntityCard.
 *
 * @param {object} props
 * @param {object} props.camp
 * @param {(id:string) => void} [props.onNavigate]
 */
import React from 'react';

import { Button } from '../../../components';
import { EmergencyService } from '../services';
import EmergencyEntityCard from './EmergencyEntityCard';

function MedicalCard({ camp, onNavigate }) {
  return (
    <EmergencyEntityCard
      icon="medical"
      tone="error"
      title={camp.name}
      subtitle={camp.specialty}
      status={{ tone: camp.status === 'open' ? 'success' : 'error', label: camp.status === 'open' ? 'Open' : 'Full' }}
      metrics={[
        { label: 'Beds free', value: String(camp.beds) },
        { label: 'Distance', value: EmergencyService.formatDistance(camp.distanceM) },
      ]}
      actions={
        onNavigate ? (
          <Button label="Directions" variant="ghost" icon="navigation" fullWidth onPress={() => onNavigate(camp.id)} />
        ) : null
      }
    />
  );
}

export default MedicalCard;
