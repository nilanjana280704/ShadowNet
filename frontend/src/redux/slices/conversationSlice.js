/**
 * conversationSlice — UI state for the open conversation: which one is active
 * and per-conversation typing placeholders.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = { activeId: null, typingByConversation: {} };

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    activeConversationSet(state, action) {
      state.activeId = action.payload;
    },
    typingSet(state, action) {
      const { conversationId, typing } = action.payload;
      state.typingByConversation[conversationId] = typing;
    },
  },
});

export const { activeConversationSet, typingSet } = conversationSlice.actions;
export default conversationSlice.reducer;
