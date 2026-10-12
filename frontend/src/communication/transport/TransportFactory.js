/**
 * TransportFactory — constructs transports by type from a registry. This is the
 * pluggability seam the whole engine was designed around: it chooses REAL native
 * transports (Android Wi-Fi Direct + BLE) when they're enabled and linked, and
 * otherwise the mock simulator — with nothing above the transport layer aware of
 * the difference.
 *
 * Selection: COMM_CONFIG.useNativeTransports AND the native module is actually
 * present (device build). On an emulator / iOS / tests, it transparently keeps
 * the mock.
 *
 * LoRa is intentionally NOT in the active registry: this project permanently
 * descoped LoRa/hardware (software-only Wi-Fi Direct/BLE mesh). Unlike Wi-Fi
 * Direct/BLE, LoRa has no "real" implementation to fall back from — its mock
 * transport would run unconditionally on every build, including real devices,
 * continuously feeding NetworkSimulator's fictional MOCK_DEVICES into the same
 * merged discovery registry real Wi-Fi Direct/BLE finds land in (TransportManager
 * initializes + starts discovery on every factory.types() entry with no way to
 * tell a real-radio device from a simulated one once merged). That previously
 * surfaced fabricated devices ("Medical Camp", "Emergency Vehicle", …) as if they
 * were real nearby people/services on physical hardware.
 */
import { COMM_CONFIG } from '../../config';
import { TransportType } from '../core/constants';
import { debugLog } from '../core/debugLog';
import { assertTransport } from './ITransport';
import WifiDirectTransport from './WifiDirectTransport';
import BleTransport from './BleTransport';
import { NativeBleTransport, NativeWifiDirectTransport, nativeCommBridge } from './native';

const useNative = COMM_CONFIG.useNativeTransports && nativeCommBridge.isAvailable();
debugLog('transport:selection', {
  useNativeTransports: COMM_CONFIG.useNativeTransports,
  nativeBridgeAvailable: nativeCommBridge.isAvailable(),
  useNative,
});

const REGISTRY = new Map([
  [TransportType.WIFI_DIRECT, useNative ? NativeWifiDirectTransport : WifiDirectTransport],
  [TransportType.BLE, useNative ? NativeBleTransport : BleTransport],
]);

export const TransportFactory = {
  /** True when the factory is building real native transports. */
  isNative() {
    return useNative;
  },

  /** Register or override a transport implementation for a type. */
  register(type, ctor) {
    REGISTRY.set(type, ctor);
  },

  /** All registered transport types (default priority order). */
  types() {
    return Array.from(REGISTRY.keys());
  },

  /** Create a transport instance, validating it satisfies ITransport. */
  create(type, simulator) {
    const Ctor = REGISTRY.get(type);
    if (!Ctor) throw new Error(`No transport registered for type ${type}`);
    return assertTransport(new Ctor(simulator));
  },
};

export default TransportFactory;
