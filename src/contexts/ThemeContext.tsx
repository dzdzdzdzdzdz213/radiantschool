import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ theme: 'light', toggle: () => {} });

/**
 * Provides the current theme (`light` / `dark`) and a toggle function.
 * Defaults to the system preference. Persists to localStorage and sets
 * `data-theme` on `document.documentElement`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const s = localStorage.getItem('theme');
      if (s === 'dark' || s === 'light') return s;
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  return (
    <Ctx.Provider value={{ theme, toggle: () => setTheme(t => t === 'light' ? 'dark' : 'light') }}>
      {children}
    </Ctx.Provider>
  );
}

/** Returns the current theme context: `theme` and `toggle`. */
export const useTheme = () => useContext(Ctx);
