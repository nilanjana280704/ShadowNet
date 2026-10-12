/**
 * ResourceService — pure list logic shared by every relief category: filtering,
 * sorting, safe-zone composition, and per-category stat rows for cards.
 */
import { DISTANCE_FILTERS, EntityStatus, FACILITIES, ReliefCategory } from '../constants';
import { MapsService } from './MapsService';

export const ResourceService = {
  sortByDistance(list) {
    return [...list].sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0));
  },

  /** Apply the shared filter set { distance, openNow, verified, accessible, petFriendly, familyFriendly }. */
  applyFilters(list, filters = {}) {
    const maxM = DISTANCE_FILTERS.find((d) => d.key === filters.distance)?.maxM ?? Infinity;
    return list.filter((e) => {
      if ((e.distanceM ?? 0) > maxM) return false;
      if (filters.openNow && ![EntityStatus.OPEN, EntityStatus.LIMITED, EntityStatus.ACTIVE].includes(e.status)) return false;
      if (filters.verified && !e.verified) return false;
      if (filters.accessible && !e.facilities?.includes(FACILITIES.WHEELCHAIR)) return false;
      if (filters.petFriendly && !e.facilities?.includes(FACILITIES.PETS)) return false;
      if (filters.familyFriendly && !e.facilities?.includes(FACILITIES.FAMILY)) return false;
      return true;
    });
  },

  searchByName(list, query) {
    if (!query?.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.area?.toLowerCase().includes(q) ||
        e.facilities?.some((f) => f.toLowerCase().includes(q))
    );
  },

  /** Safe zones = open shelters + verified open relief centers. */
  safeZones(shelters, reliefCenters) {
    return this.sortByDistance([
      ...shelters.filter((s) => s.status !== EntityStatus.FULL && s.status !== EntityStatus.CLOSED),
      ...reliefCenters.filter((r) => r.verified && r.status === EntityStatus.OPEN),
    ]);
  },

  /**
   * Smart resource recommendation — "Recommended for you". Scores helpful
   * entities (shelters, medical, food, water, volunteers, relief centers) on
   * proximity, availability, free capacity, and verification, with a per-
   * category cap so the strip stays diverse.
   *
   * ML seam: replace this weighted heuristic with a personalized ranker
   * (user context, time of day, demand signals) behind the same signature:
   * (entities, options) → ordered entities.
   *
   * @param {Array} entities merged relief entities
   * @param {object} [options]
   * @param {number} [options.limit=6]
   * @param {number} [options.perCategory=2]
   */
  recommendForYou(entities, { limit = 6, perCategory = 2 } = {}) {
    const HELPFUL = [
      ReliefCategory.SHELTER,
      ReliefCategory.MEDICAL,
      ReliefCategory.FOOD,
      ReliefCategory.WATER,
      ReliefCategory.VOLUNTEER,
      ReliefCategory.RELIEF,
    ];
    const availability = (e) => {
      if (e.status === EntityStatus.FULL || e.status === EntityStatus.CLOSED) return 0.1;
      if (e.status === EntityStatus.LIMITED) return 0.6;
      return 1;
    };
    const capacityScore = (e) => {
      if (!e.capacity?.total) return 0.5; // no capacity concept → neutral
      return Math.max(0, (e.capacity.total - (e.capacity.used ?? 0)) / e.capacity.total);
    };

    const scored = entities
      .filter((e) => HELPFUL.includes(e.category))
      .map((e) => ({
        entity: e,
        score:
          (1 - Math.min((e.distanceM ?? 0) / 3000, 1)) * 0.45 +
          availability(e) * 0.35 +
          capacityScore(e) * 0.1 +
          (e.verified ? 0.1 : 0),
      }))
      .sort((a, b) => b.score - a.score);

    const perCat = {};
    const out = [];
    for (const { entity } of scored) {
      if (out.length >= limit) break;
      perCat[entity.category] = (perCat[entity.category] || 0) + 1;
      if (perCat[entity.category] <= perCategory) out.push(entity);
    }
    return out;
  },

  /** Compact stat rows for a ResourceCard, per category. */
  statsFor(entity) {
    switch (entity.category) {
      case ReliefCategory.SHELTER: {
        const free = Math.max(0, (entity.capacity?.total ?? 0) - (entity.capacity?.used ?? 0));
        return [
          { label: 'Free spaces', value: String(free) },
          { label: 'Walk', value: `${MapsService.walkMinutes(entity.distanceM)} min` },
        ];
      }
      case ReliefCategory.MEDICAL:
        return [
          { label: 'Doctors', value: String(entity.medical?.doctors ?? 0) },
          { label: 'Beds', value: String(entity.medical?.beds ?? 0) },
          { label: 'Blood', value: entity.medical?.blood?.length ? entity.medical.blood.join(' ') : '—' },
        ];
      case ReliefCategory.FOOD:
      case ReliefCategory.WATER:
        return [
          entity.food?.mealsPerDay ? { label: 'Meals/day', value: String(entity.food.mealsPerDay) } : null,
          entity.food?.waterLitres ? { label: 'Water', value: `${entity.food.waterLitres} L` } : null,
          entity.food?.hygieneKits ? { label: 'Hygiene kits', value: String(entity.food.hygieneKits) } : null,
        ].filter(Boolean);
      case ReliefCategory.VOLUNTEER:
        return [
          { label: 'Response', value: `${entity.volunteer?.responseMin ?? '—'} min` },
          { label: 'Skills', value: entity.volunteer?.skills?.join(', ') || '—' },
        ];
      case ReliefCategory.RELIEF:
        return [{ label: 'Services', value: entity.relief?.services?.join(', ') || '—' }];
      case ReliefCategory.DANGER:
        return [
          { label: 'Severity', value: entity.danger?.severity ?? '—' },
          { label: 'Keep clear', value: `${entity.danger?.radiusM ?? 0} m` },
        ];
      default:
        return [];
    }
  },
};

export default ResourceService;
