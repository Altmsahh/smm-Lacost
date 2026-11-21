"use client";

import { useEffect, useState } from "react";

/**
 * Debounces a value by the specified delay (ms).
 * Useful for search inputs, API query filtering, etc.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
