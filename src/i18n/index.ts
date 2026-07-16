import type { Lang } from './types';
import type { Dict } from './types';
import { fr as authFr, en as authEn, ar as authAr } from './auth';
import { fr as commonFr, en as commonEn, ar as commonAr } from './common';
import { fr as dashFr, en as dashEn, ar as dashAr } from './dashboard';
import { fr as domainFr, en as domainEn, ar as domainAr } from './domain';
import { fr as landFr, en as landEn, ar as landAr } from './landing';
import { fr as navFr, en as navEn, ar as navAr } from './navigation';

const fr = { ...commonFr, ...authFr, ...navFr, ...landFr, ...dashFr, ...domainFr } as Dict;
const en = { ...commonEn, ...authEn, ...navEn, ...landEn, ...dashEn, ...domainEn } as Dict;
const ar = { ...commonAr, ...authAr, ...navAr, ...landAr, ...dashAr, ...domainAr } as Dict;

const dicts: Record<Lang, Dict> = { fr, en, ar };

export function t(key: string, lang: Lang, ...args: string[]): string {
  const val = dicts[lang]?.[key];
  if (!val) return key;
  if (typeof val === 'function') return val(...args);
  return val;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export async function autoTranslate(text: string, target: 'en' | 'ar'): Promise<string> {
  const cacheKey = `_tr_${target}_${text}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch {}

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/auto-translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    const result: string = data.translated || text;
    try { localStorage.setItem(cacheKey, result); } catch {}
    return result;
  } catch {
    return text;
  }
}

export function ta(
  key: string,
  frText: string,
  lang: Lang,
  onTranslated?: (t: string) => void,
): string {
  if (lang === 'fr') return frText;
  const existing = dicts[lang]?.[key];
  if (existing) return typeof existing === 'function' ? existing() : existing;
  const cacheKey = `_tr_${lang}_${frText}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch {}
  autoTranslate(frText, lang).then((result) => {
    try { localStorage.setItem(cacheKey, result); } catch {}
    onTranslated?.(result);
  });
  return frText;
}

export const LANGUAGES: { code: Lang; label: string; flag: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ar', label: 'العربية', flag: '🇩🇿', dir: 'rtl' },
];

export function getDir(lang: Lang): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export type { Lang };
