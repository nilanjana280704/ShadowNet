/**
 * ResourceMarker — a resource / supply center on the map.
 * @param {object} props
 * @param {boolean} [props.selected]
 * @param {string} [props.label]
 */
import React from 'react';
import MarkerBase from './MarkerBase';

function ResourceMarker({ selected, label }) {
  return <MarkerBase icon="resource" color="analytics" selected={selected} label={label} />;
}

export default ResourceMarker;
