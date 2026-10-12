/**
 * useCommunication — the bridge components use to read communication state and
 * drive the engine, without touching the engine directly. It selects plain
 * Redux state and returns memoized action callbacks (thunks). This keeps all
 * networking/business logic out of components.
 */
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  connectDevice,
  disconnectDevice,
  initCommunication,
  sendMessage,
  startDiscovery,
  stopDiscovery,
} from '../redux';

export function useCommunication() {
  const dispatch = useDispatch();

  const initialized = useSelector((s) => s.communication.initialized);
  const discovering = useSelector((s) => s.communication.discovering);
  const deviceIds = useSelector((s) => s.nearbyDevices.ids);
  const devicesById = useSelector((s) => s.nearbyDevices.byId);
  const connections = useSelector((s) => s.connections.byId);
  const networkState = useSelector((s) => s.networkState);

  const devices = useMemo(() => deviceIds.map((id) => devicesById[id]), [deviceIds, devicesById]);

  const initialize = useCallback(() => dispatch(initCommunication()), [dispatch]);
  const scanStart = useCallback(() => dispatch(startDiscovery()), [dispatch]);
  const scanStop = useCallback(() => dispatch(stopDiscovery()), [dispatch]);
  const toggleScan = useCallback(
    () => (discovering ? dispatch(stopDiscovery()) : dispatch(startDiscovery())),
    [dispatch, discovering]
  );
  const connect = useCallback((id) => dispatch(connectDevice(id)), [dispatch]);
  const disconnect = useCallback((id) => dispatch(disconnectDevice(id)), [dispatch]);
  const send = useCallback((to, text, options) => dispatch(sendMessage(to, text, options)), [dispatch]);

  return {
    initialized,
    discovering,
    devices,
    connections,
    networkState,
    initialize,
    scanStart,
    scanStop,
    toggleScan,
    connect,
    disconnect,
    send,
  };
}

export default useCommunication;
