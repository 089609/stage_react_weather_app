import { useCallback, useEffect, useMemo, useState } from 'react';

type PrimeTheme = 'lara-light-blue' | 'lara-dark-blue';

const THEME_STORAGE_KEY = 'app-theme';
const THEME_LINK_ID = 'app-theme-link';

function ensureThemeLink(): HTMLLinkElement {
  let link = document.getElementById(THEME_LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = THEME_LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  return link;
}

function themeHref(theme: PrimeTheme): string {
  return `https://unpkg.com/primereact/resources/themes/${theme}/theme.css`;
}

export function usePrimeTheme() {
  const initial = useMemo<PrimeTheme>(() => {
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) as PrimeTheme | null) ?? null;
    return stored ?? 'lara-light-blue';
  }, []);

  const [theme, setTheme] = useState<PrimeTheme>(initial);

  useEffect(() => {
    const link = ensureThemeLink();
    link.href = themeHref(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.setAttribute('data-prime-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((curr) => (curr === 'lara-light-blue' ? 'lara-dark-blue' : 'lara-light-blue'));
  }, []);

  const isDark = theme.includes('dark');

  return { theme, isDark, setTheme, toggleTheme };
}

export default usePrimeTheme;


