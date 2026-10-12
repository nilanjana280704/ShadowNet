/**
 * inboundBridge — routes a received network packet (from CommEvent.MESSAGE_RECEIVED)
 * into the existing feature slices. This is the integration glue that makes a
 * real inbound Wi-Fi Direct / BLE frame appear in the right place in the UI —
 * without any new screens or slices.
 *
 *   chat      → an incoming message in a conversation with the sender device
 *   sos       → an emergency history entry + critical toast
 *   broadcast → a broadcast history entry + toast
 *   checkin   → a toast
 *   heartbeat/ack → ignored (liveness/plumbing)
 */
import { PacketType } from '../../communication/protocol/packet';
import { HistoryKind } from '../../features/emergency/constants';
import { conversationUpserted, lastMessageSet } from '../slices/chatSlice';
import { messageAdded } from '../slices/messageSlice';
import { broadcastAdded } from '../slices/broadcastSlice';
import { historyAdded } from '../slices/emergencySlice';
import { showToast } from '../slices/uiSlice';

/** Ensure a direct conversation exists for an inbound sender, return its id. */
function ensureConversation(dispatch, getState, deviceId, name) {
  const { chat } = getState();
  const existing = chat.ids.map((id) => chat.byId[id]).find((c) => c.deviceId === deviceId);
  if (existing) return existing.id;
  const id = `c-${deviceId}`;
  dispatch(conversationUpserted({
    id,
    type: 'direct',
    name: name || 'Nearby device',
    deviceId,
    pinned: false,
    unread: 1,
    proximity: 'nearby',
    signalLevel: 3,
    lastMessageAt: Date.now(),
    lastPreview: '',
  }));
  return id;
}

export const routeInboundPacket = (payload) => (dispatch, getState) => {
  const { packet, deviceId } = payload;
  if (!packet) return;

  switch (packet.type) {
    case PacketType.CHAT: {
      const text = packet.payload?.text ?? '';
      const conversationId = ensureConversation(dispatch, getState, deviceId, packet.from);
      dispatch(messageAdded({
        id: packet.id,
        conversationId,
        self: false,
        authorName: packet.from || 'Nearby device',
        type: 'text',
        text,
        transport: payload.transport,
        delivery: 'read',
        createdAt: packet.ts || Date.now(),
        updatedAt: Date.now(),
      }));
      dispatch(lastMessageSet({ id: conversationId, preview: text, at: packet.ts || Date.now() }));
      break;
    }
    case PacketType.SOS: {
      dispatch(historyAdded({
        id: packet.id,
        kind: HistoryKind.SOS,
        title: 'SOS received nearby',
        detail: packet.payload?.text || 'A device nearby needs help',
        at: packet.ts || Date.now(),
      }));
      dispatch(showToast({ message: 'SOS received from a nearby device', severity: 'critical' }));
      break;
    }
    case PacketType.BROADCAST: {
      dispatch(broadcastAdded({
        id: packet.id,
        title: packet.payload?.title || 'Emergency broadcast',
        message: packet.payload?.text || packet.payload?.message || '',
        severity: packet.payload?.severity || 'warning',
        area: 'Nearby',
        // Received, not sent — how many other devices also got this is not
        // knowable from here, so no sentTo/reach claim is made at all.
        at: packet.ts || Date.now(),
      }));
      dispatch(showToast({ message: 'Broadcast received nearby', severity: 'warning' }));
      break;
    }
    case PacketType.CHECKIN: {
      dispatch(showToast({ message: `Check-in received: ${packet.payload?.text || 'safe'}`, severity: 'success' }));
      break;
    }
    default:
      break; // heartbeat / ack — no UI
  }
};

export default routeInboundPacket;
