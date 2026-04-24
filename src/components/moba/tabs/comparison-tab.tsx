'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, Search, X, ArrowRight, Sparkles, AlertTriangle, Crosshair, Users, ChevronDown, TrendingUp, Shield, Zap, Target, Star } from 'lucide-react';
import { ChampionIcon, TinyChampionIcon } from '../champion-icon';
import { RoleBadge } from '../badges';
import { TIER_CONFIG, ROLE_CONFIG } from '../constants';
import { getChampionSplashUrl } from '../helpers';
import type { Champion, GameSelection } from '../types';

interface ComparisonTabProps {
  champions: Champion[];
  loading: boolean;
  selectedGame: GameSelection;
  onChampionClick: (c: Champion) => void;
}

// ============================================================
// Stat Bar Component
// ============================================================
function StatBar({ label, value1, value2, format = '%', higherIsBetter = true }: {
  label: string;
  value1: number;
  value2: number;
  format?: string;
  higherIsBetter?: boolean;
}) {
  const maxVal = Math.max(value1, value2, 0.01);
  const pct1 = (value1 / maxVal) * 100;
  const pct2 = (value2 / maxVal) * 100;
  const diff = Math.abs(value1 - value2);
  const winner = higherIsBetter
    ? (value1 > value2 ? 1 : value2 > value1 ? 2 : 0)
    : (value1 < value2 ? 1 : value2 < value1 ? 2 : 0);

  const barColor = (val: number) => {
    if (label.includes('Ban')) return val > 5 ? '#e84057' : val > 2 ? '#f0c646' : '#a09b8c';
    if (label.includes('WR')) return val >= 53 ? '#0fba81' : val >= 51 ? '#0acbe6' : val >= 49 ? '#f0c646' : '#e84057';
    return '#f0c646';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold" style={{ color: barColor(value1) }}>
          {value1}{format}
        </span>
        <span className="text-[9px] text-[#5b5a56] uppercase tracking-wider">{label}</span>
        <span className="text-[11px] font-mono font-bold" style={{ color: barColor(value2) }}>
          {value2}{format}
        </span>
      </div>
      {/* Dual bars from center */}
      <div className="flex items-center gap-1 h-2">
        <div className="flex-1 flex justify-end">
          <motion.div
            className="h-full rounded-l-full"
            style={{ background: barColor(value1), width: `${pct1}%`, minWidth: '4px' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct1}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <div className="w-px h-full bg-[#785a28]/30" />
        <div className="flex-1">
          <motion.div
            className="h-full rounded-r-full"
            style={{ background: barColor(value2), width: `${pct2}%`, minWidth: '4px' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct2}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
      {/* Difference indicator */}
      {diff > 0 && winner > 0 && (
        <p className="text-[8px] text-center" style={{ color: winner === 1 ? '#0fba81' : '#0fba81' }}>
          <span style={{ color: winner === 1 ? '#0fba81' : '#e84057' }}>
            {winner === 1 ? '←' : '→'}
          </span>
          {' '}{diff.toFixed(1)}{format} {' '}
          <span style={{ color: winner === 1 ? '#0fba81' : '#e84057' }}>
            {winner === 1 ? '←' : '→'}
          </span>
        </p>
      )}
    </div>
  );
}

// ============================================================
// Champion Selector Dropdown
// ============================================================
function ChampionSelector({
  champions,
  selected,
  onSelect,
  placeholder,
  excludeId,
  side,
}: {
  champions: Champion[];
  selected: Champion | null;
  onSelect: (c: Champion) => void;
  placeholder: string;
  excludeId?: number;
  side: 'left' | 'right';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query) return champions.filter(c => c.id !== excludeId).slice(0, 15);
    const q = query.toLowerCase();
    return champions.filter(c => c.id !== excludeId && (c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q))).slice(0, 10);
  }, [champions, query, excludeId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        onClick={() => { setIsOpen(!isOpen); setQuery(''); }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left"
        style={{
          background: selected ? `linear-gradient(135deg, ${TIER_CONFIG[selected.tier]?.color || '#c8aa6e'}10, transparent)` : 'rgba(30,35,40,0.5)',
          border: selected ? `1.5px solid ${TIER_CONFIG[selected.tier]?.color || '#c8aa6e'}40` : '1.5px solid rgba(120,90,40,0.25)',
        }}
      >
        {selected ? (
          <>
            <ChampionIcon name={selected.name} tier={selected.tier} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#f0e6d2] truncate lol-title">{selected.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <RoleBadge role={selected.role} />
                <span className="text-[10px] font-mono" style={{ color: TIER_CONFIG[selected.tier]?.color }}>
                  {selected.tier} Tier
                </span>
              </div>
            </div>
            {selected && (
              <button
                onClick={(e) => { e.stopPropagation(); onSelect(null as unknown as Champion); }}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Limpiar selección"
              >
                <X className="w-3.5 h-3.5 text-[#5b5a56]" />
              </button>
            )}
          </>
        ) : (
          <>
            <GitCompare className="w-5 h-5 text-[#785a28]" />
            <span className="text-sm text-[#5b5a56]">{placeholder}</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 rounded-xl overflow-hidden z-50 max-h-72 overflow-y-auto scrollbar-none"
            style={{
              background: 'rgba(30,35,40,0.98)',
              border: '1px solid rgba(200,170,110,0.25)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Search input */}
            <div className="sticky top-0 z-10 px-3 py-2" style={{ background: 'rgba(30,35,40,0.98)', borderBottom: '1px solid rgba(120,90,40,0.15)' }}>
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[#5b5a56]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar campeón..."
                  className="flex-1 bg-transparent text-xs text-[#f0e6d2] placeholder:text-[#5b5a56] outline-none"
                  autoFocus
                />
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-[#5b5a56]">No se encontraron campeones</p>
              </div>
            ) : (
              filtered.map(champ => (
                <button
                  key={champ.id}
                  onClick={() => { onSelect(champ); setIsOpen(false); setQuery(''); }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#c8aa6e]/10 transition-colors"
                >
                  <ChampionIcon name={champ.name} tier={champ.tier} />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-semibold text-[#f0e6d2] truncate">{champ.name}</p>
                    <p className="text-[9px] text-[#5b5a56]">{champ.role} · {champ.winRate}% WR</p>
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: TIER_CONFIG[champ.tier]?.color }}>
                    {champ.tier}
                  </span>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Champion Comparison Card (one side)
// ============================================================
function ChampionComparisonCard({ champion, side }: { champion: Champion; side: 'left' | 'right' }) {
  const cfg = TIER_CONFIG[champion.tier];
  const roleCfg = ROLE_CONFIG[champion.role];
  const [imgError, setImgError] = useState(false);
  const splashUrl = getChampionSplashUrl(champion.name, 0);

  const counterNames = champion.counterPick
    ? champion.counterPick.split(/[,;\—]/).map(s => s.replace(/\(.*?\)/g, '').trim()).filter(n => n.length > 0 && n !== champion.name)
    : [];

  const synNames = champion.synergy
    ? champion.synergy.split(/[,;—]/).map(s => s.replace(/—.*/g, '').replace(/\(.*?\)/g, '').trim()).filter(n => n.length > 0 && n !== champion.name && n.length < 25)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: side === 'right' ? 0.15 : 0 }}
      className="flex-1 min-w-0 space-y-3"
    >
      {/* Splash Art Header */}
      <div className="relative rounded-xl overflow-hidden" style={{ height: '140px', border: `1.5px solid ${cfg.color}40` }}>
        {!imgError ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${splashUrl})`, filter: 'brightness(0.5) contrast(1.1) saturate(1.2)' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${cfg.color}20, rgba(10,14,26,0.8))` }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(10,14,26,0.95) 100%)' }} />
        {/* Gold accent top */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />
        {/* Champion name + badges */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-black text-[#f0e6d2] lol-title">{champion.name}</span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-black"
              style={{ backgroundColor: cfg.color, color: '#0a0e1a' }}
            >
              {champion.tier}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RoleBadge role={champion.role} />
            <span className="text-[9px] text-[#5b5a56] font-mono">P{champion.patch}</span>
          </div>
        </div>
      </div>

      {/* Counters */}
      {counterNames.length > 0 && (
        <div className="rounded-lg p-2.5" style={{ background: 'rgba(232,64,87,0.06)', border: '1px solid rgba(232,64,87,0.15)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Crosshair className="w-3 h-3 text-[#e84057]" />
            <span className="text-[9px] font-semibold text-[#e84057] uppercase tracking-wider">Counters</span>
          </div>
          <div className="flex items-center gap-2">
            {counterNames.slice(0, 3).map(name => (
              <div key={name} className="flex flex-col items-center gap-0.5">
                <TinyChampionIcon name={name} />
                <span className="text-[7px] text-[#a09b8c] leading-none truncate max-w-[36px] text-center">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synergies */}
      {synNames.length > 0 && (
        <div className="rounded-lg p-2.5" style={{ background: 'rgba(10,203,230,0.06)', border: '1px solid rgba(10,203,230,0.15)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="w-3 h-3 text-[#0acbe6]" />
            <span className="text-[9px] font-semibold text-[#0acbe6] uppercase tracking-wider">Sinergias</span>
          </div>
          <div className="flex items-center gap-2">
            {synNames.slice(0, 3).map(name => (
              <div key={name} className="flex flex-col items-center gap-0.5">
                <TinyChampionIcon name={name} />
                <span className="text-[7px] text-[#a09b8c] leading-none truncate max-w-[36px] text-center">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Broken Things */}
      {champion.brokenThings && champion.brokenThings.length > 0 && (
        <div className="rounded-lg p-2.5" style={{ background: 'rgba(232,64,87,0.04)', border: '1px solid rgba(232,64,87,0.12)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-3 h-3 text-[#e84057]" />
            <span className="text-[9px] font-semibold text-[#e84057] uppercase tracking-wider">Cosas Rotas</span>
          </div>
          <div className="space-y-1">
            {champion.brokenThings.slice(0, 3).map((thing, i) => (
              <p key={i} className="text-[9px] text-[#a09b8c] leading-snug">
                <span className="text-[#e84057] mr-1">▸</span>{thing}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {champion.aiAnalysis && (
        <div className="rounded-lg p-2.5" style={{ background: 'rgba(200,170,110,0.04)', border: '1px solid rgba(200,170,110,0.15)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3 h-3 text-[#c8aa6e]" />
            <span className="text-[9px] font-semibold text-[#c8aa6e] uppercase tracking-wider">Análisis IA</span>
          </div>
          <p className="text-[9px] text-[#a09b8c] leading-relaxed">{champion.aiAnalysis.slice(0, 200)}{champion.aiAnalysis.length > 200 ? '...' : ''}</p>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// Main Comparison Tab
// ============================================================
export function ComparisonTab({ champions, loading, selectedGame, onChampionClick }: ComparisonTabProps) {
  const [champ1, setChamp1] = useState<Champion | null>(null);
  const [champ2, setChamp2] = useState<Champion | null>(null);

  const gameChampions = champions.filter(c => {
    if (selectedGame === 'lol' && c.game !== 'LoL') return false;
    if (selectedGame === 'wildrift' && c.game !== 'WR') return false;
    return true;
  });

  const showComparison = champ1 && champ2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,170,110,0.12)', border: '1px solid rgba(200,170,110,0.25)' }}>
          <GitCompare className="w-5 h-5 text-[#c8aa6e]" />
        </div>
        <div>
          <h2 className="lol-title text-lg text-[#f0e6d2]">Comparar Campeones</h2>
          <p className="text-xs text-[#5b5a56]">Analiza dos campeones lado a lado</p>
        </div>
      </div>

      {/* Champion Selectors */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <ChampionSelector
          champions={gameChampions}
          selected={champ1}
          onSelect={c => setChamp1(c)}
          placeholder="Seleccionar campeón 1"
          excludeId={champ2?.id}
          side="left"
        />
        <div className="flex items-center justify-center sm:justify-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(200,170,110,0.1)', border: '1.5px solid rgba(200,170,110,0.25)' }}>
            <span className="text-sm font-black text-[#c8aa6e]">VS</span>
          </div>
        </div>
        <ChampionSelector
          champions={gameChampions}
          selected={champ2}
          onSelect={c => setChamp2(c)}
          placeholder="Seleccionar campeón 2"
          excludeId={champ1?.id}
          side="right"
        />
      </div>

      {/* Comparison Panel */}
      <AnimatePresence mode="wait">
        {showComparison ? (
          <motion.div
            key="comparison"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Gold accent divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,170,110,0.3), transparent)' }} />
              <span className="text-[10px] text-[#785a28] tracking-wider">COMPARACIÓN DIRECTA</span>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,170,110,0.3), transparent)' }} />
            </div>

            {/* Stat Bars — centered comparison */}
            <div className="glass-card rounded-xl p-5 space-y-4" style={{ border: '1px solid rgba(200,170,110,0.2)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ChampionIcon name={champ1.name} tier={champ1.tier} />
                  <span className="text-sm font-bold text-[#f0e6d2]">{champ1.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#f0e6d2]">{champ2.name}</span>
                  <ChampionIcon name={champ2.name} tier={champ2.tier} />
                </div>
              </div>

              <StatBar label="Win Rate" value1={champ1.winRate} value2={champ2.winRate} />
              <StatBar label="Pick Rate" value1={champ1.pickRate} value2={champ2.pickRate} />
              <StatBar label="Ban Rate" value1={champ1.banRate} value2={champ2.banRate} higherIsBetter={false} />

              {champ1.proPickRate !== undefined && champ2.proPickRate !== undefined && (
                <StatBar label="Pro Pick" value1={champ1.proPickRate} value2={champ2.proPickRate} />
              )}

              {/* Role & Tier comparison */}
              <div className="flex items-center justify-between pt-2 mt-2" style={{ borderTop: '1px solid rgba(120,90,40,0.15)' }}>
                <div className="flex items-center gap-2">
                  <RoleBadge role={champ1.role} />
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black" style={{ backgroundColor: TIER_CONFIG[champ1.tier]?.color, color: '#0a0e1a' }}>
                    {champ1.tier} Tier
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black" style={{ backgroundColor: TIER_CONFIG[champ2.tier]?.color, color: '#0a0e1a' }}>
                    {champ2.tier} Tier
                  </span>
                  <RoleBadge role={champ2.role} />
                </div>
              </div>
            </div>

            {/* Champion Cards — Side by Side on md+, stacked on mobile */}
            <div className="flex flex-col md:flex-row gap-4">
              <ChampionComparisonCard champion={champ1} side="left" />
              <div className="hidden md:block w-px bg-[#785a28]/15 shrink-0" />
              <div className="md:hidden h-px bg-[#785a28]/15" />
              <ChampionComparisonCard champion={champ2} side="right" />
            </div>

            {/* Clickable hint */}
            <div className="text-center">
              <p className="text-[10px] text-[#5b5a56]">
                Haz clic en cualquier campeón para ver más detalles →
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-xl p-12 text-center"
            style={{ border: '1px solid rgba(120,90,40,0.15)' }}
          >
            <GitCompare className="w-12 h-12 mx-auto mb-4 text-[#785a28]/30" />
            <p className="text-sm text-[#a09b8c] mb-2">Selecciona dos campeones para comparar</p>
            <p className="text-xs text-[#5b5a56]">
              Elige un campeón en cada selector para ver la comparación directa
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
