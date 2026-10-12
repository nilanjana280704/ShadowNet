/**
 * useToggle — a boolean with a stable toggle/set. Returns [value, toggle, set].
 * @param {boolean} [initial=false]
 */
import { useCallback, useState } from 'react';

export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

export default useToggle;
