/**
 * createEntitySlice — factory for normalized { byId, ids } entity slices
 * (shelters, medical camps, volunteers, danger zones…). Each gets `seeded` and
 * `upserted` reducers; anything richer belongs in a hand-written slice.
 */
import { createSlice } from '@reduxjs/toolkit';

export function createEntitySlice(name) {
  const slice = createSlice({
    name,
    initialState: { byId: {}, ids: [] },
    reducers: {
      seeded(state, action) {
        state.byId = {};
        state.ids = [];
        action.payload.forEach((e) => {
          state.byId[e.id] = e;
          state.ids.push(e.id);
        });
      },
      upserted(state, action) {
        const e = action.payload;
        if (!state.byId[e.id]) state.ids.push(e.id);
        state.byId[e.id] = e;
      },
    },
  });
  return slice;
}

export default createEntitySlice;
