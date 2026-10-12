/**
 * WifiDirectTransport — Wi-Fi Direct transport (mock). Highest-priority,
 * high-throughput, short-to-medium range. Real implementation would wrap the
 * Android Wi-Fi P2P APIs behind this same surface.
 */
import MockTransport from './MockTransport';
import { TransportType } from '../core/constants';

export default class WifiDirectTransport extends MockTransport {
  constructor(simulator) {
    super(TransportType.WIFI_DIRECT, simulator);
  }
}
