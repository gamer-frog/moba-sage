'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'moba-sage-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(new Set<number>());
  const [favoritesHydrated, setFavoritesHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    } catch { /* ignore */ }
    setFavoritesHydrated(true);
  }, []);

  // Persist to localStorage (only after hydration)
  useEffect(() => {
    if (favoritesHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    }
  }, [favorites, favoritesHydrated]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}
