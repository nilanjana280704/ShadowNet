/**
 * useDebouncedValue — debounce a rapidly-changing value (e.g. search input)
 * to limit downstream work.
 *
 * @template T
 * @param {T} value
 * @param {number} [delay=300] debounce delay in ms
 * @returns {T} the value after it has been stable for `delay`
 */
import { useEffect, useState } from 'react';

export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;
