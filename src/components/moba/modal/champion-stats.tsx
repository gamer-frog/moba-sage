'use client';

import { motion } from 'framer-motion';
import type { Champion } from '../types';
import { wrStatColor } from './helpers';

interface ChampionStatsRowProps {
  champion: Champion;
  tierColor: string;
}

export function ChampionStatsRow({ champion, tierColor }: ChampionStatsRowProps) {
  return (
    <motion.div
      className="flex items-stretch gap-2 mt-4 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(10,14,26,0.6)',
        border: `1px solid ${tierColor}20`,
        backdropFilter: 'blur(16px)',
      }}
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.25 }}
    >
      {[
        { label: 'Win Rate', value: champion.winRate, suffix: '%' },
        { label: 'Pick Rate', value: champion.pickRate, suffix: '%' },
        { label: 'Ban Rate', value: champion.banRate, suffix: '%' },
        ...(champion.proPickRate ? [{ label: 'Pro Pick', value: champion.proPickRate, suffix: '%' }] : []),
      ].map((stat, i) => (
        <div
          key={stat.label}
          className="flex-1 text-center px-2 py-2.5"
          style={{ borderRight: i < 3 ? '1px solid rgba(120,90,40,0.15)' : 'none' }}
        >
          <p
            className="text-lg font-mono font-bold leading-tight"
            style={{
              color: wrStatColor(stat.value, stat.label),
              textShadow: `0 0 12px ${wrStatColor(stat.value, stat.label)}30`,
            }}
          >
            {stat.value}{stat.suffix}
          </p>
          <p className="text-[8px] text-[#5b5a56] uppercase tracking-widest mt-0.5">{stat.label}</p>
        </div>
      ))}
    </motion.div>
  );
}
