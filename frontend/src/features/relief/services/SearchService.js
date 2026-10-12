/**
 * SearchService — unified search across every relief entity type (shelters,
 * medical, food/water, volunteers, relief centers, danger zones). Ranks by
 * match quality then distance. Pure.
 */
import { CATEGORY_META } from '../constants';

function score(entity, q) {
  const name = entity.name.toLowerCase();
  if (name.startsWith(q)) return 3;
  if (name.includes(q)) return 2;
  const haystack = [
    entity.area,
    CATEGORY_META[entity.category]?.plural,
    ...(entity.facilities || []),
    ...(entity.volunteer?.skills || []),
    ...(entity.relief?.services || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q) ? 1 : 0;
}

export const SearchService = {
  /**
   * @param {Array} entities merged entity list
   * @param {string} query
   * @param {number} [limit=12]
   */
  search(entities, query, limit = 12) {
    const q = query?.trim().toLowerCase();
    if (!q) return [];
    return entities
      .map((entity) => ({ entity, rank: score(entity, q) }))
      .filter((r) => r.rank > 0)
      .sort((a, b) => b.rank - a.rank || (a.entity.distanceM ?? 0) - (b.entity.distanceM ?? 0))
      .slice(0, limit)
      .map((r) => r.entity);
  },
};

export default SearchService;
