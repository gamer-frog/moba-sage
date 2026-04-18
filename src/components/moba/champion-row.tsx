'use client';

import { motion } from 'framer-motion';
import { Star, ChevronDown } from 'lucide-react';
import { ChampionIcon } from './champion-icon';
import { RoleBadge } from './badges';
import type { Champion } from './types';

export function ChampionRow({ champion, onClick, isFavorite, onToggleFavorite }: {
  champion: Champion;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
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
        <h3 className="font-semibold text-[13px] text-[#f0e6d2] truncate group-hover:text-[#c8aa6e] transition-colors leading-tight">
          {champion.name}
        </h3>
        <p className="text-[10px] text-[#5b5a56] truncate leading-tight mt-0.5">{champion.title}</p>
      </div>
      <RoleBadge role={champion.role} />
      <div className="hidden sm:flex items-center gap-2.5 shrink-0 text-[11px]">
        <div className="flex flex-col items-end">
          <span className="text-[8px] text-[#5b5a56] uppercase tracking-wider leading-none">WR</span>
          <span className="font-mono font-semibold leading-tight" style={{ color: champion.winRate >= 52 ? '#0acbe6' : '#a09b8c' }}>
            {champion.winRate}%
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] text-[#5b5a56] uppercase tracking-wider leading-none">Pick</span>
          <span className="font-mono font-semibold text-[#a09b8c] leading-tight">{champion.pickRate}%</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] text-[#5b5a56] uppercase tracking-wider leading-none">Ban</span>
          <span className="font-mono font-semibold leading-tight" style={{ color: champion.banRate > 5 ? '#e84057' : '#a09b8c' }}>
            {champion.banRate}%
          </span>
        </div>
      </div>
      <ChevronDown className="w-4 h-4 text-[#785a28] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(e); }}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1"
          title={isFavorite ? 'Quitar favorito' : 'Marcar favorito'}
        >
          <Star className={`w-4 h-4 transition-colors ${isFavorite ? 'text-[#f0c646]' : 'text-[#5b5a56] hover:text-[#f0c646]'}`} fill={isFavorite ? '#f0c646' : 'none'} />
        </button>
      )}
    </motion.div>
  );
}
