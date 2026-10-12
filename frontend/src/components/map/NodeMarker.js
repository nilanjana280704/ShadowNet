/**
 * NodeMarker — a mesh node on the map. Pulses when live/active.
 * @param {object} props
 * @param {boolean} [props.live=true] pulse to indicate an active node
 * @param {boolean} [props.selected]
 * @param {string} [props.label]
 */
import React from 'react';
import MarkerBase from './MarkerBase';

function NodeMarker({ live = true, selected, label }) {
  return <MarkerBase icon="nodes" color="connected" pulse={live} selected={selected} label={label} />;
}

export default NodeMarker;
