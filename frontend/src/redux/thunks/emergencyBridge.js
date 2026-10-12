/**
 * emergencyBridge — Crisis Mode ↔ Redux. Seeds mock data, subscribes SOSService
 * events, and exposes the thunks screens use to run emergency actions. SOS and
 * broadcasts also fan out through the communication engine for real reach.
 */
import { communicationService } from '../../communication';
import {
  sosService,
  BroadcastService,
  CheckInService,
} from '../../features/emergency/services';
import { HistoryKind, SosStatus, SOS_COUNTDOWN_SECONDS } from '../../features/emergency/constants';
import {
  dangerZones,
  emergencyContacts,
  emergencyHistorySeed,
  nearbyMedical,
  nearbyShelters,
  nearbyVolunteers,
} from '../../features/emergency/mockData';
import { emergencySeeded, historyAdded } from '../slices/emergencySlice';
import { contactsSeeded } from '../slices/emergencyContactsSlice';
import { checkInAdded } from '../slices/checkInSlice';
import { broadcastAdded } from '../slices/broadcastSlice';
import {
  countdownTicked,
  sosArmed,
  sosBroadcastSent,
  sosReset,
  sosStatusSet,
} from '../slices/sosSlice';
import { showToast } from '../slices/uiSlice';

let subscribed = false;
let countdownTimer = null;

export const initEmergency = () => (dispatch) => {
  dispatch(emergencySeeded({
    volunteers: nearbyVolunteers,
    shelters: nearbyShelters,
    medical: nearbyMedical,
    dangerZones,
    history: emergencyHistorySeed,
  }));
  dispatch(contactsSeeded(emergencyContacts));

  if (subscribed) return;
  subscribed = true;
  sosService.on('sos:status', (s) => dispatch(sosStatusSet(s)));
};

/** Arm SOS: run the cancelable countdown, then activate. */
export const armSOS = () => (dispatch, getState) => {
  let remaining = SOS_COUNTDOWN_SECONDS;
  dispatch(sosArmed(remaining));
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(countdownTimer);
      dispatch(activateSOS());
    } else {
      dispatch(countdownTicked(remaining));
    }
  }, 1000);

  // getState available for future pre-checks (kept for parity with other thunks)
  return getState().sos.status;
};

export const cancelSOS = () => (dispatch) => {
  clearInterval(countdownTimer);
  sosService.cancel();
  dispatch(sosStatusSet({ status: SosStatus.CANCELLED }));
};

export const activateSOS = () => (dispatch) => {
  sosService.activate();
  // Real fan-out to nearby devices via the communication engine. The
  // returned messages are the real, trackable units of delivery — progress
  // shown to the user is derived from their actual state, never simulated.
  const messages = communicationService.broadcast('SOS — I need help. Please respond.', { priority: 3, packetType: 'sos' });
  const messageIds = (messages || []).map((m) => m.id);
  dispatch(sosBroadcastSent({ messageIds }));
  dispatch(historyAdded({
    id: `h-${Date.now()}`,
    kind: HistoryKind.SOS,
    title: 'SOS activated',
    detail: messageIds.length > 0 ? `Sent to ${messageIds.length} nearby device${messageIds.length === 1 ? '' : 's'}` : 'No nearby devices to send to yet',
    at: Date.now(),
  }));
};

export const resolveSOS = () => (dispatch) => {
  sosService.resolve();
  dispatch(historyAdded({ id: `h-${Date.now()}`, kind: HistoryKind.SOS, title: 'SOS resolved', detail: 'Marked safe', at: Date.now() }));
  dispatch(sosReset());
};

export const sendCheckIn = (messageKey) => (dispatch) => {
  const record = CheckInService.create(messageKey);
  dispatch(checkInAdded(record));
  dispatch(historyAdded({ id: `h-${Date.now()}`, kind: HistoryKind.CHECK_IN, title: `Check-in · ${record.label}`, detail: `Sent to ${record.audience}`, at: record.at }));
  communicationService.broadcast(`Safe check-in: ${record.label}`, { priority: 2, packetType: 'checkin' });
  dispatch(showToast({ message: `Sent "${record.label}" to ${record.audience}`, severity: 'success' }));
  return record;
};

export const sendEmergencyBroadcast = (needKeyOrCustom) => (dispatch, getState) => {
  const nearby = getState().networkState.deviceCount;
  const entry = typeof needKeyOrCustom === 'string'
    ? BroadcastService.fromNeed(needKeyOrCustom, { nearbyDevices: nearby })
    : BroadcastService.create({ ...needKeyOrCustom, nearbyDevices: nearby });
  dispatch(broadcastAdded(entry));
  dispatch(historyAdded({
    id: `h-${Date.now()}`,
    kind: HistoryKind.BROADCAST,
    title: `Broadcast · ${entry.title}`,
    detail: entry.sentTo > 0 ? `Sent to ${entry.sentTo} nearby device${entry.sentTo === 1 ? '' : 's'}` : 'No nearby devices to send to yet',
    at: entry.at,
  }));
  communicationService.broadcast(entry.message, { priority: 3, packetType: 'broadcast' });
  dispatch(showToast({ message: `Broadcast sent · ${entry.title}`, severity: 'warning' }));
  return entry;
};
