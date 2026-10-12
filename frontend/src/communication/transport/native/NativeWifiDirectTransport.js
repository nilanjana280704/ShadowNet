/**
 * NativeWifiDirectTransport — real Wi-Fi Direct (Android WifiP2pManager) over
 * the native bridge. Highest priority; used first for peer-to-peer offline
 * messaging with no router, hotspot, or internet.
 */
import NativeTransport from './NativeTransport';
import { TransportType } from '../../core/constants';

export default class NativeWifiDirectTransport extends NativeTransport {
  constructor(_simulator) {
    super(TransportType.WIFI_DIRECT);
  }
}
