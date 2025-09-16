import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'favorite-cities';

function loadFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string');
    return [];
  } catch {
    return [];
  }
}

export default function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => loadFromStorage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const favoriteSet = useMemo(() => new Set(favorites.map((n) => n.toLowerCase())), [favorites]);

  const isFavorite = useCallback((name: string) => favoriteSet.has(String(name).toLowerCase()), [favoriteSet]);

  const toggleFavorite = useCallback((name: string) => {
    const key = String(name).toLowerCase();
    setFavorites((prev) => {
      const has = prev.some((n) => n.toLowerCase() === key);
      if (has) return prev.filter((n) => n.toLowerCase() !== key);
      return [name, ...prev];
    });
  }, []);

  return { favorites, favoriteSet, isFavorite, toggleFavorite, setFavorites };
}


