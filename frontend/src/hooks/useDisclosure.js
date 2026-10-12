/**
 * useDisclosure — boolean open/close state for overlays (Modal, BottomSheet,
 * Dropdown). Returns { isOpen, open, close, toggle }.
 *
 * @param {boolean} [initial=false]
 */
import { useCallback, useState } from 'react';

export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  return { isOpen, open, close, toggle };
}

export default useDisclosure;
