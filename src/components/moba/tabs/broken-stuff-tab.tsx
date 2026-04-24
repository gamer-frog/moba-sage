'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Sparkles, Wrench, ChevronRight, Newspaper, TrendingUp, TrendingDown, Shield, Zap, Clock, ArrowUpCircle, ArrowDownCircle, Info, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { SplashArtIcon, TinyChampionIcon } from '../champion-icon';
import { RoleBadge, CategoryBadge } from '../badges';
import { ItemIcon } from '../item-icon';
import { ChampionCard } from '../champion-card';
import { parseBuildItems, getChampionSplashUrl } from '../helpers';
import type { Champion, AiInsight, GameSelection } from '../types';

// ---- Patch Analysis types ----
interface PatchAnalysis {
  lastUpdated: string;
  currentPatch: string;
  nextPatch: string;
  patchDate: string;
  keyChanges: string[];
  systemChanges: string[];
  brokenChampions: { name: string; reason: string; tier: string }[];
  fallenChampions: { name: string; reason: string; tier: string }[];
  itemImpact: { winners: string[]; losers: string[] };
  summary: string;
  patchChanges?: PatchChampionChange[];
}

// Extended type for per-champion patch changes
interface PatchChampionChange {
  name: string;
  tierBefore?: string;
  tierAfter?: string;
  changeType: 'buff' | 'nerf' | 'rework' | 'new' | 'adjustment';
  description: string;
  impact?: 'high' | 'medium' | 'low';
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    'S': { bg: 'rgba(200,170,110,0.15)', color: '#c8aa6e', border: 'rgba(200,170,110,0.4)' },
    'S+': { bg: 'rgba(200,170,110,0.2)', color: '#c8aa6e', border: 'rgba(200,170,110,0.5)' },
    'A+': { bg: 'rgba(200,170,110,0.1)', color: '#c8aa6e', border: 'rgba(200,170,110,0.3)' },
    'A': { bg: 'rgba(10,203,230,0.1)', color: '#0acbe6', border: 'rgba(10,203,230,0.3)' },
    'B': { bg: 'rgba(232,64,87,0.1)', color: '#e84057', border: 'rgba(232,64,87,0.3)' },
    'C': { bg: 'rgba(91,90,86,0.1)', color: '#5b5a56', border: 'rgba(91,90,86,0.3)' },
  };
  const c = colors[tier] || colors['A'];
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black"
      style={{ backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {tier}
    </span>
  );
}

// Determine tier direction: up, down, same, new
function getTierDirection(tierBefore?: string, tierAfter?: string): 'up' | 'down' | 'same' | 'new' {
  if (!tierBefore || !tierAfter) return 'new';
  if (tierBefore === tierAfter) return 'same';
  const tierOrder: Record<string, number> = { 'S': 5, 'S+': 6, 'A+': 4, 'A': 3, 'B': 2, 'C': 1 };
  const before = tierOrder[tierBefore] || 0;
  const after = tierOrder[tierAfter] || 0;
  return after > before ? 'up' : 'down';
}

// Calculate tier change magnitude (0-100)
function getTierChangeMagnitude(tierBefore?: string, tierAfter?: string): number {
  if (!tierBefore || !tierAfter) return 50;
  const tierOrder: Record<string, number> = { 'S+': 6, 'S': 5, 'A+': 4, 'A': 3, 'B': 2, 'C': 1 };
  return Math.abs((tierOrder[tierAfter] || 0) - (tierOrder[tierBefore] || 0)) * 25;
}

function ChampionPatchCard({ change, index }: { change: PatchChampionChange; index: number }) {
  const direction = getTierDirection(change.tierBefore, change.tierAfter);
  const magnitude = getTierChangeMagnitude(change.tierBefore, change.tierAfter);
  
  const directionConfig = {
    up: { color: '#0fba81', icon: '↑', label: 'Sube' },
    down: { color: '#e84057', icon: '↓', label: 'Baja' },
    same: { color: '#f0c646', icon: '→', label: 'Igual' },
    new: { color: '#c8aa6e', icon: '★', label: 'Nuevo' },
  };

  const typeConfig = {
    buff: { color: '#0fba81', label: 'Buff' },
    nerf: { color: '#e84057', label: 'Nerf' },
    rework: { color: '#f0c646', label: 'Rework' },
    new: { color: '#c8aa6e', label: 'Nuevo' },
    adjustment: { color: '#0acbe6', label: 'Ajuste' },
  };

  const dir = directionConfig[direction];
  const type = typeConfig[change.changeType] || typeConfig.adjustment;

  // Tooltip content
  const tooltipText = change.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="group relative"
      title={tooltipText}
    >
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.01]"
        style={{
          background: `${dir.color}06`,
          border: `1px solid ${dir.color}18`,
        }}
      >
        {/* Champion icon */}
        <div
          className="w-9 h-9 rounded-lg overflow-hidden shrink-0"
          style={{ border: `1.5px solid ${dir.color}50` }}
        >
          <TinyChampionIcon name={change.name} />
        </div>

        {/* Name + Type Badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] font-semibold text-[#f0e6d2] truncate">{change.name}</span>
            <span
              className="text-[8px] px-1.5 py-0.5 rounded font-bold"
              style={{ background: `${type.color}15`, color: type.color, border: `1px solid ${type.color}25` }}
            >
              {type.label}
            </span>
            {change.impact && (
              <span className="text-[8px] text-[#5b5a56]">· {change.impact === 'high' ? 'Alto impacto' : change.impact === 'medium' ? 'Medio' : 'Bajo'}</span>
            )}
          </div>
          <p className="text-[9px] text-[#a09b8c] truncate">{change.description}</p>
        </div>

        {/* Tier change indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          {change.tierBefore && (
            <div className="text-center">
              <span className="block text-[8px] text-[#5b5a56]">Antes</span>
              <TierBadge tier={change.tierBefore} />
            </div>
          )}
          {/* Direction arrow */}
          <div className="flex flex-col items-center">
            <span
              className="text-sm font-black leading-none"
              style={{ color: dir.color }}
            >
              {dir.icon}
            </span>
          </div>
          {change.tierAfter && (
            <div className="text-center">
              <span className="block text-[8px] text-[#5b5a56]">Ahora</span>
              <TierBadge tier={change.tierAfter} />
            </div>
          )}
          {/* Impact bar */}
          {direction !== 'new' && change.tierBefore && change.tierAfter && change.tierBefore !== change.tierAfter && (
            <div className="w-12 h-1.5 rounded-full overflow-hidden ml-1" style={{ background: 'rgba(120,90,40,0.08)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: dir.color,
                  boxShadow: `0 0 4px ${dir.color}40`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${magnitude}%` }}
                transition={{ duration: 0.5, delay: index * 0.04 }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Derive champion patch changes from existing data
function deriveChampionChanges(analysis: PatchAnalysis): PatchChampionChange[] {
  const changes: PatchChampionChange[] = [];

  // Build from broken champions (these went UP)
  for (const champ of analysis.brokenChampions) {
    changes.push({
      name: champ.name,
      tierAfter: champ.tier,
      changeType: 'buff',
      description: champ.reason,
      impact: champ.tier === 'S' ? 'high' : 'medium',
    });
  }

  // Build from fallen champions (these went DOWN)
  for (const champ of analysis.fallenChampions) {
    const existingIdx = changes.findIndex(c => c.name === champ.name);
    if (existingIdx >= 0) {
      changes[existingIdx].tierBefore = champ.tier;
      changes[existingIdx].tierAfter = analysis.brokenChampions.find(b => b.name === champ.name)?.tier;
      // Don't add duplicate
    } else {
      changes.push({
        name: champ.name,
        tierAfter: champ.tier,
        changeType: 'nerf',
        description: champ.reason,
        impact: champ.tier === 'B' ? 'high' : 'medium',
      });
    }
  }

  // Add tier before/after from the broken/fallen structure
  // Cross-reference: broken = went UP, fallen = went DOWN
  for (const change of changes) {
    const isBroken = analysis.brokenChampions.some(b => b.name === change.name);
    const isFallen = analysis.fallenChampions.some(f => f.name === change.name);
    
    if (isBroken) {
      // Went up to current tier
      if (change.tierAfter === 'S') change.tierBefore = 'A';
      else if (change.tierAfter === 'A+') change.tierBefore = 'A';
      else change.tierBefore = 'B';
    } else if (isFallen) {
      // Went down to current tier
      if (change.tierAfter === 'B') change.tierBefore = 'S';
      else if (change.tierAfter === 'A') change.tierBefore = 'S';
      else change.tierBefore = 'A+';
    }
  }

  return changes;
}

function PatchAnalysisSection({ analysis }: { analysis: PatchAnalysis }) {
  // Derive per-champion changes from the analysis data
  const championChanges = deriveChampionChanges(analysis);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mb-2"
    >
      {/* Summary Card */}
      <div className="glass-card rounded-xl p-4 relative overflow-hidden" style={{ border: '1px solid rgba(200,170,110,0.25)' }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #c8aa6e, transparent)' }} />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(200,170,110,0.15)', border: '1px solid rgba(200,170,110,0.25)' }}>
            <Newspaper className="w-4 h-4 text-[#c8aa6e]" />
          </div>
          <div className="flex-1">
            <h3 className="lol-title text-sm text-[#f0e6d2]">ANÁLISIS DE PARCHE</h3>
            <p className="text-[10px] text-[#5b5a56]">
              Parche actual: <span className="font-mono text-[#c8aa6e]">{analysis.currentPatch}</span>
              {' · '}
              Próximo: <span className="font-mono text-[#0acbe6]">{analysis.nextPatch}</span>
              {analysis.patchDate && (
                <span className="text-[#5b5a56]"> · {analysis.patchDate}</span>
              )}
            </p>
          </div>
        </div>
        <p className="text-xs text-[#a09b8c] leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Two columns: Broken + Fallen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Broken Champions */}
        <div className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(15,186,129,0.15)' }}>
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpCircle className="w-4 h-4 text-[#0fba81]" />
            <span className="lol-label text-xs font-semibold text-[#0fba81]">¿Quién Queda Roto?</span>
          </div>
          <div className="space-y-2.5">
            {analysis.brokenChampions.map((champ, i) => (
              <motion.div
                key={champ.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0" style={{ border: '1.5px solid #0fba8180' }}>
                  <TinyChampionIcon name={champ.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#f0e6d2]">{champ.name}</span>
                    <TierBadge tier={champ.tier} />
                  </div>
                  <p className="text-[10px] text-[#a09b8c] leading-snug mt-0.5">{champ.reason}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Fallen Champions */}
        <div className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(232,64,87,0.15)' }}>
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownCircle className="w-4 h-4 text-[#e84057]" />
            <span className="lol-label text-xs font-semibold text-[#e84057]">¿Quién Cayó?</span>
          </div>
          <div className="space-y-2.5">
            {analysis.fallenChampions.map((champ, i) => (
              <motion.div
                key={champ.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.15 }}
                className="flex items-start gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0" style={{ border: '1.5px solid #e8405780' }}>
                  <TinyChampionIcon name={champ.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#f0e6d2]">{champ.name}</span>
                    <TierBadge tier={champ.tier} />
                  </div>
                  <p className="text-[10px] text-[#a09b8c] leading-snug mt-0.5">{champ.reason}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-Champion Patch Changes (NEW: TASK 3) */}
      {championChanges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-4"
          style={{ border: '1px solid rgba(200,170,110,0.2)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(200,170,110,0.12)', border: '1px solid rgba(200,170,110,0.2)' }}>
              <Newspaper className="w-3.5 h-3.5 text-[#c8aa6e]" />
            </div>
            <span className="lol-label text-xs font-semibold text-[#c8aa6e]">Cambios por Campeón</span>
            <span className="ml-auto text-[9px] text-[#5b5a56]">{championChanges.length} campeones</span>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 mb-3 px-1">
            <span className="flex items-center gap-1.5 text-[9px] text-[#5b5a56]">
              <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: '#0fba81' }} /> Tier sube
            </span>
            <span className="flex items-center gap-1.5 text-[9px] text-[#5b5a56]">
              <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: '#e84057' }} /> Tier baja
            </span>
            <span className="flex items-center gap-1.5 text-[9px] text-[#5b5a56]">
              <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: '#c8aa6e' }} /> Nuevo
            </span>
          </div>

          {/* Champion change cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {championChanges.map((change, i) => (
              <ChampionPatchCard key={change.name} change={change} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Key Changes */}
      <div className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(120,90,40,0.15)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-[#f0c646]" />
          <span className="lol-label text-xs font-semibold text-[#f0c646]">Cambios Clave del Parche</span>
        </div>
        <div className="space-y-2">
          {analysis.keyChanges.map((change, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-2"
            >
              <div className="w-1 h-1 rounded-full bg-[#f0c646]/60 shrink-0 mt-1.5" />
              <span className="text-[11px] text-[#a09b8c] leading-snug">{change}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* System Changes */}
      <div className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(120,90,40,0.1)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-[#5b8af5]" />
          <span className="lol-label text-xs font-semibold text-[#5b8af5]">Cambios de Sistemas</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {analysis.systemChanges.map((change, i) => (
            <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-[10px] text-[#a09b8c]" style={{ background: 'rgba(91,138,245,0.06)', border: '1px solid rgba(91,138,245,0.12)' }}>
              {change}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function BrokenStuffTab({
  champions, insights, loading, selectedGame,
}: { champions: Champion[]; insights: AiInsight[]; loading: boolean; selectedGame: GameSelection }) {
  const [patchAnalysis, setPatchAnalysis] = useState<PatchAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const res = await fetch('/patch-analysis.json');
        if (res.ok) {
          const data: PatchAnalysis = await res.json();
          setPatchAnalysis(data);
        }
      } catch (err) {
        console.error('Error loading patch analysis:', err);
      } finally {
        setAnalysisLoading(false);
      }
    }
    fetchAnalysis();
  }, []);

  const gameChampions = champions.filter(c => {
    if (selectedGame === 'lol') return c.game === 'LoL';
    if (selectedGame === 'wildrift') return c.game === 'WR';
    return true;
  });
  const metaInsights = insights.filter(i => {
    const champInGame = gameChampions.some(c => c.name === i.champion);
    return (i.category === 'meta' || i.category === 'buff') && champInGame;
  });
  const sTierChamps = gameChampions.filter(c => c.tier === 'S');
  const aTierChamps = gameChampions.filter(c => c.tier === 'A').slice(0, 12);
  const bTierChamps = gameChampions.filter(c => c.tier === 'B');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-[#e84057]" />
        <div>
          <h2 className="lol-title text-lg text-[#f0e6d2]">Cosas Rotas & Combos OP</h2>
          <p className="text-xs text-[#5b5a56]">Campeones y combinaciones que están dominando el meta</p>
        </div>
      </div>

      {/* PATCH ANALYSIS SECTION */}
      {analysisLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      ) : patchAnalysis ? (
        <PatchAnalysisSection analysis={patchAnalysis} />
      ) : null}

      {!loading && sTierChamps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="lol-title text-sm" style={{ color: '#c8aa6e', textShadow: '0 0 10px rgba(200,170,110,0.3)' }}>S TIER</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(200,170,110,0.3), transparent)' }} />
            <Badge className="bg-[#e84057]/20 text-[#e84057] border border-[#e84057]/30 text-[10px]">
              <AlertTriangle className="w-3 h-3 mr-1" />
              ROTO OP
            </Badge>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
            {sTierChamps.map((champ, idx) => {
              const mainBuild = champ.builds?.[0];
              const buildItems = mainBuild ? parseBuildItems(mainBuild.items) : [];
              return (
                <motion.div
                  key={champ.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="shrink-0 w-full sm:w-[180px] h-[220px] rounded-xl overflow-hidden relative group"
                  style={{ border: `2px solid rgba(200,170,110,0.3)`, boxShadow: '0 0 20px rgba(200,170,110,0.1)' }}
                >
                  {/* Splash background */}
                  <div className="absolute inset-0">
                    <Image
                      src={getChampionSplashUrl(champ.name, 0)}
                      alt={champ.name}
                      fill
                      className="object-cover"
                      style={{ filter: 'brightness(0.65) saturate(1.2)' }}
                      unoptimized
                      sizes="180px"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 15%, rgba(10,14,26,0.6) 50%, rgba(10,14,26,0.97) 100%)' }} />
                  </div>

                  {/* ROTO OP badge */}
                  {champ.winRate >= 53 && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-[#e84057]/90 text-white border border-[#e84057] text-[8px] px-1.5 py-0.5 font-black">
                        ROTO OP
                      </Badge>
                    </div>
                  )}

                  {/* S Tier badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-black" style={{ backgroundColor: '#c8aa6e', color: '#0a0e1a', boxShadow: '0 0 12px rgba(200,170,110,0.4)' }}>S</span>
                  </div>

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-3">
                    <span className="lol-title text-base font-bold text-[#f0e6d2]">{champ.name}</span>
                    <RoleBadge role={champ.role} />

                    {/* Stats row */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono text-[11px] font-bold" style={{ color: champ.winRate >= 53 ? '#0acbe6' : '#c8aa6e' }}>
                        {champ.winRate}% WR
                      </span>
                      <span className="text-[#5b5a56] text-[10px]">·</span>
                      <span className="font-mono text-[10px] text-[#a09b8c]">{champ.pickRate}% Pick</span>
                      {champ.banRate > 5 && (
                        <>
                          <span className="text-[#5b5a56] text-[10px]">·</span>
                          <span className="font-mono text-[10px] text-[#e84057]">{champ.banRate}% Ban</span>
                        </>
                      )}
                    </div>

                    {/* Build items inside card */}
                    {mainBuild && buildItems.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 overflow-hidden">
                        {buildItems.slice(0, 4).map((item, i) => (
                          <div key={i} className="relative">
                            <ItemIcon name={item} />
                          </div>
                        ))}
                        {buildItems.length > 4 && (
                          <span className="text-[8px] text-[#5b5a56]">+{buildItems.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && aTierChamps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="lol-title text-sm" style={{ color: '#0acbe6', textShadow: '0 0 10px rgba(10,203,230,0.3)' }}>A TIER</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(10,203,230,0.3), transparent)' }} />
            <span className="text-[10px] text-[#5b5a56]">También fuertes</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {aTierChamps.map((champ, idx) => (
              <motion.div
                key={champ.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-start gap-3 p-3 rounded-xl group cursor-pointer transition-all duration-300"
                style={{
                  background: 'rgba(10,203,230,0.04)',
                  border: '1px solid rgba(10,203,230,0.12)',
                }}
                whileHover={{
                  borderColor: 'rgba(200,170,110,0.5)',
                  boxShadow: '0 0 20px rgba(200,170,110,0.15), 0 0 40px rgba(200,170,110,0.05)',
                }}
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(200,170,110,0.3)]"
                    style={{ border: '2px solid #0acbe680' }}>
                    <SplashArtIcon name={champ.name} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black" style={{ backgroundColor: '#0acbe6', color: '#0a0e1a' }}>A</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#f0e6d2] truncate group-hover:text-[#c8aa6e] transition-colors">{champ.name}</p>
                  <p className="text-[9px] text-[#5b5a56] mb-0.5">{champ.role}</p>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-mono font-semibold" style={{ color: champ.winRate >= 51 ? '#0acbe6' : '#a09b8c' }}>{champ.winRate}% WR</span>
                    <span className="text-[#5b5a56]">·</span>
                    <span className="font-mono text-[#a09b8c]">{champ.pickRate}% Pick</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!loading && bTierChamps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="lol-title text-sm" style={{ color: '#0fba81', textShadow: '0 0 10px rgba(15,186,129,0.3)' }}>B TIER</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(15,186,129,0.3), transparent)' }} />
            <span className="text-[10px] text-[#5b5a56]">Jugables</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {bTierChamps.map(champ => (
              <motion.div key={champ.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 p-2 rounded-lg" style={{ background: 'rgba(15,186,129,0.03)', border: '1px solid rgba(15,186,129,0.1)' }}>
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0" style={{ border: '1.5px solid #0fba8150' }}>
                  <TinyChampionIcon name={champ.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-[#f0e6d2] truncate">{champ.name}</p>
                  <p className="text-[9px] text-[#5b5a56] font-mono">{champ.winRate}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#f0c646]" />
          <span className="lol-label text-xs font-semibold text-[#a09b8c]">Insights de IA</span>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(240,198,70,0.2), transparent)' }} />
          <span className="text-[10px] text-[#5b5a56]">{metaInsights.length} insights</span>
        </div>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-5 space-y-3 mb-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-2 w-32 rounded-full" />
            </div>
          ))
        ) : (
          <div className="space-y-3">
            {metaInsights.map(insight => (
              <motion.div key={insight.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="glass-card rounded-xl p-4 border-l-4 hover:border-[#c8aa6e]/30 transition-colors" style={{ borderLeftColor: insight.category === 'meta' ? '#f0c646' : '#0acbe6' }}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <TinyChampionIcon name={insight.champion} />
                      <span className="font-semibold text-[#f0e6d2] text-sm">{insight.champion}</span>
                      <CategoryBadge category={insight.category} />
                      {insight.category === 'meta' && (
                        <Badge className="bg-[#e84057]/20 text-[#e84057] border border-[#e84057]/30 text-[10px]">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          ROTO OP
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#a09b8c] leading-relaxed mb-3">{insight.content}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-[10px] text-[#5b5a56] shrink-0">Confianza</span>
                        <Progress value={insight.confidence * 100} className="h-1.5 flex-1" />
                        <span className="text-[10px] font-mono text-[#c8aa6e] shrink-0">{(insight.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#785a28] shrink-0 mt-1" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
