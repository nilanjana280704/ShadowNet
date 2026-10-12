/**
 * commBridge — connects the communication engine to Redux. `initCommunication`
 * initializes the engine once and subscribes its events to slice actions, so
 * components read plain state and never touch the engine directly. Thunks
 * (startDiscovery, connectDevice, sendMessage…) are the only way UI drives it.
 *
 * Engine state is persisted (debounced) via commStorage for offline restore.
 */
import { communicationService, commStorage, CommEvent } from '../../communication';
import { debugLog } from '../../communication/core/debugLog';
import { discoveringSet, engineError, engineStateSet } from '../slices/communicationSlice';
import { deviceRemoved, deviceUpserted } from '../slices/nearbyDevicesSlice';
import { connectionUpserted } from '../slices/connectionsSlice';
import { routeUpserted } from '../slices/routingSlice';
import { incomingAdded, messageUpserted } from '../slices/messageQueueSlice';
import { networkStateSet } from '../slices/networkStateSlice';
import { peerIdentified, peerIdentityCleared } from '../slices/identitySlice';
import { routeInboundPacket } from './inboundBridge';
import { resolveDisplayName } from '../../utils/identity';

let subscribed = false;
let persistTimer = null;

function schedulePersist() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    commStorage.persist(communicationService.getSnapshot());
  }, 1500);
}

export const initCommunication = () => async (dispatch, getState) => {
  try {
    await communicationService.initialize();
    dispatch(engineStateSet({ initialized: true }));

    // Tell the engine who we really are, so it can announce this identity to
    // peers once connected. Read once here: by the time this runs the user is
    // already authenticated (Home only mounts post-auth per RootNavigator).
    const state = getState();
    const userId = state.auth.user?.uid;
    if (userId) {
      communicationService.setLocalIdentity({
        userId,
        displayName: resolveDisplayName({ profile: state.profile.data, authUser: state.auth.user }),
      });
    }

    if (subscribed) return;
    subscribed = true;

    communicationService.on(CommEvent.DEVICE_DISCOVERED, (d) => {
      debugLog('redux:deviceUpserted', { id: d.id, name: d.name, transports: d.transports });
      dispatch(deviceUpserted(d));
    });
    communicationService.on(CommEvent.DEVICE_UPDATED, (d) => dispatch(deviceUpserted(d)));
    communicationService.on(CommEvent.DEVICE_LOST, (d) => {
      dispatch(deviceRemoved(d.id));
      // The device is gone entirely, not just disconnected — its identity (if
      // any) is no longer meaningful.
      dispatch(peerIdentityCleared(d.id));
    });
    communicationService.on(CommEvent.PEER_IDENTIFIED, (p) => dispatch(peerIdentified(p)));
    communicationService.on(CommEvent.CONNECTION_CHANGED, (c) => dispatch(connectionUpserted(c)));
    communicationService.on(CommEvent.ROUTE_CHANGED, (r) => dispatch(routeUpserted(r)));
    communicationService.on(CommEvent.MESSAGE_QUEUED, (m) => dispatch(messageUpserted(m)));
    communicationService.on(CommEvent.MESSAGE_UPDATED, (m) => dispatch(messageUpserted(m)));
    communicationService.on(CommEvent.MESSAGE_RECEIVED, (m) => {
      dispatch(incomingAdded(m));
      // Real inbound packets carry a parsed protocol packet — route into chat /
      // emergency so Phone B actually shows Phone A's message.
      if (m?.packet) dispatch(routeInboundPacket(m));
    });
    communicationService.on(CommEvent.NETWORK_STATE, (s) => {
      dispatch(networkStateSet(s));
      schedulePersist();
    });
  } catch (err) {
    dispatch(engineError(err?.message || 'engine-init-failed'));
  }
};

export const startDiscovery = () => (dispatch) => {
  debugLog('redux:scanRequested');
  communicationService.startDiscovery();
  dispatch(discoveringSet(true));
};

export const stopDiscovery = () => (dispatch) => {
  communicationService.stopDiscovery();
  dispatch(discoveringSet(false));
};

export const connectDevice = (deviceId) => () => communicationService.connect(deviceId);

export const disconnectDevice = (deviceId) => () => communicationService.disconnect(deviceId);

export const sendMessage = (to, text, options) => () => communicationService.send(to, text, options);

export const broadcastMessage = (text, options) => () => communicationService.broadcast(text, options);
