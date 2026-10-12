/**
 * messageQueueSlice — outgoing/sent messages (normalized, newest first) and
 * incoming messages, mirrored from MessageQueueService events.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = { byId: {}, ids: [], incoming: [] };

const messageQueueSlice = createSlice({
  name: 'messageQueue',
  initialState,
  reducers: {
    messageUpserted(state, action) {
      const message = action.payload;
      if (!state.byId[message.id]) state.ids.unshift(message.id);
      state.byId[message.id] = message;
    },
    incomingAdded(state, action) {
      state.incoming.unshift(action.payload);
    },
    messagesCleared() {
      return initialState;
    },
  },
});

export const { messageUpserted, incomingAdded, messagesCleared } = messageQueueSlice.actions;
export default messageQueueSlice.reducer;
