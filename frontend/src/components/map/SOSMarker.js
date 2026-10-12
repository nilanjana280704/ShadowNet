/**
 * SOSMarker — an active distress beacon on the map. Always pulses.
 * @param {object} props
 * @param {boolean} [props.selected]
 * @param {string} [props.label]
 */
import React from 'react';
import MarkerBase from './MarkerBase';

function SOSMarker({ selected, label }) {
  return <MarkerBase icon="sos" color="sos" pulse selected={selected} label={label} />;
}

export default SOSMarker;
