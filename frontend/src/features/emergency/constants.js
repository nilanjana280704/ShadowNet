/**
 * Crisis Mode domain constants — SOS states, emergency status levels, safe
 * check-in messages, broadcast needs, quick-help categories, and contact groups.
 * One source of truth so screens carry no literal strings for these.
 */

export const SosStatus = Object.freeze({
  IDLE: 'idle',
  ARMING: 'arming', // countdown running
  ACTIVE: 'active', // broadcasting
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
});

export const EmergencyStatus = Object.freeze({
  NOMINAL: 'nominal',
  ALERT: 'alert',
  CRITICAL: 'critical',
});

export const EMERGENCY_STATUS_META = Object.freeze({
  [EmergencyStatus.NOMINAL]: { label: 'All clear', tone: 'success', status: 'nominal' },
  [EmergencyStatus.ALERT]: { label: 'Alert active', tone: 'warning', status: 'warning' },
  [EmergencyStatus.CRITICAL]: { label: 'SOS active', tone: 'error', status: 'critical' },
});

export const SOS_COUNTDOWN_SECONDS = 3;

// Safe check-in presets — one tap each.
export const CHECK_IN_MESSAGES = [
  { key: 'safe', label: "I'm safe", icon: 'success', tone: 'success' },
  { key: 'injured', label: "I'm injured", icon: 'medical', tone: 'warning' },
  { key: 'need-help', label: 'I need help', icon: 'sos', tone: 'sos' },
  { key: 'trapped', label: "I'm trapped", icon: 'shieldAlert', tone: 'critical' },
  { key: 'moving', label: "I'm moving", icon: 'navigation', tone: 'info' },
];

// Emergency broadcast needs.
export const BROADCAST_NEEDS = [
  { key: 'water', label: 'Need water', icon: 'water', tone: 'info' },
  { key: 'food', label: 'Need food', icon: 'food', tone: 'warning' },
  { key: 'medicine', label: 'Need medicine', icon: 'medicine', tone: 'error' },
  { key: 'shelter', label: 'Need shelter', icon: 'shelter', tone: 'success' },
  { key: 'rescue', label: 'Need rescue', icon: 'rescue', tone: 'sos' },
  { key: 'blood', label: 'Need blood', icon: 'blood', tone: 'critical' },
  { key: 'transport', label: 'Need transport', icon: 'transport', tone: 'info' },
  { key: 'doctor', label: 'Need a doctor', icon: 'doctor', tone: 'error' },
];

// Quick-help categories (large cards).
export const QUICK_HELP = [
  { key: 'medical', label: 'Medical', icon: 'medical', tone: 'error' },
  { key: 'police', label: 'Police', icon: 'police', tone: 'info' },
  { key: 'fire', label: 'Fire', icon: 'fire', tone: 'sos' },
  { key: 'volunteer', label: 'Volunteer', icon: 'volunteer', tone: 'success' },
  { key: 'shelter', label: 'Shelter', icon: 'shelter', tone: 'success' },
  { key: 'food', label: 'Food', icon: 'food', tone: 'warning' },
  { key: 'water', label: 'Water', icon: 'water', tone: 'info' },
  { key: 'transport', label: 'Transport', icon: 'transport', tone: 'analytics' },
];

export const ContactGroup = Object.freeze({
  FAMILY: 'family',
  FRIENDS: 'friends',
  DOCTORS: 'doctors',
  NEIGHBOURS: 'neighbours',
  VOLUNTEERS: 'volunteers',
});

export const CONTACT_GROUP_META = Object.freeze({
  [ContactGroup.FAMILY]: { label: 'Family', icon: 'user', tone: 'accent' },
  [ContactGroup.FRIENDS]: { label: 'Friends', icon: 'users', tone: 'info' },
  [ContactGroup.DOCTORS]: { label: 'Doctors', icon: 'doctor', tone: 'error' },
  [ContactGroup.NEIGHBOURS]: { label: 'Neighbours', icon: 'home', tone: 'warning' },
  [ContactGroup.VOLUNTEERS]: { label: 'Volunteers', icon: 'volunteer', tone: 'success' },
});

// History event kinds for the timeline.
export const HistoryKind = Object.freeze({
  SOS: 'sos',
  BROADCAST: 'broadcast',
  CHECK_IN: 'check-in',
  RESPONSE: 'response',
});
