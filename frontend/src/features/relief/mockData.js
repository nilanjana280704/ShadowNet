/**
 * Relief Network mock data — deterministic, seeded generators producing a
 * realistic local area: 16 shelters, 11 medical camps, 24 food/water points,
 * 12 relief centers, 22 volunteers, 9 danger zones, comm nodes, and active SOS
 * signals — all geo-positioned around the user. Replaced by backend sync later;
 * the entity shape is the contract the feature codes against.
 */
import { EntityStatus, FACILITIES, OrgType, ReliefCategory } from './constants';
import { MapsService } from './services/MapsService';

// The user's mock position (map center).
export const USER_GEO = { lat: 28.6139, lng: 77.209 };

// Seeded LCG so the dataset is stable across reloads (no Math.random drift).
let seed = 42;
function rand() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}
const pickOne = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => min + rand() * (max - min);
const intBetween = (min, max) => Math.round(between(min, max));
const sample = (arr, n) => {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  return out;
};

/** Random geo within ringM..maxM of the user. */
function nearbyGeo(minM = 150, maxM = 2400) {
  const angle = rand() * Math.PI * 2;
  const dist = between(minM, maxM);
  return MapsService.offset(USER_GEO, Math.cos(angle) * dist, Math.sin(angle) * dist);
}

const minsAgo = (m) => Date.now() - m * 60000;

const FACILITY_POOL = Object.values(FACILITIES);
const AREAS = ['Sector 42', 'Riverside', 'Old Market', 'Station Road', 'Lake Colony', 'Hill View', 'Green Park', 'Mill Lane'];
const PHONES = () => `+1 555 0${intBetween(100, 999)}`;

function base(category, name, over = {}) {
  const geo = over.geo || nearbyGeo();
  return {
    id: `${category}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    category,
    name,
    area: pickOne(AREAS),
    description: '',
    geo,
    distanceM: MapsService.distanceM(USER_GEO, geo),
    status: EntityStatus.OPEN,
    verified: rand() > 0.35,
    facilities: sample(FACILITY_POOL, intBetween(2, 5)),
    hours: pickOne(['Open 24 hours', '6:00 – 22:00', '8:00 – 20:00', 'Daylight hours']),
    contact: PHONES(),
    lastUpdated: minsAgo(intBetween(4, 240)),
    ...over,
  };
}

// ---------------------------------------------------------------------------
// Shelters (16)
// ---------------------------------------------------------------------------
const SHELTER_NAMES = [
  'Govt School Shelter', 'Community Centre', 'Riverside Temple Hall', 'St. Mary Hall',
  'Sector 42 Gymnasium', 'Old Market Warehouse', 'City Library Annex', 'Lakeside Pavilion',
  'Hillview College', 'Green Park Club', 'Station Road Depot', 'Unity Hall',
  'Sunrise School', 'Millworkers Hall', 'North Stadium Stand', 'Harbor Customs Shed',
];
export const shelters = SHELTER_NAMES.map((name, i) => {
  const total = intBetween(60, 240);
  const used = Math.min(total, intBetween(10, total + 30));
  const free = Math.max(0, total - used);
  return base(ReliefCategory.SHELTER, name, {
    description: 'Staffed shelter with sleeping space, registration desk, and basic supplies.',
    status: free === 0 ? EntityStatus.FULL : free < total * 0.15 ? EntityStatus.LIMITED : EntityStatus.OPEN,
    capacity: { total, used },
    verified: i < 10,
  });
});

// ---------------------------------------------------------------------------
// Medical camps (11)
// ---------------------------------------------------------------------------
const MEDICAL_NAMES = [
  'Riverside Medical Camp', 'Mobile Health Unit 3', 'Red Cross Field Post', 'Sector 42 Clinic',
  'Station Road Triage', 'Green Park First Aid', 'Lakeside Health Tent', 'Unity Medical Van',
  'Hillview Dispensary', 'Old Market Aid Station', 'North Field Hospital',
];
const BLOOD = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
export const medicalCamps = MEDICAL_NAMES.map((name, i) => {
  const beds = intBetween(0, 14);
  return base(ReliefCategory.MEDICAL, name, {
    description: 'Field medical point with triage, first aid, and referral to hospitals.',
    status: beds === 0 ? EntityStatus.FULL : EntityStatus.OPEN,
    medical: {
      doctors: intBetween(1, 6),
      beds,
      firstAid: true,
      medicine: rand() > 0.25,
      blood: sample(BLOOD, intBetween(0, 4)),
      rating: intBetween(3, 5),
    },
    verified: i < 8,
  });
});

// ---------------------------------------------------------------------------
// Food centers (14) + water stations (10)
// ---------------------------------------------------------------------------
const FOOD_NAMES = [
  'Community Kitchen', 'Langar Point', 'Relief Meals Van', 'School Meal Counter',
  'Temple Kitchen', 'Volunteers Canteen', 'Hot Meals Tent', 'Bakery Collective',
  'Green Park Kitchen', 'Station Meals Point', 'Harbor Soup Line', 'Mill Lane Kitchen',
  'Unity Food Bank', 'Lakeside Meal Tent',
];
export const foodCenters = FOOD_NAMES.map((name) =>
  base(ReliefCategory.FOOD, name, {
    description: 'Cooked meals and dry rations while supplies last.',
    status: pickOne([EntityStatus.OPEN, EntityStatus.OPEN, EntityStatus.LIMITED]),
    food: {
      mealsPerDay: intBetween(80, 900),
      waterLitres: intBetween(0, 400),
      hygieneKits: intBetween(0, 120),
      babySupplies: rand() > 0.5,
    },
  })
);

const WATER_NAMES = [
  'Water Tanker Point A', 'Water Tanker Point B', 'Borewell Station', 'Purifier Unit 1',
  'Purifier Unit 2', 'Rail Yard Hydrant', 'Green Park Tank', 'Mobile Water Van',
  'School Water Point', 'Harbor Desal Unit',
];
export const waterStations = WATER_NAMES.map((name) =>
  base(ReliefCategory.WATER, name, {
    description: 'Drinking water distribution. Bring containers if you can.',
    status: pickOne([EntityStatus.OPEN, EntityStatus.OPEN, EntityStatus.LIMITED]),
    food: { mealsPerDay: 0, waterLitres: intBetween(500, 6000), hygieneKits: intBetween(0, 60), babySupplies: false },
  })
);

// ---------------------------------------------------------------------------
// Relief centers (12)
// ---------------------------------------------------------------------------
const RELIEF_DEFS = [
  ['District Relief HQ', OrgType.GOVERNMENT], ['Civil Defence Post', OrgType.GOVERNMENT],
  ['Red Crescent Base', OrgType.NGO], ['Hope Foundation Camp', OrgType.NGO], ['CarePoint NGO Desk', OrgType.NGO],
  ['Sector 42 Residents Hub', OrgType.COMMUNITY], ['Neighbourhood Watch Post', OrgType.COMMUNITY], ['Faith Council Kitchen', OrgType.COMMUNITY],
  ['Army Relief Column', OrgType.MILITARY], ['Engineers Field Unit', OrgType.MILITARY],
  ['Metro Logistics Depot', OrgType.PRIVATE], ['Grid Power Response', OrgType.PRIVATE],
];
const SERVICES_POOL = ['Registration', 'Supplies', 'Rescue coordination', 'Family reunification', 'Charging', 'Transport', 'Information desk', 'Debris clearing'];
export const reliefCenters = RELIEF_DEFS.map(([name, org]) => {
  const total = intBetween(100, 600);
  return base(ReliefCategory.RELIEF, name, {
    description: 'Coordinated relief operations, supplies, and information.',
    relief: { org, services: sample(SERVICES_POOL, intBetween(2, 4)) },
    capacity: { total, used: intBetween(20, total) },
    verified: true,
  });
});

// ---------------------------------------------------------------------------
// Volunteers (22)
// ---------------------------------------------------------------------------
const VOLUNTEER_NAMES = [
  'Sara K.', 'Omar F.', 'Lin W.', 'Priya D.', 'Rahul M.', 'Meera J.', 'Anil T.', 'Fatima Z.',
  'Diego R.', 'Hana S.', 'Vikram P.', 'Elena V.', 'Tom B.', 'Aisha N.', 'Kenji O.', 'Marta L.',
  'Noah G.', 'Ibrahim H.', 'Chloe A.', 'Ravi S.', 'Yuki T.', 'Ana C.',
];
const SKILLS = ['First aid', 'Search & rescue', 'Medical', 'Driving', 'Cooking', 'Translation', 'Counselling', 'Electrical', 'Swimming', 'Radio operator'];
const LANGUAGES = ['English', 'Hindi', 'Bengali', 'Tamil', 'Spanish', 'Arabic'];
export const volunteers = VOLUNTEER_NAMES.map((name, i) =>
  base(ReliefCategory.VOLUNTEER, name, {
    description: 'Registered ShadowNet volunteer.',
    status: EntityStatus.OPEN,
    geo: nearbyGeo(80, 1600),
    volunteer: {
      skills: sample(SKILLS, intBetween(1, 3)),
      languages: sample(LANGUAGES, intBetween(1, 3)),
      availability: pickOne(['available', 'available', 'busy', 'offline']),
      responseMin: intBetween(3, 20),
    },
    facilities: [],
    hours: null,
    verified: i < 14,
  })
);

// ---------------------------------------------------------------------------
// Danger zones (9): 6 hazard zones + 3 blocked roads
// ---------------------------------------------------------------------------
const HAZARDS = [
  ['East Bridge Flooding', 'Flood water over roadway', 380],
  ['Substation Live Wires', 'Downed power lines', 160],
  ['Riverbank Erosion', 'Unstable ground', 300],
  ['Gas Leak — Mill Lane', 'Reported gas smell', 220],
  ['Collapsed Facade', 'Falling debris risk', 140],
  ['Waterlogged Underpass', 'Deep standing water', 260],
];
export const dangerZones = [
  ...HAZARDS.map(([name, reason, radiusM]) =>
    base(ReliefCategory.DANGER, name, {
      description: reason,
      status: EntityStatus.ACTIVE,
      danger: { kind: 'zone', reason, severity: pickOne(['high', 'high', 'extreme']), radiusM },
      facilities: [],
      hours: null,
      contact: null,
    })
  ),
  ...[['Station Road Closed', 420], ['Old Market Lane Blocked', 300], ['Lakeshore Drive Cut', 500]].map(([name, lengthM]) => {
    const start = nearbyGeo(300, 1800);
    const angle = rand() * Math.PI * 2;
    return base(ReliefCategory.DANGER, name, {
      description: 'Road impassable — debris and abandoned vehicles.',
      status: EntityStatus.ACTIVE,
      geo: start,
      danger: {
        kind: 'road',
        reason: 'Blocked road',
        severity: 'high',
        radiusM: 60,
        end: MapsService.offset(start, Math.cos(angle) * lengthM, Math.sin(angle) * lengthM),
      },
      facilities: [],
      hours: null,
      contact: null,
    });
  }),
];

// ---------------------------------------------------------------------------
// Communication nodes + active SOS signals
// ---------------------------------------------------------------------------
export const commNodes = ['Relay North', 'Relay East', 'Relay South', 'School Gateway', 'Harbor Mast', 'Hilltop Repeater'].map((name) =>
  base(ReliefCategory.NODE, name, {
    description: 'Helps pass messages between phones in this area.',
    status: EntityStatus.OPEN,
    facilities: [],
    hours: null,
    contact: null,
    node: { signal: intBetween(2, 4) },
  })
);

export const sosSignals = [
  base(ReliefCategory.SOS, 'SOS — 3rd Street', {
    description: 'Someone nearby has sent an emergency alert.',
    status: EntityStatus.ACTIVE,
    geo: nearbyGeo(400, 1200),
    facilities: [],
    hours: null,
    contact: null,
  }),
  base(ReliefCategory.SOS, 'SOS — Rail Yard', {
    description: 'Someone nearby has sent an emergency alert.',
    status: EntityStatus.ACTIVE,
    geo: nearbyGeo(900, 2000),
    facilities: [],
    hours: null,
    contact: null,
  }),
];

// Decorative road/water geometry for the offline canvas (geo polylines).
export const baseMapGeometry = {
  roads: [
    [MapsService.offset(USER_GEO, -2600, -300), MapsService.offset(USER_GEO, 2600, 180)],
    [MapsService.offset(USER_GEO, -400, -2600), MapsService.offset(USER_GEO, 250, 2600)],
    [MapsService.offset(USER_GEO, -2200, 1500), MapsService.offset(USER_GEO, 2400, 900)],
    [MapsService.offset(USER_GEO, -1800, -1700), MapsService.offset(USER_GEO, 2100, -1400)],
  ],
  river: [
    MapsService.offset(USER_GEO, -2600, 2100),
    MapsService.offset(USER_GEO, -900, 1600),
    MapsService.offset(USER_GEO, 400, 1900),
    MapsService.offset(USER_GEO, 2600, 1500),
  ],
};
