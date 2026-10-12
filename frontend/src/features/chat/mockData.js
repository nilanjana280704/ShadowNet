/**
 * Chat mock data — realistic conversations, groups, nearby users, and broadcast
 * history for development. No backend. `deviceId` links a conversation to a
 * communication-engine device so delivery can later be driven by the real
 * pipeline.
 */
import { AttachmentType, ConversationType, DeliveryState, GroupType, MessageType } from './constants';
import { MessagePriority } from '../../communication';

export const SELF_ID = 'self';
const min = (m) => Date.now() - m * 60000;
const hr = (h) => Date.now() - h * 3600000;

export const conversations = [
  {
    id: 'c-family',
    type: ConversationType.GROUP,
    groupType: GroupType.FAMILY,
    name: 'Family',
    deviceId: 'dev-priya',
    pinned: true,
    unread: 2,
    proximity: 'nearby',
    signalLevel: 4,
    lastMessageAt: min(4),
  },
  {
    id: 'c-priya',
    type: ConversationType.DIRECT,
    name: 'Priya',
    deviceId: 'dev-priya',
    pinned: true,
    unread: 0,
    proximity: 'nearby',
    signalLevel: 4,
    lastMessageAt: min(12),
  },
  {
    id: 'c-volunteers',
    type: ConversationType.GROUP,
    groupType: GroupType.VOLUNTEER,
    name: 'Rescue Volunteers',
    deviceId: 'dev-volunteer',
    pinned: false,
    unread: 5,
    proximity: 'relayed',
    signalLevel: 3,
    lastMessageAt: min(18),
  },
  {
    id: 'c-medcamp',
    type: ConversationType.DIRECT,
    name: 'Medical Camp',
    deviceId: 'dev-medcamp',
    pinned: false,
    unread: 0,
    proximity: 'relayed',
    signalLevel: 2,
    lastMessageAt: hr(1),
  },
  {
    id: 'c-neighbourhood',
    type: ConversationType.GROUP,
    groupType: GroupType.NEIGHBORHOOD,
    name: 'Sector 42 Neighbourhood',
    deviceId: 'dev-rescue',
    pinned: false,
    unread: 12,
    proximity: 'relayed',
    signalLevel: 3,
    lastMessageAt: min(31),
  },
  {
    id: 'c-shelter',
    type: ConversationType.DIRECT,
    name: 'Riverside Shelter',
    deviceId: 'dev-shelter',
    pinned: false,
    unread: 0,
    proximity: 'offline',
    signalLevel: 1,
    lastMessageAt: hr(3),
  },
];

const mk = (over) => ({
  self: false,
  type: MessageType.TEXT,
  priority: MessagePriority.NORMAL,
  encrypted: true,
  transport: 'wifi-direct',
  ...over,
});

export const messagesByConversation = {
  'c-family': [
    mk({ id: 'm1', authorName: 'Mom', text: 'Are you all safe? The road near us is flooded.', createdAt: min(40) }),
    mk({ id: 'm2', self: true, text: "We're okay, staying on higher ground.", delivery: DeliveryState.READ, createdAt: min(36) }),
    mk({ id: 'm3', authorName: 'Dad', type: MessageType.SAFE_CHECKIN, text: 'Checked in safe from the community centre.', createdAt: min(20) }),
    mk({ id: 'm4', authorName: 'Mom', type: MessageType.LOCATION, text: 'Our location', attachment: { type: AttachmentType.LOCATION, title: 'Community Centre', subtitle: '0.8 km away', coords: '28.61, 77.20' }, createdAt: min(6) }),
    mk({ id: 'm5', authorName: 'Mom', text: 'Come here if you can, they have food and water.', createdAt: min(4) }),
  ],
  'c-priya': [
    mk({ id: 'p1', authorName: 'Priya', text: 'Signal is weak here but this app still works!', createdAt: min(30) }),
    mk({ id: 'p2', self: true, text: 'Mesh network is holding up. Stay put.', delivery: DeliveryState.DELIVERED, transport: 'ble', createdAt: min(12) }),
    mk({ id: 'p3', self: true, type: MessageType.RESOURCE_REQUEST, text: 'Do you have any spare power banks?', attachment: { type: AttachmentType.RESOURCE, title: 'Power bank', subtitle: 'Requested · qty 2' }, delivery: DeliveryState.QUEUED, createdAt: min(11) }),
  ],
  'c-volunteers': [
    mk({ id: 'v1', authorName: 'Coordinator', type: MessageType.BROADCAST, priority: MessagePriority.HIGH, text: 'Need 3 volunteers at the east bridge for evacuation.', createdAt: min(25) }),
    mk({ id: 'v2', authorName: 'Rahul', text: 'On my way, ETA 10 min.', createdAt: min(22) }),
    mk({ id: 'v3', authorName: 'Meera', type: MessageType.VOLUNTEER_REQUEST, text: 'Can someone cover the medical tent?', attachment: { type: AttachmentType.VOLUNTEER, title: 'Medical tent cover', subtitle: '2 hours' }, createdAt: min(18) }),
  ],
  'c-medcamp': [
    mk({ id: 'd1', authorName: 'Medical Camp', text: 'We can take 6 more patients tonight.', attachment: { type: AttachmentType.MEDICAL, title: 'Riverside Medical Camp', subtitle: '6 beds available' }, transport: 'lora', createdAt: hr(1) }),
    mk({ id: 'd2', self: true, text: 'Sending someone with a fracture. Thank you.', delivery: DeliveryState.DELIVERED, transport: 'lora', createdAt: min(52) }),
  ],
  'c-neighbourhood': [
    mk({ id: 'n1', authorName: 'Anil', text: 'Power is out across the whole sector.', createdAt: min(45) }),
    mk({ id: 'n2', authorName: 'Sara', text: 'Shelter open at the school.', attachment: { type: AttachmentType.SHELTER, title: 'Govt School Shelter', subtitle: 'Capacity 120 · 40 free' }, createdAt: min(38) }),
    mk({ id: 'n3', authorName: 'Vikram', type: MessageType.SOS, priority: MessagePriority.EMERGENCY, text: 'Elderly neighbour needs help on 3rd street!', createdAt: min(31) }),
  ],
  'c-shelter': [
    mk({ id: 's1', authorName: 'Riverside Shelter', text: 'Doors open all night. Bring ID if you have it.', transport: 'lora', createdAt: hr(3) }),
    mk({ id: 's2', self: true, text: 'Understood, heading over.', delivery: DeliveryState.FAILED, transport: 'lora', createdAt: hr(2) }),
  ],
};

export const nearbyUsers = [
  { id: 'dev-priya', name: 'Priya', kind: 'family', signalLevel: 4, distanceM: 12, deviceId: 'dev-priya' },
  { id: 'dev-volunteer', name: 'Rescue Volunteer', kind: 'volunteer', signalLevel: 3, distanceM: 85, deviceId: 'dev-volunteer' },
  { id: 'dev-rescue', name: 'Rescue Team Alpha', kind: 'rescue', signalLevel: 3, distanceM: 210, deviceId: 'dev-rescue' },
  { id: 'dev-medcamp', name: 'Medical Camp', kind: 'medical', signalLevel: 2, distanceM: 320, deviceId: 'dev-medcamp' },
];

export const groups = [
  { id: 'g-family', groupType: GroupType.FAMILY, name: 'Family', members: 4, active: true },
  { id: 'g-volunteers', groupType: GroupType.VOLUNTEER, name: 'Rescue Volunteers', members: 18, active: true },
  { id: 'g-emergency', groupType: GroupType.EMERGENCY, name: 'Sector 42 Emergency Team', members: 9, active: true },
  { id: 'g-neighbourhood', groupType: GroupType.NEIGHBORHOOD, name: 'Sector 42 Neighbourhood', members: 64, active: true },
  { id: 'g-community', groupType: GroupType.COMMUNITY, name: 'City Relief Community', members: 210, active: false },
];

// No pre-seeded broadcast history: inventing past broadcasts (with specific
// fake "reach" numbers) that never actually happened on this device is
// exactly the kind of fabricated claim this app must not make. Real entries
// are added as the user actually sends/receives broadcasts.
export const broadcastHistory = [];

export const recentSearches = ['Priya', 'shelter', 'power bank', 'medical camp', 'volunteers'];
