'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X, ChevronRight, Trophy, Target, Star, Zap, Shield, Swords, ArrowDown, Crosshair } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TinyChampionIcon, SplashArtIcon } from '../champion-icon';
import type { BrokenCombo, GameSelection } from '../types';

// Combo type detection from description keywords
type ComboType = 'Burst' | 'Poke' | 'Engage' | 'Dive' | 'Peel' | null;

const COMBO_TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; icon: typeof Zap }> = {
  'Burst': { color: '#e84057', bg: 'rgba(232,64,87,0.1)', border: 'rgba(232,64,87,0.3)', icon: Zap },
  'Poke': { color: '#0acbe6', bg: 'rgba(10,203,230,0.1)', border: 'rgba(10,203,230,0.3)', icon: Crosshair },
  'Engage': { color: '#c8aa6e', bg: 'rgba(200,170,110,0.1)', border: 'rgba(200,170,110,0.3)', icon: Shield },
  'Dive': { color: '#f0c646', bg: 'rgba(240,198,70,0.1)', border: 'rgba(240,198,70,0.3)', icon: ArrowDown },
  'Peel': { color: '#0fba81', bg: 'rgba(15,186,129,0.1)', border: 'rgba(15,186,129,0.3)', icon: Swords },
};

function detectComboType(description: string): ComboType {
  const desc = description.toLowerCase();
  if (/burst|explosi|one-shot|instakill|daño instant|eliminaci.rápida|burstear/.test(desc)) return 'Burst';
  if (/poke|daño sostenido| harass|ataque a distancia|pokear|dac/.test(desc)) return 'Poke';
  if (/engage|iniciar|iniciaci.hroe|teamfight|entrar|engagear|start/.test(desc)) return 'Engage';
  if (/dive|sumergir|salto|saltar|profundidad|inmersion|bruscar/.test(desc)) return 'Dive';
  if (/peel|proteger|guardi.hroe de acompa.ar|defender|supresar|cc/.test(desc)) return 'Peel';
  return null;
}

// Difficulty rating parser
function getDifficultyRating(difficulty: string): number {
  const d = difficulty.toLowerCase();
  if (/dif.cil|hard|expert|avanzado|difícil|alta/.test(d)) return 3;
  if (/media|medium|moderada|moderate|intermed/.test(d)) return 2;
  return 1; // fácil / easy / low
}

function DifficultyStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map(i => (
        <Star
          key={i}
          className="w-3 h-3"
          style={{
            color: i <= rating ? '#c8aa6e' : 'rgba(120,90,40,0.25)',
            fill: i <= rating ? '#c8aa6e' : 'transparent',
          }}
        />
      ))}
    </div>
  );
}

export function CombosTab({ combos, loading, selectedGame }: { combos: BrokenCombo[]; loading: boolean; selectedGame: GameSelection }) {
  const [sizeFilter, setSizeFilter] = useState<number | null>(null);
  const [expandedCombo, setExpandedCombo] = useState<number | null>(null);
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
            const isExpanded = expandedCombo === combo.id;
            const diffRating = getDifficultyRating(combo.difficulty);
            const comboType = detectComboType(combo.description);
            const comboTypeCfg = comboType ? COMBO_TYPE_CONFIG[comboType] : null;

            return (
              <div key={combo.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="glass-card rounded-xl p-4 cursor-pointer hover:border-[#e84057]/30 transition-all duration-300 group"
                  style={{ border: '1px solid rgba(120,90,40,0.12)' }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setExpandedCombo(isExpanded ? null : combo.id)}
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
                  <p className="text-[11px] text-[#a09b8c] mt-1 leading-relaxed line-clamp-2">{combo.description}</p>

                  {/* Badges row */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {/* Win Rate */}
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: combo.winRate >= 57 ? 'rgba(10,203,230,0.1)' : 'rgba(160,155,140,0.1)', color: combo.winRate >= 57 ? '#0acbe6' : '#a09b8c', border: `1px solid ${combo.winRate >= 57 ? 'rgba(10,203,230,0.3)' : 'rgba(160,155,140,0.2)'}` }}>
                      {combo.winRate}% WR
                    </span>

                    {/* Difficulty label */}
                    <span className="text-[9px] px-2 py-0.5 rounded" style={{ backgroundColor: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>
                      {combo.difficulty}
                    </span>

                    {/* Combo Type Badge */}
                    {comboTypeCfg && (
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1"
                        style={{ backgroundColor: comboTypeCfg.bg, color: comboTypeCfg.color, border: `1px solid ${comboTypeCfg.border}` }}
                      >
                        {(() => { const Icon = comboTypeCfg.icon; return <Icon className="w-2.5 h-2.5" />; })()}
                        {comboType}
                      </span>
                    )}

                    <span className="text-[9px] text-[#5b5a56] ml-auto">
                      {combo.champions.length} campeón{combo.champions.length > 1 ? 'es' : ''}
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4 text-[#785a28]" />
                    </motion.div>
                  </div>

                  {/* Difficulty Stars */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] text-[#5b5a56]">Dificultad:</span>
                    <DifficultyStars rating={diffRating} />
                  </div>
                </motion.div>

                {/* Inline Expansion Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 p-4 rounded-xl" style={{ background: 'rgba(30,35,40,0.5)', border: '1px solid rgba(120,90,40,0.15)' }}>
                        {/* Champions with icons */}
                        <div className="mb-3">
                          <span className="lol-label text-[10px] text-[#c8aa6e] mb-2 block">Campeones</span>
                          <div className="flex items-center gap-3 flex-wrap">
                            {combo.champions.map((name) => (
                              <div key={name} className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{ background: 'rgba(200,170,110,0.06)', border: '1px solid rgba(200,170,110,0.12)' }}>
                                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0" style={{ border: '1.5px solid rgba(200,170,110,0.3)' }}>
                                  <SplashArtIcon name={name} />
                                </div>
                                <span className="text-xs font-semibold text-[#f0e6d2]">{name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(10,203,230,0.06)', border: '1px solid rgba(10,203,230,0.1)' }}>
                            <Trophy className="w-3.5 h-3.5 mx-auto mb-1 text-[#0acbe6]" />
                            <span className="text-xs font-mono font-bold text-[#0acbe6]">{combo.winRate}%</span>
                            <p className="text-[9px] text-[#5b5a56]">Win Rate</p>
                          </div>
                          <div className="text-center p-2 rounded-lg" style={{ background: dc.bg, border: `1px solid ${dc.border}` }}>
                            <Target className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: dc.text }} />
                            <span className="text-xs font-semibold" style={{ color: dc.text }}>{combo.difficulty}</span>
                            <p className="text-[9px] text-[#5b5a56]">Dificultad</p>
                          </div>
                          <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(200,170,110,0.06)', border: '1px solid rgba(200,170,110,0.1)' }}>
                            <Flame className="w-3.5 h-3.5 mx-auto mb-1 text-[#c8aa6e]" />
                            <span className="text-xs font-semibold text-[#c8aa6e]">{combo.champions.length}</span>
                            <p className="text-[9px] text-[#5b5a56]">Campeones</p>
                          </div>
                        </div>

                        {/* Combo Type + Difficulty Stars in detail */}
                        <div className="flex items-center gap-4 mb-3 p-2 rounded-lg" style={{ background: 'rgba(10,14,26,0.4)', border: '1px solid rgba(120,90,40,0.1)' }}>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-[#5b5a56]">Tipo:</span>
                            {comboTypeCfg ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1" style={{ backgroundColor: comboTypeCfg.bg, color: comboTypeCfg.color, border: `1px solid ${comboTypeCfg.border}` }}>
                                {(() => { const Icon = comboTypeCfg.icon; return <Icon className="w-3 h-3" />; })()}
                                {comboType}
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#5b5a56]">Mixto</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-[#5b5a56]">Dificultad:</span>
                            <DifficultyStars rating={diffRating} />
                          </div>
                        </div>

                        {/* Full description */}
                        <div>
                          <span className="lol-label text-[10px] text-[#c8aa6e] mb-1 block">Por qué funciona</span>
                          <p className="text-xs text-[#a09b8c] leading-relaxed">{combo.description}</p>
                        </div>

                        {/* Close button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedCombo(null); }}
                          className="mt-3 w-full py-1.5 rounded-lg text-[10px] text-[#5b5a56] hover:text-[#a09b8c] transition-colors text-center"
                          style={{ background: 'rgba(120,90,40,0.08)', border: '1px solid rgba(120,90,40,0.1)' }}
                        >
                          Cerrar detalle
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
