/**
 * reliefBridge — Relief Network ↔ Redux. Seeds the entity slices from mock
 * data, prepares the offline map region, and exposes the thunks screens use
 * (select an entity, plan routes to it). Screens never import mock data or
 * services directly for state changes.
 */
import {
  commNodes,
  dangerZones,
  foodCenters,
  medicalCamps,
  reliefCenters,
  shelters,
  sosSignals,
  USER_GEO,
  volunteers,
  waterStations,
} from '../../features/relief/mockData';
import { OfflineMapService, RoutingService, ShelterService } from '../../features/relief/services';
import { EntityStatus } from '../../features/relief/constants';
import { sheltersSeeded } from '../slices/shelterSlice';
import { medicalSeeded } from '../slices/medicalSlice';
import { volunteersSeeded } from '../slices/volunteerSlice';
import { dangerZonesSeeded } from '../slices/dangerZoneSlice';
import { resourcesSeeded } from '../slices/resourcesSlice';
import { entitySelected, mapRoutesCleared, offlineRegionSet, routesSet, selectionCleared } from '../slices/mapsSlice';

let seeded = false;

export const initRelief = () => async (dispatch) => {
  if (!seeded) {
    seeded = true;
    dispatch(sheltersSeeded(shelters));
    dispatch(medicalSeeded(medicalCamps));
    dispatch(volunteersSeeded(volunteers));
    dispatch(dangerZonesSeeded(dangerZones));
    dispatch(resourcesSeeded([...foodCenters, ...waterStations, ...reliefCenters, ...commNodes, ...sosSignals]));
  }
  const region = await OfflineMapService.ensureDefaultRegion();
  dispatch(offlineRegionSet({ id: region.id, name: region.name, ready: true }));
};

/** Find an entity by id across every relief slice. */
export function findReliefEntity(state, id) {
  return (
    state.shelter.byId[id] ||
    state.medical.byId[id] ||
    state.volunteer.byId[id] ||
    state.dangerZone.byId[id] ||
    state.resources.byId[id] ||
    null
  );
}

/** All mappable entities merged (used by the map + unified search). */
export function allReliefEntities(state) {
  const collect = (slice) => slice.ids.map((id) => slice.byId[id]);
  return [
    ...collect(state.shelter),
    ...collect(state.medical),
    ...collect(state.volunteer),
    ...collect(state.dangerZone),
    ...collect(state.resources),
  ];
}

export const selectMapEntity = (id) => (dispatch) => {
  dispatch(mapRoutesCleared());
  dispatch(entitySelected(id));
};

export const clearMapSelection = () => (dispatch) => dispatch(selectionCleared());

/** Destination availability 0..1 for the route recommender. */
function availabilityOf(entity) {
  if (entity.status === EntityStatus.FULL || entity.status === EntityStatus.CLOSED) return 0.2;
  if (entity.status === EntityStatus.LIMITED) return 0.6;
  if (entity.capacity) {
    return ShelterService.freeSpaces(entity) > 0 ? 1 : 0.2;
  }
  return 1;
}

/**
 * Plan fastest/safest/balanced routes from the user to an entity, then let the
 * recommender (distance + danger + coverage + destination availability) pick
 * the one to preselect and badge.
 */
export const planRoutesTo = (entityId) => (dispatch, getState) => {
  const state = getState();
  const entity = findReliefEntity(state, entityId);
  if (!entity) return null;
  const zones = state.dangerZone.ids.map((id) => state.dangerZone.byId[id]);
  const planned = RoutingService.plan(USER_GEO, entity.geo, zones);
  const { routes, recommendedKind } = RoutingService.recommend(planned, {
    coverageM: state.networkState.coverageM,
    availability: availabilityOf(entity),
  });
  dispatch(entitySelected(entityId));
  dispatch(routesSet({ routes, activeKind: recommendedKind }));
  return routes;
};
