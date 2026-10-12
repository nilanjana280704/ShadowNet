/**
 * RoutingService — a thin stateful wrapper over RoutingEngine. Caches the last
 * route chosen per device and emits ROUTE_CHANGED so the UI can visualize the
 * active path. Higher layers call this, not the engine directly.
 */
import EventEmitter from '../core/EventEmitter';
import { CommEvent } from '../core/constants';
import RoutingEngine from './RoutingEngine';

export default class RoutingService extends EventEmitter {
  constructor(engine = new RoutingEngine()) {
    super();
    this.engine = engine;
    this.lastRoutes = new Map();
  }

  selectRoute(device, options) {
    const route = this.engine.selectRoute(device, options);
    if (route) {
      this.lastRoutes.set(device.id, route);
      this.emit(CommEvent.ROUTE_CHANGED, route);
    }
    return route;
  }

  scoreRoutes(device) {
    return this.engine.scoreRoutes(device);
  }

  getLastRoute(deviceId) {
    return this.lastRoutes.get(deviceId);
  }

  getLastRoutes() {
    return Array.from(this.lastRoutes.values());
  }
}
