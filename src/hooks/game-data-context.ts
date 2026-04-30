'use client';

import { createContext, useContext } from 'react';
import type {
  Champion, PatchNote, AiInsight, TaskItem,
  ProPick, BrokenCombo, SummonerData, GameSelection,
} from '@/components/moba/types';

export interface GameDataContextValue {
  // Game state
  activeTab: string;
  selectedGame: GameSelection;
  // Data
  champions: Champion[];
  patches: PatchNote[];
  insights: AiInsight[];
  tasks: TaskItem[];
  combos: BrokenCombo[];
  proPicks: ProPick[];
  // Loading
  loading: boolean;
  fetchError: boolean;
  // Filters
  searchQuery: string;
  roleFilter: string;
  proRegionFilter: string;
  // Favorites
  favorites: Set<number>;
  // Summoner
  summonerName: string;
  summonerRegion: string;
  summonerData: SummonerData | null;
  summonerLoading: boolean;
  summonerError: string;
  // Version
  liveVersions: { lol: string; wr: string; gamePatch: string; metaLastUpdated: string };
  // Callbacks
  onSearchChange: (q: string) => void;
  onRoleFilterChange: (r: string) => void;
  onProRegionFilterChange: (r: string) => void;
  onToggleFavorite: (id: number) => void;
  onChampionClick: (c: Champion) => void;
  onSummonerNameChange: (n: string) => void;
  onSummonerRegionChange: (r: string) => void;
  onSearchSummoner: () => void;
  fetchData: () => void;
  handleToggleTask: (t: TaskItem) => void;
  onRetryFetch: () => void;
}

export const GameDataContext = createContext<GameDataContextValue | null>(null);

export function useGameDataContext() {
  const ctx = useContext(GameDataContext);
  if (!ctx) throw new Error('useGameDataContext must be used within GameDataContext.Provider');
  return ctx;
}
