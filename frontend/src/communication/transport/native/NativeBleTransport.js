/**
 * NativeBleTransport — real Bluetooth LE over the native bridge. Automatic
 * fallback when Wi-Fi Direct is unavailable or fails (the ConnectionManager
 * already tries transports in priority order: Wi-Fi Direct → BLE → LoRa).
 */
import NativeTransport from './NativeTransport';
import { TransportType } from '../../core/constants';

export default class NativeBleTransport extends NativeTransport {
  constructor(_simulator) {
    super(TransportType.BLE);
  }
}
