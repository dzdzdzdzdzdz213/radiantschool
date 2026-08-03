import { useSyncExternalStore } from 'react';

export const SUPPORTED_CURRENCIES = ['DZD', 'EUR', 'USD'] as const;
export type AppCurrency = (typeof SUPPORTED_CURRENCIES)[number];

let current: AppCurrency = 'DZD';
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AppCurrency {
  return current;
}

export function setAppCurrency(code: string): void {
  const next = (SUPPORTED_CURRENCIES as readonly string[]).includes(code) ? (code as AppCurrency) : 'DZD';
  if (next === current) return;
  current = next;
  listeners.forEach((l) => l());
}

export function getAppCurrency(): AppCurrency {
  return current;
}

export function useAppCurrency(): AppCurrency {
  return useSyncExternalStore(subscribe, getSnapshot);
}