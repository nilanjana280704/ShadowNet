/**
 * Chat domain constants. Message types, delivery states, conversation/group
 * types, and attachment types — plus a mapping from the communication engine's
 * MessageState to the chat DeliveryState, so chat delivery is driven by the real
 * engine pipeline when it's wired in.
 */
import { MessageState } from '../../communication';

export const MessageType = Object.freeze({
  TEXT: 'text',
  LOCATION: 'location',
  SOS: 'sos',
  BROADCAST: 'broadcast',
  RESOURCE_REQUEST: 'resource-request',
  VOLUNTEER_REQUEST: 'volunteer-request',
  SAFE_CHECKIN: 'safe-checkin',
  SYSTEM: 'system',
  IMAGE: 'image', // future placeholder
  VOICE: 'voice', // future placeholder
});

export const DeliveryState = Object.freeze({
  SENDING: 'sending',
  QUEUED: 'queued',
  RELAYING: 'relaying',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
  RETRYING: 'retrying',
});

// How each engine MessageState surfaces in the chat UI.
export const ENGINE_TO_DELIVERY = Object.freeze({
  [MessageState.QUEUED]: DeliveryState.QUEUED,
  [MessageState.ENCRYPTING]: DeliveryState.SENDING,
  [MessageState.ROUTING]: DeliveryState.RELAYING,
  [MessageState.SENDING]: DeliveryState.RELAYING,
  [MessageState.SENT]: DeliveryState.DELIVERED,
  [MessageState.DELIVERED]: DeliveryState.DELIVERED,
  [MessageState.ACKNOWLEDGED]: DeliveryState.DELIVERED,
  [MessageState.FAILED]: DeliveryState.FAILED,
  [MessageState.RETRYING]: DeliveryState.RETRYING,
});

export const ConversationType = Object.freeze({ DIRECT: 'direct', GROUP: 'group' });

export const GroupType = Object.freeze({
  COMMUNITY: 'community',
  FAMILY: 'family',
  VOLUNTEER: 'volunteer',
  EMERGENCY: 'emergency',
  NEIGHBORHOOD: 'neighborhood',
});

export const GROUP_META = Object.freeze({
  [GroupType.COMMUNITY]: { label: 'Community', icon: 'users', tone: 'info' },
  [GroupType.FAMILY]: { label: 'Family', icon: 'user', tone: 'accent' },
  [GroupType.VOLUNTEER]: { label: 'Volunteer Team', icon: 'volunteer', tone: 'success' },
  [GroupType.EMERGENCY]: { label: 'Emergency Team', icon: 'sos', tone: 'emergency' },
  [GroupType.NEIGHBORHOOD]: { label: 'Neighbourhood', icon: 'home', tone: 'warning' },
});

export const AttachmentType = Object.freeze({
  LOCATION: 'location',
  RESOURCE: 'resource',
  CONTACT: 'contact',
  SHELTER: 'shelter',
  MEDICAL: 'medical',
  VOLUNTEER: 'volunteer',
});

export const ATTACHMENT_META = Object.freeze({
  [AttachmentType.LOCATION]: { label: 'Location', icon: 'pin', tone: 'info' },
  [AttachmentType.RESOURCE]: { label: 'Resource', icon: 'resource', tone: 'warning' },
  [AttachmentType.CONTACT]: { label: 'Emergency contact', icon: 'phone', tone: 'accent' },
  [AttachmentType.SHELTER]: { label: 'Shelter', icon: 'shelter', tone: 'success' },
  [AttachmentType.MEDICAL]: { label: 'Medical camp', icon: 'medical', tone: 'error' },
  [AttachmentType.VOLUNTEER]: { label: 'Volunteer', icon: 'volunteer', tone: 'success' },
});

// Priority presentation for classified messages. NORMAL renders no badge —
// only deviations from normal deserve the user's attention.
export const PRIORITY_META = Object.freeze({
  3: { label: 'Critical', tone: 'critical' }, // MessagePriority.EMERGENCY
  2: { label: 'High', tone: 'warning' }, // MessagePriority.HIGH
  0: { label: 'Low', tone: 'neutral' }, // MessagePriority.LOW
});

// Message-type presentation (icon + accent) for system/special bubbles.
export const MESSAGE_TYPE_META = Object.freeze({
  [MessageType.SOS]: { label: 'SOS', icon: 'sos', tone: 'sos' },
  [MessageType.BROADCAST]: { label: 'Broadcast', icon: 'emergency', tone: 'emergency' },
  [MessageType.RESOURCE_REQUEST]: { label: 'Resource request', icon: 'resource', tone: 'warning' },
  [MessageType.VOLUNTEER_REQUEST]: { label: 'Volunteer request', icon: 'volunteer', tone: 'info' },
  [MessageType.SAFE_CHECKIN]: { label: 'Safe check-in', icon: 'success', tone: 'success' },
  [MessageType.SYSTEM]: { label: 'System', icon: 'info', tone: 'muted' },
});
