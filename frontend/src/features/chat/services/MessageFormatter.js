/**
 * MessageFormatter — pure helpers for building message objects and formatting
 * timestamps, previews, and delivery labels. No side effects.
 */
import { DeliveryState, MessageType } from '../constants';
import { MessagePriority } from '../../../communication';
import { clockTime, relativeTime } from '../../../utils/time';

let counter = 0;
const nextId = () => {
  counter += 1;
  return `cm-${Date.now().toString(36)}-${counter}`;
};

// Rule-based priority classification by message type. ML seam: replace with a
// content classifier (urgency from the text itself) behind the same signature.
const TYPE_PRIORITY = {
  [MessageType.SOS]: MessagePriority.EMERGENCY,
  [MessageType.BROADCAST]: MessagePriority.HIGH,
  [MessageType.RESOURCE_REQUEST]: MessagePriority.HIGH,
  [MessageType.VOLUNTEER_REQUEST]: MessagePriority.HIGH,
  [MessageType.SAFE_CHECKIN]: MessagePriority.LOW,
  [MessageType.SYSTEM]: MessagePriority.LOW,
};

export const MessageFormatter = {
  /** Classify a message's priority from its type (Critical/High/Normal/Low). */
  classifyPriority(type) {
    return TYPE_PRIORITY[type] ?? MessagePriority.NORMAL;
  },

  createMessage({ conversationId, text, type = MessageType.TEXT, attachment = null, priority, authorName = 'You' }) {
    return {
      id: nextId(),
      conversationId,
      self: true,
      authorName,
      type,
      text,
      attachment,
      // Explicit priority wins; otherwise classify from the message type.
      priority: priority ?? this.classifyPriority(type),
      encrypted: true,
      transport: null,
      delivery: DeliveryState.SENDING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  },

  relativeTime,
  clockTime,

  /** One-line preview for the chat list. */
  preview(message) {
    if (!message) return '';
    const prefix = message.self ? 'You: ' : '';
    switch (message.type) {
      case MessageType.LOCATION:
        return `${prefix}Shared a location`;
      case MessageType.SOS:
        return `SOS · ${message.text}`;
      case MessageType.BROADCAST:
        return `Broadcast · ${message.text}`;
      case MessageType.RESOURCE_REQUEST:
        return `${prefix}Resource request`;
      case MessageType.VOLUNTEER_REQUEST:
        return `${prefix}Volunteer request`;
      case MessageType.SAFE_CHECKIN:
        return `${prefix}Checked in safe`;
      default:
        return `${prefix}${message.text || ''}`;
    }
  },

  deliveryLabel(state) {
    const labels = {
      [DeliveryState.SENDING]: 'Sending',
      [DeliveryState.QUEUED]: 'Queued',
      [DeliveryState.RELAYING]: 'Relaying',
      [DeliveryState.DELIVERED]: 'Delivered',
      [DeliveryState.READ]: 'Read',
      [DeliveryState.FAILED]: 'Failed',
      [DeliveryState.RETRYING]: 'Retrying',
    };
    return labels[state] || '';
  },
};

export default MessageFormatter;
