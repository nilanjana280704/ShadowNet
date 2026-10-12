/**
 * chatSlice — conversation metadata (the chat list): name, proximity, unread,
 * pinned, last-message preview, plus the active list filter and search query.
 * Message bodies live in messageSlice.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = { byId: {}, ids: [], filter: 'all', query: '' };

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    conversationsSeeded(state, action) {
      state.byId = {};
      state.ids = [];
      action.payload.forEach((c) => {
        state.byId[c.id] = c;
        state.ids.push(c.id);
      });
    },
    conversationUpserted(state, action) {
      const c = action.payload;
      if (!state.byId[c.id]) state.ids.push(c.id);
      state.byId[c.id] = c;
    },
    lastMessageSet(state, action) {
      const { id, preview, at } = action.payload;
      const c = state.byId[id];
      if (c) {
        c.lastPreview = preview;
        c.lastMessageAt = at;
      }
    },
    conversationRead(state, action) {
      const c = state.byId[action.payload];
      if (c) c.unread = 0;
    },
    pinToggled(state, action) {
      const c = state.byId[action.payload];
      if (c) c.pinned = !c.pinned;
    },
    filterSet(state, action) {
      state.filter = action.payload;
    },
    querySet(state, action) {
      state.query = action.payload;
    },
  },
});

export const {
  conversationsSeeded,
  conversationUpserted,
  lastMessageSet,
  conversationRead,
  pinToggled,
  filterSet,
  querySet,
} = chatSlice.actions;
export default chatSlice.reducer;
