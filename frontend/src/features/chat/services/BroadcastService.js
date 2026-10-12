/**
 * BroadcastService — builds broadcast history entries. `sentTo` is the real
 * number of currently known nearby devices at send time — never a fabricated
 * number — meaning "sent to," not "confirmed received by" (there is no real
 * per-recipient read-receipt mechanism). Broadcasts fan out to everyone
 * nearby via the communication engine when wired in; here it produces the
 * record Broadcast History renders.
 */
let counter = 0;

export const BroadcastService = {
  create({ title, message, severity = 'warning', area = 'Nearby', nearbyDevices = 0 }) {
    counter += 1;
    return {
      id: `bc-${Date.now().toString(36)}-${counter}`,
      title,
      message,
      severity,
      area,
      sentTo: nearbyDevices,
      at: Date.now(),
    };
  },
};

export default BroadcastService;
