import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type Lang, getDir } from '@/i18n';

interface LangCtx {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (l: Lang) => void;
}

const Ctx = createContext<LangCtx>({ lang: 'fr', dir: 'ltr', setLang: () => {} });

/**
 * Provides the current language (`fr` / `en` / `ar`) and direction
 * (`ltr` / `rtl`) via context. Persists to localStorage and sets
 * `lang` and `dir` attributes on `document.documentElement`.
 */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const s = localStorage.getItem('lang');
      if (s === 'fr' || s === 'en' || s === 'ar') return s;
    } catch {}
    return 'fr';
  });

  const dir = getDir(lang);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', dir);
    try { localStorage.setItem('lang', lang); } catch {}
  }, [lang, dir]);

  return (
    <Ctx.Provider value={{ lang, dir, setLang }}>
      {children}
    </Ctx.Provider>
  );
}

/** Returns the current language context: `lang`, `dir`, and `setLang`. */
export const useLang = () => useContext(Ctx);
