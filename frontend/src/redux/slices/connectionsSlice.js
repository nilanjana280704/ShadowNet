/**
 * connectionsSlice — current connection record per device (keyed by deviceId),
 * updated from ConnectionManager events.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = { byId: {} };

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    connectionUpserted(state, action) {
      const conn = action.payload;
      state.byId[conn.deviceId] = conn;
    },
    connectionsCleared() {
      return initialState;
    },
  },
});

export const { connectionUpserted, connectionsCleared } = connectionsSlice.actions;
export default connectionsSlice.reducer;
