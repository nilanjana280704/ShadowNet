/**
 * Timestamp — renders a time value as relative ("5m") or wall-clock ("14:07")
 * through the Text atom.
 *
 * @param {object} props
 * @param {number} props.date epoch ms
 * @param {boolean} [props.relative=false] relative vs. clock time
 * @param {string} [props.variant='caption']
 * @param {string} [props.color='muted']
 */
import React from 'react';

import { clockTime, relativeTime } from '../../utils/time';
import Text from './Text';

function Timestamp({ date, relative = false, variant = 'caption', color = 'muted', ...rest }) {
  if (!date) return null;
  return (
    <Text variant={variant} color={color} {...rest}>
      {relative ? relativeTime(date) : clockTime(date)}
    </Text>
  );
}

export default Timestamp;
