/**
 * SOSService — drives the SOS activation/cancel/resolve lifecycle. It no
 * longer fabricates delivery progress or acknowledgements: real progress is
 * derived in the UI from the actual message states the communication engine
 * reports for the messages broadcast on activation (see emergencyBridge's
 * sosBroadcastSent + sosSlice.messageIds). This service only emits the real,
 * user-driven status transition and its real timestamp.
 *
 *   events: sos:status (id, status, activatedAt)
 */
import EventEmitter from '../../../communication/core/EventEmitter';
import { SosStatus } from '../constants';

class SOSService extends EventEmitter {
  activate() {
    const id = `sos-${Date.now().toString(36)}`;
    const activatedAt = Date.now();
    this.emit('sos:status', { id, status: SosStatus.ACTIVE, activatedAt });
    return { id, activatedAt };
  }

  cancel() {
    this.emit('sos:status', { status: SosStatus.CANCELLED });
  }

  resolve() {
    this.emit('sos:status', { status: SosStatus.RESOLVED });
  }
}

export const sosService = new SOSService();
export default sosService;
