/**
 * Milestone 9 intelligence checks — health grading, route recommendation,
 * resource recommendation, priority classification, battery advice, insights.
 */
import { networkHealthScore } from '../src/communication/core/metrics';
import { RoutingService } from '../src/features/relief/services/RoutingService';
import { ResourceService } from '../src/features/relief/services/ResourceService';
import { MapsService } from '../src/features/relief/services/MapsService';
import { EntityStatus, RouteKind } from '../src/features/relief/constants';
import { USER_GEO, dangerZones, shelters, volunteers, medicalCamps } from '../src/features/relief/mockData';
import { MessageFormatter } from '../src/features/chat/services/MessageFormatter';
import { MessageType } from '../src/features/chat/constants';
import { MessagePriority } from '../src/communication';
import { batteryRecommendation, generateInsights } from '../src/utils/insights';

test('networkHealthScore grades sensibly', () => {
  expect(networkHealthScore({ online: false }).grade).toBe('poor');
  const strong = networkHealthScore({ online: true, deviceCount: 10, coverageM: 2500, activeTransport: 'wifi-direct' });
  expect(strong.grade).toBe('excellent');
  const weak = networkHealthScore({ online: true, deviceCount: 1, coverageM: 100, activeTransport: 'lora' });
  expect(['fair', 'poor']).toContain(weak.grade);
});

test('RoutingService.recommend flags exactly one route and orders it first', () => {
  const to = MapsService.offset(USER_GEO, 900, 500);
  const planned = RoutingService.plan(USER_GEO, to, dangerZones);
  const { routes, recommendedKind } = RoutingService.recommend(planned, { coverageM: 1500, availability: 1 });
  expect(routes.filter((r) => r.recommended)).toHaveLength(1);
  expect(routes[0].recommended).toBe(true);
  expect(routes[0].kind).toBe(recommendedKind);
  expect(Object.values(RouteKind)).toContain(recommendedKind);
});

test('ResourceService.recommendForYou ranks nearby open entities with category diversity', () => {
  const all = [...shelters, ...medicalCamps, ...volunteers];
  const recs = ResourceService.recommendForYou(all, { limit: 6, perCategory: 2 });
  expect(recs.length).toBeGreaterThan(0);
  expect(recs.length).toBeLessThanOrEqual(6);
  const perCat = {};
  recs.forEach((e) => {
    perCat[e.category] = (perCat[e.category] || 0) + 1;
    expect(perCat[e.category]).toBeLessThanOrEqual(2);
    expect([EntityStatus.FULL, EntityStatus.CLOSED].includes(e.status) && e.distanceM < 300).toBe(false);
  });
});

test('MessageFormatter classifies priority by type', () => {
  expect(MessageFormatter.classifyPriority(MessageType.SOS)).toBe(MessagePriority.EMERGENCY);
  expect(MessageFormatter.classifyPriority(MessageType.BROADCAST)).toBe(MessagePriority.HIGH);
  expect(MessageFormatter.classifyPriority(MessageType.TEXT)).toBe(MessagePriority.NORMAL);
  expect(MessageFormatter.classifyPriority(MessageType.SAFE_CHECKIN)).toBe(MessagePriority.LOW);
  const sos = MessageFormatter.createMessage({ conversationId: 'c1', text: 'help', type: MessageType.SOS });
  expect(sos.priority).toBe(MessagePriority.EMERGENCY);
});

test('batteryRecommendation fires on low battery / weak network / SOS, else null', () => {
  expect(batteryRecommendation({ batteryLevel: 0.8, healthGrade: 'excellent' })).toBeNull();
  expect(batteryRecommendation({ batteryLevel: 0.2, healthGrade: 'excellent' })).not.toBeNull();
  expect(batteryRecommendation({ batteryLevel: 0.9, healthGrade: 'poor' })).not.toBeNull();
  expect(batteryRecommendation({ batteryLevel: 0.9, healthGrade: 'good', sosActive: true })).not.toBeNull();
});

test('generateInsights produces capped, well-formed insights', () => {
  const insights = generateInsights({
    shelters,
    medical: medicalCamps,
    volunteers,
    health: { grade: 'excellent', label: 'Excellent' },
    queuedMessages: 2,
    limit: 4,
  });
  expect(insights.length).toBeGreaterThan(0);
  expect(insights.length).toBeLessThanOrEqual(4);
  insights.forEach((i) => {
    expect(i.id).toBeTruthy();
    expect(i.icon).toBeTruthy();
    expect(i.text.length).toBeGreaterThan(10);
  });
});
