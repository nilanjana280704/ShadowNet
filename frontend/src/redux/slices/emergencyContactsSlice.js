/**
 * emergencyContactsSlice — the user's emergency contacts, normalized, with a
 * priority contact.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = { byId: {}, ids: [], priorityId: null };

const emergencyContactsSlice = createSlice({
  name: 'emergencyContacts',
  initialState,
  reducers: {
    contactsSeeded(state, action) {
      state.byId = {};
      state.ids = [];
      action.payload.forEach((c) => {
        state.byId[c.id] = c;
        state.ids.push(c.id);
        if (c.priority && !state.priorityId) state.priorityId = c.id;
      });
    },
    contactAdded(state, action) {
      const c = action.payload;
      if (!state.byId[c.id]) state.ids.push(c.id);
      state.byId[c.id] = c;
    },
    prioritySet(state, action) {
      const id = action.payload;
      state.ids.forEach((cid) => {
        if (state.byId[cid]) state.byId[cid].priority = cid === id;
      });
      state.priorityId = id;
    },
  },
});

export const { contactsSeeded, contactAdded, prioritySet } = emergencyContactsSlice.actions;
export default emergencyContactsSlice.reducer;
