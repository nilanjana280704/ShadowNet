/**
 * Relief Network unit checks — geo math, mock data volumes, routing behavior,
 * filtering, and unified search.
 */
import { MapsService } from '../src/features/relief/services/MapsService';
import { RoutingService } from '../src/features/relief/services/RoutingService';
import { ResourceService } from '../src/features/relief/services/ResourceService';
import { SearchService } from '../src/features/relief/services/SearchService';
import { EntityStatus, RouteKind } from '../src/features/relief/constants';
import {
  dangerZones,
  foodCenters,
  medicalCamps,
  reliefCenters,
  shelters,
  USER_GEO,
  volunteers,
  waterStations,
} from '../src/features/relief/mockData';

test('mock data meets the required volumes', () => {
  const resources = foodCenters.length + waterStations.length + reliefCenters.length;
  expect(resources).toBeGreaterThanOrEqual(30);
  expect(resources + shelters.length + medicalCamps.length).toBeGreaterThanOrEqual(50);
  expect(volunteers.length).toBeGreaterThanOrEqual(20);
  expect(shelters.length).toBeGreaterThanOrEqual(15);
  expect(medicalCamps.length).toBeGreaterThanOrEqual(10);
  expect(dangerZones.length).toBeGreaterThanOrEqual(8);
});

test('MapsService projection and distance are consistent', () => {
  const p = MapsService.offset(USER_GEO, 1000, 0); // 1 km east
  expect(MapsService.distanceM(USER_GEO, p)).toBeGreaterThan(950);
  expect(MapsService.distanceM(USER_GEO, p)).toBeLessThan(1050);

  const px = MapsService.project(p, USER_GEO, { w: 400, h: 400 }, 4000);
  expect(px.x).toBeCloseTo(300, 0); // center 200 + 1000m * (400/4000)
  expect(px.y).toBeCloseTo(200, 0);
});

test('RoutingService returns three route kinds with sane metrics', () => {
  const to = MapsService.offset(USER_GEO, 800, 600);
  const routes = RoutingService.plan(USER_GEO, to, dangerZones);
  const kinds = routes.map((r) => r.kind).sort();
  expect(kinds).toEqual([RouteKind.ALTERNATIVE, RouteKind.SAFEST, RouteKind.SHORTEST].sort());
  routes.forEach((r) => {
    expect(r.distanceM).toBeGreaterThan(900);
    expect(r.walkMin).toBeGreaterThan(5);
    expect(r.safety).toBeGreaterThan(0);
    expect(r.safety).toBeLessThanOrEqual(1);
  });
  const safest = routes.find((r) => r.kind === RouteKind.SAFEST);
  const shortest = routes.find((r) => r.kind === RouteKind.SHORTEST);
  expect(safest.safety).toBeGreaterThanOrEqual(shortest.safety);
});

test('ResourceService filters by distance and open status', () => {
  const list = [
    { id: 'a', distanceM: 500, status: EntityStatus.OPEN, facilities: [] },
    { id: 'b', distanceM: 3000, status: EntityStatus.OPEN, facilities: [] },
    { id: 'c', distanceM: 400, status: EntityStatus.CLOSED, facilities: [] },
  ];
  const near = ResourceService.applyFilters(list, { distance: '1km' });
  expect(near.map((e) => e.id).sort()).toEqual(['a', 'c']);
  const open = ResourceService.applyFilters(list, { distance: 'any', openNow: true });
  expect(open.map((e) => e.id).sort()).toEqual(['a', 'b']);
});

test('SearchService finds entities across categories and ranks prefixes first', () => {
  const all = [...shelters, ...medicalCamps, ...volunteers];
  const results = SearchService.search(all, 'riverside');
  expect(results.length).toBeGreaterThan(0);
  expect(results[0].name.toLowerCase()).toContain('riverside');
});
