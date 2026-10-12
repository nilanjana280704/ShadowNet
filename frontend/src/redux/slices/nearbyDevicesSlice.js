/**
 * nearbyDevicesSlice — normalized registry of discovered devices, updated from
 * engine discovery events.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = { byId: {}, ids: [] };

const nearbyDevicesSlice = createSlice({
  name: 'nearbyDevices',
  initialState,
  reducers: {
    deviceUpserted(state, action) {
      const device = action.payload;
      if (!state.byId[device.id]) state.ids.push(device.id);
      state.byId[device.id] = device;
    },
    deviceRemoved(state, action) {
      const id = action.payload;
      delete state.byId[id];
      state.ids = state.ids.filter((x) => x !== id);
    },
    devicesCleared() {
      return initialState;
    },
  },
});

export const { deviceUpserted, deviceRemoved, devicesCleared } = nearbyDevicesSlice.actions;
export default nearbyDevicesSlice.reducer;
