/**
 * mapsSlice — map UI state: layer toggles, the selected entity, planned routes,
 * the active route choice, and the offline region indicator.
 */
import { createSlice } from '@reduxjs/toolkit';

import { DEFAULT_LAYERS } from '../../features/relief/constants';

const initialState = {
  layers: { ...DEFAULT_LAYERS },
  selectedId: null,
  routes: [],
  activeRouteKind: null,
  offlineRegion: null, // { id, name, ready }
};

const mapsSlice = createSlice({
  name: 'maps',
  initialState,
  reducers: {
    layerToggled(state, action) {
      const key = action.payload;
      state.layers[key] = !state.layers[key];
    },
    entitySelected(state, action) {
      state.selectedId = action.payload;
    },
    selectionCleared(state) {
      state.selectedId = null;
      state.routes = [];
      state.activeRouteKind = null;
    },
    routesSet(state, action) {
      state.routes = action.payload.routes;
      state.activeRouteKind = action.payload.activeKind;
    },
    activeRouteSet(state, action) {
      state.activeRouteKind = action.payload;
    },
    // Named mapRoutesCleared to avoid colliding with the comm-engine routing
    // slice's routesCleared in the barrel export.
    mapRoutesCleared(state) {
      state.routes = [];
      state.activeRouteKind = null;
    },
    offlineRegionSet(state, action) {
      state.offlineRegion = action.payload;
    },
  },
});

export const {
  layerToggled,
  entitySelected,
  selectionCleared,
  routesSet,
  activeRouteSet,
  mapRoutesCleared,
  offlineRegionSet,
} = mapsSlice.actions;
export default mapsSlice.reducer;
