/**
 * Rule-based intelligence helpers shared by the dashboard and network screens.
 * Pure functions over existing state — no side effects, no new services.
 *
 * ML seam: both functions are candidates for on-device models later — insight
 * selection ranked by user relevance, and battery policy learned from device
 * telemetry — behind these same signatures.
 */
import { EntityStatus } from '../features/relief/constants';
import { MapsService, ShelterService, VolunteerService } from '../features/relief/services';

/**
 * Smart battery mode — recommend saving power when the battery is low, the
 * network is weak (relaying costs more), or an SOS is active (the radio must
 * outlive the emergency). Returns null when no recommendation applies.
 *
 * @param {object} params
 * @param {number} params.batteryLevel 0..1
 * @param {string} [params.healthGrade] network health grade
 * @param {boolean} [params.sosActive]
 * @returns {null | { severity:string, title:string, message:string }}
 */
export function batteryRecommendation({ batteryLevel, healthGrade, sosActive = false }) {
  const lowBattery = batteryLevel <= 0.35;
  const weakNetwork = healthGrade === 'poor' || healthGrade === 'fair';
  if (!lowBattery && !weakNetwork && !sosActive) return null;

  const reasons = [];
  if (lowBattery) reasons.push(`battery at ${Math.round(batteryLevel * 100)}%`);
  if (weakNetwork) reasons.push('a weak network burns more power relaying');
  if (sosActive) reasons.push('your SOS needs the radio to stay alive');

  return {
    severity: lowBattery || sosActive ? 'warning' : 'info',
    title: 'Battery saver recommended',
    message: `Dim the screen, close other apps, and keep ShadowNet in the foreground — ${reasons.join(', ')}.`,
  };
}

/**
 * AI insights — compact, plain-language observations for the dashboard,
 * generated from live state (relief entities + network health). Returns up to
 * `limit` insights, most useful first.
 *
 * @param {object} params
 * @param {Array} [params.shelters] shelter entities
 * @param {Array} [params.medical] medical camp entities
 * @param {Array} [params.volunteers] volunteer entities
 * @param {{grade:string,label:string}} [params.health] network health
 * @param {number} [params.queuedMessages]
 * @param {number} [params.limit=4]
 * @returns {Array<{ id:string, icon:string, tone:string, text:string }>}
 */
export function generateInsights({ shelters = [], medical = [], volunteers = [], health, queuedMessages = 0, limit = 4 }) {
  const insights = [];
  const nearest = (list) => [...list].sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0))[0];

  const shelter = nearest(shelters.filter((s) => ShelterService.freeSpaces(s) > 0 && ShelterService.isAccepting(s)));
  if (shelter) {
    insights.push({
      id: 'shelter',
      icon: 'shelter',
      tone: 'success',
      text: `${shelter.name} has ${ShelterService.freeSpaces(shelter)} spaces free, ${MapsService.walkMinutes(shelter.distanceM)} min away.`,
    });
  }

  const camp = nearest(medical.filter((m) => m.status === EntityStatus.OPEN));
  if (camp) {
    insights.push({
      id: 'medical',
      icon: 'medical',
      tone: 'error',
      text: `Medical help at ${camp.name} is ${MapsService.walkMinutes(camp.distanceM)} min away.`,
    });
  }

  const available = volunteers.filter((v) => VolunteerService.isAvailable(v) && (v.distanceM ?? 0) < 1000);
  if (available.length > 0) {
    insights.push({
      id: 'volunteers',
      icon: 'volunteer',
      tone: 'info',
      text: `${available.length} volunteer${available.length === 1 ? ' is' : 's are'} available within 1 km.`,
    });
  }

  if (health) {
    insights.push({
      id: 'network',
      icon: 'network',
      tone: health.grade === 'excellent' || health.grade === 'good' ? 'accent' : 'warning',
      text: `Network quality is ${health.label.toLowerCase()} — messages ${
        health.grade === 'poor' ? 'may take longer to relay' : 'are relaying normally'
      }.`,
    });
  }

  if (queuedMessages > 0) {
    insights.push({
      id: 'queue',
      icon: 'clock',
      tone: 'warning',
      text: `${queuedMessages} message${queuedMessages === 1 ? ' is' : 's are'} queued and will send when a device is in range.`,
    });
  }

  return insights.slice(0, limit);
}
