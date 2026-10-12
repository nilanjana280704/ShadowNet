/**
 * BroadcastCard — a selectable need tile for the Emergency Broadcast screen.
 * Thin wrapper over EmergencyTile so needs and quick-help share one tile.
 *
 * @param {object} props
 * @param {object} props.need { key, label, icon, tone }
 * @param {boolean} [props.selected]
 * @param {(key:string) => void} props.onPress
 */
import React from 'react';

import EmergencyTile from './EmergencyTile';

function BroadcastCard({ need, selected, onPress }) {
  return (
    <EmergencyTile
      label={need.label}
      icon={need.icon}
      tone={need.tone}
      selected={selected}
      onPress={() => onPress(need.key)}
    />
  );
}

export default BroadcastCard;
