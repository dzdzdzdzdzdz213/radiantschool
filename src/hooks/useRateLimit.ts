import { useState, useCallback, useRef } from 'react';

export function useRateLimit(cooldownMs: number = 60000) {
  const [remaining, setRemaining] = useState(0);
  const lastSubmit = useRef(0);

  const checkLimit = useCallback((): boolean => {
    const elapsed = Date.now() - lastSubmit.current;
    if (elapsed < cooldownMs) {
      setRemaining(Math.ceil((cooldownMs - elapsed) / 1000));
      return false;
    }
    lastSubmit.current = Date.now();
    setRemaining(0);
    return true;
  }, [cooldownMs]);

  return { checkLimit, remaining };
}

export function useStorageRateLimit(key: string, cooldownMs: number = 60000) {
  const [remaining, setRemaining] = useState(0);

  const checkLimit = useCallback((): boolean => {
    try {
      const lastStr = localStorage.getItem(`ratelimit:${key}`);
      const last = lastStr ? parseInt(lastStr, 10) : 0;
      const elapsed = Date.now() - last;
      if (elapsed < cooldownMs) {
        setRemaining(Math.ceil((cooldownMs - elapsed) / 1000));
        return false;
      }
      localStorage.setItem(`ratelimit:${key}`, String(Date.now()));
      setRemaining(0);
      return true;
    } catch {
      localStorage.setItem(`ratelimit:${key}`, String(Date.now()));
      return true;
    }
  }, [key, cooldownMs]);

  return { checkLimit, remaining };
}
