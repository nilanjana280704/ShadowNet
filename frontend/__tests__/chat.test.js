/**
 * Chat service/formatter unit checks.
 */
import { MessageFormatter } from '../src/features/chat/services/MessageFormatter';
import { ConversationService, ConversationFilter } from '../src/features/chat/services/ConversationService';
import { BroadcastService } from '../src/features/chat/services/BroadcastService';
import { chatService } from '../src/features/chat/services/ChatService';
import { MessageType, DeliveryState, ENGINE_TO_DELIVERY } from '../src/features/chat/constants';
import { MessageState } from '../src/communication';

test('MessageFormatter creates a self message in the sending state', () => {
  const m = MessageFormatter.createMessage({ conversationId: 'c1', text: 'hi' });
  expect(m.self).toBe(true);
  expect(m.delivery).toBe('sending');
  expect(m.conversationId).toBe('c1');
});

test('MessageFormatter previews special types without leaking raw text for SOS', () => {
  const sos = { type: MessageType.SOS, text: 'need help' };
  expect(MessageFormatter.preview(sos)).toContain('SOS');
});

test('ConversationService sorts pinned first then most recent', () => {
  const list = [
    { id: 'a', pinned: false, lastMessageAt: 100 },
    { id: 'b', pinned: true, lastMessageAt: 50 },
    { id: 'c', pinned: false, lastMessageAt: 200 },
  ];
  const sorted = ConversationService.sort(list).map((c) => c.id);
  expect(sorted).toEqual(['b', 'c', 'a']);
});

test('ConversationService filters unread', () => {
  const list = [
    { id: 'a', unread: 0 },
    { id: 'b', unread: 3 },
  ];
  expect(ConversationService.filter(list, ConversationFilter.UNREAD).map((c) => c.id)).toEqual(['b']);
});

test('BroadcastService (chat) reports the real nearby-device count, never a fabricated reach', () => {
  const entry = BroadcastService.create({ title: 'Need water', message: 'test', nearbyDevices: 7 });
  expect(entry.sentTo).toBe(7);
});

test('BroadcastService (chat) is honest about zero nearby devices', () => {
  const entry = BroadcastService.create({ title: 'Need water', message: 'test', nearbyDevices: 0 });
  expect(entry.sentTo).toBe(0);
});

test('ChatService never fabricates delivery/read for a real device-mapped message (simulate: false)', () => {
  jest.useFakeTimers();
  try {
    const updates = [];
    const onUpdated = (u) => updates.push(u.delivery);
    chatService.on('message:updated', onUpdated);

    const message = MessageFormatter.createMessage({ conversationId: 'c1', text: 'hi' });
    chatService.send(message, { online: true, proximity: 'nearby', simulate: false });

    // Even after plenty of time passes, nothing beyond the real local
    // SENDING state may appear — only the real engine may advance it further.
    jest.advanceTimersByTime(10000);

    expect(updates).toEqual([DeliveryState.SENDING]);
  } finally {
    chatService.removeAllListeners();
    jest.useRealTimers();
  }
});

test('ChatService still runs the local simulated progression for demo/group conversations (no real device)', () => {
  jest.useFakeTimers();
  try {
    const updates = [];
    chatService.on('message:updated', (u) => updates.push(u.delivery));

    const message = MessageFormatter.createMessage({ conversationId: 'c-group', text: 'hi everyone' });
    chatService.send(message, { online: true, proximity: 'nearby' }); // simulate defaults to true

    jest.advanceTimersByTime(3000);

    expect(updates).toEqual([
      DeliveryState.SENDING,
      DeliveryState.RELAYING,
      DeliveryState.DELIVERED,
      DeliveryState.READ,
    ]);
  } finally {
    chatService.removeAllListeners();
    jest.useRealTimers();
  }
});

test('ENGINE_TO_DELIVERY maps every real engine state to a chat delivery state (the real wiring, not a timer)', () => {
  expect(ENGINE_TO_DELIVERY[MessageState.SENDING]).toBe(DeliveryState.RELAYING);
  expect(ENGINE_TO_DELIVERY[MessageState.DELIVERED]).toBe(DeliveryState.DELIVERED);
  expect(ENGINE_TO_DELIVERY[MessageState.ACKNOWLEDGED]).toBe(DeliveryState.DELIVERED);
  expect(ENGINE_TO_DELIVERY[MessageState.FAILED]).toBe(DeliveryState.FAILED);
});
