/**
 * NodeCountWidget — connected mesh node count as a MetricCard preset.
 *
 * @param {object} props
 * @param {number} props.count connected nodes
 * @param {number} [props.trend] signed change vs. previous window
 * @param {() => void} [props.onPress]
 */
import React from 'react';

import { MetricCard } from '../molecules';

function NodeCountWidget({ count = 0, trend, onPress }) {
  return (
    <MetricCard
      label="Mesh Nodes"
      value={count}
      icon="nodes"
      tone="primary"
      trend={trend}
      trendLabel={typeof trend === 'number' ? 'vs 5m' : undefined}
      onPress={onPress}
    />
  );
}

export default NodeCountWidget;
