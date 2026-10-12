/**
 * chatBridge — connects ChatService to Redux and exposes the thunks screens use
 * to drive messaging. Like commBridge, components never touch the service: they
 * dispatch these thunks and read plain state.
 *
 * Real delivery for device-mapped conversations: when a message is actually
 * sent to a discovered device, `engineMessageLinks` maps the real engine
 * message id back to the local chat message, and the real MESSAGE_UPDATED
 * stream (not a timer) drives its displayed delivery state via
 * ENGINE_TO_DELIVERY — see sendChatMessage/retryChatMessage below.
 */
import { communicationService, CommEvent } from '../../communication';
import { chatService, BroadcastService, MessageFormatter } from '../../features/chat/services';
import { ENGINE_TO_DELIVERY } from '../../features/chat/constants';
import { conversations, messagesByConversation, broadcastHistory } from '../../features/chat/mockData';
import { broadcastAdded, broadcastsSeeded } from '../slices/broadcastSlice';
import { conversationRead, conversationsSeeded, conversationUpserted, lastMessageSet } from '../slices/chatSlice';
import { activeConversationSet } from '../slices/conversationSlice';
import { messageAdded, messagesSeeded, messageUpdated } from '../slices/messageSlice';
import { queueSet } from '../slices/queueSlice';

let subscribed = false;
const engineMessageLinks = new Map(); // real engine message id -> { chatMessageId, conversationId }

/** Send (or resend) a message to a real device, and track it for real delivery state. */
function sendToRealDevice(deviceId, text, chatMessageId, conversationId) {
  const engineMessage = communicationService.send(deviceId, text, { packetType: 'chat' });
  if (engineMessage?.id) {
    engineMessageLinks.set(engineMessage.id, { chatMessageId, conversationId });
  }
}

export const initChat = () => (dispatch) => {
  dispatch(conversationsSeeded(conversations));
  Object.entries(messagesByConversation).forEach(([conversationId, messages]) =>
    dispatch(messagesSeeded({ conversationId, messages }))
  );
  dispatch(broadcastsSeeded(broadcastHistory));

  if (subscribed) return;
  subscribed = true;
  chatService.on('message:added', (m) => dispatch(messageAdded(m)));
  chatService.on('message:updated', (u) => dispatch(messageUpdated(u)));
  chatService.on('queue:changed', (q) => dispatch(queueSet(q)));

  // Real, event-driven delivery for messages actually sent to a device —
  // never a fabricated timer.
  communicationService.on(CommEvent.MESSAGE_UPDATED, (m) => {
    const link = engineMessageLinks.get(m.id);
    if (!link) return;
    dispatch(messageUpdated({
      conversationId: link.conversationId,
      id: link.chatMessageId,
      delivery: ENGINE_TO_DELIVERY[m.state],
      updatedAt: Date.now(),
      transport: m.transport,
    }));
  });
};

export const openConversation = (conversationId) => (dispatch) => {
  dispatch(activeConversationSet(conversationId));
  dispatch(conversationRead(conversationId));
};

/**
 * Open an existing direct conversation with a peer, or create one on the fly.
 * Returns the conversation id.
 */
export const startConversationWith = (peer) => (dispatch, getState) => {
  const { chat } = getState();
  const deviceId = peer.deviceId || peer.id;
  const existing = chat.ids.map((id) => chat.byId[id]).find((c) => c.type === 'direct' && c.deviceId === deviceId);
  if (existing) {
    dispatch(openConversation(existing.id));
    return existing.id;
  }
  const level = peer.level ?? peer.signalLevel ?? 3;
  const id = `c-${peer.id || deviceId}`;
  dispatch(conversationUpserted({
    id,
    type: 'direct',
    name: peer.name,
    deviceId,
    pinned: false,
    unread: 0,
    proximity: level >= 4 ? 'nearby' : 'relayed',
    signalLevel: level,
    lastMessageAt: Date.now(),
    lastPreview: '',
  }));
  dispatch(messagesSeeded({ conversationId: id, messages: [] }));
  dispatch(openConversation(id));
  return id;
};

export const sendChatMessage = (conversationId, payload) => (dispatch, getState) => {
  const state = getState();
  const convo = state.chat.byId[conversationId];
  const proximity = convo?.proximity || 'relayed';
  const online = proximity !== 'offline';
  const message = MessageFormatter.createMessage({ conversationId, ...payload });
  const hasRealDevice = Boolean(convo?.deviceId) && Boolean(payload.text);

  // Real transmission: if the conversation maps to a discovered device, send
  // the text over the communication engine (real Wi-Fi Direct / BLE when
  // enabled) and let its real message state drive delivery — never a timer.
  chatService.send(message, { online, proximity, simulate: !hasRealDevice });
  dispatch(lastMessageSet({ id: conversationId, preview: MessageFormatter.preview(message), at: message.createdAt }));

  if (hasRealDevice) {
    sendToRealDevice(convo.deviceId, payload.text, message.id, conversationId);
  }
  return message;
};

export const retryChatMessage = (message) => (dispatch, getState) => {
  const convo = getState().chat.byId[message.conversationId];
  const hasRealDevice = Boolean(convo?.deviceId) && Boolean(message.text);
  chatService.retry(message, {
    proximity: convo?.proximity === 'offline' ? 'relayed' : convo?.proximity,
    simulate: !hasRealDevice,
  });
  if (hasRealDevice) {
    sendToRealDevice(convo.deviceId, message.text, message.id, message.conversationId);
  }
};

export const flushChatQueue = () => (dispatch, getState) => {
  const online = getState().networkState.online;
  chatService.flush({ proximity: online ? 'relayed' : 'offline' });
};

export const sendBroadcast = ({ title, message, severity, area }) => (dispatch, getState) => {
  const nearby = getState().networkState.deviceCount;
  const entry = BroadcastService.create({ title, message, severity, area, nearbyDevices: nearby });
  dispatch(broadcastAdded(entry));
  return entry;
};
