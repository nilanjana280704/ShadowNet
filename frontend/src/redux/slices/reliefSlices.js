/**
 * Relief Network slices — resources (food/water/relief centers + shared
 * filters/search), shelters, medical camps, volunteers, and danger zones. Each
 * entity store is normalized { byId, ids }. Kept in one module because the five
 * entity slices are structurally identical; each is still its own reducer.
 */
import { createSlice } from '@reduxjs/toolkit';

function normalized(payload) {
  const byId = {};
  const ids = [];
  payload.forEach((e) => {
    byId[e.id] = e;
    ids.push(e.id);
  });
  return { byId, ids };
}

function entitySlice(name, seedAction) {
  return createSlice({
    name,
    initialState: { byId: {}, ids: [] },
    reducers: {
      [seedAction](state, action) {
        return normalized(action.payload);
      },
    },
  });
}

// --- resources: food + water + relief centers, plus shared filters/query ----
const resourcesSlice = createSlice({
  name: 'resources',
  initialState: {
    byId: {},
    ids: [],
    filters: {
      distance: 'any',
      openNow: false,
      verified: false,
      accessible: false,
      petFriendly: false,
      familyFriendly: false,
    },
    query: '',
  },
  reducers: {
    resourcesSeeded(state, action) {
      const { byId, ids } = normalized(action.payload);
      state.byId = byId;
      state.ids = ids;
    },
    reliefFilterSet(state, action) {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    reliefFiltersReset(state) {
      state.filters = { distance: 'any', openNow: false, verified: false, accessible: false, petFriendly: false, familyFriendly: false };
    },
    reliefQuerySet(state, action) {
      state.query = action.payload;
    },
  },
});

const shelterSlice = entitySlice('shelter', 'sheltersSeeded');
const medicalSlice = entitySlice('medical', 'medicalSeeded');
const volunteerSlice = entitySlice('volunteer', 'volunteersSeeded');
const dangerZoneSlice = entitySlice('dangerZone', 'dangerZonesSeeded');

export const { resourcesSeeded, reliefFilterSet, reliefFiltersReset, reliefQuerySet } = resourcesSlice.actions;
export const { sheltersSeeded } = shelterSlice.actions;
export const { medicalSeeded } = medicalSlice.actions;
export const { volunteersSeeded } = volunteerSlice.actions;
export const { dangerZonesSeeded } = dangerZoneSlice.actions;

export const resourcesReducer = resourcesSlice.reducer;
export const shelterReducer = shelterSlice.reducer;
export const medicalReducer = medicalSlice.reducer;
export const volunteerReducer = volunteerSlice.reducer;
export const dangerZoneReducer = dangerZoneSlice.reducer;
