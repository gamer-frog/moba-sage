'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TinyChampionIcon } from '../champion-icon';
import type { BrokenCombo, GameSelection } from '../types';

export function CombosTab({ combos, loading, selectedGame }: { combos: BrokenCombo[]; loading: boolean; selectedGame: GameSelection }) {
  const [sizeFilter, setSizeFilter] = useState<number | null>(null);
  const gameFilter = selectedGame === 'wildrift' ? 'WR' : 'LoL';
  const filtered = combos
    .filter(c => c.game === gameFilter)
    .filter(c => sizeFilter === null || c.champions.length === sizeFilter);

  const sizeOptions = [
    { value: null, label: 'Todos' },
    { value: 2, label: 'Dúos (2)' },
    { value: 3, label: 'Tríos (3)' },
    { value: 4, label: 'Cuartetos (4)' },
    { value: 5, label: 'Equipos (5)' },
  ];

  const diffColors: Record<string, { bg: string; border: string; text: string }> = {
    fácil: { bg: 'rgba(15,186,129,0.1)', border: 'rgba(15,186,129,0.3)', text: '#0fba81' },
    media: { bg: 'rgba(10,203,230,0.1)', border: 'rgba(10,203,230,0.3)', text: '#0acbe6' },
    difícil: { bg: 'rgba(232,64,87,0.1)', border: 'rgba(232,64,87,0.3)', text: '#e84057' },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Flame className="w-5 h-5 text-[#e84057]" />
        <div>
          <h2 className="lol-title text-lg text-[#f0e6d2]">Combos Rotos</h2>
          <p className="text-xs text-[#5b5a56]">Combinaciones más tóxicas del meta — Ordenadas por win rate</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {sizeOptions.map(opt => (
          <button
            key={String(opt.value)}
            onClick={() => setSizeFilter(opt.value)}
            className={`
              px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
              ${sizeFilter === opt.value
                ? 'bg-[#e84057]/15 text-[#e84057] border border-[#e84057]/30'
                : 'text-[#5b5a56] hover:text-[#a09b8c] hover:bg-[#1e2328]/40 border border-transparent'
              }
            `}
            aria-pressed={sizeFilter === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((combo, idx) => {
            const dc = diffColors[combo.difficulty] || diffColors.media;
            return (
              <motion.div
                key={combo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="glass-card rounded-xl p-4 cursor-pointer hover:border-[#e84057]/30 transition-all duration-300 group"
                style={{ border: '1px solid rgba(120,90,40,0.12)' }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  {combo.champions.map((name, i) => (
                    <div key={name} className="flex items-center gap-2">
                      <TinyChampionIcon name={name} />
                      {i < combo.champions.length - 1 && (
                        <span className="text-[10px] text-[#785a28] font-bold">+</span>
                      )}
                    </div>
                  ))}
                </div>
                <h3 className="text-sm font-bold text-[#f0e6d2] group-hover:text-[#e84057] transition-colors">{combo.name}</h3>
                <p className="text-[11px] text-[#a09b8c] mt-1 leading-relaxed">{combo.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: combo.winRate >= 57 ? 'rgba(10,203,230,0.1)' : 'rgba(160,155,140,0.1)', color: combo.winRate >= 57 ? '#0acbe6' : '#a09b8c', border: `1px solid ${combo.winRate >= 57 ? 'rgba(10,203,230,0.3)' : 'rgba(160,155,140,0.2)'}` }}>
                    {combo.winRate}% WR
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded" style={{ backgroundColor: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>
                    {combo.difficulty}
                  </span>
                  <span className="text-[9px] text-[#5b5a56] ml-auto">
                    {combo.champions.length} champ{combo.champions.length > 1 ? 's' : ''}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-[#5b5a56]">
          <Flame className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No hay combos para este filtro</p>
        </div>
      )}
    </div>
  );
}
