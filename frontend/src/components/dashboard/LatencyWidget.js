/**
 * LatencyWidget — mesh round-trip latency as a MetricCard preset. Tone shifts
 * with latency thresholds.
 *
 * @param {object} props
 * @param {number} props.latencyMs current latency in ms
 * @param {number} [props.trend] signed delta vs. previous window
 * @param {() => void} [props.onPress]
 */
import React from 'react';

import { MetricCard } from '../molecules';

function toneFor(ms) {
  if (ms <= 120) return 'success';
  if (ms <= 300) return 'warning';
  return 'error';
}

function LatencyWidget({ latencyMs = 0, trend, onPress }) {
  return (
    <MetricCard
      label="Latency"
      value={latencyMs}
      unit="MS"
      icon="latency"
      tone={toneFor(latencyMs)}
      trend={trend}
      trendLabel={typeof trend === 'number' ? 'vs 1m' : undefined}
      onPress={onPress}
    />
  );
}

export default LatencyWidget;
