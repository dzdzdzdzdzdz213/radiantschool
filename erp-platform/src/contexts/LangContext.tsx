import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type Lang, LANGUAGES, getDir } from '@/i18n';

interface LangCtx {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (l: Lang) => void;
}

const Ctx = createContext<LangCtx>({ lang: 'fr', dir: 'ltr', setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const s = localStorage.getItem('lang');
    if (s === 'fr' || s === 'en' || s === 'ar') return s;
    return 'fr';
  });

  const dir = getDir(lang);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', dir);
    localStorage.setItem('lang', lang);
  }, [lang, dir]);

  return (
    <Ctx.Provider value={{ lang, dir, setLang }}>
      {children}
    </Ctx.Provider>
  );
}

export const useLang = () => useContext(Ctx);
