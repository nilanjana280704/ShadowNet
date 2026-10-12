/**
 * VolunteerMarker — a volunteer / responder position on the map.
 * @param {object} props
 * @param {boolean} [props.selected]
 * @param {string} [props.label]
 */
import React from 'react';
import MarkerBase from './MarkerBase';

function VolunteerMarker({ selected, label }) {
  return <MarkerBase icon="volunteer" color="info" selected={selected} label={label} />;
}

export default VolunteerMarker;
