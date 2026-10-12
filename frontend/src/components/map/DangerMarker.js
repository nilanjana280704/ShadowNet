/**
 * DangerMarker — a hazard / danger zone marker. Pulses to draw attention.
 * @param {object} props
 * @param {boolean} [props.pulse=true]
 * @param {boolean} [props.selected]
 * @param {string} [props.label]
 */
import React from 'react';
import MarkerBase from './MarkerBase';

function DangerMarker({ pulse = true, selected, label }) {
  return <MarkerBase icon="danger" color="critical" pulse={pulse} selected={selected} label={label} />;
}

export default DangerMarker;
