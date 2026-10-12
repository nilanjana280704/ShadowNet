/**
 * ConnectionStatusBadge — a Badge that maps a connection state to a tone and
 * label. Reused wherever a device/link connection status is shown.
 *
 * @param {object} props
 * @param {string} props.state ConnectionState value
 */
import React from 'react';

import { ConnectionState } from '../../communication';
import Badge from './Badge';

const MAP = {
  [ConnectionState.DISCONNECTED]: { tone: 'neutral', label: 'Offline' },
  [ConnectionState.CONNECTING]: { tone: 'info', label: 'Connecting' },
  [ConnectionState.CONNECTED]: { tone: 'success', label: 'Connected' },
  [ConnectionState.RECONNECTING]: { tone: 'warning', label: 'Reconnecting' },
  [ConnectionState.FAILED]: { tone: 'error', label: 'Failed' },
  [ConnectionState.TIMEOUT]: { tone: 'error', label: 'Timed out' },
};

function ConnectionStatusBadge({ state }) {
  const m = MAP[state] || MAP[ConnectionState.DISCONNECTED];
  return <Badge label={m.label} tone={m.tone} />;
}

export default ConnectionStatusBadge;
