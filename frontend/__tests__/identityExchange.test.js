/**
 * Peer identity exchange — the real mechanism (not Redux UI wiring): a
 * validated IDENTITY packet sent once per fresh connection, and the
 * engine/reducer behavior around validating, associating, and clearing it.
 * No real radios here — same style as communication.test.js, using the mock
 * simulator's transport/connection managers directly.
 */
import CommunicationManager from '../src/communication/manager/CommunicationManager';
import { ConnectionEvent } from '../src/communication/connection/ConnectionManager';
import { CommEvent, ConnectionState, TransportEvent } from '../src/communication/core/constants';
import {
  PacketType,
  buildIdentityAnnouncement,
  isValidIdentityPayload,
  parsePacket,
  serialize,
} from '../src/communication/protocol/packet';
import identityReducer, { peerIdentified, peerIdentityCleared } from '../src/redux/slices/identitySlice';

const makeDevice = (id) => ({ id, transports: ['wifi-direct'] });

// --- Payload validation ---

test('isValidIdentityPayload accepts a real userId + displayName', () => {
  expect(isValidIdentityPayload({ userId: 'u1', displayName: 'Nilanjana' })).toBe(true);
});

test.each([
  [null],
  [undefined],
  ['not-an-object'],
  [{}],
  [{ userId: 'u1' }],
  [{ displayName: 'Nilanjana' }],
  [{ userId: '   ', displayName: 'Nilanjana' }],
  [{ userId: 'u1', displayName: '   ' }],
  [{ userId: 123, displayName: 'Nilanjana' }],
])('isValidIdentityPayload rejects invalid payload %#', (payload) => {
  expect(isValidIdentityPayload(payload)).toBe(false);
});

test('buildIdentityAnnouncement round-trips through serialize/parsePacket', () => {
  const wire = serialize(buildIdentityAnnouncement({ from: 'u1', to: 'dev-2', userId: 'u1', displayName: 'Nilanjana' }));
  const parsed = parsePacket(wire);
  expect(parsed.type).toBe(PacketType.IDENTITY);
  expect(parsed.payload).toEqual({ userId: 'u1', displayName: 'Nilanjana' });
});

// --- Outbound: announcing on connect ---

test('nothing is announced until a real local identity has been set', () => {
  const manager = new CommunicationManager();
  const sendSpy = jest.spyOn(manager.transportManager, 'send').mockResolvedValue({ confidence: 1, latencyMs: 5 });

  manager.connectionManager.emit(ConnectionEvent.CHANGED, {
    deviceId: 'dev-1',
    state: ConnectionState.CONNECTED,
    device: makeDevice('dev-1'),
    transport: 'wifi-direct',
  });

  expect(sendSpy).not.toHaveBeenCalled();
});

test('a fresh connection announces the real local identity to that peer', async () => {
  const manager = new CommunicationManager();
  const sendSpy = jest.spyOn(manager.transportManager, 'send').mockResolvedValue({ confidence: 1, latencyMs: 5 });

  manager.setLocalIdentity({ userId: 'u-nilanjana', displayName: 'Nilanjana' });
  manager.connectionManager.emit(ConnectionEvent.CHANGED, {
    deviceId: 'dev-2',
    state: ConnectionState.CONNECTED,
    device: makeDevice('dev-2'),
    transport: 'wifi-direct',
  });

  expect(sendSpy).toHaveBeenCalledTimes(1);
  const [transport, deviceId, wire] = sendSpy.mock.calls[0];
  expect(transport).toBe('wifi-direct');
  expect(deviceId).toBe('dev-2');
  const packet = parsePacket(wire);
  expect(packet.type).toBe(PacketType.IDENTITY);
  expect(packet.payload).toEqual({ userId: 'u-nilanjana', displayName: 'Nilanjana' });
});

test('setLocalIdentity rejects an invalid identity — never announces junk', () => {
  const manager = new CommunicationManager();
  const sendSpy = jest.spyOn(manager.transportManager, 'send').mockResolvedValue({});

  manager.setLocalIdentity({ userId: '', displayName: 'Nilanjana' });
  manager.connectionManager.emit(ConnectionEvent.CHANGED, {
    deviceId: 'dev-1',
    state: ConnectionState.CONNECTED,
    device: makeDevice('dev-1'),
    transport: 'wifi-direct',
  });

  expect(sendSpy).not.toHaveBeenCalled();
});

// --- Inbound: receiving and validating ---

test('a valid inbound identity packet emits PEER_IDENTIFIED associated with the originating deviceId', () => {
  const manager = new CommunicationManager();
  const spy = jest.fn();
  manager.on(CommEvent.PEER_IDENTIFIED, spy);

  manager.transportManager.emit(TransportEvent.MESSAGE, {
    kind: 'inbound',
    deviceId: 'dev-9',
    transport: 'wifi-direct',
    packet: buildIdentityAnnouncement({ from: 'u-panchali', to: 'self', userId: 'u-panchali', displayName: 'Panchali' }),
  });

  expect(spy).toHaveBeenCalledTimes(1);
  const event = spy.mock.calls[0][0];
  expect(event.deviceId).toBe('dev-9');
  expect(event.userId).toBe('u-panchali');
  expect(event.displayName).toBe('Panchali');
});

test('an invalid/incomplete inbound identity payload is rejected, not emitted', () => {
  const manager = new CommunicationManager();
  const spy = jest.fn();
  manager.on(CommEvent.PEER_IDENTIFIED, spy);

  manager.transportManager.emit(TransportEvent.MESSAGE, {
    kind: 'inbound',
    deviceId: 'dev-9',
    transport: 'wifi-direct',
    packet: { v: 1, id: 'pk-x', type: PacketType.IDENTITY, from: 'u1', to: 'self', ts: Date.now(), ttl: 1, payload: { userId: '' } },
  });

  expect(spy).not.toHaveBeenCalled();
});

test('identity packets never surface as a chat/SOS/broadcast message', () => {
  const manager = new CommunicationManager();
  const spy = jest.fn();
  manager.on(CommEvent.MESSAGE_RECEIVED, spy);

  manager.transportManager.emit(TransportEvent.MESSAGE, {
    kind: 'inbound',
    deviceId: 'dev-9',
    transport: 'wifi-direct',
    packet: buildIdentityAnnouncement({ from: 'u1', to: 'self', userId: 'u1', displayName: 'Nilanjana' }),
  });

  expect(spy).not.toHaveBeenCalled();
});

test('duplicate identity announcements from the same device do not throw and reflect the latest value', () => {
  const manager = new CommunicationManager();
  const spy = jest.fn();
  manager.on(CommEvent.PEER_IDENTIFIED, spy);

  const announce = (displayName) =>
    manager.transportManager.emit(TransportEvent.MESSAGE, {
      kind: 'inbound',
      deviceId: 'dev-9',
      transport: 'wifi-direct',
      packet: buildIdentityAnnouncement({ from: 'u1', to: 'self', userId: 'u1', displayName }),
    });

  expect(() => {
    announce('Panchali');
    announce('Panchali');
  }).not.toThrow();

  expect(spy).toHaveBeenCalledTimes(2);
  expect(spy.mock.calls[1][0].displayName).toBe('Panchali');
});

// --- Redux slice: device-to-identity association, duplicates, clearing ---

test('identitySlice upserts by deviceId and overwrites (not duplicates) on a repeat announcement', () => {
  let state = identityReducer(undefined, { type: '@@init' });
  state = identityReducer(state, peerIdentified({ deviceId: 'dev-1', userId: 'u1', displayName: 'Nilanjana', verifiedAt: 1 }));
  state = identityReducer(state, peerIdentified({ deviceId: 'dev-1', userId: 'u1', displayName: 'Nilanjana', verifiedAt: 2 }));

  expect(Object.keys(state.byDeviceId)).toHaveLength(1);
  expect(state.byDeviceId['dev-1'].verifiedAt).toBe(2);
});

test('identitySlice keeps two different devices separately associated (no cross-talk)', () => {
  let state = identityReducer(undefined, { type: '@@init' });
  state = identityReducer(state, peerIdentified({ deviceId: 'dev-1', userId: 'u-nilanjana', displayName: 'Nilanjana' }));
  state = identityReducer(state, peerIdentified({ deviceId: 'dev-2', userId: 'u-panchali', displayName: 'Panchali' }));

  expect(state.byDeviceId['dev-1'].displayName).toBe('Nilanjana');
  expect(state.byDeviceId['dev-2'].displayName).toBe('Panchali');
});

test('identitySlice ignores a malformed peerIdentified payload', () => {
  let state = identityReducer(undefined, { type: '@@init' });
  state = identityReducer(state, peerIdentified({ deviceId: 'dev-1' })); // missing userId/displayName
  expect(state.byDeviceId['dev-1']).toBeUndefined();
});

test('identitySlice clears an identity when its device is lost entirely', () => {
  let state = identityReducer(undefined, { type: '@@init' });
  state = identityReducer(state, peerIdentified({ deviceId: 'dev-1', userId: 'u1', displayName: 'Nilanjana' }));
  state = identityReducer(state, peerIdentityCleared('dev-1'));
  expect(state.byDeviceId['dev-1']).toBeUndefined();
});
