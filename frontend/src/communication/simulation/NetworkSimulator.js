/**
 * NetworkSimulator — the mock physical world. It stands in for real radios:
 * staggered device discovery, signal jitter, probabilistic connect/send
 * outcomes, and occasional link loss. Transports depend on this (injected), so
 * replacing it with real native events later touches only the transport layer.
 *
 * All randomness lives here so transports and higher layers stay deterministic
 * and testable.
 */
import { deliveryConfidence, estimateLatency } from '../core/metrics';
import { devicesForTransport } from './mockDevices';

const rand = (min, max) => min + Math.random() * (max - min);

export default class NetworkSimulator {
  constructor({ discoveryStepMs = 600, jitterIntervalMs = 3000 } = {}) {
    this.discoveryStepMs = discoveryStepMs;
    this.jitterIntervalMs = jitterIntervalMs;
    this._timers = new Set();
  }

  _track(timer) {
    this._timers.add(timer);
    return timer;
  }

  /**
   * Begin surfacing devices for a transport over time and periodically jittering
   * their signal. Returns a stop function that clears all its timers.
   */
  startDiscovery(transportType, { onFound, onUpdate }) {
    const devices = devicesForTransport(transportType);
    const timers = [];

    devices.forEach((device, i) => {
      const t = setTimeout(() => onFound({ ...device, transport: transportType }), this.discoveryStepMs * (i + 1) + rand(0, 250));
      timers.push(this._track(t));
    });

    const jitter = setInterval(() => {
      const device = devices[Math.floor(rand(0, devices.length))];
      if (!device) return;
      const signal = Math.max(0.15, Math.min(1, device.signal + rand(-0.12, 0.12)));
      onUpdate({ id: device.id, signal, latencyMs: estimateLatency(transportType, signal) });
    }, this.jitterIntervalMs);
    timers.push(this._track(jitter));

    return () => {
      timers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
        this._timers.delete(t);
      });
    };
  }

  /** Simulate a connection attempt; resolves on success, rejects on failure. */
  connect(device) {
    return new Promise((resolve, reject) => {
      const latency = rand(300, 1200);
      const t = setTimeout(() => {
        this._timers.delete(t);
        // Stronger signal -> higher success probability.
        if (Math.random() < 0.12 + (1 - (device.signal ?? 0.6)) * 0.25) {
          reject(new Error('link-failed'));
        } else {
          resolve({ latencyMs: Math.round(latency) });
        }
      }, latency);
      this._track(t);
    });
  }

  /** Simulate sending a packet; resolves with delivery confidence + latency. */
  send(device, transportType) {
    return new Promise((resolve, reject) => {
      const signal = device.signal ?? 0.6;
      const latency = estimateLatency(transportType, signal) * rand(0.8, 1.4);
      const confidence = deliveryConfidence(transportType, signal);
      const t = setTimeout(() => {
        this._timers.delete(t);
        if (Math.random() > confidence) reject(new Error('send-failed'));
        else resolve({ confidence, latencyMs: Math.round(latency) });
      }, latency);
      this._track(t);
    });
  }

  /** Cancel every outstanding timer (engine shutdown). */
  dispose() {
    this._timers.forEach((t) => {
      clearTimeout(t);
      clearInterval(t);
    });
    this._timers.clear();
  }
}
