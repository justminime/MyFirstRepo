import { useState, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  sanitize?: (raw: unknown) => T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      const parsed: unknown = JSON.parse(item);
      return sanitize ? sanitize(parsed) : (parsed as T);
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue(prev => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Ignore write errors (private browsing, storage quota exceeded)
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
