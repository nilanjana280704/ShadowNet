/**
 * Pure metric helpers shared by the simulator, routing engine, and UI. No
 * side effects — deterministic given inputs (except where a jitter amount is
 * passed in).
 */
import { TRANSPORT_META } from './constants';

export const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Map a 0..1 signal fraction to a 0..4 bar level. */
export function signalToLevel(signal) {
  return Math.max(0, Math.min(4, Math.round(clamp01(signal) * 4)));
}

/** Estimate one-hop latency (ms) for a transport given signal quality. */
export function estimateLatency(transportType, signal) {
  const meta = TRANSPORT_META[transportType];
  if (!meta) return 999;
  // Weaker signal inflates latency up to ~2.5x the base.
  const penalty = 1 + (1 - clamp01(signal)) * 1.5;
  return Math.round(meta.baseLatencyMs * penalty);
}

/** Reliability score 0..1 combining transport reliability and signal. */
export function reliabilityScore(transportType, signal) {
  const meta = TRANSPORT_META[transportType];
  if (!meta) return 0;
  return clamp01(meta.reliability * (0.6 + 0.4 * clamp01(signal)));
}

/** Delivery confidence 0..1 for a single send attempt. */
export function deliveryConfidence(transportType, signal) {
  return clamp01(reliabilityScore(transportType, signal) * (0.85 + 0.15 * clamp01(signal)));
}

// Health grade thresholds and transport quality weights.
const HEALTH_GRADES = [
  { min: 0.8, grade: 'excellent', label: 'Excellent' },
  { min: 0.6, grade: 'good', label: 'Good' },
  { min: 0.35, grade: 'fair', label: 'Fair' },
  { min: 0, grade: 'poor', label: 'Poor' },
];
const TRANSPORT_QUALITY = { 'wifi-direct': 1, ble: 0.7, lora: 0.5 };

/**
 * Network health score — a rule-based 0..1 composite of connected devices,
 * coverage, active transport quality, and being online, graded
 * excellent/good/fair/poor for the dashboard and network screen.
 *
 * ML seam: replace this heuristic with a model trained on real session
 * telemetry (delivery success, latency variance, churn) behind the same
 * signature — callers only consume { score, grade, label }.
 *
 * @param {{online:boolean, deviceCount:number, coverageM:number, activeTransport:string}} s
 */
export function networkHealthScore({ online, deviceCount = 0, coverageM = 0, activeTransport } = {}) {
  if (!online) return { score: 0, grade: 'poor', label: 'Poor' };
  const devices = Math.min(deviceCount / 8, 1) * 0.35;
  const coverage = Math.min(coverageM / 2000, 1) * 0.25;
  const transport = (TRANSPORT_QUALITY[activeTransport] ?? 0.4) * 0.25;
  const base = 0.15; // online at all
  const score = clamp01(devices + coverage + transport + base);
  const tier = HEALTH_GRADES.find((g) => score >= g.min);
  return { score: Math.round(score * 100) / 100, grade: tier.grade, label: tier.label };
}

/**
 * Route score (higher is better) balancing transport priority, signal,
 * reliability, and latency. Used to pick the best path.
 */
export function routeScore(transportType, signal) {
  const meta = TRANSPORT_META[transportType];
  if (!meta) return 0;
  const priorityWeight = 1 / meta.priority; // wifi(1) > ble(2) > lora(3)
  const latency = estimateLatency(transportType, signal);
  const latencyScore = 1 - Math.min(1, latency / 1000);
  return (
    priorityWeight * 0.4 +
    clamp01(signal) * 0.25 +
    reliabilityScore(transportType, signal) * 0.2 +
    latencyScore * 0.15
  );
}
