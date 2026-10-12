/**
 * AnimatedCounter — a number that counts up to its value on mount/change.
 * Renders through the Text atom so it inherits the type scale. Honors
 * reduce-motion (snaps to the value).
 *
 * @param {object} props
 * @param {number} props.value target value
 * @param {number} [props.duration=900] count duration in ms
 * @param {(n:number) => string|number} [props.format] format the displayed number
 * @param {string} [props.variant='telemetryL'] Text variant
 * @param {string} [props.color='primary'] Text color token
 */
import React, { useEffect, useRef, useState } from 'react';

import { duration as durationTokens, easing } from '../../animations/tokens';
import { useReducedMotion } from '../../animations';
import Text from './Text';

function AnimatedCounter({ value, duration = durationTokens.deliberate, format, variant = 'telemetryL', color = 'primary', ...rest }) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);
  const rafValue = useRef(0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return undefined;
    }
    const from = rafValue.current;
    const start = Date.now();
    const curve = easing.decelerate;
    let frame;

    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      const eased = curve(t);
      const current = from + (value - from) * eased;
      rafValue.current = current;
      setDisplay(current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduced]);

  const rounded = Math.round(display);
  const shown = format ? format(rounded) : rounded;

  return (
    <Text variant={variant} color={color} {...rest}>
      {shown}
    </Text>
  );
}

export default AnimatedCounter;
