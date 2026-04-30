'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { SkillIcon } from '../skill-icon';
import type { Champion } from '../types';
import {
  getAbilityName,
  GENERIC_ABILITY_DESCRIPTIONS,
} from '@/data/champion-data';

// ============================================================
// Ability tooltip helpers
// ============================================================

export function getAbilityDescription(champion: Champion, skill: 'Q'|'W'|'E'|'R'): string {
  if (champion.brokenThings && champion.brokenThings.length > 0) {
    const skillMention = champion.brokenThings.find(t => t.toLowerCase().includes(skill.toLowerCase()));
    if (skillMention) return skillMention;
  }
  if (champion.aiAnalysis) {
    const lines = champion.aiAnalysis.split(/[.\n]/);
    const relevant = lines.find(l => l.toLowerCase().includes(skill.toLowerCase()));
    if (relevant && relevant.length > 10) return relevant.trim();
  }
  return GENERIC_ABILITY_DESCRIPTIONS[skill];
}

// ============================================================
// Ability Section Component
// ============================================================

export function AbilitySection({ champion }: { champion: Champion }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(10,203,230,0.06), rgba(10,203,230,0.02))', border: '1px solid rgba(10,203,230,0.15)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-[#0acbe6]" />
        <span className="text-[10px] font-semibold text-[#0acbe6] uppercase tracking-wider">Habilidades</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(['Q', 'W', 'E', 'R'] as const).map(skill => {
          const skillColor = skill === 'Q' ? '#0acbe6' : skill === 'W' ? '#0fba81' : skill === 'E' ? '#f0c646' : '#e84057';
          return (
            <motion.div
              key={skill}
              className="flex gap-3 p-3 rounded-lg transition-colors"
              style={{
                background: 'rgba(20,25,32,0.6)',
                borderLeft: `3px solid ${skillColor}`,
              }}
              whileHover={{ background: 'rgba(30,35,40,0.8)' }}
            >
              <SkillIcon championName={champion.name} skill={skill} size={48} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-black" style={{ color: skillColor }}>{skill}</span>
                  <span className="text-xs font-semibold text-[#f0e6d2]">{getAbilityName(champion.name, skill)}</span>
                </div>
                <p className="text-xs text-[#a09b8c] leading-relaxed">
                  {getAbilityDescription(champion, skill)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
