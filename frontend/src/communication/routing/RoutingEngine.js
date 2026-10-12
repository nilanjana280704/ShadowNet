/**
 * RoutingEngine — selects the best path to a device. Stateless and pure: given a
 * device (its reachable transports + signal), it scores each transport and picks
 * the winner, honoring the priority order Wi-Fi Direct → BLE → LoRa while also
 * weighing signal, reliability, and latency. `hops` is single-element today; the
 * shape is ready for multi-hop mesh routing later.
 */
import {
  deliveryConfidence,
  estimateLatency,
  reliabilityScore,
  routeScore,
} from '../core/metrics';

export default class RoutingEngine {
  constructor({ stickyRatio = 0.9 } = {}) {
    // How close a preferred/connected transport's score must be to the best to
    // keep using it (avoids flapping between transports).
    this.stickyRatio = stickyRatio;
  }

  scoreRoutes(device) {
    return (device.transports || [])
      .map((transport) => ({
        transport,
        score: routeScore(transport, device.signal),
        latencyMs: estimateLatency(transport, device.signal),
        reliability: reliabilityScore(transport, device.signal),
      }))
      .sort((a, b) => b.score - a.score);
  }

  selectRoute(device, { preferred } = {}) {
    const routes = this.scoreRoutes(device);
    if (routes.length === 0) return null;

    let best = routes[0];
    if (preferred) {
      const preferredRoute = routes.find((r) => r.transport === preferred);
      if (preferredRoute && preferredRoute.score >= best.score * this.stickyRatio) {
        best = preferredRoute;
      }
    }

    return {
      deviceId: device.id,
      transport: best.transport,
      score: best.score,
      latencyMs: best.latencyMs,
      reliability: best.reliability,
      confidence: deliveryConfidence(best.transport, device.signal),
      hops: [device.id],
      selectedAt: Date.now(),
    };
  }
}
