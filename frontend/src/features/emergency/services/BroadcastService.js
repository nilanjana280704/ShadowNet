/**
 * BroadcastService (emergency) — builds emergency broadcast requests from a
 * predefined need or custom text. `sentTo` is the real number of currently
 * known nearby devices at send time (never a fabricated/random number) — it
 * means "sent to this many devices," not "confirmed received by," since the
 * engine has no real per-recipient read-receipt mechanism. The actual fan-out
 * is done by CommunicationService.broadcast in the thunk.
 */
import { BROADCAST_NEEDS } from '../constants';

let counter = 0;

export const BroadcastService = {
  fromNeed(needKey, { nearbyDevices = 0 } = {}) {
    const need = BROADCAST_NEEDS.find((n) => n.key === needKey);
    return this.create({
      title: need ? need.label : 'Emergency request',
      message: need ? `${need.label} — please respond if you can help.` : 'Emergency request',
      needKey,
      tone: need?.tone,
      nearbyDevices,
    });
  },

  create({ title, message, needKey = null, tone = 'warning', area = 'Nearby', nearbyDevices = 0 }) {
    counter += 1;
    return {
      id: `eb-${Date.now().toString(36)}-${counter}`,
      title,
      message,
      needKey,
      tone,
      severity: tone === 'sos' || tone === 'critical' ? 'critical' : tone === 'error' ? 'warning' : 'info',
      area,
      sentTo: nearbyDevices,
      at: Date.now(),
    };
  },
};

export default BroadcastService;
