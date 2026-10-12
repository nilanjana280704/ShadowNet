/**
 * Redux Toolkit store. Combines the auth, profile, session, and ui slices.
 * Feature slices (chat, mesh, sos…) register here in later milestones.
 */
import { configureStore } from '@reduxjs/toolkit';

import {
  authReducer,
  profileReducer,
  sessionReducer,
  uiReducer,
  communicationReducer,
  nearbyDevicesReducer,
  connectionsReducer,
  routingReducer,
  messageQueueReducer,
  networkStateReducer,
  verifiedPeersReducer,
  chatReducer,
  conversationReducer,
  messageReducer,
  queueReducer,
  broadcastReducer,
  sosReducer,
  emergencyReducer,
  checkInReducer,
  emergencyContactsReducer,
  resourcesReducer,
  shelterReducer,
  medicalReducer,
  volunteerReducer,
  dangerZoneReducer,
  mapsReducer,
} from './slices';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    session: sessionReducer,
    ui: uiReducer,
    communication: communicationReducer,
    nearbyDevices: nearbyDevicesReducer,
    connections: connectionsReducer,
    routing: routingReducer,
    messageQueue: messageQueueReducer,
    networkState: networkStateReducer,
    verifiedPeers: verifiedPeersReducer,
    chat: chatReducer,
    conversation: conversationReducer,
    message: messageReducer,
    queue: queueReducer,
    broadcast: broadcastReducer,
    sos: sosReducer,
    emergency: emergencyReducer,
    checkIn: checkInReducer,
    emergencyContacts: emergencyContactsReducer,
    resources: resourcesReducer,
    shelter: shelterReducer,
    medical: medicalReducer,
    volunteer: volunteerReducer,
    dangerZone: dangerZoneReducer,
    maps: mapsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Dev tokens / timestamps are plain data; nothing non-serializable stored.
      serializableCheck: true,
    }),
});

export default store;
