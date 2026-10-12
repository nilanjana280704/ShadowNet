/**
 * Crisis Mode mock data — contacts, nearby volunteers, shelters, medical camps,
 * broadcast responses, SOS acknowledgements, and history. No backend.
 */
import { ContactGroup } from './constants';

export const emergencyContacts = [
  { id: 'ec-mom', name: 'Mom', group: ContactGroup.FAMILY, phone: '+1 555 0112', relation: 'Mother', priority: true, deviceId: 'dev-priya' },
  { id: 'ec-dad', name: 'Dad', group: ContactGroup.FAMILY, phone: '+1 555 0113', relation: 'Father', priority: false },
  { id: 'ec-priya', name: 'Priya', group: ContactGroup.FAMILY, phone: '+1 555 0114', relation: 'Sister', priority: false, deviceId: 'dev-priya' },
  { id: 'ec-rahul', name: 'Rahul', group: ContactGroup.FRIENDS, phone: '+1 555 0210', relation: 'Friend', priority: false },
  { id: 'ec-drmeera', name: 'Dr. Meera', group: ContactGroup.DOCTORS, phone: '+1 555 0301', relation: 'Family doctor', priority: true },
  { id: 'ec-anil', name: 'Anil (2B)', group: ContactGroup.NEIGHBOURS, phone: '+1 555 0410', relation: 'Neighbour', priority: false },
  { id: 'ec-vol', name: 'Sara (Volunteer)', group: ContactGroup.VOLUNTEERS, phone: '+1 555 0510', relation: 'Rescue volunteer', priority: false, deviceId: 'dev-volunteer' },
];

export const nearbyVolunteers = [
  { id: 'v-sara', name: 'Sara', skill: 'First aid', distanceM: 120, etaMin: 4, signalLevel: 4, status: 'available' },
  { id: 'v-omar', name: 'Omar', skill: 'Search & rescue', distanceM: 240, etaMin: 7, signalLevel: 3, status: 'available' },
  { id: 'v-lin', name: 'Lin', skill: 'Medical', distanceM: 310, etaMin: 9, signalLevel: 3, status: 'busy' },
];

export const nearbyShelters = [
  { id: 's-school', name: 'Govt School Shelter', capacity: 120, free: 40, distanceM: 800, status: 'open' },
  { id: 's-community', name: 'Community Centre', capacity: 80, free: 12, distanceM: 1300, status: 'open' },
  { id: 's-temple', name: 'Riverside Temple', capacity: 60, free: 0, distanceM: 1900, status: 'full' },
];

export const nearbyMedical = [
  { id: 'm-riverside', name: 'Riverside Medical Camp', beds: 6, distanceM: 320, status: 'open', specialty: 'Trauma' },
  { id: 'm-mobile', name: 'Mobile Health Unit', beds: 2, distanceM: 650, status: 'open', specialty: 'General' },
];

export const dangerZones = [
  { id: 'dz-bridge', name: 'East Bridge', reason: 'Flooding', distanceM: 500 },
  { id: 'dz-power', name: 'Substation', reason: 'Live wires', distanceM: 900 },
];

// No pre-seeded history: inventing past events that never happened on this
// device is exactly the kind of fabricated claim this app must not make.
// Real entries are added by emergencyBridge as the user actually does things
// (sends an SOS, checks in, broadcasts).
export const emergencyHistorySeed = [];
