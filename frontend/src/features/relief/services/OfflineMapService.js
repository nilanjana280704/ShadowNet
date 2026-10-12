/**
 * OfflineMapService — offline map region management (architecture).
 *
 * Manages a manifest of downloadable map regions in AsyncStorage. Today the
 * canvas map is inherently offline (vector-drawn); when a real OSM tile
 * renderer lands, `downloadRegion` becomes the tile-prefetch entry point and
 * the manifest gates which areas render without connectivity. The API is the
 * contract; the implementation simulates an instant download.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@shadownet/map-regions';

export const MAP_REGIONS = [
  { id: 'sector-42', name: 'Sector 42 & Riverside', radiusKm: 3, sizeMb: 18 },
  { id: 'city-core', name: 'City Core', radiusKm: 8, sizeMb: 64 },
];

async function readManifest() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export const OfflineMapService = {
  listRegions() {
    return MAP_REGIONS;
  },

  async isRegionReady(regionId) {
    const manifest = await readManifest();
    return Boolean(manifest[regionId]?.ready);
  },

  /** Mark a region downloaded (simulated; real impl prefetches OSM tiles). */
  async downloadRegion(regionId) {
    const region = MAP_REGIONS.find((r) => r.id === regionId);
    if (!region) throw new Error(`Unknown map region ${regionId}`);
    const manifest = await readManifest();
    manifest[regionId] = { ready: true, downloadedAt: Date.now(), sizeMb: region.sizeMb };
    await AsyncStorage.setItem(KEY, JSON.stringify(manifest));
    return region;
  },

  async removeRegion(regionId) {
    const manifest = await readManifest();
    delete manifest[regionId];
    await AsyncStorage.setItem(KEY, JSON.stringify(manifest));
  },

  /** Ensure the local region is available (first-launch default). */
  async ensureDefaultRegion() {
    const [region] = MAP_REGIONS;
    if (!(await this.isRegionReady(region.id))) await this.downloadRegion(region.id);
    return region;
  },
};

export default OfflineMapService;
