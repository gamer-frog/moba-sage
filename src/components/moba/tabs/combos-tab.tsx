'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Target, Star, Zap, Shield, Swords, ArrowDown, Crosshair, Users, ChevronLeft, CircleDot, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChampionIcon, SplashArtIcon, TinyChampionIcon, MicroChampionIcon } from '../champion-icon';
import { getChampionSplashUrl } from '../helpers';
import type { BrokenCombo, GameSelection } from '../types';
import { proComps } from '@/data/combos-data';

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
  if (/burst|explosi|one-shot|instakill|daño instant|eliminaci.rápida|burstear|inmune|inmortal|triple/.test(desc)) return 'Burst';
  if (/poke|daño sostenido| harass|ataque a distancia|pokear|dac/.test(desc)) return 'Poke';
  if (/engage|iniciar|iniciaci.hroe|teamfight|entrar|engagear|start|protect|peel/.test(desc)) return 'Engage';
  if (/dive|sumergir|salto|saltar|profundidad|inmersion|bruscar/.test(desc)) return 'Dive';
  return null;
}

// Difficulty rating parser
function getDifficultyRating(difficulty: string): number {
  const d = difficulty.toLowerCase();
  if (/dif.cil|hard|expert|avanzado|difícil|alta/.test(d)) return 3;
  if (/media|medium|moderada|moderate|intermed/.test(d)) return 2;
  return 1;
}

const DIFF_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  fácil: { bg: 'rgba(15,186,129,0.1)', border: 'rgba(15,186,129,0.3)', text: '#0fba81' },
  media: { bg: 'rgba(10,203,230,0.1)', border: 'rgba(10,203,230,0.3)', text: '#0acbe6' },
  difícil: { bg: 'rgba(232,64,87,0.1)', border: 'rgba(232,64,87,0.3)', text: '#e84057' },
};

function DifficultyStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-3 h-3';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map(i => (
        <Star
          key={i}
          className={cls}
          style={{
            color: i <= rating ? '#c8aa6e' : 'rgba(120,90,40,0.25)',
            fill: i <= rating ? '#c8aa6e' : 'transparent',
          }}
        />
      ))}
    </div>
  );
}


// ============ LEFT PANEL: Combo List Card ============
function ComboListCard({
  combo,
  isSelected,
  onClick,
  index,
}: {
  combo: BrokenCombo;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}) {
  const comboType = detectComboType(combo.description);
  const comboTypeCfg = comboType ? COMBO_TYPE_CONFIG[comboType] : null;
  const isMeta = combo.winRate >= 57;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      className={`
        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 group
        ${isSelected
          ? 'ring-1 ring-lol-gold/60 shadow-lg shadow-lol-gold/10'
          : 'hover:ring-1 hover:ring-lol-gold/25'
        }
      `}
      style={{
        background: isSelected
          ? 'linear-gradient(135deg, rgba(200,170,110,0.12), rgba(30,35,40,0.7))'
          : 'linear-gradient(135deg, rgba(30,35,40,0.5), rgba(20,24,30,0.4))',
        border: isSelected
          ? '1px solid rgba(200,170,110,0.35)'
          : '1px solid rgba(120,90,40,0.12)',
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: isMeta
            ? 'linear-gradient(90deg, #c8aa6e, #f0c646, #c8aa6e)'
            : isSelected
              ? 'linear-gradient(90deg, #c8aa6e, #c8aa6e40)'
              : 'linear-gradient(90deg, transparent, #5b5a56, transparent)',
        }}
      />

      {/* Selected indicator bar */}
      <div
        className={`
          absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-200
          ${isSelected ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          background: 'linear-gradient(180deg, #c8aa6e, #f0c646)',
        }}
      />

      <div className="p-3">
        {/* Champion portrait strip — like a mini team comp */}
        <div className="flex items-center gap-1 mb-2.5">
          {combo.champions.map((name, i) => (
            <div key={name} className="relative -ml-0.5 first:ml-0">
              <div
                className="transition-transform duration-200 group-hover:scale-105"
                style={{
                  filter: isMeta ? 'drop-shadow(0 0 4px rgba(232,64,87,0.35))' : 'none',
                }}
              >
                <TinyChampionIcon name={name} />
              </div>
              {i < combo.champions.length - 1 && (
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 z-10">
                  <span className="text-[10px] text-lol-gold font-bold">+</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Combo name */}
        <h3
          className={`
            text-xs font-bold leading-tight transition-colors duration-200
            ${isSelected ? 'text-lol-text' : 'text-lol-muted group-hover:text-lol-text'}
          `}
        >
          {combo.name}
        </h3>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 mt-2">
          {/* Win Rate */}
          <span
            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: isMeta ? 'rgba(10,203,230,0.12)' : 'rgba(160,155,140,0.08)',
              color: isMeta ? '#0acbe6' : '#a09b8c',
              border: `1px solid ${isMeta ? 'rgba(10,203,230,0.25)' : 'rgba(160,155,140,0.15)'}`,
            }}
          >
            {combo.winRate}% WR
          </span>

          {/* Meta tag */}
          {isMeta && (
            <span
              className="text-[10px] font-black px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(200,170,110,0.15)', color: '#c8aa6e', border: '1px solid rgba(200,170,110,0.3)' }}
            >
              META
            </span>
          )}

          {/* Combo type */}
          {comboTypeCfg && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5"
              style={{ backgroundColor: comboTypeCfg.bg, color: comboTypeCfg.color, border: `1px solid ${comboTypeCfg.border}` }}
            >
              {(() => { const Icon = comboTypeCfg.icon; return <Icon className="w-2.5 h-2.5" />; })()}
              {comboType}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============ RIGHT PANEL: Combo Detail ============
function ComboDetailPanel({ combo }: { combo: BrokenCombo }) {
  const dc = DIFF_COLORS[combo.difficulty] || DIFF_COLORS.media;
  const diffRating = getDifficultyRating(combo.difficulty);
  const comboType = detectComboType(combo.description);
  const comboTypeCfg = comboType ? COMBO_TYPE_CONFIG[comboType] : null;
  const isMeta = combo.winRate >= 57;
  const primaryChamp = combo.champions[0] || '';
  const splashUrl = getChampionSplashUrl(primaryChamp, 0);

  return (
    <motion.div
      key={combo.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-full flex flex-col"
    >
      {/* Hero banner with splash art background */}
      <div className="relative w-full h-40 sm:h-52 md:h-60 overflow-hidden rounded-t-xl">
        {/* Splash art bg */}
        <div className="absolute inset-0">
          <Image
            src={splashUrl}
            alt={primaryChamp}
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          {/* Dark overlay gradient */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, rgba(10,14,26,0.3) 0%, rgba(10,14,26,0.6) 40%, rgba(10,14,26,0.95) 85%, #0a0e1a 100%)',
          }} />
          {/* Side fade for readability */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(90deg, rgba(10,14,26,0.4), transparent 30%, transparent 70%, rgba(10,14,26,0.4))',
          }} />
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
          {/* Meta badge */}
          {isMeta && (
            <div className="mb-2">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-md inline-flex items-center gap-1" style={{
                background: 'linear-gradient(135deg, rgba(200,170,110,0.2), rgba(240,198,70,0.15))',
                color: '#c8aa6e',
                border: '1px solid rgba(200,170,110,0.4)',
                boxShadow: '0 0 12px rgba(200,170,110,0.15)',
              }}>
                <Sparkles className="w-3 h-3" />
                META — {combo.winRate}% Win Rate
              </span>
            </div>
          )}

          {/* Combo name */}
          <h2 className="lol-title text-xl sm:text-2xl md:text-3xl text-lol-text leading-tight drop-shadow-lg">
            {combo.name}
          </h2>

          {/* Champion portrait strip overlay */}
          <div className="flex items-end gap-2 mt-3 -mb-1">
            {combo.champions.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.25 }}
                className="flex flex-col items-center"
              >
                <div
                  className="relative rounded-lg overflow-hidden"
                  style={{
                    width: '56px',
                    height: '56px',
                    border: `2px solid ${isMeta ? 'rgba(200,170,110,0.5)' : 'rgba(120,90,40,0.35)'}`,
                    boxShadow: `0 2px 8px rgba(0,0,0,0.4), 0 0 10px ${isMeta ? 'rgba(200,170,110,0.15)' : 'rgba(0,0,0,0.2)'}`,
                    marginTop: `${i * 4}px`,
                  }}
                >
                  <SplashArtIcon name={name} />
                  {/* Role number */}
                  <div className="absolute bottom-0 inset-x-0 py-0.5 text-center" style={{
                    background: 'linear-gradient(transparent, rgba(10,14,26,0.9))',
                  }}>
                    <span className="text-[10px] font-black text-lol-gold">{i + 1}</span>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[10px] font-semibold text-lol-muted mt-1 max-w-[60px] truncate text-center">{name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="glass-card rounded-b-xl flex-1 overflow-y-auto scrollbar-thin" style={{ borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0, maxHeight: 'calc(100vh - 420px)' }}>
        <div className="p-4 sm:p-5 space-y-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Win Rate */}
            <div
              className="p-3 rounded-lg text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(10,203,230,0.08), rgba(10,203,230,0.03))',
                border: '1px solid rgba(10,203,230,0.15)',
              }}
            >
              <Trophy className="w-4 h-4 mx-auto mb-1.5" style={{ color: '#0acbe6' }} />
              <span className="text-lg font-mono font-bold block" style={{ color: isMeta ? '#0acbe6' : '#a09b8c' }}>{combo.winRate}%</span>
              <p className="text-[10px] text-lol-dim mt-0.5">Win Rate</p>
            </div>

            {/* Difficulty */}
            <div
              className="p-3 rounded-lg text-center"
              style={{ background: `${dc.bg}`, border: `1px solid ${dc.border}` }}
            >
              <Target className="w-4 h-4 mx-auto mb-1.5" style={{ color: dc.text }} />
              <span className="text-sm font-bold block" style={{ color: dc.text }}>{combo.difficulty}</span>
              <div className="mt-1">
                <DifficultyStars rating={diffRating} />
              </div>
            </div>

            {/* Combo Type */}
            <div
              className="p-3 rounded-lg text-center"
              style={{
                background: comboTypeCfg ? comboTypeCfg.bg : 'rgba(160,155,140,0.06)',
                border: comboTypeCfg ? `1px solid ${comboTypeCfg.border}` : '1px solid rgba(160,155,140,0.15)',
              }}
            >
              {comboTypeCfg ? (() => { const Icon = comboTypeCfg.icon; return <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: comboTypeCfg.color }} />; })() : <CircleDot className="w-4 h-4 mx-auto mb-1.5 text-lol-dim" />}
              <span className="text-sm font-bold block" style={{ color: comboTypeCfg ? comboTypeCfg.color : '#5b5a56' }}>
                {comboType || 'Mixto'}
              </span>
              <p className="text-[10px] text-lol-dim mt-0.5">Tipo</p>
            </div>

            {/* Champion Count */}
            <div
              className="p-3 rounded-lg text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(200,170,110,0.08), rgba(200,170,110,0.03))',
                border: '1px solid rgba(200,170,110,0.15)',
              }}
            >
              <Users className="w-4 h-4 mx-auto mb-1.5 text-lol-gold" />
              <span className="text-lg font-bold block text-lol-gold">{combo.champions.length}</span>
              <p className="text-[10px] text-lol-dim mt-0.5">
                {combo.champions.length === 2 ? 'Dúo' : combo.champions.length === 3 ? 'Trío' : combo.champions.length === 4 ? 'Cuarteto' : 'Equipo'}
              </p>
            </div>
          </div>

          {/* Difficulty progress bar */}
          <div className="p-3 rounded-lg" style={{ background: 'rgba(10,14,26,0.4)', border: '1px solid rgba(120,90,40,0.1)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="lol-label text-[10px] text-lol-dim">Dificultad de ejecución</span>
              <DifficultyStars rating={diffRating} size="lg" />
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(120,90,40,0.08)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${dc.text}30, ${dc.text})`,
                  boxShadow: `0 0 8px ${dc.text}25`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(diffRating / 3) * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Champions list with roles */}
          <div>
            <span className="lol-label text-[10px] text-lol-gold mb-2.5 block">Campeones</span>
            <div className="space-y-1.5">
              {combo.champions.map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 hover:bg-[rgba(200,170,110,0.06)]"
                  style={{ background: 'rgba(200,170,110,0.03)', border: '1px solid rgba(200,170,110,0.08)' }}
                >
                  <ChampionIcon name={name} tier={isMeta ? 'S' : 'A'} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-lol-text block truncate">{name}</span>
                    <span className="text-[10px] text-lol-dim">Posición {i + 1}</span>
                  </div>
                  {i === 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{
                      background: 'rgba(200,170,110,0.12)',
                      color: '#c8aa6e',
                      border: '1px solid rgba(200,170,110,0.3)',
                    }}>
                      KEY
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="lol-label text-[10px] text-lol-gold mb-2 block">Por qué funciona</span>
            <p className="text-xs text-lol-muted leading-relaxed">{combo.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


// ============ MAIN COMPONENT ============
export function CombosTab({ combos, loading, selectedGame }: { combos: BrokenCombo[]; loading: boolean; selectedGame: GameSelection }) {
  const [sizeFilter, setSizeFilter] = useState<number | null>(null);
  const [selectedComboId, setSelectedComboId] = useState<number | null>(null);
  
  const gameFilter = selectedGame === 'wildrift' ? 'WR' : 'LoL';
  const filtered = combos
    .filter(c => c.game === gameFilter)
    .filter(c => sizeFilter === null || c.champions.length === sizeFilter);

  // Derive effective selection — auto-select first if current is not in list
  const effectiveId = selectedComboId !== null && filtered.some(c => c.id === selectedComboId)
    ? selectedComboId
    : (filtered.length > 0 ? filtered[0].id : null);

  const selectedCombo = effectiveId !== null ? filtered.find(c => c.id === effectiveId) ?? null : null;

  // When user changes filter, reset to first item
  const handleSizeFilter = (val: number | null) => {
    setSizeFilter(val);
    setSelectedComboId(null); // will auto-resolve via effectiveId
  };

  const sizeOptions = [
    { value: null, label: 'Todos' },
    { value: 2, label: 'Dúos (2)' },
    { value: 3, label: 'Tríos (3)' },
    { value: 4, label: 'Cuartetos (4)' },
    { value: 5, label: 'Equipos (5)' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(232,64,87,0.12)', border: '1px solid rgba(232,64,87,0.25)' }}>
          <Flame className="w-4 h-4 text-lol-danger" />
        </div>
        <div>
          <h2 className="lol-title text-lg text-lol-text">Combos Rotos</h2>
          <p className="text-xs text-lol-dim">Combinaciones más tóxicas del meta — Selecciona un combo para ver detalles</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {sizeOptions.map(opt => (
          <button
            key={String(opt.value)}
            onClick={() => handleSizeFilter(opt.value)}
            className={`
              px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
              ${sizeFilter === opt.value
                ? 'bg-lol-gold/15 text-lol-gold border border-lol-gold/30 shadow-sm shadow-lol-gold/10'
                : 'text-lol-dim hover:text-lol-muted hover:bg-lol-card/40 border border-transparent'
              }
            `}
            aria-pressed={sizeFilter === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left panel skeleton */}
          <div className="w-full md:w-[320px] lg:w-[340px] shrink-0 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          {/* Right panel skeleton */}
          <div className="flex-1 hidden md:block">
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16 text-lol-dim">
          <Flame className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No hay combos para este filtro</p>
        </div>
      ) : (
        /* ============ CHAMPION SELECT LAYOUT ============ */
        <>
          {/* Desktop: Side-by-side layout */}
          <div className="hidden md:flex gap-4" style={{ minHeight: '520px' }}>
            {/* LEFT PANEL — Combo List */}
            <div
              className="w-[320px] lg:w-[340px] shrink-0 flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin"
              style={{ maxHeight: 'calc(100vh - 280px)' }}
            >
              <div className="flex items-center gap-2 px-1 mb-1">
                <span className="lol-label text-[10px] text-lol-gold">
                  {filtered.length} COMBO{filtered.length !== 1 ? 'S' : ''}
                </span>
                <div className="flex-1 h-[1px]" style={{ background: 'rgba(200,170,110,0.15)' }} />
              </div>
              {filtered.map((combo, idx) => (
                <ComboListCard
                  key={combo.id}
                  combo={combo}
                  isSelected={effectiveId === combo.id}
                  onClick={() => setSelectedComboId(combo.id)}
                  index={idx}
                />
              ))}
            </div>

            {/* RIGHT PANEL — Detail */}
            <div className="flex-1 glass-card rounded-xl overflow-hidden" style={{ border: '1px solid rgba(120,90,40,0.15)' }}>
              <AnimatePresence mode="wait">
                {selectedCombo ? (
                  <ComboDetailPanel combo={selectedCombo} />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex items-center justify-center text-lol-dim"
                    style={{ minHeight: '400px' }}
                  >
                    <div className="text-center">
                      <ChevronLeft className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Selecciona un combo</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile: Stacked layout — horizontal scroll strip + detail below */}
          <div className="md:hidden space-y-4">
            {/* Horizontal scroll strip */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="lol-label text-[10px] text-lol-gold">
                  {filtered.length} COMBO{filtered.length !== 1 ? 'S' : ''}
                </span>
                <div className="flex-1 h-[1px]" style={{ background: 'rgba(200,170,110,0.15)' }} />
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
                {filtered.map((combo, idx) => {
                  const isMeta = combo.winRate >= 57;
                  return (
                    <motion.button
                      key={combo.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => setSelectedComboId(combo.id)}
                      className={`
                        shrink-0 snap-start rounded-lg overflow-hidden transition-all duration-200 text-left
                        ${effectiveId === combo.id
                          ? 'ring-1 ring-lol-gold/60'
                          : 'opacity-70 hover:opacity-100'
                        }
                      `}
                      style={{
                        width: '180px',
                        background: effectiveId === combo.id
                          ? 'linear-gradient(135deg, rgba(200,170,110,0.12), rgba(30,35,40,0.7))'
                          : 'rgba(30,35,40,0.5)',
                        border: effectiveId === combo.id
                          ? '1px solid rgba(200,170,110,0.35)'
                          : '1px solid rgba(120,90,40,0.12)',
                      }}
                    >
                      <div className="p-2.5">
                        <div className="flex items-center gap-1 mb-2">
                          {combo.champions.map((name) => (
                            <div key={name} className="w-6 h-6 rounded-full overflow-hidden" style={{ border: '1px solid rgba(120,90,40,0.3)' }}>
                              <MicroChampionIcon name={name} />
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] font-bold text-lol-text leading-tight truncate">{combo.name}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] font-mono font-bold" style={{ color: isMeta ? '#0acbe6' : '#a09b8c' }}>
                            {combo.winRate}%
                          </span>
                          {isMeta && (
                            <span className="text-[10px] font-black px-1 py-0.5 rounded" style={{ background: 'rgba(200,170,110,0.15)', color: '#c8aa6e' }}>META</span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Mobile detail panel */}
            <AnimatePresence mode="wait">
              {selectedCombo ? (
                <motion.div
                  key={selectedCombo.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <ComboDetailPanel combo={selectedCombo} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-xl p-8 text-center text-lol-dim"
                >
                  <ChevronLeft className="w-6 h-6 mx-auto mb-2 opacity-30 rotate-90" />
                  <p className="text-xs">Desliza y selecciona un combo arriba</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* ============ COMPOSICIONES PRO ============ */}
      <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(120,90,40,0.2)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(200,170,110,0.12)', border: '1px solid rgba(200,170,110,0.25)' }}>
            <Users className="w-4 h-4 text-lol-gold" />
          </div>
          <div>
            <h2 className="lol-title text-lg text-lol-text">Composiciones Pro</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(200,170,110,0.12)', color: '#c8aa6e', border: '1px solid rgba(200,170,110,0.3)' }}>{proComps.length} comps</span>
              <p className="text-xs text-lol-dim">Team comps más fuertes del meta actual</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {proComps.map((comp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="p-3 sm:p-4 rounded-xl relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(200,170,110,0.06), rgba(30,35,40,0.5))', border: '1px solid rgba(200,170,110,0.2)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #c8aa6e, #c8aa6e40)' }} />
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-lol-text">{comp.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold" style={{ background: 'rgba(200,170,110,0.12)', color: '#c8aa6e', border: '1px solid rgba(200,170,110,0.3)' }}>{comp.playstyle}</span>
              </div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {comp.champions.map(c => (
                  <div key={c} className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg" style={{ background: 'rgba(200,170,110,0.06)', border: '1px solid rgba(200,170,110,0.15)' }}>
                    <ChampionIcon name={c} tier="A" />
                    <span className="text-[10px] font-semibold text-lol-text">{c}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-lol-muted leading-relaxed">{comp.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
