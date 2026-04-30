'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Champion, GameSelection } from '@/components/moba/types';

export function useGlobalSearch(selectedGame: GameSelection, champions: Champion[]) {
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const globalSearchRef = useRef<HTMLInputElement>(null);

  // Filter champions by search query and selected game (memoized)
  const searchResults = useMemo(() => {
    const filtered = champions.filter(c => !selectedGame || c.game === selectedGame);
    return globalSearchQuery.trim().length > 0
      ? filtered.filter(c => c.name.toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 8)
      : filtered.slice(0, 8);
  }, [globalSearchQuery, champions, selectedGame]);

  // Listen for custom search open event
  useEffect(() => {
    function handleOpenSearch() {
      setGlobalSearchOpen(true);
      setGlobalSearchQuery('');
    }
    window.addEventListener('moba-sage-open-search', handleOpenSearch);
    return () => window.removeEventListener('moba-sage-open-search', handleOpenSearch);
  }, []);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (selectedGame) {
          setGlobalSearchOpen(prev => !prev);
          setGlobalSearchQuery('');
        }
      }
      if (e.key === 'Escape' && globalSearchOpen) {
        setGlobalSearchOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedGame, globalSearchOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (globalSearchOpen && globalSearchRef.current) {
      setTimeout(() => globalSearchRef.current?.focus(), 100);
    }
  }, [globalSearchOpen]);

  const handleSearchSelect = useCallback((champ: Champion, onSelect: (c: Champion) => void) => {
    onSelect(champ);
    setGlobalSearchOpen(false);
    setGlobalSearchQuery('');
  }, []);

  return {
    globalSearchOpen, setGlobalSearchOpen,
    globalSearchQuery, setGlobalSearchQuery,
    globalSearchRef, searchResults,
    handleSearchSelect,
  };
}
