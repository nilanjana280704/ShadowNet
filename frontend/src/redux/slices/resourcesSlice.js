/**
 * resourcesSlice — food centers, water stations, and relief centers (the
 * "resources" of the relief network), plus the shared list filters and search
 * query used by every category list screen.
 */
import { createSlice } from '@reduxjs/toolkit';

const DEFAULT_FILTERS = {
  distance: 'any',
  openNow: false,
  verified: false,
  accessible: false,
  petFriendly: false,
  familyFriendly: false,
};

const initialState = {
  byId: {},
  ids: [],
  filters: { ...DEFAULT_FILTERS },
  query: '',
};

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    resourcesSeeded(state, action) {
      state.byId = {};
      state.ids = [];
      action.payload.forEach((e) => {
        state.byId[e.id] = e;
        state.ids.push(e.id);
      });
    },
    reliefFilterSet(state, action) {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    reliefFiltersReset(state) {
      state.filters = { ...DEFAULT_FILTERS };
    },
    reliefQuerySet(state, action) {
      state.query = action.payload;
    },
  },
});

export const { resourcesSeeded, reliefFilterSet, reliefFiltersReset, reliefQuerySet } = resourcesSlice.actions;
export default resourcesSlice.reducer;
