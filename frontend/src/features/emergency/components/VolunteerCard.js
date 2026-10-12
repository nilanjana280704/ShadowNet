/**
 * VolunteerCard — a nearby volunteer with skill, distance, ETA, and message
 * action. Preset over EmergencyEntityCard.
 *
 * @param {object} props
 * @param {object} props.volunteer
 * @param {(id:string) => void} [props.onMessage]
 */
import React from 'react';

import { Button } from '../../../components';
import { EmergencyService } from '../services';
import EmergencyEntityCard from './EmergencyEntityCard';

function VolunteerCard({ volunteer, onMessage }) {
  const available = volunteer.status === 'available';
  return (
    <EmergencyEntityCard
      icon="volunteer"
      tone="success"
      title={volunteer.name}
      subtitle={volunteer.skill}
      status={{ tone: available ? 'success' : 'warning', label: available ? 'Available' : 'Busy' }}
      metrics={[
        { label: 'Distance', value: EmergencyService.formatDistance(volunteer.distanceM) },
        { label: 'ETA', value: `${volunteer.etaMin} min` },
      ]}
      actions={
        onMessage ? (
          <Button label="Message" variant="ghost" icon="message" fullWidth onPress={() => onMessage(volunteer.id)} />
        ) : null
      }
    />
  );
}

export default VolunteerCard;
