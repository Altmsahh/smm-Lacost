"use client";

import { useState, useCallback } from "react";

/**
 * Manages boolean toggle state — useful for modals, drawers, dropdowns.
 */
export function useToggle(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle } as const;
}
