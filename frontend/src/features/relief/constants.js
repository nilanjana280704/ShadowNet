/**
 * Relief Network domain constants — entity categories, statuses, map layers,
 * filters, facilities, and org types. Single source of truth for the maps,
 * safe zones, and relief screens.
 */

export const ReliefCategory = Object.freeze({
  SHELTER: 'shelter',
  MEDICAL: 'medical',
  FOOD: 'food',
  WATER: 'water',
  VOLUNTEER: 'volunteer',
  RELIEF: 'relief',
  DANGER: 'danger',
  NODE: 'node',
  SOS: 'sos',
});

export const CATEGORY_META = Object.freeze({
  [ReliefCategory.SHELTER]: { label: 'Shelter', plural: 'Shelters', icon: 'shelter', tone: 'success' },
  [ReliefCategory.MEDICAL]: { label: 'Medical', plural: 'Medical camps', icon: 'medical', tone: 'error' },
  [ReliefCategory.FOOD]: { label: 'Food', plural: 'Food centers', icon: 'food', tone: 'warning' },
  [ReliefCategory.WATER]: { label: 'Water', plural: 'Water stations', icon: 'water', tone: 'info' },
  [ReliefCategory.VOLUNTEER]: { label: 'Volunteer', plural: 'Volunteers', icon: 'volunteer', tone: 'accent' },
  [ReliefCategory.RELIEF]: { label: 'Relief center', plural: 'Relief centers', icon: 'lifebuoy', tone: 'analytics' },
  [ReliefCategory.DANGER]: { label: 'Danger', plural: 'Danger zones', icon: 'danger', tone: 'critical' },
  [ReliefCategory.NODE]: { label: 'Relay point', plural: 'Relay points', icon: 'nodes', tone: 'connected' },
  [ReliefCategory.SOS]: { label: 'SOS', plural: 'SOS signals', icon: 'sos', tone: 'sos' },
});

export const EntityStatus = Object.freeze({
  OPEN: 'open',
  LIMITED: 'limited',
  FULL: 'full',
  CLOSED: 'closed',
  ACTIVE: 'active', // danger zones / sos
});

export const STATUS_META = Object.freeze({
  [EntityStatus.OPEN]: { label: 'Open', tone: 'success' },
  [EntityStatus.LIMITED]: { label: 'Limited', tone: 'warning' },
  [EntityStatus.FULL]: { label: 'Full', tone: 'error' },
  [EntityStatus.CLOSED]: { label: 'Closed', tone: 'offline' },
  [EntityStatus.ACTIVE]: { label: 'Active', tone: 'critical' },
});

// Map layers — which entity categories each layer controls.
export const MAP_LAYERS = [
  { key: 'shelters', label: 'Shelters', icon: 'shelter', categories: [ReliefCategory.SHELTER] },
  { key: 'medical', label: 'Medical', icon: 'medical', categories: [ReliefCategory.MEDICAL] },
  { key: 'resources', label: 'Resources', icon: 'resource', categories: [ReliefCategory.FOOD, ReliefCategory.WATER, ReliefCategory.RELIEF] },
  { key: 'volunteers', label: 'Volunteers', icon: 'volunteer', categories: [ReliefCategory.VOLUNTEER] },
  { key: 'danger', label: 'Danger', icon: 'danger', categories: [ReliefCategory.DANGER] },
  { key: 'coverage', label: 'Coverage', icon: 'radar', categories: [] },
  { key: 'nodes', label: 'Relay points', icon: 'nodes', categories: [ReliefCategory.NODE] },
  { key: 'traffic', label: 'Traffic', icon: 'transport', categories: [], disabled: true },
];

export const DEFAULT_LAYERS = Object.freeze({
  shelters: true,
  medical: true,
  resources: true,
  volunteers: true,
  danger: true,
  coverage: true,
  nodes: false,
  traffic: false,
});

// Facilities pool + the filter toggles that map onto them.
export const FACILITIES = Object.freeze({
  WHEELCHAIR: 'Wheelchair access',
  PETS: 'Pet friendly',
  FAMILY: 'Family area',
  POWER: 'Charging points',
  WATER: 'Drinking water',
  FIRST_AID: 'First aid',
  TOILETS: 'Toilets',
  BLANKETS: 'Blankets',
  GENERATOR: 'Generator',
  MEALS: 'Hot meals',
});

export const FACILITY_ICON = Object.freeze({
  [FACILITIES.WHEELCHAIR]: 'wheelchair',
  [FACILITIES.PETS]: 'pet',
  [FACILITIES.FAMILY]: 'users',
  [FACILITIES.POWER]: 'zap',
  [FACILITIES.WATER]: 'water',
  [FACILITIES.FIRST_AID]: 'medical',
  [FACILITIES.TOILETS]: 'home',
  [FACILITIES.BLANKETS]: 'shelter',
  [FACILITIES.GENERATOR]: 'power',
  [FACILITIES.MEALS]: 'food',
});

export const DISTANCE_FILTERS = [
  { key: 'any', label: 'Any distance', maxM: Infinity },
  { key: '1km', label: 'Under 1 km', maxM: 1000 },
  { key: '2km', label: 'Under 2 km', maxM: 2000 },
  { key: '5km', label: 'Under 5 km', maxM: 5000 },
];

export const FILTER_TOGGLES = [
  { key: 'openNow', label: 'Open now', icon: 'clock' },
  { key: 'verified', label: 'Verified', icon: 'success' },
  { key: 'accessible', label: 'Accessible', icon: 'wheelchair' },
  { key: 'petFriendly', label: 'Pet friendly', icon: 'pet' },
  { key: 'familyFriendly', label: 'Family friendly', icon: 'users' },
];

export const OrgType = Object.freeze({
  GOVERNMENT: 'government',
  NGO: 'ngo',
  COMMUNITY: 'community',
  MILITARY: 'military',
  PRIVATE: 'private',
});

export const ORG_META = Object.freeze({
  [OrgType.GOVERNMENT]: { label: 'Government', icon: 'government' },
  [OrgType.NGO]: { label: 'NGO', icon: 'ngo' },
  [OrgType.COMMUNITY]: { label: 'Community', icon: 'community' },
  [OrgType.MILITARY]: { label: 'Military', icon: 'military' },
  [OrgType.PRIVATE]: { label: 'Private', icon: 'building' },
});

export const RouteKind = Object.freeze({
  SHORTEST: 'shortest',
  SAFEST: 'safest',
  ALTERNATIVE: 'alternative',
});

export const ROUTE_META = Object.freeze({
  [RouteKind.SHORTEST]: { label: 'Fastest', icon: 'route', tone: 'info' },
  [RouteKind.SAFEST]: { label: 'Safest', icon: 'shield', tone: 'success' },
  [RouteKind.ALTERNATIVE]: { label: 'Balanced', icon: 'navigation', tone: 'warning' },
});
