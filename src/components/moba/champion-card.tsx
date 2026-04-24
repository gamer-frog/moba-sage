'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { getChampionSplashUrl } from './helpers';
import { RoleBadge } from './badges';
import { TIER_CONFIG } from './constants';
import type { Champion } from './types';

interface ChampionCardProps {
  champion: Champion;
  onClick?: () => void;
  showFavorite?: boolean;
  isFavorite?: boolean;
  trend?: 'rising' | 'falling' | undefined;
  size?: 'sm' | 'lg';
}

function getWrColor(wr: number): string {
  if (wr >= 53) return '#0fba81';
  if (wr >= 51) return '#0acbe6';
  if (wr >= 49) return '#f0c646';
  return '#e84057';
}

export function ChampionCard({
  champion,
  onClick,
  showFavorite = true,
  isFavorite = false,
  trend,
  size = 'sm',
}: ChampionCardProps) {
  const { name, role, tier, winRate, pickRate } = champion;
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.B;
  const splashUrl = getChampionSplashUrl(name, 0);
  const wrColor = getWrColor(winRate);
  const isLg = size === 'lg';

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        relative rounded-xl overflow-hidden cursor-pointer
        transition-shadow duration-300
        ${isLg ? 'w-full sm:w-[180px] h-[220px]' : 'w-[120px] h-[160px]'}
      `}
      style={{
        border: `2px solid ${cfg.color}60`,
        boxShadow: `0 0 12px ${cfg.color}15`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${cfg.color}`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${cfg.color}40, 0 8px 32px rgba(0,0,0,0.4)`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${cfg.color}60`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${cfg.color}15`;
      }}
    >
      {/* Splash art background */}
      <div className="absolute inset-0">
        <Image
          src={splashUrl}
          alt={name}
          fill
          className="object-cover transition-all duration-300"
          style={{ filter: 'brightness(0.7) saturate(1.1)' }}
          unoptimized
          sizes={isLg ? '180px' : '120px'}
        />
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to bottom, transparent 20%, rgba(10,14,26,0.7) 55%, rgba(10,14,26,0.95) 100%)',
          }}
        />
        {/* Hover brightness overlay */}
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: 'rgba(200,170,110,0.08)' }}
        />
      </div>

      {/* Favorite star */}
      {showFavorite && isFavorite && (
        <div className="absolute top-1.5 right-1.5 z-10">
          <Star className="w-3.5 h-3.5 text-[#f0c646]" fill="#f0c646" style={{ filter: 'drop-shadow(0 0 4px rgba(240,198,70,0.6))' }} />
        </div>
      )}

      {/* Trend indicator */}
      {trend && (
        <div className="absolute top-1.5 left-1.5 z-10">
          {trend === 'rising' ? (
            <TrendingUp className="w-3.5 h-3.5 text-[#0fba81]" style={{ filter: 'drop-shadow(0 0 4px rgba(15,186,129,0.6))' }} />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-[#e84057]" style={{ filter: 'drop-shadow(0 0 4px rgba(232,64,87,0.6))' }} />
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-2">
        {/* Tier badge */}
        <div className="mb-1">
          <span
            className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black"
            style={{
              backgroundColor: `${cfg.color}25`,
              color: cfg.color,
              border: `1px solid ${cfg.color}40`,
            }}
          >
            {tier}
          </span>
        </div>

        {/* Champion name */}
        <span className="lol-title text-[#f0e6d2] leading-tight" style={{ fontSize: isLg ? '14px' : '12px' }}>
          {name}
        </span>

        {/* Role badge */}
        <div className="mt-0.5">
          <RoleBadge role={role} />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono" style={{ fontSize: isLg ? '11px' : '10px', color: wrColor }}>
            {winRate}%
          </span>
          <span className="text-[#5b5a56] font-mono" style={{ fontSize: isLg ? '10px' : '9px' }}>
            ·
          </span>
          <span className="font-mono text-[#a09b8c]" style={{ fontSize: isLg ? '10px' : '9px' }}>
            {pickRate}% pick
          </span>
        </div>
      </div>
    </motion.div>
  );
}
