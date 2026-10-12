/**
 * routingSlice — last route chosen per device plus the most recent route, from
 * RoutingService events. Powers route visualization.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = { byDeviceId: {}, last: null };

const routingSlice = createSlice({
  name: 'routing',
  initialState,
  reducers: {
    routeUpserted(state, action) {
      const route = action.payload;
      state.byDeviceId[route.deviceId] = route;
      state.last = route;
    },
    routesCleared() {
      return initialState;
    },
  },
});

export const { routeUpserted, routesCleared } = routingSlice.actions;
export default routingSlice.reducer;
