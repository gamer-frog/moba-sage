'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { getChampionSplashUrl } from './helpers';
import { RoleBadge } from './badges';
import { TIER_CONFIG } from './constants';
import { WeeklyWRChart } from './weekly-wr-chart';
import type { Champion } from './types';

interface ChampionCardProps {
  champion: Champion;
  onClick?: () => void;
  showFavorite?: boolean;
  isFavorite?: boolean;
  trend?: 'rising' | 'falling' | undefined;
  size?: 'sm' | 'lg' | 'xl';
  showWeeklyChart?: boolean;
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
  showWeeklyChart = false,
}: ChampionCardProps) {
  const { name, role, tier, winRate, pickRate, banRate } = champion;
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.B;
  const splashUrl = getChampionSplashUrl(name, 0);
  const wrColor = getWrColor(winRate);

  // Size configs for LoL card-style
  const sizeConfig = {
    sm: { w: 'w-[140px]', h: 'h-[195px]', nameSize: 'text-[13px]', statSize: 'text-[9px]', iconSize: 36 },
    lg: { w: 'w-[185px]', h: 'h-[260px]', nameSize: 'text-[15px]', statSize: 'text-[10px]', iconSize: 44 },
    xl: { w: 'w-[220px]', h: 'h-[310px]', nameSize: 'text-[17px]', statSize: 'text-[11px]', iconSize: 52 },
  };

  const sc = sizeConfig[size];

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        ${sc.w} ${sc.h} relative rounded-xl overflow-hidden cursor-pointer
        transition-shadow duration-300 group
      `}
      style={{
        border: `2px solid ${cfg.color}50`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 15px ${cfg.color}10`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = `${cfg.color}`;
        el.style.boxShadow = `0 8px 32px rgba(0,0,0,0.6), 0 0 30px ${cfg.color}35`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = `${cfg.color}50`;
        el.style.boxShadow = `0 4px 20px rgba(0,0,0,0.4), 0 0 15px ${cfg.color}10`;
      }}
    >
      {/* Splash art background — LoL card style */}
      <div className="absolute inset-0">
        <Image
          src={splashUrl}
          alt={name}
          fill
          className="object-cover object-center transition-all duration-500 group-hover:scale-110"
          style={{ filter: 'brightness(0.6) saturate(1.2) contrast(1.1)' }}
          sizes={size === 'xl' ? '220px' : size === 'lg' ? '185px' : '140px'}
        />
        {/* Dark gradient overlay — LoL card bottom panel */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 10%, rgba(10,14,26,0.3) 35%, rgba(10,14,26,0.75) 55%, rgba(10,14,26,0.97) 100%)',
          }}
        />
        {/* LoL-style corner accents */}
        <div
          className="absolute top-0 left-0 w-6 h-6"
          style={{
            borderTop: `2px solid ${cfg.color}80`,
            borderLeft: `2px solid ${cfg.color}80`,
            borderTopLeftRadius: '10px',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-6 h-6"
          style={{
            borderBottom: `2px solid ${cfg.color}80`,
            borderRight: `2px solid ${cfg.color}80`,
            borderBottomRightRadius: '10px',
          }}
        />
        {/* Hover gold shimmer */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(200,170,110,0.1) 0%, transparent 50%, rgba(200,170,110,0.05) 100%)',
          }}
        />
      </div>

      {/* Top section — Tier badge + Favorite + Trend */}
      <div className="absolute top-0 left-0 right-0 p-2 flex items-start justify-between z-10">
        {/* Tier badge — LoL style diamond */}
        <div
          className="relative px-2 py-0.5"
          style={{
            background: `linear-gradient(135deg, ${cfg.color}40, ${cfg.color}20)`,
            border: `1px solid ${cfg.color}60`,
            borderRadius: '2px',
            clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span className="text-[10px] font-black tracking-wider" style={{ color: cfg.color, textShadow: `0 0 8px ${cfg.color}60` }}>
            {tier}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Trend arrow */}
          {trend && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: trend === 'rising' ? 'rgba(15,186,129,0.2)' : 'rgba(232,64,87,0.2)', backdropFilter: 'blur(4px)' }}>
              {trend === 'rising' ? (
                <TrendingUp className="w-3 h-3 text-[#0fba81]" />
              ) : (
                <TrendingDown className="w-3 h-3 text-[#e84057]" />
              )}
            </div>
          )}
          {/* Favorite */}
          {showFavorite && (
            <button
              onClick={e => e.stopPropagation()}
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backdropFilter: 'blur(4px)' }}
            >
              <Star className={`w-3.5 h-3.5 transition-colors ${isFavorite ? 'text-[#f0c646]' : 'text-[#5b5a56]'}`} fill={isFavorite ? '#f0c646' : 'none'} />
            </button>
          )}
        </div>
      </div>

      {/* Bottom content panel — LoL card style */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
        {/* Champion icon + Name row */}
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className="w-8 h-8 rounded-lg overflow-hidden shrink-0"
            style={{
              border: `2px solid ${cfg.color}60`,
              boxShadow: `0 0 8px ${cfg.color}20`,
            }}
          >
            <Image
              src={`https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${name.replace(/['\s.]/g, '')}_0.jpg`}
              alt=""
              width={32}
              height={32}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={e => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`${sc.nameSize} lol-title text-[#f0e6d2] leading-tight truncate`} style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
              {name}
            </h3>
            <RoleBadge role={role} />
          </div>
        </div>

        {/* Stats — WR / Pick / Ban */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-1">
            <span className={`${sc.statSize} font-mono font-bold`} style={{ color: wrColor }}>{winRate}%</span>
            <span className="text-[7px] text-[#5b5a56] uppercase">WR</span>
          </div>
          <div className="w-px h-2.5 bg-[#785a28]/30" />
          <div className="flex items-center gap-1">
            <span className={`${sc.statSize} font-mono text-[#a09b8c]`}>{pickRate}%</span>
            <span className="text-[7px] text-[#5b5a56] uppercase">Pick</span>
          </div>
          {size !== 'sm' && banRate > 0 && (
            <>
              <div className="w-px h-2.5 bg-[#785a28]/30" />
              <div className="flex items-center gap-1">
                <span className={`${sc.statSize} font-mono`} style={{ color: banRate > 5 ? '#e84057' : '#a09b8c' }}>{banRate}%</span>
                <span className="text-[7px] text-[#5b5a56] uppercase">Ban</span>
              </div>
            </>
          )}
        </div>

        {/* WR mini bar */}
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(120,90,40,0.15)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${wrColor}80, ${wrColor})` }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((winRate / 58) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Weekly chart (XL only) */}
        {showWeeklyChart && size === 'xl' && (
          <div className="mt-2">
            <WeeklyWRChart championName={name} currentWR={winRate} compact />
          </div>
        )}
      </div>
    </motion.div>
  );
}
