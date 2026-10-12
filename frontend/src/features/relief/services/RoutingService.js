/**
 * RoutingService (relief) — plans walking routes between two geo points and
 * returns three options: shortest, safest (detours away from danger zones), and
 * an alternative. Routes are geo waypoint polylines the map projects and draws.
 * Pure and deterministic; a real road-network router (OSRM/GraphHopper offline)
 * slots in behind this same API.
 */
import { RouteKind } from '../constants';
import { MapsService } from './MapsService';

/** Perpendicular unit vector (east/north meters) for a segment. */
function perpendicular(from, to) {
  const eastM = (to.lng - from.lng) * MapsService.metersPerDegLng(from.lat);
  const northM = (to.lat - from.lat) * 111320;
  const len = Math.sqrt(eastM * eastM + northM * northM) || 1;
  return { e: -northM / len, n: eastM / len };
}

function midpoint(a, b, t = 0.5) {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

function pathDistance(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += MapsService.distanceM(points[i - 1], points[i]);
  return Math.round(total);
}

/** Nearest danger zone to the straight line between from/to (rough midpoint check). */
function threateningZone(from, to, dangerZones = []) {
  const mid = midpoint(from, to);
  let worst = null;
  dangerZones.forEach((zone) => {
    const d = MapsService.distanceM(mid, zone.geo);
    const threat = (zone.danger?.radiusM ?? 150) * 2.2;
    if (d < threat && (!worst || d < worst.d)) worst = { zone, d };
  });
  return worst?.zone || null;
}

function buildRoute(kind, points, safety) {
  const distanceM = pathDistance(points);
  return {
    kind,
    points,
    distanceM,
    walkMin: MapsService.walkMinutes(distanceM),
    safety, // 0..1
  };
}

export const RoutingService = {
  /**
   * @param {{lat,lng}} from
   * @param {{lat,lng}} to
   * @param {Array} dangerZones entities with geo + danger.radiusM
   * @returns Array of 3 routes, safest first when danger is nearby
   */
  plan(from, to, dangerZones = []) {
    const perp = perpendicular(from, to);
    const zone = threateningZone(from, to, dangerZones);
    const detourM = zone ? (zone.danger?.radiusM ?? 150) * 2.5 : 220;

    // Shortest: near-straight with a gentle bend.
    const shortest = buildRoute(
      RouteKind.SHORTEST,
      [from, MapsService.offset(midpoint(from, to), perp.e * 40, perp.n * 40), to],
      zone ? 0.55 : 0.9
    );

    // Safest: two waypoints pushed away from the threatening zone.
    const away = zone
      ? MapsService.distanceM(MapsService.offset(midpoint(from, to), perp.e * detourM, perp.n * detourM), zone.geo) >
        MapsService.distanceM(MapsService.offset(midpoint(from, to), -perp.e * detourM, -perp.n * detourM), zone.geo)
        ? 1
        : -1
      : 1;
    const safest = buildRoute(
      RouteKind.SAFEST,
      [
        from,
        MapsService.offset(midpoint(from, to, 0.33), perp.e * detourM * away, perp.n * detourM * away),
        MapsService.offset(midpoint(from, to, 0.66), perp.e * detourM * 0.8 * away, perp.n * detourM * 0.8 * away),
        to,
      ],
      0.95
    );

    // Alternative: bends the opposite way.
    const alternative = buildRoute(
      RouteKind.ALTERNATIVE,
      [from, MapsService.offset(midpoint(from, to), -perp.e * detourM * 0.7 * away, -perp.n * detourM * 0.7 * away), to],
      zone ? 0.7 : 0.8
    );

    return [safest, shortest, alternative];
  },

  /**
   * Smart route recommendation — scores each planned route on speed, safety
   * (danger zones / road blocks are already priced into route.safety),
   * communication coverage along the way, and the destination's availability,
   * then flags the winner with `recommended: true` and returns it first.
   *
   * ML seam: this weighted heuristic is where a learned ranker slots in —
   * trained on which routes users actually complete — behind the same
   * signature: (routes, context) → routes with one `recommended`.
   *
   * @param {Array} routes from plan()
   * @param {object} [context]
   * @param {number} [context.coverageM] current communication coverage radius
   * @param {number} [context.availability] destination availability 0..1
   *        (open with capacity → 1, limited → 0.6, full/closed → 0.2)
   * @returns {{ routes: Array, recommendedKind: string }}
   */
  recommend(routes, { coverageM = 0, availability = 1 } = {}) {
    if (!routes.length) return { routes, recommendedKind: null };
    const minWalk = Math.min(...routes.map((r) => r.walkMin));
    // Coverage helps every route equally today (single-hop model); it nudges
    // scores up so availability matters relatively less when comms are strong.
    const coverageScore = Math.min(coverageM / 2000, 1);

    let best = null;
    const scored = routes.map((route) => {
      const speed = minWalk / route.walkMin; // 1 for the fastest
      const score =
        route.safety * 0.4 + speed * 0.3 + coverageScore * 0.15 + availability * 0.15;
      const entry = { ...route, recommendScore: Math.round(score * 100) / 100, recommended: false };
      if (!best || entry.recommendScore > best.recommendScore) best = entry;
      return entry;
    });

    best.recommended = true;
    const ordered = [best, ...scored.filter((r) => r !== best)];
    return { routes: ordered, recommendedKind: best.kind };
  },
};

export default RoutingService;
