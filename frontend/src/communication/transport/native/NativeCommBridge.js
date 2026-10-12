/**
 * NativeCommBridge — the thin JS ↔ native seam for real offline transports.
 * Wraps the `ShadowNetComm` Android native module (Wi-Fi Direct + BLE) and its
 * event stream, exposing promise-returning methods and an EventEmitter.
 *
 * Degrades gracefully: when the native module is absent (emulator, iOS, Jest,
 * or a build without the module), `isAvailable()` returns false and the
 * TransportFactory keeps using the mock simulator. Nothing here runs at import
 * time, so importing this file is always safe.
 *
 * Native → JS events arrive on the single `ShadowNetCommEvent` channel as
 * `{ type, transport, ... }` and are re-emitted by `type` (deviceFound,
 * deviceLost, connected, disconnected, message, stateChanged).
 */
import { NativeEventEmitter, NativeModules } from 'react-native';

import EventEmitter from '../../core/EventEmitter';
import { debugLog } from '../../core/debugLog';

const Native = NativeModules.ShadowNetComm || null;
debugLog('nativeBridge:moduleResolved', {
  available: Boolean(Native),
  registeredModules: Object.keys(NativeModules).filter((k) => /shadownet/i.test(k)),
});

class NativeCommBridge extends EventEmitter {
  constructor() {
    super();
    this._wired = false;
    this._nativeEmitter = null;
    this._subscription = null;
  }

  isAvailable() {
    return Boolean(Native);
  }

  _wire() {
    if (this._wired || !Native) return;
    this._wired = true;
    this._nativeEmitter = new NativeEventEmitter(Native);
    this._subscription = this._nativeEmitter.addListener('ShadowNetCommEvent', (event) => {
      debugLog('nativeBridge:eventReceived', { type: event?.type, transport: event?.transport });
      if (event?.type) this.emit(event.type, event);
    });
  }

  /** Prepare a transport (permissions/receivers). Wires the event stream once. */
  initialize(transport) {
    if (!Native) return Promise.resolve();
    this._wire();
    debugLog('nativeBridge:initialize', { transport });
    return Native.initialize(transport);
  }

  startDiscovery(transport) {
    debugLog('nativeBridge:startDiscovery', { transport, available: Boolean(Native) });
    return Native ? Native.startDiscovery(transport) : Promise.resolve();
  }

  stopDiscovery(transport) {
    return Native ? Native.stopDiscovery(transport) : Promise.resolve();
  }

  connect(transport, deviceId) {
    return Native ? Native.connect(transport, deviceId) : Promise.reject(new Error('native-unavailable'));
  }

  disconnect(transport, deviceId) {
    return Native ? Native.disconnect(transport, deviceId) : Promise.resolve();
  }

  /** Send a serialized packet (JSON string). Resolves { confidence, latencyMs }. */
  send(transport, deviceId, json) {
    return Native ? Native.send(transport, deviceId, json) : Promise.reject(new Error('native-unavailable'));
  }

  getStatus(transport) {
    return Native ? Native.getStatus(transport) : Promise.resolve({ available: false });
  }

  dispose() {
    this._subscription?.remove?.();
    this._subscription = null;
    this._wired = false;
  }
}

export const nativeCommBridge = new NativeCommBridge();
export default nativeCommBridge;
