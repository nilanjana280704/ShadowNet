/**
 * MapsService — geo math for the offline map canvas: haversine distance, an
 * equirectangular projection (geo -> canvas px), and walking-time estimates.
 *
 * The visual map is a custom offline-first canvas (react-native-svg). This
 * service is the seam for a real tile renderer: swap the canvas for an
 * OpenStreetMap tile layer (e.g. MapLibre) and the projection/geo model here
 * stays the contract the rest of the feature codes against.
 */
const METERS_PER_DEG_LAT = 111320;
const WALK_METERS_PER_MIN = 80; // ~4.8 km/h

export const MapsService = {
  /** Great-circle distance in meters between two { lat, lng } points. */
  distanceM(a, b) {
    const rad = (d) => (d * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const s =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)));
  },

  /** Meters per degree of longitude at a latitude. */
  metersPerDegLng(lat) {
    return METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
  },

  /**
   * Project a geo point to canvas pixels.
   * @param {{lat,lng}} geo point to project
   * @param {{lat,lng}} center canvas center
   * @param {{w:number,h:number}} size canvas size in px
   * @param {number} spanM meters spanned by the canvas width (zoom)
   */
  project(geo, center, size, spanM) {
    const scale = size.w / spanM; // px per meter
    const dxM = (geo.lng - center.lng) * this.metersPerDegLng(center.lat);
    const dyM = (geo.lat - center.lat) * METERS_PER_DEG_LAT;
    return {
      x: size.w / 2 + dxM * scale,
      y: size.h / 2 - dyM * scale,
    };
  },

  /** Meters -> px for the current viewport (for radii). */
  metersToPx(m, size, spanM) {
    return (m / spanM) * size.w;
  },

  /** Offset a geo point by meters east/north. */
  offset(geo, eastM, northM) {
    return {
      lat: geo.lat + northM / METERS_PER_DEG_LAT,
      lng: geo.lng + eastM / this.metersPerDegLng(geo.lat),
    };
  },

  walkMinutes(distanceM) {
    return Math.max(1, Math.round(distanceM / WALK_METERS_PER_MIN));
  },

  formatDistance(m) {
    if (m == null) return '—';
    return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
  },
};

export default MapsService;
