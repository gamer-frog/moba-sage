'use client';

import { motion } from 'framer-motion';
import { TIER_CONFIG } from './constants';
import { ChampionRow } from './champion-row';
import { Skeleton } from '@/components/ui/skeleton';
import type { Champion } from './types';
import type { LucideIcon } from 'lucide-react';

export function TierSection({ tier, champions, onChampionClick, favorites, onToggleFavorite }: {
  tier: string;
  champions: Champion[];
  onChampionClick: (c: Champion) => void;
  favorites: Set<number>;
  onToggleFavorite: (id: number) => void;
}) {
  const cfg = TIER_CONFIG[tier];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-4">
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-t-xl"
        style={{
          background: `linear-gradient(90deg, ${cfg.color}18, ${cfg.color}05)`,
          borderTop: `2px solid ${cfg.color}`,
          borderLeft: `1px solid ${cfg.color}25`,
          borderRight: `1px solid ${cfg.color}25`,
        }}
      >
        <span
          className="text-lg font-black tracking-wide"
          style={{ color: cfg.color, textShadow: `0 0 12px ${cfg.color}30` }}
        >
          {tier}
        </span>
        <div className="w-px h-4 bg-[#785a28]/40" />
        <span className="text-xs font-medium" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        <span className="text-[10px] text-[#5b5a56] ml-auto">
          {champions.length} campeones
        </span>
      </div>

      <div
        className="hidden sm:flex items-center px-4 py-1.5 text-[8px] text-[#5b5a56] uppercase tracking-widest font-medium"
        style={{
          background: 'rgba(20, 24, 30, 0.8)',
          borderLeft: `1px solid rgba(120, 90, 40, 0.15)`,
          borderRight: `1px solid rgba(120, 90, 40, 0.15)`,
        }}
      >
        <div className="w-11 shrink-0" />
        <div className="flex-1" />
        <div className="w-14 shrink-0" />
        <div className="flex items-center gap-2.5 shrink-0 ml-3">
          <span className="w-8 text-center">WR</span>
          <span className="w-8 text-center">Pick</span>
          <span className="w-8 text-center">Ban</span>
        </div>
        <div className="w-4 shrink-0" />
      </div>

      <div
        className="space-y-0.5 p-1 rounded-b-xl"
        style={{
          background: 'rgba(20, 24, 30, 0.5)',
          border: '1px solid rgba(120, 90, 40, 0.12)',
          borderTop: 'none',
        }}
      >
        {champions.map(champ => (
          <div key={champ.id}>
            <ChampionRow champion={champ} onClick={() => onChampionClick(champ)} isFavorite={favorites.has(champ.id)} onToggleFavorite={(e) => { e.stopPropagation(); onToggleFavorite(champ.id); }} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function TierSectionSkeleton() {
  return (
    <div className="mb-4">
      <div className="h-10 rounded-t-xl bg-[#1e2328]/50 mb-1" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 p-1 rounded-b-xl bg-[#14181e]/50">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg">
            <Skeleton className="w-11 h-11 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-2.5 w-28" />
            </div>
            <Skeleton className="h-5 w-10 rounded-full" />
            <Skeleton className="h-4 w-16 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
