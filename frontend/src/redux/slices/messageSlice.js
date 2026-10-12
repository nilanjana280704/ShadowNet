/**
 * messageSlice — messages normalized per conversation. Fed by ChatService
 * events (added/updated) via the chat bridge.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = { byConversation: {} };

function bucket(state, conversationId) {
  if (!state.byConversation[conversationId]) {
    state.byConversation[conversationId] = { ids: [], byId: {} };
  }
  return state.byConversation[conversationId];
}

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    messagesSeeded(state, action) {
      const { conversationId, messages } = action.payload;
      const b = { ids: [], byId: {} };
      messages.forEach((m) => {
        const msg = { ...m, conversationId };
        b.ids.push(msg.id);
        b.byId[msg.id] = msg;
      });
      state.byConversation[conversationId] = b;
    },
    messageAdded(state, action) {
      const message = action.payload;
      const b = bucket(state, message.conversationId);
      if (!b.byId[message.id]) b.ids.push(message.id);
      b.byId[message.id] = message;
    },
    messageUpdated(state, action) {
      const { conversationId, id, delivery, updatedAt, transport } = action.payload;
      const b = state.byConversation[conversationId];
      const message = b?.byId[id];
      if (!message) return;
      message.delivery = delivery;
      message.updatedAt = updatedAt;
      if (transport) message.transport = transport;
    },
  },
});

export const { messagesSeeded, messageAdded, messageUpdated } = messageSlice.actions;
export default messageSlice.reducer;
