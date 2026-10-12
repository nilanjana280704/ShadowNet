/**
 * ShelterMarker — a shelter / safe zone on the map.
 * @param {object} props
 * @param {boolean} [props.selected]
 * @param {string} [props.label]
 */
import React from 'react';
import MarkerBase from './MarkerBase';

function ShelterMarker({ selected, label }) {
  return <MarkerBase icon="shelter" color="success" selected={selected} label={label} />;
}

export default ShelterMarker;
