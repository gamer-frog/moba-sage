'use client';

import { motion } from 'framer-motion';
import { TIER_CONFIG } from './constants';
import { ChampionRow } from './champion-row';
import { SourceBadge } from './source-badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Champion } from './types';
import type { LucideIcon } from 'lucide-react';

function wrColor(wr: number): string {
  if (wr >= 53) return '#0fba81';
  if (wr >= 51) return '#0acbe6';
  if (wr >= 49) return '#f0c646';
  return '#e84057';
}

export function TierSection({ tier, champions, onChampionClick, favorites, onToggleFavorite, trendMap, showWeeklyChart }: {
  tier: string;
  champions: Champion[];
  onChampionClick: (c: Champion) => void;
  favorites: Set<number>;
  onToggleFavorite: (id: number) => void;
  trendMap?: Record<string, 'rising' | 'falling'>;
  showWeeklyChart?: boolean;
}) {
  const cfg = TIER_CONFIG[tier];

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
        <div className="w-px h-4 bg-[#785a28]/40" />
        <span className="text-xs font-medium" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        <span className="text-[10px] text-[#5b5a56]">
          {champions.length} campeones
        </span>
        {/* Tier averages */}
        <div className="hidden md:flex items-center gap-3 ml-auto text-[10px]">
          <div className="flex items-center gap-1">
            <span className="text-[#5b5a56]">PROM</span>
            <span className="font-mono font-semibold" style={{ color: wrColor(parseFloat(avgWR)) }}>{avgWR}% WR</span>
          </div>
          <div className="w-px h-3 bg-[#785a28]/30" />
          <div className="flex items-center gap-1">
            <span className="font-mono text-[#a09b8c]">{avgPick}% Pick</span>
          </div>
          <div className="w-px h-3 bg-[#785a28]/30" />
          <div className="flex items-center gap-1">
            <span className="font-mono" style={{ color: parseFloat(avgBan) > 3 ? '#e84057' : '#a09b8c' }}>{avgBan}% Ban</span>
          </div>
        </div>
      </div>

      {/* Source attribution under tier header */}
      {tier === 'S' && (
        <div className="px-4 py-1" style={{ background: 'rgba(20, 24, 30, 0.6)', borderLeft: '1px solid rgba(120, 90, 40, 0.12)', borderRight: '1px solid rgba(120, 90, 40, 0.12)' }}>
          <SourceBadge source="U.GG + OP.GG" patch="Patch 26.9" timestamp="2026-04-25T12:00:00Z" size="xs" />
        </div>
      )}

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
