/**
 * Crisis Mode service unit checks.
 */
import { EmergencyService } from '../src/features/emergency/services/EmergencyService';
import { CheckInService } from '../src/features/emergency/services/CheckInService';
import { BroadcastService } from '../src/features/emergency/services/BroadcastService';
import { sosService } from '../src/features/emergency/services/SOSService';
import { EmergencyStatus, SosStatus } from '../src/features/emergency/constants';
import { selectSosProgress } from '../src/features/emergency/SOSScreen';
import sosReducer, { sosBroadcastSent, sosReset, sosStatusSet } from '../src/redux/slices/sosSlice';
import { MessageState } from '../src/communication';

test('EmergencyService derives CRITICAL status while SOS is active', () => {
  expect(EmergencyService.deriveStatus({ sosStatus: SosStatus.ACTIVE })).toBe(EmergencyStatus.CRITICAL);
  expect(EmergencyService.deriveStatus({ sosStatus: SosStatus.IDLE, activeAlerts: 1 })).toBe(EmergencyStatus.ALERT);
  expect(EmergencyService.deriveStatus({ sosStatus: SosStatus.IDLE })).toBe(EmergencyStatus.NOMINAL);
});

test('EmergencyService formats distance', () => {
  expect(EmergencyService.formatDistance(320)).toBe('320 m');
  expect(EmergencyService.formatDistance(1500)).toBe('1.5 km');
});

test('CheckInService builds a record from a preset key', () => {
  const record = CheckInService.create('safe');
  expect(record.key).toBe('safe');
  expect(record.label).toBe("I'm safe");
  expect(record.audience).toBe('Family');
});

test('BroadcastService builds a request from a need, with an honest (not fabricated) reach', () => {
  const entry = BroadcastService.fromNeed('water', { nearbyDevices: 10 });
  expect(entry.needKey).toBe('water');
  // sentTo must be exactly the real nearby-device count — never inflated
  // with a random number, unlike the old (removed) fabricated "reach".
  expect(entry.sentTo).toBe(10);
  expect(entry.title).toContain('water');
});

test('BroadcastService never fabricates a reach when there are no real nearby devices', () => {
  const entry = BroadcastService.fromNeed('water', { nearbyDevices: 0 });
  expect(entry.sentTo).toBe(0);
});

test('SOSService.activate emits only a real status transition — no fabricated progress or acknowledgements', () => {
  const statusEvents = [];
  const progressEvents = [];
  const ackEvents = [];
  sosService.on('sos:status', (e) => statusEvents.push(e));
  sosService.on('sos:progress', (e) => progressEvents.push(e));
  sosService.on('sos:ack', (e) => ackEvents.push(e));

  const result = sosService.activate();

  expect(statusEvents).toHaveLength(1);
  expect(statusEvents[0].status).toBe(SosStatus.ACTIVE);
  expect(result.activatedAt).toBeLessThanOrEqual(Date.now());
  // The fabricated events this used to emit must never fire again.
  expect(progressEvents).toHaveLength(0);
  expect(ackEvents).toHaveLength(0);
});

test('sosSlice stores the real message ids a broadcast actually sent', () => {
  let state = sosReducer(undefined, { type: '@@init' });
  state = sosReducer(state, sosStatusSet({ id: 'sos-1', status: SosStatus.ACTIVE, activatedAt: 1000 }));
  state = sosReducer(state, sosBroadcastSent({ messageIds: ['m1', 'm2', 'm3'] }));
  expect(state.messageIds).toEqual(['m1', 'm2', 'm3']);
});

test('sosSlice clears message ids on reset', () => {
  let state = sosReducer(undefined, { type: '@@init' });
  state = sosReducer(state, sosBroadcastSent({ messageIds: ['m1'] }));
  state = sosReducer(state, sosReset());
  expect(state.messageIds).toEqual([]);
});

test('selectSosProgress derives real percent/devicesReached from actual message states, not a timer', () => {
  const state = {
    sos: { messageIds: ['m1', 'm2', 'm3', 'm4'] },
    messageQueue: {
      byId: {
        m1: { state: MessageState.DELIVERED },
        m2: { state: MessageState.ACKNOWLEDGED },
        m3: { state: MessageState.SENDING },
        // m4 absent entirely — must not throw or count as reached.
      },
    },
  };
  const progress = selectSosProgress(state);
  expect(progress.total).toBe(4);
  expect(progress.devicesReached).toBe(2);
  expect(progress.percent).toBe(50);
});

test('selectSosProgress is honest about zero real messages (no broadcast sent yet)', () => {
  const state = { sos: { messageIds: [] }, messageQueue: { byId: {} } };
  const progress = selectSosProgress(state);
  expect(progress).toEqual({ total: 0, devicesReached: 0, percent: 0 });
});
