'use client';

import { motion } from 'framer-motion';
import { TIER_CONFIG } from './constants';
import { ChampionRow } from './champion-row';
import { SourceBadge } from './source-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { wrColor } from './theme-colors';
import type { Champion } from './types';

export function TierSection({ tier, champions, onChampionClick, favorites, onToggleFavorite, trendMap, showWeeklyChart, gamePatch }: {
  tier: string;
  champions: Champion[];
  onChampionClick: (c: Champion) => void;
  favorites: Set<number>;
  onToggleFavorite: (id: number) => void;
  trendMap?: Record<string, 'rising' | 'falling'>;
  showWeeklyChart?: boolean;
  gamePatch?: string;
}) {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG['B'];

  // Compute tier averages
  const avgWR = champions.length > 0
    ? (champions.reduce((sum, c) => sum + c.winRate, 0) / champions.length).toFixed(1)
    : '0.0';
  const avgPick = champions.length > 0
    ? (champions.reduce((sum, c) => sum + c.pickRate, 0) / champions.length).toFixed(1)
    : '0.0';
  const avgBan = champions.length > 0
    ? (champions.reduce((sum, c) => sum + c.banRate, 0) / champions.length).toFixed(1)
    : '0.0';

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-5">
      {/* Gold accent line */}
      <div className="w-full h-[2px] rounded-full mb-1" style={{ background: `linear-gradient(90deg, ${cfg.color}60, ${cfg.color}20, transparent)` }} />
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-t-xl"
        style={{
          background: `linear-gradient(90deg, ${cfg.color}15, transparent)`,
          borderLeft: `2px solid ${cfg.color}80`,
        }}
      >
        <span
          className="text-lg font-black tracking-wide"
          style={{ color: cfg.color, textShadow: `0 0 12px ${cfg.color}30` }}
        >
          {tier}
        </span>
        <div className="w-px h-4 bg-lol-gold-dark/40" />
        <span className="text-xs font-medium" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        <span className="text-[10px] text-lol-dim">
          {champions.length} campeones
        </span>
        {/* Tier averages */}
        <div className="hidden md:flex items-center gap-3 ml-auto text-[10px]">
          <div className="flex items-center gap-1">
            <span className="text-lol-dim">PROM</span>
            <span className="font-mono font-semibold" style={{ color: wrColor(parseFloat(avgWR)) }}>{avgWR}% WR</span>
          </div>
          <div className="w-px h-3 bg-lol-gold-dark/30" />
          <div className="flex items-center gap-1">
            <span className="font-mono text-lol-muted">{avgPick}% Pick</span>
          </div>
          <div className="w-px h-3 bg-lol-gold-dark/30" />
          <div className="flex items-center gap-1">
            <span className="font-mono" style={{ color: parseFloat(avgBan) > 3 ? '#e84057' : '#a09b8c' }}>{avgBan}% Ban</span>
          </div>
        </div>
      </div>

      {/* Source attribution under tier header */}
      {tier === 'S' && (
        <div className="px-4 py-1" style={{ background: 'rgba(20, 24, 30, 0.6)', borderLeft: '1px solid rgba(120, 90, 40, 0.12)', borderRight: '1px solid rgba(120, 90, 40, 0.12)' }}>
          <SourceBadge source="U.GG + OP.GG" patch={gamePatch ? `Patch ${gamePatch}` : undefined} timestamp={undefined} size="xs" />
        </div>
      )}

      <div
        className="hidden sm:flex items-center px-4 py-1.5 text-[10px] text-lol-dim uppercase tracking-widest font-medium"
        style={{
          background: 'rgba(20, 24, 30, 0.8)',
          borderLeft: `1px solid rgba(120, 90, 40, 0.15)`,
          borderRight: `1px solid rgba(120, 90, 40, 0.15)`,
        }}
      >
        <div className="w-11 shrink-0" />
        <div className="flex-1" />
        <div className="w-14 shrink-0" />
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="w-16 text-center">TV</span>
          <span className="w-16 text-center">Pick</span>
          <span className="w-16 text-center">Ban</span>
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
            <ChampionRow champion={champ} onClick={() => onChampionClick(champ)} isFavorite={favorites.has(champ.id)} onToggleFavorite={(e) => { e.stopPropagation(); onToggleFavorite(champ.id); }} trend={trendMap?.[champ.name]} showWeeklyChart={showWeeklyChart} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function TierSectionSkeleton() {
  return (
    <div className="mb-4">
      <div className="h-10 rounded-t-xl bg-lol-card/50 mb-1" />
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
