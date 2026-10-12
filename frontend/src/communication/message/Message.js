/**
 * Message model + factory. A message carries its own delivery metadata
 * (state, priority, timestamps, attempts, encryption flag, delivery confidence,
 * route) so any queue or UI can render its status without extra lookups.
 */
import { MessagePriority, MessageState } from '../core/constants';

let counter = 0;
export function nextMessageId() {
  counter += 1;
  return `msg-${Date.now().toString(36)}-${counter}`;
}

/**
 * @param {object} params
 * @param {string} params.to target device id ('broadcast' for all)
 * @param {string} [params.from] sender id
 * @param {string} params.text message body
 * @param {number} [params.priority] MessagePriority
 * @param {boolean} [params.encrypted] whether to encrypt before send
 * @param {string} [params.packetType] wire PacketType (chat/sos/broadcast/…)
 */
export function createMessage({ to, from = 'self', text, priority = MessagePriority.NORMAL, encrypted = true, packetType = 'chat' }) {
  const now = Date.now();
  return {
    id: nextMessageId(),
    to,
    from,
    text,
    packetType,
    cipher: null,
    priority,
    encrypted,
    state: MessageState.QUEUED,
    transport: null,
    route: null,
    attempts: 0,
    confidence: 0,
    hops: 0,
    createdAt: now,
    updatedAt: now,
    error: null,
  };
}

/** Return a new message with a patched state + metadata (immutable update). */
export function patchMessage(message, patch) {
  return { ...message, ...patch, updatedAt: Date.now() };
}

export function isTerminal(state) {
  return state === MessageState.ACKNOWLEDGED || state === MessageState.DELIVERED || state === MessageState.FAILED;
}
