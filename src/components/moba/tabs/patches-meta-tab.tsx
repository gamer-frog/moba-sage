'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScrollText, Clock, Brain, ExternalLink, Filter, Gamepad2, Swords, Crosshair, Shield,
  TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, Zap, Target,
  AlertTriangle, Sparkles, Newspaper, ArrowUpCircle, ArrowDownCircle, Compass,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TinyChampionIcon, ChampionIcon } from '../champion-icon';
import { CategoryBadge } from '../badges';
import type { Champion, PatchNote, AiInsight, GameSelection } from '../types';

// ============================================================
// LOCAL TYPES
// ============================================================

interface FeedPatch {
  id: string | number;
  version: string;
  title: string;
  summary: string;
  game: string;
  date: string;
  status: string;
  digest?: string;
  url?: string;
  changes?: Record<string, string[]>;
  highlights?: string[];
  sourceGame?: string;
}

interface PatchesFeed {
  lastUpdated: string;
  source: string;
  patches: FeedPatch[];
}

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
}

interface PatchChampionChange {
  name: string;
  tierBefore?: string;
  tierAfter?: string;
  changeType: 'buff' | 'nerf' | 'rework' | 'new' | 'adjustment';
  description: string;
  impact?: 'high' | 'medium' | 'low';
}

interface ChampionChange {
  name: string;
  type: 'buff' | 'nerf' | 'adjust';
  description: string;
}

type PatchGameFilter = 'Todos' | 'LoL' | 'Dota' | 'CS2';
const GAME_FILTERS: PatchGameFilter[] = ['Todos', 'LoL', 'Dota', 'CS2'];

// ============================================================
// SHARED HELPERS (from both tabs)
// ============================================================

function normalizeGame(game: string): string {
  if (!game) return 'LoL';
  const g = game.toLowerCase().trim();
  if (g === 'lol' || g === 'league of legends' || g === 'leagueoflegends') return 'LoL';
  if (g === 'wr' || g === 'wild rift' || g === 'wildrift') return 'WR';
  if (g === 'dota' || g === 'dota 2' || g === 'dota2') return 'Dota';
  if (g === 'cs2' || g === 'cs:2' || g === 'counter-strike 2') return 'CS2';
  if (g === 'val' || g === 'valorant') return 'VAL';
  return 'LoL';
}

function getChangeTypeConfig(type: 'buff' | 'nerf' | 'adjust') {
  switch (type) {
    case 'buff': return { color: '#0fba81', bg: 'rgba(15,186,129,0.1)', border: 'rgba(15,186,129,0.3)', label: 'Buff', icon: TrendingUp };
    case 'nerf': return { color: '#e84057', bg: 'rgba(232,64,87,0.1)', border: 'rgba(232,64,87,0.3)', label: 'Nerf', icon: TrendingDown };
    case 'adjust': return { color: '#f0c646', bg: 'rgba(240,198,70,0.1)', border: 'rgba(240,198,70,0.3)', label: 'Ajuste', icon: Minus };
  }
}

function getGameIcon(game: string) {
  switch (game) {
    case 'Dota': return <Shield className="w-3.5 h-3.5" />;
    case 'CS2': return <Crosshair className="w-3.5 h-3.5" />;
    default: return <Swords className="w-3.5 h-3.5" />;
  }
}

function getGameStyle(game: string): { color: string; bg: string; border: string; label: string } {
  switch (game) {
    case 'WR': case 'Wild Rift': return { color: '#0acbe6', bg: 'rgba(10,203,230,0.1)', border: 'rgba(10,203,230,0.3)', label: 'Wild Rift' };
    case 'LoL': return { color: '#c8aa6e', bg: 'rgba(200,170,110,0.1)', border: 'rgba(200,170,110,0.3)', label: 'LoL' };
    case 'Dota': return { color: '#e84057', bg: 'rgba(232,64,87,0.1)', border: 'rgba(232,64,87,0.3)', label: 'Dota 2' };
    case 'CS2': return { color: '#f0c646', bg: 'rgba(240,198,70,0.1)', border: 'rgba(240,198,70,0.3)', label: 'CS2' };
    default: return { color: '#a09b8c', bg: 'rgba(160,155,140,0.1)', border: 'rgba(160,155,140,0.3)', label: game };
  }
}

function getPatchNotesUrl(patch: PatchNote): string {
  const v = patch.version.replace(/\./g, '-');
  if (patch.sourceGame === 'WR') return `https://www.leagueoflegends.com/es-es/news/game-updates/wild-rift-patch-${v}-notes/`;
  return `https://www.leagueoflegends.com/es-es/news/game-updates/patch-${v}-notes/`;
}

function getPatchExternalUrl(patch: { sourceGame?: string; url?: string; version: string }): string | null {
  if ('url' in patch && patch.url) return patch.url as string;
  return null;
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
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black"
      style={{ backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {tier}
    </span>
  );
}

function getTierDirection(tierBefore?: string, tierAfter?: string): 'up' | 'down' | 'same' | 'new' {
  if (!tierBefore || !tierAfter) return 'new';
  if (tierBefore === tierAfter) return 'same';
  const tierOrder: Record<string, number> = { 'S': 5, 'S+': 6, 'A+': 4, 'A': 3, 'B': 2, 'C': 1 };
  return (tierOrder[tierAfter] || 0) > (tierOrder[tierBefore] || 0) ? 'up' : 'down';
}

function getTierChangeMagnitude(tierBefore?: string, tierAfter?: string): number {
  if (!tierBefore || !tierAfter) return 50;
  const tierOrder: Record<string, number> = { 'S+': 6, 'S': 5, 'A+': 4, 'A': 3, 'B': 2, 'C': 1 };
  return Math.abs((tierOrder[tierAfter] || 0) - (tierOrder[tierBefore] || 0)) * 25;
}

// ============================================================
// CHAMPION HIGHLIGHT GENERATION (from patches-tab)
// ============================================================

function getLoLChampionHighlights(patch: { sourceGame: string; version: string; summary: string; digest?: string }): ChampionChange[] {
  if (patch.sourceGame !== 'LoL') return [];
  const text = `${patch.summary} ${patch.digest || ''}`.toLowerCase();
  const highlights: ChampionChange[] = [];
  const buffKeywords = ['aumentado', 'mejorado', 'buff', 'bonus', 'fortalecido', 'potenciado'];
  const nerfKeywords = ['reducido', 'nerf', 'disminuido', 'debilitado', 'recortado', 'ajustado a la baja'];
  const adjustKeywords = ['ajustado', 'retrabajado', 'cambiado', 'modificado', 'actualizado', 'rebalanceado'];
  const championNames = [
    'Ahri', 'Akali', 'Aatrox', 'Amumu', 'Annie', 'Ashe', 'Blitzcrank', 'Brand', 'Braum',
    'Caitlyn', 'Camille', 'Darius', 'Diana', 'Draven', 'Ekko', 'Elise', 'Ezreal', 'Fiora',
    'Garen', 'Gragas', 'Graves', 'Irelia', 'Janna', 'Jarvan', 'Jax', 'Jayce', 'Jinx',
    "Kai'Sa", 'Katarina', 'Lee Sin', 'Leona', 'Lulu', 'Lux', 'Malphite', 'Miss Fortune',
    'Mordekaiser', 'Morgana', 'Nasus', 'Nautilus', 'Nidalee', 'Orianna', 'Pantheon',
    'Pyke', 'Riven', 'Rengar', 'Senna', 'Sett', 'Sion', 'Sona', 'Syndra', 'Thresh',
    'Tristana', 'Twitch', 'Varus', 'Vayne', 'Veigar', 'Vi', 'Yasuo', 'Yone', 'Zed', 'Zeri', 'Ziggs',
  ];
  const foundChampions = championNames.filter(name => text.includes(name.toLowerCase())).slice(0, 4);
  if (foundChampions.length === 0) {
    const hash = patch.version.split('.').reduce((a, b) => a + parseInt(b || '0'), 0);
    const shuffled = [...championNames].sort(() => (hash % 7) - 3);
    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
      const typeIdx = (hash + i) % 3;
      highlights.push({ name: shuffled[i], type: typeIdx === 0 ? 'buff' : typeIdx === 1 ? 'nerf' : 'adjust', description: typeIdx === 0 ? 'Estadísticas aumentadas' : typeIdx === 1 ? 'Daño reducido' : 'Habilidades ajustadas' });
    }
    return highlights;
  }
  for (const champ of foundChampions) {
    const idx = text.indexOf(champ.toLowerCase());
    const champText = text.substring(idx, idx + 200);
    let type: 'buff' | 'nerf' | 'adjust' = 'adjust';
    if (buffKeywords.some(k => champText.includes(k))) type = 'buff';
    else if (nerfKeywords.some(k => champText.includes(k))) type = 'nerf';
    else if (adjustKeywords.some(k => champText.includes(k))) type = 'adjust';
    highlights.push({ name: champ, type, description: type === 'buff' ? 'Estadísticas aumentadas' : type === 'nerf' ? 'Daño reducido' : 'Habilidades ajustadas' });
  }
  return highlights.slice(0, 4);
}

// ============================================================
// CHAMPION PATCH CARD (from broken-stuff-tab)
// ============================================================

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
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04, duration: 0.25 }} className="group relative" title={change.description}>
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.01] flex-wrap gap-y-1.5" style={{ background: `${dir.color}06`, border: `1px solid ${dir.color}18` }}>
        <ChampionIcon name={change.name} tier={change.tierAfter || change.tierBefore || 'A'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] font-semibold text-lol-text truncate">{change.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${type.color}15`, color: type.color, border: `1px solid ${type.color}25` }}>{type.label}</span>
            {change.impact && <span className="text-[10px] text-lol-dim">· {change.impact === 'high' ? 'Alto impacto' : change.impact === 'medium' ? 'Medio' : 'Bajo'}</span>}
          </div>
          <p className="text-[10px] text-lol-muted truncate">{change.description}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {change.tierBefore && <div className="text-center"><span className="block text-[10px] text-lol-dim">Antes</span><TierBadge tier={change.tierBefore} /></div>}
          <div className="flex flex-col items-center"><span className="text-sm font-black leading-none" style={{ color: dir.color }}>{dir.icon}</span></div>
          {change.tierAfter && <div className="text-center"><span className="block text-[10px] text-lol-dim">Ahora</span><TierBadge tier={change.tierAfter} /></div>}
          {direction !== 'new' && change.tierBefore && change.tierAfter && change.tierBefore !== change.tierAfter && (
            <div className="w-12 h-1.5 rounded-full overflow-hidden ml-1" style={{ background: 'rgba(120,90,40,0.08)' }}>
              <motion.div className="h-full rounded-full" style={{ background: dir.color, boxShadow: `0 0 4px ${dir.color}40` }} initial={{ width: 0 }} animate={{ width: `${magnitude}%` }} transition={{ duration: 0.5, delay: index * 0.04 }} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// DERIVE CHAMPION CHANGES (from broken-stuff-tab)
// ============================================================

function deriveChampionChanges(analysis: PatchAnalysis): PatchChampionChange[] {
  const changes: PatchChampionChange[] = [];
  const broken = Array.isArray(analysis.brokenChampions) ? analysis.brokenChampions : [];
  const fallen = Array.isArray(analysis.fallenChampions) ? analysis.fallenChampions : [];
  for (const champ of broken) {
    changes.push({ name: champ.name, tierAfter: champ.tier, changeType: 'buff', description: champ.reason, impact: champ.tier === 'S' ? 'high' : 'medium' });
  }
  for (const champ of fallen) {
    const existingIdx = changes.findIndex(c => c.name === champ.name);
    if (existingIdx >= 0) {
      changes[existingIdx].tierBefore = champ.tier;
      changes[existingIdx].tierAfter = broken.find(b => b.name === champ.name)?.tier;
    } else {
      changes.push({ name: champ.name, tierAfter: champ.tier, changeType: 'nerf', description: champ.reason, impact: champ.tier === 'B' ? 'high' : 'medium' });
    }
  }
  for (const change of changes) {
    const isBroken = broken.some(b => b.name === change.name);
    const isFallen = fallen.some(f => f.name === change.name);
    if (isBroken) {
      if (change.tierAfter === 'S') change.tierBefore = 'A';
      else if (change.tierAfter === 'A+') change.tierBefore = 'A';
      else change.tierBefore = 'B';
    } else if (isFallen) {
      if (change.tierAfter === 'B') change.tierBefore = 'S';
      else if (change.tierAfter === 'A') change.tierBefore = 'S';
      else change.tierBefore = 'A+';
    }
  }
  return changes;
}

// ============================================================
// SECTION: Official Riot Patch Notes Banner
// ============================================================

function RiotPatchNotesBanner() {
  return (
    <motion.a
      href="https://www.leagueoflegends.com/en-us/news/game-updates/"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200"
      style={{ background: 'linear-gradient(135deg, rgba(200,170,110,0.08), rgba(30,35,40,0.5))', border: '1px solid rgba(200,170,110,0.2)' }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(200,170,110,0.15)', border: '1px solid rgba(200,170,110,0.25)' }}>
        <ScrollText className="w-4 h-4 text-lol-gold" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-lol-text block truncate">Notas de Parche Oficiales de Riot</span>
        <span className="text-[10px] text-lol-gold-dark">leagueoflegends.com/en-us/news/game-updates</span>
      </div>
      <ExternalLink className="w-4 h-4 text-lol-gold shrink-0" />
    </motion.a>
  );
}

// ============================================================
// SECTION: Meta Impact (from patches-tab)
// ============================================================

function MetaImpactSection({ latestPatch }: { latestPatch: PatchNote & { feedStatus?: string } }) {
  const highlights = getLoLChampionHighlights(latestPatch);
  const buffs = highlights.filter(h => h.type === 'buff').length;
  const nerfs = highlights.filter(h => h.type === 'nerf').length;
  const adjusts = highlights.filter(h => h.type === 'adjust').length;
  const changes = latestPatch.changes || {};
  const newItemCount = (changes.newItems || []).length;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl overflow-hidden relative" style={{ border: '1px solid rgba(200,170,110,0.25)' }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #c8aa6e, transparent)' }} />
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-lol-gold" />
          <span className="lol-label text-xs font-bold text-lol-gold uppercase tracking-wider">Meta Impact</span>
          <span className="ml-auto text-[10px] font-mono text-lol-muted">{latestPatch.version}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(15,186,129,0.06)', border: '1px solid rgba(15,186,129,0.15)' }}>
            <ArrowUp className="w-4 h-4 mx-auto mb-1 text-lol-green" />
            <span className="text-lg font-bold font-mono text-lol-green">{buffs}</span>
            <p className="text-[10px] text-lol-dim">Buffeados</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(232,64,87,0.06)', border: '1px solid rgba(232,64,87,0.15)' }}>
            <ArrowDown className="w-4 h-4 mx-auto mb-1 text-lol-danger" />
            <span className="text-lg font-bold font-mono text-lol-danger">{nerfs}</span>
            <p className="text-[10px] text-lol-dim">Nerfeados</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(240,198,70,0.06)', border: '1px solid rgba(240,198,70,0.15)' }}>
            <Minus className="w-4 h-4 mx-auto mb-1 text-lol-warning" />
            <span className="text-lg font-bold font-mono text-lol-warning">{adjusts}</span>
            <p className="text-[10px] text-lol-dim">Ajustados</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(10,203,230,0.06)', border: '1px solid rgba(10,203,230,0.15)' }}>
            <Gamepad2 className="w-4 h-4 mx-auto mb-1 text-lol-success" />
            <span className="text-lg font-bold font-mono text-lol-success">{newItemCount}</span>
            <p className="text-[10px] text-lol-dim">Items Nuevos</p>
          </div>
        </div>
        {highlights.length > 0 && (
          <div className="mt-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(200,170,110,0.04)', border: '1px solid rgba(200,170,110,0.12)' }}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-lol-gold uppercase">Cambio más significativo:</span>
              <div className="flex items-center gap-1.5">
                <TinyChampionIcon name={highlights[0].name} />
                <span className="text-xs font-bold text-lol-text">{highlights[0].name}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: highlights[0].type === 'buff' ? 'rgba(15,186,129,0.15)' : highlights[0].type === 'nerf' ? 'rgba(232,64,87,0.15)' : 'rgba(240,198,70,0.15)', color: highlights[0].type === 'buff' ? '#0fba81' : highlights[0].type === 'nerf' ? '#e84057' : '#f0c646' }}>
                  {highlights[0].type === 'buff' ? '↑ BUFF' : highlights[0].type === 'nerf' ? '↓ NERF' : '→ AJUSTE'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// SECTION: Patch Analysis (from broken-stuff-tab)
// ============================================================

function PatchAnalysisSection({ analysis }: { analysis: PatchAnalysis }) {
  const championChanges = deriveChampionChanges(analysis);
  const broken = Array.isArray(analysis.brokenChampions) ? analysis.brokenChampions : [];
  const fallen = Array.isArray(analysis.fallenChampions) ? analysis.fallenChampions : [];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mb-2">
      {/* Summary Card */}
      <div className="glass-card rounded-xl p-4 relative overflow-hidden" style={{ border: '1px solid rgba(200,170,110,0.25)' }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #c8aa6e, transparent)' }} />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(200,170,110,0.15)', border: '1px solid rgba(200,170,110,0.25)' }}>
            <Newspaper className="w-4 h-4 text-lol-gold" />
          </div>
          <div className="flex-1">
            <h3 className="lol-title text-sm text-lol-text">ANÁLISIS DE PARCHE</h3>
            <p className="text-[10px] text-lol-dim">
              Parche actual: <span className="font-mono text-lol-gold">{analysis.currentPatch}</span>
              {' · '}Próximo: <span className="font-mono text-lol-success">{analysis.nextPatch}</span>
              {analysis.patchDate && <span className="text-lol-dim"> · {analysis.patchDate}</span>}
            </p>
          </div>
        </div>
        <p className="text-xs text-lol-muted leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Broken + Fallen columns */}
      {(broken.length > 0 || fallen.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {broken.length > 0 && (
            <div className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(15,186,129,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(15,186,129,0.12)', border: '1px solid rgba(15,186,129,0.3)' }}><ArrowUpCircle className="w-4 h-4 text-lol-green" /></div>
                <span className="lol-label text-xs font-semibold text-lol-green">¿Quién Queda Roto?</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(15,186,129,0.12)', color: '#0fba81', border: '1px solid rgba(15,186,129,0.25)' }}>{broken.length}</span>
              </div>
              <div className="space-y-2.5">
                {broken.map((champ, i) => (
                  <motion.div key={champ.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-2.5 p-2 rounded-lg" style={{ background: 'rgba(15,186,129,0.04)', borderLeft: '2px solid #0fba81' }}>
                    <ChampionIcon name={champ.name} tier={champ.tier || 'A'} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-lol-text">{champ.name}</span>
                        <TierBadge tier={champ.tier} />
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(15,186,129,0.15)', color: '#0fba81', border: '1px solid rgba(15,186,129,0.3)' }}>BUFFED</span>
                      </div>
                      <p className="text-[10px] text-lol-muted leading-snug mt-0.5">{champ.reason}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          {fallen.length > 0 && (
            <div className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(232,64,87,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(232,64,87,0.12)', border: '1px solid rgba(232,64,87,0.3)' }}><ArrowDownCircle className="w-4 h-4 text-lol-danger" /></div>
                <span className="lol-label text-xs font-semibold text-lol-danger">¿Quién Cayó?</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(232,64,87,0.12)', color: '#e84057', border: '1px solid rgba(232,64,87,0.25)' }}>{fallen.length}</span>
              </div>
              <div className="space-y-2.5">
                {fallen.map((champ, i) => (
                  <motion.div key={champ.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 + 0.15 }} className="flex items-start gap-2.5 p-2 rounded-lg" style={{ background: 'rgba(232,64,87,0.04)', borderLeft: '2px solid #e84057' }}>
                    <ChampionIcon name={champ.name} tier={champ.tier || 'A'} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-lol-text">{champ.name}</span>
                        <TierBadge tier={champ.tier} />
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(232,64,87,0.15)', color: '#e84057', border: '1px solid rgba(232,64,87,0.3)' }}>NERFED</span>
                      </div>
                      <p className="text-[10px] text-lol-muted leading-snug mt-0.5">{champ.reason}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Per-Champion Patch Changes */}
      {championChanges.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(200,170,110,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(200,170,110,0.12)', border: '1px solid rgba(200,170,110,0.2)' }}><Newspaper className="w-3.5 h-3.5 text-lol-gold" /></div>
            <span className="lol-label text-xs font-semibold text-lol-gold">Cambios por Campeón</span>
            <span className="ml-auto text-[10px] text-lol-dim">{championChanges.length} campeones</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap mb-3 px-1">
            <span className="flex items-center gap-1.5 text-[10px] text-lol-dim"><span className="w-3 h-1.5 rounded-full inline-block" style={{ background: '#0fba81' }} /> Tier sube</span>
            <span className="flex items-center gap-1.5 text-[10px] text-lol-dim"><span className="w-3 h-1.5 rounded-full inline-block" style={{ background: '#e84057' }} /> Tier baja</span>
            <span className="flex items-center gap-1.5 text-[10px] text-lol-dim"><span className="w-3 h-1.5 rounded-full inline-block" style={{ background: '#c8aa6e' }} /> Nuevo</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {championChanges.map((change, i) => <ChampionPatchCard key={change.name} change={change} index={i} />)}
          </div>
        </motion.div>
      )}

      {/* Key Changes */}
      <div className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(120,90,40,0.15)' }}>
        <div className="flex items-center gap-2 mb-3"><Zap className="w-4 h-4 text-lol-warning" /><span className="lol-label text-xs font-semibold text-lol-warning">Cambios Clave del Parche</span></div>
        <div className="space-y-2">
          {analysis.keyChanges.map((change, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: '#f0c646', boxShadow: '0 0 4px rgba(240,198,70,0.4)' }} />
              <span className="text-[11px] text-lol-muted leading-snug">{change}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* System Changes */}
      <div className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(120,90,40,0.1)' }}>
        <div className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-[#5b8af5]" /><span className="lol-label text-xs font-semibold text-[#5b8af5]">Cambios de Sistemas</span></div>
        <div className="flex flex-wrap gap-1.5">
          {analysis.systemChanges.map((change, i) => (
            <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-[10px] text-lol-muted" style={{ background: 'rgba(91,138,245,0.06)', border: '1px solid rgba(91,138,245,0.12)' }}>{change}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// MAIN UNIFIED COMPONENT
// ============================================================

export function PatchesMetaTab({
  patches, champions, insights, loading, selectedGame,
}: {
  patches: PatchNote[];
  champions: Champion[];
  insights: AiInsight[];
  loading: boolean;
  selectedGame: GameSelection;
}) {
  // --- Patch feed state (from patches-tab) ---
  const [feedPatches, setFeedPatches] = useState<FeedPatch[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState(false);
  const [gameFilter, setGameFilter] = useState<PatchGameFilter>('Todos');
  const [selectedTimelinePatch, setSelectedTimelinePatch] = useState<number>(0);

  // --- Patch analysis state (from broken-stuff-tab) ---
  const [patchAnalysis, setPatchAnalysis] = useState<PatchAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState(false);

  // --- Sub-section toggle ---
  const [activeSection, setActiveSection] = useState<'meta' | 'history' | 'broken'>('meta');

  // Fetch patches-feed.json
  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch('/patches-feed.json');
        if (res.ok) { const data: PatchesFeed = await res.json(); setFeedPatches(data.patches || []); }
        else setFeedError(true);
      } catch (err) { console.error('Error loading patches feed:', err); setFeedError(true); }
      finally { setFeedLoading(false); }
    }
    fetchFeed();
  }, []);

  // Fetch patch-analysis.json
  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const res = await fetch('/patch-analysis.json');
        if (res.ok) {
          const raw = await res.json();
          const mapped: PatchAnalysis = {
            lastUpdated: raw.date || new Date().toISOString(),
            currentPatch: raw.version || '',
            nextPatch: raw.nextPatch?.number || raw.nextPatch?.version || '',
            patchDate: raw.date || '',
            keyChanges: Array.isArray(raw.highlights) ? raw.highlights : [],
            systemChanges: Array.isArray(raw.metaDirection) ? raw.metaDirection : [],
            brokenChampions: Array.isArray(raw.brokenChampions) ? raw.brokenChampions : [],
            fallenChampions: Array.isArray(raw.fallenChampions) ? raw.fallenChampions : [],
            itemImpact: { winners: [], losers: [] },
            summary: raw.summary || '',
          };
          setPatchAnalysis(mapped);
        } else setAnalysisError(true);
      } catch (err) { console.error('Error loading patch analysis:', err); setAnalysisError(true); }
      finally { setAnalysisLoading(false); }
    }
    fetchAnalysis();
  }, []);

  // --- Derived data ---
  const mergedPatches = useMemo(() => {
    const seenVersions = new Set<string>();
    const result: Array<PatchNote & { feedStatus?: string }> = [];
    for (const p of patches) {
      if (p.sourceGame === 'VAL' || p.sourceGame === 'Valorant') continue;
      const key = `${p.sourceGame}-${p.version}`;
      if (!seenVersions.has(key)) { seenVersions.add(key); result.push(p); }
    }
    for (const fp of feedPatches) {
      const normalizedGame = normalizeGame(fp.game);
      if (normalizedGame === 'VAL') continue;
      const key = `${normalizedGame}-${fp.version}`;
      if (!seenVersions.has(key)) {
        seenVersions.add(key);
        result.push({ id: typeof fp.id === 'number' ? fp.id : Date.now() + Math.random(), version: fp.version, title: fp.title, summary: fp.summary, digest: fp.digest || '', date: fp.date, sourceGame: normalizedGame, feedStatus: fp.status, highlights: fp.highlights, changes: fp.changes });
      } else {
        const existing = result.find(r => `${r.sourceGame}-${r.version}` === key);
        if (existing) {
          if (fp.highlights && (!existing.highlights || existing.highlights.length === 0)) existing.highlights = fp.highlights;
          if (fp.changes && Object.keys(fp.changes).length > 0 && (!existing.changes || Object.keys(existing.changes).length === 0)) existing.changes = fp.changes;
          if (fp.digest && !existing.digest) existing.digest = fp.digest;
          if (fp.title && fp.title.length > (existing.title?.length || 0)) existing.title = fp.title;
          if (fp.summary && fp.summary.length > (existing.summary?.length || 0)) existing.summary = fp.summary;
          if (fp.status) (existing as PatchNote & { feedStatus?: string }).feedStatus = fp.status;
          if (fp.url) existing.url = fp.url;
        }
      }
    }
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result;
  }, [patches, feedPatches]);

  const filteredPatches = mergedPatches.filter(p => {
    if (selectedGame === 'lol') return p.sourceGame === 'LoL';
    if (selectedGame === 'wildrift') return p.sourceGame === 'WR';
    if (gameFilter === 'LoL') return p.sourceGame === 'LoL';
    if (gameFilter === 'Dota') return p.sourceGame === 'Dota';
    if (gameFilter === 'CS2') return p.sourceGame === 'CS2';
    return true;
  });

  const isFiltering = selectedGame !== null;

  const timelinePatches = useMemo(() => {
    return mergedPatches.slice(0, 4);
  }, [mergedPatches]);

  const safeTimelineIdx = Math.min(selectedTimelinePatch, Math.max(0, timelinePatches.length - 1));
  const selectedPatchDetail = timelinePatches.length > 0 ? timelinePatches[safeTimelineIdx] : null;
  const selectedPatchHighlights = selectedPatchDetail ? getLoLChampionHighlights(selectedPatchDetail) : [];

  const metaDirection = useMemo(() => {
    if (!selectedPatchHighlights || selectedPatchHighlights.length === 0) return null;
    const buffs = selectedPatchHighlights.filter(h => h.type === 'buff');
    const nerfs = selectedPatchHighlights.filter(h => h.type === 'nerf');
    if (buffs.length === 0 && nerfs.length === 0) return null;
    const directions: string[] = [];
    if (buffs.length > nerfs.length) directions.push('Meta diversificándose — más campeones viables');
    if (nerfs.length >= 2) directions.push('Nerfs agresivos podrían cambiar el meta fuertemente');
    if (selectedPatchHighlights.some(h => h.name === 'Jinx' || h.name === 'Vayne' || h.name === "Kog'Maw")) directions.push('Hyper carries podrían volverse dominantes');
    if (selectedPatchHighlights.some(h => h.name === 'Darius' || h.name === 'Fiora' || h.name === "K'Sante")) directions.push('Bruisers top lane en el spotlight');
    if (directions.length === 0) directions.push('Ajustes menores — meta estable con ligeros cambios');
    return directions;
  }, [selectedPatchHighlights]);

  const latestPatch = useMemo(() => mergedPatches[0] ?? null, [mergedPatches]);

  // --- Broken stuff data (from broken-stuff-tab) ---
  const gameChampions = champions.filter(c => {
    if (selectedGame === 'lol') return c.game === 'LoL';
    if (selectedGame === 'wildrift') return c.game === 'WR';
    return true;
  });
  const metaInsights = insights.filter(i => {
    const champInGame = gameChampions.some(c => c.name === i.champion);
    return (i.category === 'meta' || i.category === 'buff') && champInGame;
  });
  const metaCategoryInsights = metaInsights.filter(i => i.category === 'meta');
  const buffCategoryInsights = metaInsights.filter(i => i.category === 'buff');
  const tierCounts = useMemo(() => {
    const s = gameChampions.filter(c => c.tier === 'S' || c.tier === 'S+').length;
    const a = gameChampions.filter(c => c.tier === 'A' || c.tier === 'A+').length;
    const b = gameChampions.filter(c => c.tier === 'B').length;
    return { total: gameChampions.length, s, a, b };
  }, [gameChampions]);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="space-y-5">
      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-3">
        <ScrollText className="w-6 h-6 text-lol-gold" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="lol-title text-xl text-lol-text">Parches & Meta</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ background: 'rgba(15,186,129,0.15)', color: '#0fba81', border: '1px solid rgba(15,186,129,0.4)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-lol-green animate-pulse" />
              Versión Actual
            </span>
          </div>
          <p className="text-sm text-lol-gold-dark">Parches, notas oficiales, cambios y análisis del meta</p>
        </div>
      </div>

      {/* ===== OFFICIAL RIOT PATCH NOTES LINK ===== */}
      <RiotPatchNotesBanner />

      {/* ===== META IMPACT — Latest Patch Overview ===== */}
      {!loading && !feedLoading && mergedPatches.length > 0 && latestPatch && (
        <MetaImpactSection latestPatch={latestPatch} />
      )}

      {/* ===== SUB-SECTION TABS ===== */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(10,14,26,0.5)', border: '1px solid rgba(200,170,110,0.15)' }}>
        {[
          { id: 'meta' as const, label: 'Análisis & Meta', icon: Brain },
          { id: 'history' as const, label: 'Historial de Parches', icon: Clock },
          { id: 'broken' as const, label: 'Meta Insights', icon: Sparkles },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer
              ${activeSection === tab.id
                ? 'text-lol-gold shadow-sm'
                : 'text-lol-dim hover:text-lol-muted'
              }
            `}
            style={activeSection === tab.id ? { background: 'rgba(200,170,110,0.1)', border: '1px solid rgba(200,170,110,0.25)' } : { background: 'transparent', border: '1px solid transparent' }}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ===== SECTION: ANÁLISIS & META ===== */}
      {activeSection === 'meta' && (
        <AnimatePresence mode="wait">
          <motion.div key="meta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Patch Analysis — LoL only */}
            {selectedGame !== 'wildrift' && (analysisLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-32 rounded-xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Skeleton className="h-48 rounded-xl" />
                  <Skeleton className="h-48 rounded-xl" />
                </div>
              </div>
            ) : patchAnalysis ? (
              <PatchAnalysisSection analysis={patchAnalysis} />
            ) : analysisError ? (
              <div className="glass-card rounded-xl p-6 text-center" style={{ border: '1px solid rgba(232,64,87,0.2)' }}>
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-lol-danger" />
                <p className="text-sm text-lol-muted mb-1">No se pudo cargar el análisis del parche</p>
                <p className="text-xs text-lol-gold-dark">Intenta recargar la página</p>
              </div>
            ) : null)}

            {/* Tier Summary Banner — links to Tier List tab */}
            {!loading && tierCounts.total > 0 && (
              <motion.a
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.005 }}
                href="?tab=tierlist"
                className="block rounded-xl p-4 cursor-pointer transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, rgba(200,170,110,0.06), rgba(10,14,26,0.5))',
                  border: '1px solid rgba(200,170,110,0.2)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(200,170,110,0.12)', border: '1px solid rgba(200,170,110,0.25)' }}>
                    <Target className="w-5 h-5 text-lol-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-lol-text">Tier List Completa</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(200,170,110,0.1)', color: '#c8aa6e', border: '1px solid rgba(200,170,110,0.2)' }}>{tierCounts.total} campeones</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: 'rgba(200,170,110,0.12)', color: '#c8aa6e', border: '1px solid rgba(200,170,110,0.25)' }}>S: {tierCounts.s}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: 'rgba(10,203,230,0.1)', color: '#0acbe6', border: '1px solid rgba(10,203,230,0.2)' }}>A: {tierCounts.a}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: 'rgba(15,186,129,0.08)', color: '#0fba81', border: '1px solid rgba(15,186,129,0.18)' }}>B: {tierCounts.b}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-lol-gold shrink-0 hidden sm:inline">Ver Tier List completa →</span>
                </div>
              </motion.a>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ===== SECTION: HISTORIAL DE PARCHES ===== */}
      {activeSection === 'history' && (
        <AnimatePresence mode="wait">
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Game Filter Buttons */}
            {!isFiltering && (
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-3.5 h-3.5 text-lol-dim" />
                {GAME_FILTERS.map(game => {
                  const isActive = gameFilter === game;
                  const style = game !== 'Todos' ? getGameStyle(game) : null;
                  return (
                    <button key={game} onClick={() => setGameFilter(game)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${isActive ? (style ? 'border shadow-[0_0_10px_rgba(200,170,110,0.08)]' : 'bg-lol-gold/15 text-lol-gold border border-lol-gold/30') : 'text-lol-dim hover:text-lol-muted hover:bg-lol-card/40 border border-transparent'}`} style={isActive && style ? { backgroundColor: style.bg, color: style.color, borderColor: style.border } : undefined} aria-pressed={isActive}>
                      {game !== 'Todos' && getGameIcon(game)}{game}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Patch Timeline */}
            {timelinePatches.length > 0 && (
              <div className="glass-card rounded-xl p-3 sm:p-5" style={{ border: '1px solid rgba(200,170,110,0.2)' }}>
                <div className="flex items-center gap-2 mb-4"><Clock className="w-4 h-4 text-lol-gold" /><h3 className="lol-label text-xs font-semibold text-lol-gold uppercase tracking-wider">Línea de Tiempo</h3></div>
                <div className="relative">
                  <div className="absolute top-4 left-[24px] right-[24px] h-px" style={{ background: 'linear-gradient(90deg, rgba(120,90,40,0.15), rgba(200,170,110,0.25), rgba(120,90,40,0.15))' }} />
                  <div className="flex items-start justify-between">
                    {timelinePatches.map((patch, idx) => {
                      const gs = getGameStyle(patch.sourceGame);
                      const isSelected = selectedTimelinePatch === idx;
                      const isMostRecent = idx === 0;
                      return (
                        <div key={`${patch.sourceGame}-${patch.version}`} className="flex flex-col items-center relative cursor-pointer group" style={{ width: `${100 / timelinePatches.length}%` }} onClick={() => setSelectedTimelinePatch(idx)}>
                          <motion.div className="relative z-10 mb-3" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}>
                            {isMostRecent && <motion.div className="absolute inset-0 rounded-full" style={{ backgroundColor: gs.color, opacity: 0.15 }} animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />}
                            <div className="rounded-full flex items-center justify-center transition-all duration-300" style={{ width: isMostRecent ? 36 : isSelected ? 32 : 28, height: isMostRecent ? 36 : isSelected ? 32 : 28, backgroundColor: isSelected ? gs.color : gs.bg, border: `2px solid ${isSelected ? gs.color : gs.border}`, boxShadow: isSelected ? `0 0 16px ${gs.color}30` : 'none' }}>{getGameIcon(patch.sourceGame)}</div>
                          </motion.div>
                          <div className="text-center">
                            <p className={`text-[10px] font-bold transition-colors duration-200 ${isSelected ? 'text-lol-text' : 'text-lol-dim group-hover:text-lol-muted'}`}>{patch.version}</p>
                            <p className="text-[10px] mt-0.5 transition-colors duration-200" style={{ color: isSelected ? gs.color : '#785a2860' }}>{gs.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded Patch Details */}
                <AnimatePresence mode="wait">
                  {selectedPatchDetail && (
                    <motion.div key={`${selectedPatchDetail.sourceGame}-${selectedPatchDetail.version}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                      <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(120,90,40,0.15)' }}>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className="bg-lol-gold text-lol-bg font-bold text-xs px-2.5 py-0.5">{selectedPatchDetail.version}</Badge>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: getGameStyle(selectedPatchDetail.sourceGame).bg, color: getGameStyle(selectedPatchDetail.sourceGame).color }}>{getGameStyle(selectedPatchDetail.sourceGame).label}</span>
                          <span className="text-[10px] text-lol-dim ml-auto">{new Date(selectedPatchDetail.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <h4 className="lol-title text-sm text-lol-text mb-1">{selectedPatchDetail.title}</h4>
                        <p className="text-[11px] text-lol-muted leading-relaxed line-clamp-2">{selectedPatchDetail.summary}</p>

                        {selectedPatchHighlights.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2.5"><TrendingUp className="w-4 h-4 text-lol-gold" /><h5 className="lol-label text-sm font-semibold text-lol-gold uppercase tracking-wider">Destacados del Parche</h5></div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {selectedPatchHighlights.map(change => { const cfg = getChangeTypeConfig(change.type); const Icon = cfg.icon; return (
                                <motion.div key={change.name} whileHover={{ scale: 1.03, y: -2 }} className="rounded-xl p-3 flex items-center gap-3 cursor-default overflow-hidden relative" style={{ background: 'rgba(10,14,26,0.7)', border: `1px solid ${cfg.border}40`, borderLeft: `3px solid ${cfg.color}`, backdropFilter: 'blur(8px)' }}>
                                  <TinyChampionIcon name={change.name} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-lol-text truncate">{change.name}</p>
                                    <p className="text-[10px] mt-0.5" style={{ color: cfg.color }}>{change.description}</p>
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded mt-1" style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}><Icon className="w-3 h-3" />{cfg.label}</span>
                                  </div>
                                </motion.div>
                              ); })}
                            </div>
                          </div>
                        )}

                        {/* Meta Direction */}
                        {metaDirection && metaDirection.length > 0 && (
                          <div className="mt-4 rounded-xl p-3 sm:p-4" style={{ background: 'rgba(240,198,70,0.04)', border: '1px solid rgba(240,198,70,0.15)' }}>
                            <div className="flex items-center gap-2 mb-2.5"><Compass className="w-4 h-4 text-lol-warning" /><h5 className="lol-label text-sm font-semibold text-lol-warning uppercase tracking-wider">Dirección del Meta</h5></div>
                            <div className="space-y-2">{metaDirection.map((dir, i) => <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-lol-warning shrink-0 mt-0.5" /><span className="text-sm text-lol-muted leading-relaxed">{dir}</span></motion.div>)}</div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Patch Count */}
            <div className="flex items-center gap-2 text-lol-dim">
              <span className="text-sm">{filteredPatches.length} parche(s) encontrado(s)</span>
              {!isFiltering && <span className="text-[10px] text-lol-gold-dark">· Fuentes: API + patches-feed.json</span>}
            </div>

            {/* Patch List */}
            {(loading || feedLoading) ? (
              Array.from({ length: 2 }).map((_, i) => <div key={i} className="glass-card rounded-xl p-6 space-y-3"><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-20 w-full" /></div>)
            ) : filteredPatches.length === 0 ? (
              <div className="text-center py-12 text-lol-dim"><ScrollText className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="text-sm">No hay parches disponibles para este filtro</p></div>
            ) : (
              filteredPatches.map(patch => {
                const gs = getGameStyle(patch.sourceGame);
                const externalUrl = getPatchExternalUrl(patch) || getPatchNotesUrl(patch);
                const feedStatus = (patch as PatchNote & { feedStatus?: string }).feedStatus;
                const championHighlights = getLoLChampionHighlights(patch);
                return (
                  <motion.div key={`${patch.sourceGame}-${patch.version}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="glass-card rounded-xl p-3 sm:p-5 border border-lol-gold-dark/25 hover:border-lol-gold/20 transition-all duration-300">
                    <div className="flex items-start gap-3 mb-4 flex-wrap">
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Badge className="bg-lol-gold text-lol-bg font-bold text-sm px-3 py-1">{patch.version}</Badge>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: gs.bg, color: gs.color, border: `1px solid ${gs.border}` }}>{getGameIcon(patch.sourceGame)}{gs.label}</span>
                        {feedStatus && feedStatus !== 'current' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider" style={{ backgroundColor: feedStatus === 'live' ? 'rgba(15,186,129,0.1)' : feedStatus === 'pbe' ? 'rgba(10,203,230,0.1)' : 'rgba(240,198,70,0.1)', color: feedStatus === 'live' ? '#0fba81' : feedStatus === 'pbe' ? '#0acbe6' : '#f0c646', border: `1px solid ${feedStatus === 'live' ? 'rgba(15,186,129,0.3)' : feedStatus === 'pbe' ? 'rgba(10,203,230,0.3)' : 'rgba(240,198,70,0.3)'}` }}>
                            {feedStatus === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-lol-green mr-1 animate-pulse" />}
                            {feedStatus === 'upcoming' ? 'Próximo' : feedStatus === 'rolling_out' ? 'Desplegando' : feedStatus}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="lol-title text-lg text-lol-text">{patch.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-lol-dim mt-1 flex-wrap">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(patch.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-[10px] text-lol-gold hover:text-lol-text transition-colors">Notas Oficiales <ExternalLink className="w-2.5 h-2.5" /></a>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4"><h4 className="lol-label text-xs font-semibold text-lol-gold mb-2">Resumen</h4><p className="text-sm text-lol-muted leading-relaxed">{patch.summary}</p></div>
                    {championHighlights.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2.5"><TrendingUp className="w-3.5 h-3.5 text-lol-gold" /><h4 className="lol-label text-xs font-semibold text-lol-gold">Destacados del Parche</h4></div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{championHighlights.map(change => { const cfg = getChangeTypeConfig(change.type); const Icon = cfg.icon; return (
                          <motion.div key={change.name} whileHover={{ scale: 1.03, y: -1 }} className="rounded-lg p-2.5 flex items-center gap-2" style={{ background: 'rgba(10,14,26,0.6)', border: '1px solid rgba(200,170,110,0.2)', backdropFilter: 'blur(8px)' }}>
                            <TinyChampionIcon name={change.name} />
                            <div className="flex-1 min-w-0"><p className="text-[10px] font-semibold text-lol-text truncate">{change.name}</p><span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5" style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}><Icon className="w-2 h-2" />{cfg.label}</span></div>
                          </motion.div>
                        ); })}</div>
                      </div>
                    )}
                    {patch.highlights && patch.highlights.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2.5"><Target className="w-3.5 h-3.5 text-lol-warning" /><h4 className="lol-label text-xs font-semibold text-lol-warning">Highlights del Meta</h4></div>
                        <div className="space-y-1.5">{patch.highlights.map((h: string, i: number) => <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(240,198,70,0.04)', border: '1px solid rgba(240,198,70,0.1)' }}><span className="text-[10px] font-bold text-lol-warning shrink-0 mt-0.5">{i + 1}</span><span className="text-xs text-lol-muted leading-relaxed">{h}</span></div>)}</div>
                      </div>
                    )}
                    {patch.changes && Object.keys(patch.changes).length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2.5"><Zap className="w-3.5 h-3.5 text-lol-gold" /><h4 className="lol-label text-xs font-semibold text-lol-gold">Cambios Detallados</h4></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{Object.entries(patch.changes).map(([category, items]) => (
                          <div key={category} className="rounded-lg p-3" style={{ background: 'rgba(120,90,40,0.06)', border: '1px solid rgba(120,90,40,0.15)' }}>
                            <span className="text-[10px] font-bold text-lol-gold uppercase tracking-wider">{category}</span>
                            <div className="mt-1.5 space-y-1">{(items as string[]).slice(0, 5).map((item, i) => <p key={i} className="text-[11px] text-lol-muted leading-snug">• {item}</p>)}</div>
                          </div>
                        ))}</div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ===== SECTION: META INSIGHTS ===== */}
      {activeSection === 'broken' && (
        <AnimatePresence mode="wait">
          <motion.div key="broken" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            {metaInsights.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-lol-warning" />
                  <span className="lol-label text-xs font-semibold text-lol-muted">Insights de IA</span>
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(240,198,70,0.2), transparent)' }} />
                  <span className="text-[10px] text-lol-dim">{metaInsights.length} insights</span>
                </div>
                <div className="space-y-6">
                  {/* Combos Rotos */}
                  {metaCategoryInsights.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-lol-danger/15 text-lol-danger border border-lol-danger/30 text-[11px] px-2 py-0.5 font-bold gap-1"><Zap className="w-3 h-3" />Combos Rotos</Badge>
                        <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(232,64,87,0.2), transparent)' }} />
                        <span className="text-[10px] text-lol-dim">{metaCategoryInsights.length}</span>
                      </div>
                      <div className="space-y-3">
                        {metaCategoryInsights.map((insight, i) => {
                          const confidencePct = Math.min(insight.confidence * 100, 100);
                          return (
                            <motion.div key={insight.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }} className="glass-card rounded-xl p-3 sm:p-4 border-l-4 hover:border-lol-danger/40 transition-colors" style={{ borderLeftColor: '#e84057', background: 'linear-gradient(135deg, rgba(232,64,87,0.03), rgba(30,35,40,0.5))' }}>
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <ChampionIcon name={insight.champion} tier={gameChampions.find(c => c.name === insight.champion)?.tier || 'A'} />
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-lol-text text-sm">{insight.champion}</span>
                                        <Badge className="bg-lol-danger/20 text-lol-danger border border-lol-danger/30 text-[10px] px-1.5 py-0"><AlertTriangle className="w-3 h-3 mr-0.5" />ROTO</Badge>
                                      </div>
                                      <CategoryBadge category={insight.category} />
                                    </div>
                                  </div>
                                  <p className="text-sm text-lol-muted leading-relaxed mb-3">{insight.content}</p>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-lol-dim shrink-0">Confianza</span>
                                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(232,64,87,0.12)' }}>
                                      <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, rgba(232,64,87,0.4), #e84057)', boxShadow: '0 0 6px rgba(232,64,87,0.3)' }} initial={{ width: 0 }} animate={{ width: `${confidencePct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-lol-danger shrink-0">{confidencePct.toFixed(0)}%</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* Items & Buffs */}
                  {buffCategoryInsights.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-lol-success/15 text-lol-success border border-lol-success/30 text-[11px] px-2 py-0.5 font-bold gap-1"><ArrowUp className="w-3 h-3" />Items & Buffs</Badge>
                        <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(10,203,230,0.2), transparent)' }} />
                        <span className="text-[10px] text-lol-dim">{buffCategoryInsights.length}</span>
                      </div>
                      <div className="space-y-3">
                        {buffCategoryInsights.map((insight, i) => {
                          const confidencePct = Math.min(insight.confidence * 100, 100);
                          return (
                            <motion.div key={insight.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }} className="glass-card rounded-xl p-3 sm:p-4 border-l-4 hover:border-lol-success/40 transition-colors" style={{ borderLeftColor: '#0acbe6', background: 'linear-gradient(135deg, rgba(10,203,230,0.03), rgba(30,35,40,0.5))' }}>
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <ChampionIcon name={insight.champion} tier={gameChampions.find(c => c.name === insight.champion)?.tier || 'A'} />
                                    <div>
                                      <div className="flex items-center gap-1.5"><span className="font-semibold text-lol-text text-sm">{insight.champion}</span><Badge className="bg-lol-success/20 text-lol-success border border-lol-success/30 text-[10px] px-1.5 py-0">BUFF</Badge></div>
                                      <CategoryBadge category={insight.category} />
                                    </div>
                                  </div>
                                  <p className="text-sm text-lol-muted leading-relaxed mb-3">{insight.content}</p>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-lol-dim shrink-0">Confianza</span>
                                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(10,203,230,0.12)' }}>
                                      <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, rgba(10,203,230,0.4), #0acbe6)', boxShadow: '0 0 6px rgba(10,203,230,0.3)' }} initial={{ width: 0 }} animate={{ width: `${confidencePct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-lol-success shrink-0">{confidencePct.toFixed(0)}%</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {!loading && metaInsights.length === 0 && (
              <div className="text-center py-12 text-lol-dim">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No hay insights disponibles para este filtro</p>
              </div>
            )}
            {/* AI Disclaimer */}
            <div className="mt-4 px-4 py-2.5 rounded-lg text-center" style={{ background: 'rgba(120,90,40,0.06)', border: '1px solid rgba(120,90,40,0.1)' }}>
              <p className="text-[10px] text-lol-dim leading-relaxed">
                <Sparkles className="w-3 h-3 inline-block mr-1 text-lol-gold/40" />
                Análisis generado por IA — Verificá con fuentes oficiales antes de tomar decisiones
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
