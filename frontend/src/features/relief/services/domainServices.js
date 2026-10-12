/**
 * Domain helpers per relief entity type. Small, pure, and shared by cards,
 * list screens, and the detail page.
 */
import { EntityStatus } from '../constants';

export const ShelterService = {
  freeSpaces(shelter) {
    return Math.max(0, (shelter.capacity?.total ?? 0) - (shelter.capacity?.used ?? 0));
  },
  occupancy(shelter) {
    const total = shelter.capacity?.total ?? 0;
    return total ? (shelter.capacity.used ?? 0) / total : 0;
  },
  isAccepting(shelter) {
    return shelter.status === EntityStatus.OPEN || shelter.status === EntityStatus.LIMITED;
  },
};

export const MedicalService = {
  /** 1..5 emergency readiness rating. */
  rating(camp) {
    return camp.medical?.rating ?? 3;
  },
  hasBlood(camp, group) {
    return Boolean(camp.medical?.blood?.includes(group));
  },
  summary(camp) {
    const m = camp.medical || {};
    const parts = [`${m.doctors ?? 0} doctors`, `${m.beds ?? 0} beds`];
    if (m.medicine) parts.push('medicine');
    if (m.firstAid) parts.push('first aid');
    return parts.join(' · ');
  },
};

export const VolunteerService = {
  isAvailable(volunteer) {
    return volunteer.volunteer?.availability === 'available';
  },
  availabilityMeta(volunteer) {
    const availability = volunteer.volunteer?.availability;
    if (availability === 'available') return { tone: 'success', label: 'Available' };
    if (availability === 'busy') return { tone: 'warning', label: 'Busy' };
    return { tone: 'offline', label: 'Offline' };
  },
  summary(volunteer) {
    const v = volunteer.volunteer || {};
    return `${(v.skills || []).join(', ')} · ${(v.languages || []).join(', ')}`;
  },
};
