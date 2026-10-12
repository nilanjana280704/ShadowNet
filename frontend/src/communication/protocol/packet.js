/**
 * ShadowNet wire protocol — the JSON packet exchanged between devices over any
 * transport (Wi-Fi Direct socket, BLE characteristic, LoRa frame). Kept small
 * and self-describing so it survives fragmentation and relaying.
 *
 * This is the contract the native layer mirrors byte-for-byte: the native side
 * frames a packet as [4-byte big-endian length][UTF-8 JSON] on a stream, or
 * chunks it across BLE writes. Higher layers only ever see parsed objects.
 */

export const PROTOCOL_VERSION = 1;

// The message types ShadowNet carries end-to-end.
export const PacketType = Object.freeze({
  CHAT: 'chat',
  SOS: 'sos',
  BROADCAST: 'broadcast',
  CHECKIN: 'checkin',
  HEARTBEAT: 'heartbeat',
  ACK: 'ack',
  // Announces the sender's real authenticated app identity to a peer it just
  // connected to. Never routed to chat/SOS — consumed only by the identity
  // layer. See buildIdentityAnnouncement / isValidIdentityPayload below.
  IDENTITY: 'identity',
});

let seq = 0;
function nextPacketId() {
  seq += 1;
  return `pk-${Date.now().toString(36)}-${seq}`;
}

/**
 * Build a packet ready to serialize and transmit.
 * @param {object} params
 * @param {string} params.type PacketType
 * @param {string} params.from self device id
 * @param {string} [params.to] target device id ('broadcast' for all)
 * @param {object} [params.payload] type-specific body
 * @param {number} [params.ttl=4] hops remaining (mesh relay budget)
 */
export function buildPacket({ type, from, to = 'broadcast', payload = {}, ttl = 4, id }) {
  return {
    v: PROTOCOL_VERSION,
    id: id || nextPacketId(),
    type,
    from,
    to,
    ts: Date.now(),
    ttl,
    payload,
  };
}

/** Serialize a packet to the string the transport sends. */
export function serialize(packet) {
  return JSON.stringify(packet);
}

/**
 * Parse a received string into a validated packet, or null if malformed /
 * unsupported version. Never throws — bad frames are dropped.
 */
export function parsePacket(raw) {
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!obj || obj.v !== PROTOCOL_VERSION || !obj.type || !obj.from) return null;
    if (!Object.values(PacketType).includes(obj.type)) return null;
    return obj;
  } catch {
    return null;
  }
}

/** An acknowledgement packet for a received packet id. */
export function buildAck({ from, to, ackFor }) {
  return buildPacket({ type: PacketType.ACK, from, to, ttl: 1, payload: { ackFor } });
}

/** A heartbeat/keepalive packet. */
export function buildHeartbeat({ from }) {
  return buildPacket({ type: PacketType.HEARTBEAT, from, ttl: 1 });
}

/**
 * An identity-announcement packet, sent once per newly-established connection
 * so the peer can associate this device with a real, authenticated app user
 * (never a device name, never fabricated).
 * @param {object} params
 * @param {string} params.from local device id
 * @param {string} params.to peer device id
 * @param {string} params.userId stable authenticated app user id
 * @param {string} params.displayName the user's real, resolved display name
 */
export function buildIdentityAnnouncement({ from, to, userId, displayName }) {
  return buildPacket({ type: PacketType.IDENTITY, from, to, ttl: 1, payload: { userId, displayName } });
}

/**
 * Validate an inbound identity payload before trusting it. Both fields must
 * be present, non-empty, trimmed strings — anything else is rejected outright
 * (the peer stays unverified rather than being populated with junk data).
 * @param {object} payload
 */
export function isValidIdentityPayload(payload) {
  if (!payload || typeof payload !== 'object') return false;
  const userId = typeof payload.userId === 'string' ? payload.userId.trim() : '';
  const displayName = typeof payload.displayName === 'string' ? payload.displayName.trim() : '';
  return Boolean(userId) && Boolean(displayName);
}

export default {
  PacketType,
  buildPacket,
  parsePacket,
  serialize,
  buildAck,
  buildHeartbeat,
  buildIdentityAnnouncement,
  isValidIdentityPayload,
  PROTOCOL_VERSION,
};
