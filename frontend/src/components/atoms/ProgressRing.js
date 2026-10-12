/**
 * ProgressRing — a circular progress gauge with a large center value and a
 * caption. Wraps CircularProgress so emergency/live-status screens share one
 * ring treatment.
 *
 * @param {object} props
 * @param {number} props.value 0..1
 * @param {string|number} props.centerValue big value in the middle
 * @param {string} [props.label] caption under the value
 * @param {number} [props.size=120]
 * @param {'primary'|'success'|'warning'|'error'} [props.tone='primary']
 * @param {string} [props.valueColor] Text color token for the center value
 */
import React from 'react';

import CircularProgress from './CircularProgress';
import Text from './Text';

function ProgressRing({ value, centerValue, label, size = 120, tone = 'primary', valueColor = 'primary' }) {
  return (
    <CircularProgress value={value} size={size} strokeWidth={8} tone={tone}>
      <Text variant="telemetryL" color={valueColor}>
        {centerValue}
      </Text>
      {label ? (
        <Text variant="caption" color="muted">
          {label}
        </Text>
      ) : null}
    </CircularProgress>
  );
}

export default ProgressRing;
