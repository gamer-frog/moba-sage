'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, Search, X, Sparkles, AlertTriangle, Crosshair, Users } from 'lucide-react';
import { ChampionIcon, TinyChampionIcon } from '../champion-icon';
import { RoleBadge } from '../badges';
import { TIER_CONFIG } from '../constants';
import { getChampionSplashUrl } from '../helpers';
import type { Champion, GameSelection } from '../types';

interface ComparisonTabProps {
  champions: Champion[];
  selectedGame: GameSelection;
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

  const getBarClasses = (val: number): { text: string; bg: string } => {
    if (label.includes('Ban')) {
      if (val > 5) return { text: 'text-lol-danger', bg: 'bg-lol-danger' };
      if (val > 2) return { text: 'text-lol-warning', bg: 'bg-lol-warning' };
      return { text: 'text-lol-muted', bg: 'bg-lol-muted' };
    }
    if (label.includes('WR')) {
      if (val >= 53) return { text: 'text-lol-green', bg: 'bg-lol-green' };
      if (val >= 51) return { text: 'text-lol-success', bg: 'bg-lol-success' };
      if (val >= 49) return { text: 'text-lol-warning', bg: 'bg-lol-warning' };
      return { text: 'text-lol-danger', bg: 'bg-lol-danger' };
    }
    return { text: 'text-lol-warning', bg: 'bg-lol-warning' };
  };

  const cls1 = getBarClasses(value1);
  const cls2 = getBarClasses(value2);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-mono font-bold ${cls1.text}`}>
          {value1}{format}
        </span>
        <span className="text-[10px] text-lol-dim uppercase tracking-wider">{label}</span>
        <span className={`text-[11px] font-mono font-bold ${cls2.text}`}>
          {value2}{format}
        </span>
      </div>
      {/* Dual bars from center */}
      <div className="flex items-center gap-1 h-2">
        <div className="flex-1 flex justify-end">
          <motion.div
            className={`h-full rounded-l-full ${cls1.bg}`}
            style={{ width: `${pct1}%`, minWidth: '4px' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct1}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <div className="w-px h-full bg-lol-gold-dark/30" />
        <div className="flex-1">
          <motion.div
            className={`h-full rounded-r-full ${cls2.bg}`}
            style={{ width: `${pct2}%`, minWidth: '4px' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct2}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
      {/* Difference indicator */}
      {diff > 0 && winner > 0 && (
        <p className={`text-[10px] text-center ${winner === 1 ? 'text-lol-green' : 'text-lol-danger'}`}>
          {winner === 1 ? '← ' : '→ '}{diff.toFixed(1)}{format}
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
}: {
  champions: Champion[];
  selected: Champion | null;
  onSelect: (c: Champion | null) => void;
  placeholder: string;
  excludeId?: number;
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
        aria-expanded={isOpen}
        aria-haspopup="listbox"
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
              <p className="text-sm font-semibold text-lol-text truncate lol-title">{selected.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <RoleBadge role={selected.role} />
                <span className="text-[10px] font-mono" style={{ color: TIER_CONFIG[selected.tier]?.color }}>
                  {selected.tier} Tier
                </span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(null); }}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Limpiar selección"
            >
              <X className="w-3.5 h-3.5 text-lol-dim" />
            </button>
          </>
        ) : (
          <>
            <GitCompare className="w-5 h-5 text-lol-gold-dark" />
            <span className="text-sm text-lol-dim">{placeholder}</span>
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
            className="absolute top-full mt-2 left-0 right-0 rounded-xl overflow-hidden z-50 max-h-72 overflow-y-auto scrollbar-none border border-lol-gold/25"
            role="listbox"
            style={{
              background: 'rgba(30,35,40,0.98)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Search input */}
            <div className="sticky top-0 z-10 px-3 py-2 border-b border-lol-gold-dark/15" style={{ background: 'rgba(30,35,40,0.98)' }}>
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-lol-dim" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar campeón..."
                  className="flex-1 bg-transparent text-xs text-lol-text placeholder:text-lol-dim outline-none"
                  autoFocus
                />
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-lol-dim">No se encontraron campeones</p>
              </div>
            ) : (
              filtered.map(champ => (
                <button
                  key={champ.id}
                  role="option"
                  aria-selected={selected?.id === champ.id}
                  onClick={() => { onSelect(champ); setIsOpen(false); setQuery(''); }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-lol-gold/10 transition-colors"
                >
                  <ChampionIcon name={champ.name} tier={champ.tier} />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-semibold text-lol-text truncate">{champ.name}</p>
                    <p className="text-[10px] text-lol-dim">{champ.role} · {champ.winRate}% WR</p>
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
  const cfg = TIER_CONFIG[champion.tier] || TIER_CONFIG['B'];
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
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${splashUrl})`, filter: 'brightness(0.5) contrast(1.1) saturate(1.2)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(10,14,26,0.95) 100%)' }} />
        {/* Gold accent top */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />
        {/* Champion name + badges */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-black text-lol-text lol-title">{champion.name}</span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-black"
              style={{ backgroundColor: cfg.color, color: '#0a0e1a' }}
            >
              {champion.tier}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RoleBadge role={champion.role} />
            <span className="text-[10px] text-lol-dim font-mono">P{champion.patch}</span>
          </div>
        </div>
      </div>

      {/* Counters */}
      {counterNames.length > 0 && (
        <div className="rounded-lg p-2.5 bg-lol-danger/6 border border-lol-danger/15">
          <div className="flex items-center gap-1.5 mb-2">
            <Crosshair className="w-3 h-3 text-lol-danger" />
            <span className="text-[10px] font-semibold text-lol-danger uppercase tracking-wider">Counters</span>
          </div>
          <div className="flex items-center gap-2">
            {counterNames.slice(0, 3).map(name => (
              <div key={name} className="flex flex-col items-center gap-0.5">
                <TinyChampionIcon name={name} />
                <span className="text-[10px] text-lol-muted leading-none truncate max-w-[36px] text-center">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synergies */}
      {synNames.length > 0 && (
        <div className="rounded-lg p-2.5 bg-lol-success/6 border border-lol-success/15">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="w-3 h-3 text-lol-success" />
            <span className="text-[10px] font-semibold text-lol-success uppercase tracking-wider">Sinergias</span>
          </div>
          <div className="flex items-center gap-2">
            {synNames.slice(0, 3).map(name => (
              <div key={name} className="flex flex-col items-center gap-0.5">
                <TinyChampionIcon name={name} />
                <span className="text-[10px] text-lol-muted leading-none truncate max-w-[36px] text-center">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Broken Things */}
      {champion.brokenThings && champion.brokenThings.length > 0 && (
        <div className="rounded-lg p-2.5 bg-lol-danger/[0.04] border border-lol-danger/12">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-3 h-3 text-lol-danger" />
            <span className="text-[10px] font-semibold text-lol-danger uppercase tracking-wider">Cosas Rotas</span>
          </div>
          <div className="space-y-1">
            {champion.brokenThings.slice(0, 3).map((thing, i) => (
              <p key={i} className="text-[10px] text-lol-muted leading-snug">
                <span className="text-lol-danger mr-1">▸</span>{thing}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {champion.aiAnalysis && (
        <div className="rounded-lg p-2.5 bg-lol-gold/[0.04] border border-lol-gold/15">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3 h-3 text-lol-gold" />
            <span className="text-[10px] font-semibold text-lol-gold uppercase tracking-wider">Análisis IA</span>
          </div>
          <p className="text-[10px] text-lol-muted leading-relaxed">{champion.aiAnalysis.slice(0, 200)}{champion.aiAnalysis.length > 200 ? '...' : ''}</p>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// Main Comparison Tab
// ============================================================
export function ComparisonTab({ champions, selectedGame }: ComparisonTabProps) {
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
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-lol-gold/12 border border-lol-gold/25">
          <GitCompare className="w-5 h-5 text-lol-gold" />
        </div>
        <div>
          <h2 className="lol-title text-lg text-lol-text">Comparar Campeones</h2>
          <p className="text-xs text-lol-dim">Analiza dos campeones lado a lado</p>
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
        />
        <div className="flex items-center justify-center sm:justify-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-lol-gold/10 border-[1.5px] border-lol-gold/25">
            <span className="text-sm font-black text-lol-gold">VS</span>
          </div>
        </div>
        <ChampionSelector
          champions={gameChampions}
          selected={champ2}
          onSelect={c => setChamp2(c)}
          placeholder="Seleccionar campeón 2"
          excludeId={champ1?.id}
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
              <span className="text-[10px] text-lol-gold-dark tracking-wider">COMPARACIÓN DIRECTA</span>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,170,110,0.3), transparent)' }} />
            </div>

            {/* Stat Bars — centered comparison */}
            <div className="glass-card rounded-xl p-5 space-y-4 border border-lol-gold/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ChampionIcon name={champ1.name} tier={champ1.tier} />
                  <span className="text-sm font-bold text-lol-text">{champ1.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-lol-text">{champ2.name}</span>
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
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-lol-gold-dark/15">
                <div className="flex items-center gap-2">
                  <RoleBadge role={champ1.role} />
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black" style={{ backgroundColor: TIER_CONFIG[champ1.tier]?.color, color: '#0a0e1a' }}>
                    {champ1.tier} Tier
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black" style={{ backgroundColor: TIER_CONFIG[champ2.tier]?.color, color: '#0a0e1a' }}>
                    {champ2.tier} Tier
                  </span>
                  <RoleBadge role={champ2.role} />
                </div>
              </div>
            </div>

            {/* Champion Cards — Side by Side on md+, stacked on mobile */}
            <div className="flex flex-col md:flex-row gap-4">
              <ChampionComparisonCard champion={champ1} side="left" />
              <div className="hidden md:block w-px bg-lol-gold-dark/15 shrink-0" />
              <div className="md:hidden h-px bg-lol-gold-dark/15" />
              <ChampionComparisonCard champion={champ2} side="right" />
            </div>

            {/* Clickable hint */}
            <div className="text-center">
              <p className="text-[10px] text-lol-dim">
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
            className="glass-card rounded-xl p-12 text-center border border-lol-gold-dark/15"
          >
            <GitCompare className="w-12 h-12 mx-auto mb-4 text-lol-gold-dark/30" />
            <p className="text-sm text-lol-muted mb-2">Selecciona dos campeones para comparar</p>
            <p className="text-xs text-lol-dim">
              Elige un campeón en cada selector para ver la comparación directa
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
