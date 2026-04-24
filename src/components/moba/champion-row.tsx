'use client';

import { motion } from 'framer-motion';
import { Star, ChevronDown, TrendingUp, Minus, TrendingDown } from 'lucide-react';
import { ChampionIcon, MicroChampionIcon } from './champion-icon';
import { RoleBadge } from './badges';
import { WeeklyWRChart } from './weekly-wr-chart';
import type { Champion } from './types';

// Color coding for win rate: red (<48) → yellow (48-51) → cyan (51-53) → green (>53)
function wrColor(wr: number): string {
  if (wr >= 53) return '#0fba81';
  if (wr >= 51) return '#0acbe6';
  if (wr >= 49) return '#f0c646';
  return '#e84057';
}

// Mini horizontal bar for stat visualization
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(120,90,40,0.12)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color, opacity: 0.7 }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

// Trend icon based on pro pick rate
function TrendIcon({ rate }: { rate: number }) {
  if (rate >= 15) return <TrendingUp className="w-3 h-3 text-[#0fba81]" />;
  if (rate >= 8) return <TrendingUp className="w-3 h-3 text-[#0acbe6]" />;
  if (rate >= 4) return <Minus className="w-3 h-3 text-[#f0c646]" />;
  return <TrendingDown className="w-3 h-3 text-[#5b5a56]" />;
}

// Parse comma-separated champion names from counterPick or synergy
function parseChampionNames(str: string | undefined, currentChampName: string): string[] {
  if (!str) return [];
  return str
    .split(/[,;—]/)
    .map(s => s.replace(/\(.*?\)/g, '').replace(/—.*/g, '').trim())
    .filter(n => n.length > 0 && n.length < 25 && n !== currentChampName);
}

export function ChampionRow({ champion, onClick, isFavorite, onToggleFavorite, trend, showWeeklyChart }: {
  champion: Champion;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  trend?: 'rising' | 'falling';
  showWeeklyChart?: boolean;
}) {
  const wr = wrColor(champion.winRate);

  const synergyNames = parseChampionNames(champion.synergy, champion.name);
  const counterNames = parseChampionNames(champion.counterPick, champion.name);
  const hasMatchups = synergyNames.length > 0 || counterNames.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalles de ${champion.name}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      className="champion-row flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group"
    >
      <div className="relative">
        <ChampionIcon name={champion.name} tier={champion.tier} />
        {isFavorite && (
          <div className="absolute -top-1 -right-1 z-10 lol-fav-star">
            <Star className="w-3.5 h-3.5 text-[#f0c646]" fill="#f0c646" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-[13px] text-[#f0e6d2] truncate group-hover:text-[#c8aa6e] transition-colors leading-tight">
            {champion.name}
          </h3>
          {trend === 'rising' && <span className="text-[11px] font-bold text-[#0fba81]">↑</span>}
          {trend === 'falling' && <span className="text-[11px] font-bold text-[#e84057]">↓</span>}
          {champion.proPickRate !== undefined && champion.proPickRate > 0 && (
            <TrendIcon rate={champion.proPickRate} />
          )}
        </div>
        <p className="text-[10px] text-[#5b5a56] truncate leading-tight mt-0.5">{champion.title}</p>
        {/* Matchup indicators — synergy (green) + counters (red) */}
        {hasMatchups && (
          <div className="flex items-center gap-1.5 mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
            {synergyNames.slice(0, 3).map((name) => (
              <div key={`syn-${name}`} className="relative" title={`${name} (Sinergia)`}>
                <MicroChampionIcon name={name} />
                <div className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 4px rgba(10,203,230,0.6)', border: '1px solid rgba(10,203,230,0.4)' }} />
              </div>
            ))}
            {synergyNames.length > 0 && counterNames.length > 0 && (
              <div className="w-px h-3 bg-[#785a28]/30" />
            )}
            {counterNames.slice(0, 3).map((name) => (
              <div key={`ctr-${name}`} className="relative" title={`${name} (Counter)`}>
                <MicroChampionIcon name={name} />
                <div className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 4px rgba(232,64,87,0.6)', border: '1px solid rgba(232,64,87,0.4)' }} />
              </div>
            ))}
          </div>
        )}
      </div>
      <RoleBadge role={champion.role} />
      {/* Mobile WR bar — subtle inline indicator */}
      <div className="flex sm:hidden items-center gap-1.5 shrink-0">
        <span className="text-[10px] font-mono font-semibold" style={{ color: wr }}>{champion.winRate}%</span>
        <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(120,90,40,0.12)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: wr, opacity: 0.8 }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((champion.winRate / 58) * 100, 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-3 shrink-0 text-[11px]">
        {/* Win Rate with bar */}
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[8px] text-[#5b5a56] uppercase tracking-wider leading-none">WR</span>
          <span className="font-mono font-semibold leading-tight" style={{ color: wr }}>
            {champion.winRate}%
          </span>
          <MiniBar value={champion.winRate} max={60} color={wr} />
        </div>
        {/* Pick Rate with bar */}
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[8px] text-[#5b5a56] uppercase tracking-wider leading-none">Pick</span>
          <span className="font-mono font-semibold text-[#a09b8c] leading-tight">{champion.pickRate}%</span>
          <MiniBar value={champion.pickRate} max={20} color="#5b8af5" />
        </div>
        {/* Ban Rate with bar */}
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[8px] text-[#5b5a56] uppercase tracking-wider leading-none">Ban</span>
          <span className="font-mono font-semibold leading-tight" style={{ color: champion.banRate > 5 ? '#e84057' : '#a09b8c' }}>
            {champion.banRate}%
          </span>
          <MiniBar value={champion.banRate} max={20} color="#e84057" />
        </div>
        {/* Weekly WR mini chart */}
        {showWeeklyChart && (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[8px] text-[#5b5a56] uppercase tracking-wider leading-none">4 Sem</span>
            <WeeklyWRChart championName={champion.name} currentWR={champion.winRate} compact />
          </div>
        )}
      </div>
      <ChevronDown className="w-4 h-4 text-[#785a28] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(e); }}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1"
          title={isFavorite ? 'Quitar favorito' : 'Marcar favorito'}
          aria-label={isFavorite ? `Quitar ${champion.name} de favoritos` : `Marcar ${champion.name} como favorito`}
          aria-pressed={isFavorite}
        >
          <Star className={`w-4 h-4 transition-colors ${isFavorite ? 'text-[#f0c646]' : 'text-[#5b5a56] hover:text-[#f0c646]'}`} fill={isFavorite ? '#f0c646' : 'none'} />
        </button>
      )}
    </motion.div>
  );
}
