/**
 * Home screen mock data. Realistic placeholder content only — no business
 * logic. Replaced by live data in later milestones.
 */

// Notification badge count only — not an identity. The real display name
// comes from the authenticated user (see utils/identity.js), never from here.
export const unreadCount = 3;

export function todayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// Primary actions — the four things a person needs within 1-2 seconds.
// `key` lets the screen route known ones.
export const primaryActions = [
  { key: 'sos', title: 'Send SOS', subtitle: 'Get emergency help now', icon: 'sos', variant: 'danger' },
  { key: 'message', title: 'Send Message', subtitle: 'Message people without internet', icon: 'message', tone: 'accent' },
  { key: 'nearbyHelp', title: 'Nearby Help', subtitle: "See who's nearby and can help", icon: 'volunteer', tone: 'info' },
  { key: 'safety', title: 'Safety', subtitle: 'Shelters, danger areas, and alerts', icon: 'shelter', tone: 'success' },
];

export const secondaryActions = [
  { key: 'requestHelp', title: 'Request Help', icon: 'medical', tone: 'accent' },
  { key: 'broadcast', title: 'Broadcast Alert', icon: 'emergency', tone: 'emergency' },
  { key: 'contacts', title: 'Emergency Contacts', icon: 'phone', tone: 'accent' },
  { key: 'checkin', title: 'Safe Check-In', icon: 'success', tone: 'success' },
  { key: 'missing', title: 'Missing Persons', icon: 'users', tone: 'analytics' },
  { key: 'updates', title: 'Emergency Updates', icon: 'bell', tone: 'warning' },
];

