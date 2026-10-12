/**
 * BleTransport — Bluetooth Low Energy transport (mock). Low power, short range,
 * modest throughput. The real implementation (NativeBleTransport) talks to the
 * Android BluetoothGatt/BluetoothLeScanner APIs directly through the native
 * module, not through a third-party BLE library.
 */
import MockTransport from './MockTransport';
import { TransportType } from '../core/constants';

export default class BleTransport extends MockTransport {
  constructor(simulator) {
    super(TransportType.BLE, simulator);
  }
}
