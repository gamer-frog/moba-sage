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

// Trend icon based on pro pick rate
function TrendIcon({ rate }: { rate: number }) {
  if (rate >= 15) return <TrendingUp className="w-3 h-3 text-lol-green" />;
  if (rate >= 8) return <TrendingUp className="w-3 h-3 text-lol-success" />;
  if (rate >= 4) return <Minus className="w-3 h-3 text-lol-warning" />;
  return <TrendingDown className="w-3 h-3 text-lol-dim" />;
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
            <Star className="w-3.5 h-3.5 text-lol-warning" fill="#f0c646" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-[13px] text-lol-text truncate group-hover:text-lol-gold transition-colors leading-tight">
            {champion.name}
          </h3>
          {trend === 'rising' && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-black" style={{ background: 'rgba(15,186,129,0.15)', color: '#0fba81' }}>▲</span>
          )}
          {trend === 'falling' && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-black" style={{ background: 'rgba(232,64,87,0.15)', color: '#e84057' }}>▼</span>
          )}
          {champion.proPickRate !== undefined && champion.proPickRate > 0 && (
            <TrendIcon rate={champion.proPickRate} />
          )}
        </div>
        <p className="text-[10px] text-lol-gold-dark truncate leading-tight mt-0.5 italic">{champion.title}</p>
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
              <div className="w-px h-3 bg-lol-gold-dark/30" />
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
      {/* Stats cluster — pill badges */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md" style={{ background: `${wr}10`, border: `1px solid ${wr}20` }}>
          <span className="font-mono font-bold text-[11px] sm:text-[12px] leading-none" style={{ color: wr }}>
            {champion.winRate}%
          </span>
          <span className="text-[10px] text-lol-dim uppercase tracking-widest">WR</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: 'rgba(91,138,245,0.08)', border: '1px solid rgba(91,138,245,0.15)' }}>
          <span className="font-mono font-semibold text-[12px] text-[#5b8af5] leading-none">{champion.pickRate}%</span>
          <span className="text-[10px] text-lol-dim uppercase tracking-widest">Pick</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: champion.banRate > 5 ? 'rgba(232,64,87,0.08)' : 'rgba(120,90,40,0.05)', border: champion.banRate > 5 ? '1px solid rgba(232,64,87,0.15)' : '1px solid rgba(120,90,40,0.1)' }}>
          <span className="font-mono font-semibold text-[12px] leading-none" style={{ color: champion.banRate > 5 ? '#e84057' : '#a09b8c' }}>{champion.banRate}%</span>
          <span className="text-[10px] text-lol-dim uppercase tracking-widest">Ban</span>
        </div>
        {/* Weekly WR mini chart */}
        {showWeeklyChart && (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] text-lol-dim uppercase tracking-wider leading-none">4 Sem</span>
            <WeeklyWRChart championName={champion.name} currentWR={champion.winRate} compact />
          </div>
        )}
      </div>
      <ChevronDown className="w-4 h-4 text-lol-gold-dark shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(e); }}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1"
          title={isFavorite ? 'Quitar favorito' : 'Marcar favorito'}
          aria-label={isFavorite ? `Quitar ${champion.name} de favoritos` : `Marcar ${champion.name} como favorito`}
          aria-pressed={isFavorite}
        >
          <Star className={`w-4 h-4 transition-colors ${isFavorite ? 'text-lol-warning' : 'text-lol-dim hover:text-lol-warning'}`} fill={isFavorite ? '#f0c646' : 'none'} />
        </button>
      )}
    </motion.div>
  );
}
