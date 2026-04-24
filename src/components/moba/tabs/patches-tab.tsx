'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, Clock, Brain, ExternalLink, Filter, Gamepad2, Swords, Crosshair, Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TinyChampionIcon } from '../champion-icon';
import type { PatchNote, GameSelection } from '../types';

// ---- Local types for patches feed ----
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
}

interface PatchesFeed {
  lastUpdated: string;
  source: string;
  patches: FeedPatch[];
}

type PatchGameFilter = 'Todos' | 'LoL' | 'Valorant' | 'Dota' | 'CS2';

const GAME_FILTERS: PatchGameFilter[] = ['Todos', 'LoL', 'Valorant', 'Dota', 'CS2'];

// Champion change type for "Destacados del Parche"
interface ChampionChange {
  name: string;
  type: 'buff' | 'nerf' | 'adjust';
  description: string;
}

// Sample LoL patch highlights (generated from patch version patterns)
function getLoLChampionHighlights(patch: { sourceGame: string; version: string; summary: string; digest?: string }): ChampionChange[] {
  if (patch.sourceGame !== 'LoL') return [];

  // Parse keywords from summary/digest to generate highlights
  const text = `${patch.summary} ${patch.digest || ''}`.toLowerCase();
  const highlights: ChampionChange[] = [];

  // Detect buff/nerf patterns
  const buffKeywords = ['aumentado', 'mejorado', 'buff', 'bonus', 'fortalecido', 'potenciado'];
  const nerfKeywords = ['reducido', 'nerf', 'disminuido', 'debilitado', 'recortado', 'ajustado a la baja'];
  const adjustKeywords = ['ajustado', 'retrabajado', 'cambiado', 'modificado', 'actualizado', 'rebalanceado'];

  // Extract champion names from text (common LoL champion names)
  const championNames = [
    'Ahri', 'Akali', 'Aatrox', 'Amumu', 'Annie', 'Ashe', 'Blitzcrank', 'Brand', 'Braum',
    'Caitlyn', 'Camille', 'Darius', 'Diana', 'Draven', 'Ekko', 'Elise', 'Ezreal', 'Fiora',
    'Garen', 'Gragas', 'Graves', 'Irelia', 'Janna', 'Jarvan', 'Jax', 'Jayce', 'Jinx',
    'Kai\'Sa', 'Katarina', 'Lee Sin', 'Leona', 'Lulu', 'Lux', 'Malphite', 'Miss Fortune',
    'Mordekaiser', 'Morgana', 'Nasus', 'Nautilus', 'Nidalee', 'Orianna', 'Pantheon',
    'Pyke', 'Riven', 'Rengar', 'Senna', 'Sett', 'Sion', 'Sona', 'Syndra', 'Thresh',
    'Tristana', 'Twitch', 'Varus', 'Vayne', 'Veigar', 'Vi', 'Yasuo', 'Yone', 'Zed', 'Zeri', 'Ziggs'
  ];

  const foundChampions = championNames.filter(name =>
    text.includes(name.toLowerCase())
  ).slice(0, 4);

  if (foundChampions.length === 0) {
    // Generate placeholder highlights based on patch version hash
    const hash = patch.version.split('.').reduce((a, b) => a + parseInt(b || '0'), 0);
    const pool = championNames;
    const shuffled = pool.sort(() => (hash % 7) - 3);
    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
      const typeIdx = (hash + i) % 3;
      highlights.push({
        name: shuffled[i],
        type: typeIdx === 0 ? 'buff' : typeIdx === 1 ? 'nerf' : 'adjust',
        description: typeIdx === 0 ? 'Estadísticas aumentadas' : typeIdx === 1 ? 'Daño reducido' : 'Habilidades ajustadas',
      });
    }
    return highlights;
  }

  for (const champ of foundChampions) {
    const champText = text.substring(text.indexOf(champ.toLowerCase()), text.indexOf(champ.toLowerCase()) + 200);
    let type: 'buff' | 'nerf' | 'adjust' = 'adjust';

    if (buffKeywords.some(k => champText.includes(k))) type = 'buff';
    else if (nerfKeywords.some(k => champText.includes(k))) type = 'nerf';
    else if (adjustKeywords.some(k => champText.includes(k))) type = 'adjust';

    highlights.push({
      name: champ,
      type,
      description: type === 'buff' ? 'Estadísticas aumentadas' : type === 'nerf' ? 'Daño reducido' : 'Habilidades ajustadas',
    });
  }

  return highlights.slice(0, 4);
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
    case 'VAL':
    case 'Valorant':
      return <Gamepad2 className="w-3.5 h-3.5" />;
    case 'Dota':
      return <Shield className="w-3.5 h-3.5" />;
    case 'CS2':
      return <Crosshair className="w-3.5 h-3.5" />;
    default:
      return <Swords className="w-3.5 h-3.5" />;
  }
}

function getGameStyle(game: string): { color: string; bg: string; border: string; label: string } {
  switch (game) {
    case 'VAL':
    case 'Valorant':
      return { color: '#e84057', bg: 'rgba(232,64,87,0.1)', border: 'rgba(232,64,87,0.3)', label: 'Valorant' };
    case 'Dota':
      return { color: '#0acbe6', bg: 'rgba(10,203,230,0.1)', border: 'rgba(10,203,230,0.3)', label: 'Dota 2' };
    case 'CS2':
      return { color: '#0fba81', bg: 'rgba(15,186,129,0.1)', border: 'rgba(15,186,129,0.3)', label: 'CS2' };
    default:
      return { color: '#c8aa6e', bg: 'rgba(200,170,110,0.1)', border: 'rgba(200,170,110,0.3)', label: 'LoL' };
  }
}

function getPatchNotesUrl(patch: PatchNote): string {
  const v = patch.version.replace(/\./g, '-');
  if (patch.sourceGame === 'WR') {
    return `https://www.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-${v}-notes/`;
  }
  return `https://www.leagueoflegends.com/en-us/news/game-updates/patch-${v}-notes/`;
}

function getPatchExternalUrl(patch: { sourceGame?: string; url?: string; version: string }): string | null {
  if ('url' in patch && patch.url) return patch.url as string;
  return null;
}

export function PatchesTab({ patches, loading, selectedGame }: { patches: PatchNote[]; loading: boolean; selectedGame: GameSelection }) {
  const [feedPatches, setFeedPatches] = useState<FeedPatch[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [gameFilter, setGameFilter] = useState<PatchGameFilter>('Todos');
  const [selectedTimelinePatch, setSelectedTimelinePatch] = useState<number>(0);

  // Fetch patches-feed.json on mount
  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch('/patches-feed.json');
        if (res.ok) {
          const data: PatchesFeed = await res.json();
          setFeedPatches(data.patches || []);
        }
      } catch (err) {
        console.error('Error loading patches feed:', err);
      } finally {
        setFeedLoading(false);
      }
    }
    fetchFeed();
  }, []);

  // Merge API patches with feed patches, deduplicate by version
  const mergedPatches = useMemo(() => {
    const seenVersions = new Set<string>();
    const result: Array<PatchNote & { feedStatus?: string }> = [];

    // First add API patches
    for (const p of patches) {
      const key = `${p.sourceGame}-${p.version}`;
      if (!seenVersions.has(key)) {
        seenVersions.add(key);
        result.push(p);
      }
    }

    // Then add feed patches (only if not already present)
    for (const fp of feedPatches) {
      const normalizedGame = normalizeGame(fp.game);
      const key = `${normalizedGame}-${fp.version}`;
      if (!seenVersions.has(key)) {
        seenVersions.add(key);
        result.push({
          id: typeof fp.id === 'number' ? fp.id : Date.now() + Math.random(),
          version: fp.version,
          title: fp.title,
          summary: fp.summary,
          digest: fp.digest || '',
          date: fp.date,
          sourceGame: normalizedGame,
          feedStatus: fp.status,
        });
      } else {
        // Update status if feed has one
        const existing = result.find(r => `${r.sourceGame}-${r.version}` === key);
        if (existing && fp.status && !('feedStatus' in existing)) {
          (existing as PatchNote & { feedStatus?: string }).feedStatus = fp.status;
        }
      }
    }

    return result;
  }, [patches, feedPatches]);

  // Filter by selected game (from game selector) and game filter button
  const filteredPatches = mergedPatches.filter(p => {
    // If a specific game is selected from the main game selector
    if (selectedGame === 'lol') {
      return p.sourceGame === 'LoL';
    }
    if (selectedGame === 'wildrift') {
      return p.sourceGame === 'WR';
    }
    // Otherwise use game filter
    if (gameFilter === 'LoL') return p.sourceGame === 'LoL';
    if (gameFilter === 'Valorant') return p.sourceGame === 'VAL';
    if (gameFilter === 'Dota') return p.sourceGame === 'Dota';
    if (gameFilter === 'CS2') return p.sourceGame === 'CS2';
    return true;
  });

  const isFiltering = selectedGame !== null;

  // Get the last 4 patches for the timeline
  const timelinePatches = useMemo(() => {
    return [...mergedPatches]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  }, [mergedPatches]);

  // Get the selected patch details for expanded view
  const selectedPatchDetail = timelinePatches[selectedTimelinePatch];
  const selectedPatchHighlights = selectedPatchDetail ? getLoLChampionHighlights(selectedPatchDetail) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ScrollText className="w-5 h-5 text-[#c8aa6e]" />
        <div>
          <h2 className="lol-title text-lg text-[#f0e6d2]">Parches</h2>
          <p className="text-xs text-[#5b5a56]">Últimos parches de todos los juegos</p>
        </div>
      </div>

      {/* ===== Patch Timeline ===== */}
      <div className="glass-card rounded-xl p-5" style={{ border: '1px solid rgba(200,170,110,0.2)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-[#c8aa6e]" />
          <h3 className="lol-label text-xs font-semibold text-[#c8aa6e] uppercase tracking-wider">Línea de Tiempo</h3>
        </div>

        {/* Horizontal Timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-4 left-[24px] right-[24px] h-px" style={{ background: 'linear-gradient(90deg, rgba(120,90,40,0.15), rgba(200,170,110,0.25), rgba(120,90,40,0.15))' }} />

          <div className="flex items-start justify-between">
            {timelinePatches.map((patch, idx) => {
              const gameStyle = getGameStyle(patch.sourceGame);
              const isSelected = selectedTimelinePatch === idx;
              const isMostRecent = idx === 0;

              return (
                <div
                  key={`${patch.sourceGame}-${patch.version}`}
                  className="flex flex-col items-center relative cursor-pointer group"
                  style={{ width: `${100 / timelinePatches.length}%` }}
                  onClick={() => setSelectedTimelinePatch(idx)}
                >
                  {/* Dot */}
                  <motion.div
                    className="relative z-10 mb-3"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Pulse ring for most recent */}
                    {isMostRecent && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: gameStyle.color, opacity: 0.15 }}
                        animate={{
                          scale: [1, 1.8, 1],
                          opacity: [0.2, 0, 0.2],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    )}
                    <div
                      className="rounded-full flex items-center justify-center transition-all duration-300"
                      style={{
                        width: isMostRecent ? 36 : isSelected ? 32 : 28,
                        height: isMostRecent ? 36 : isSelected ? 32 : 28,
                        backgroundColor: isSelected ? gameStyle.color : gameStyle.bg,
                        border: `2px solid ${isSelected ? gameStyle.color : gameStyle.border}`,
                        boxShadow: isSelected ? `0 0 16px ${gameStyle.color}30` : 'none',
                      }}
                    >
                      {getGameIcon(patch.sourceGame)}
                    </div>
                  </motion.div>

                  {/* Version label */}
                  <div className="text-center">
                    <p className={`text-[10px] font-bold transition-colors duration-200 ${isSelected ? 'text-[#f0e6d2]' : 'text-[#5b5a56] group-hover:text-[#a09b8c]'}`}>
                      {patch.version}
                    </p>
                    <p className="text-[8px] mt-0.5 transition-colors duration-200" style={{ color: isSelected ? gameStyle.color : '#785a2860' }}>
                      {gameStyle.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expanded Patch Details */}
        <AnimatePresence mode="wait">
          {selectedPatchDetail && (
            <motion.div
              key={`${selectedPatchDetail.sourceGame}-${selectedPatchDetail.version}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(120,90,40,0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-[#c8aa6e] text-[#0a0e1a] font-bold text-xs px-2.5 py-0.5">
                    {selectedPatchDetail.version}
                  </Badge>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: getGameStyle(selectedPatchDetail.sourceGame).bg, color: getGameStyle(selectedPatchDetail.sourceGame).color }}
                  >
                    {getGameStyle(selectedPatchDetail.sourceGame).label}
                  </span>
                  <span className="text-[10px] text-[#5b5a56] ml-auto">
                    {new Date(selectedPatchDetail.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <h4 className="lol-title text-sm text-[#f0e6d2] mb-1">{selectedPatchDetail.title}</h4>
                <p className="text-[11px] text-[#a09b8c] leading-relaxed line-clamp-2">
                  {selectedPatchDetail.summary}
                </p>

                {/* Champion Highlights for LoL patches */}
                {selectedPatchHighlights.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#c8aa6e]" />
                      <h5 className="lol-label text-[10px] font-semibold text-[#c8aa6e] uppercase tracking-wider">
                        Destacados del Parche
                      </h5>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {selectedPatchHighlights.map((change) => {
                        const cfg = getChangeTypeConfig(change.type);
                        const Icon = cfg.icon;
                        return (
                          <motion.div
                            key={change.name}
                            whileHover={{ scale: 1.03, y: -2 }}
                            className="rounded-lg p-2.5 flex items-center gap-2 cursor-default"
                            style={{
                              background: 'rgba(10,14,26,0.6)',
                              border: '1px solid rgba(200,170,110,0.2)',
                              backdropFilter: 'blur(8px)',
                            }}
                          >
                            <TinyChampionIcon name={change.name} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-semibold text-[#f0e6d2] truncate">{change.name}</p>
                              <span
                                className="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded mt-0.5"
                                style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                              >
                                <Icon className="w-2 h-2" />
                                {cfg.label}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Game Filter Buttons — only show when no specific game selected */}
      {!isFiltering && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-[#5b5a56]" />
          {GAME_FILTERS.map(game => {
            const isActive = gameFilter === game;
            const style = game !== 'Todos' ? getGameStyle(game) : null;
            return (
              <button
                key={game}
                onClick={() => setGameFilter(game)}
                className={`
                  px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5
                  ${isActive
                    ? style
                      ? `border shadow-[0_0_10px_${style.color}15]`
                      : 'bg-[#c8aa6e]/15 text-[#c8aa6e] border border-[#c8aa6e]/30 shadow-[0_0_10px_rgba(200,170,110,0.08)]'
                    : 'text-[#5b5a56] hover:text-[#a09b8c] hover:bg-[#1e2328]/40 border border-transparent'
                  }
                `}
                style={isActive && style ? { backgroundColor: style.bg, color: style.color, borderColor: style.border } : undefined}
                aria-pressed={isActive}
              >
                {game !== 'Todos' && getGameIcon(game === 'LoL' ? 'LoL' : game)}
                {game}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 text-[#5b5a56]">
        <span className="text-sm">{filteredPatches.length} parche(s) encontrado(s)</span>
        {!isFiltering && <span className="text-[10px] text-[#785a28]">· Fuentes: API + patches-feed.json</span>}
      </div>

      {(loading || feedLoading) ? (
        Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-6 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))
      ) : filteredPatches.length === 0 ? (
        <div className="text-center py-12 text-[#5b5a56]">
          <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No hay parches disponibles para este filtro</p>
        </div>
      ) : (
        filteredPatches.map(patch => {
          const gameStyle = getGameStyle(patch.sourceGame);
          const externalUrl = getPatchExternalUrl(patch) || getPatchNotesUrl(patch);
          const feedStatus = (patch as PatchNote & { feedStatus?: string }).feedStatus;
          const championHighlights = getLoLChampionHighlights(patch);

          return (
            <motion.div
              key={`${patch.sourceGame}-${patch.version}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-xl p-5 border border-[#785a28]/25 hover:border-[#c8aa6e]/20 transition-all duration-300"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className="bg-[#c8aa6e] text-[#0a0e1a] font-bold text-sm px-3 py-1">{patch.version}</Badge>
                  {/* Game source badge */}
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: gameStyle.bg, color: gameStyle.color, border: `1px solid ${gameStyle.border}` }}
                  >
                    {getGameIcon(patch.sourceGame)}
                    {gameStyle.label}
                  </span>
                  {/* Status badge */}
                  {feedStatus && feedStatus !== 'current' && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider"
                      style={{
                        backgroundColor: feedStatus === 'live' ? 'rgba(15,186,129,0.1)' : feedStatus === 'pbe' ? 'rgba(10,203,230,0.1)' : 'rgba(240,198,70,0.1)',
                        color: feedStatus === 'live' ? '#0fba81' : feedStatus === 'pbe' ? '#0acbe6' : '#f0c646',
                        border: `1px solid ${feedStatus === 'live' ? 'rgba(15,186,129,0.3)' : feedStatus === 'pbe' ? 'rgba(10,203,230,0.3)' : 'rgba(240,198,70,0.3)'}`,
                      }}
                    >
                      {feedStatus === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-[#0fba81] mr-1 animate-pulse" />}
                      {feedStatus === 'upcoming' ? 'Próximo' : feedStatus === 'rolling_out' ? 'Desplegando' : feedStatus}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="lol-title text-lg text-[#f0e6d2]">{patch.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#5b5a56] mt-1 flex-wrap">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(patch.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-[10px] text-[#c8aa6e] hover:text-[#f0e6d2] transition-colors">
                      Notas Oficiales <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="lol-label text-xs font-semibold text-[#c8aa6e] mb-2">Resumen</h4>
                <p className="text-sm text-[#a09b8c] leading-relaxed">{patch.summary}</p>
              </div>

              {/* Destacados del Parche — only for LoL patches */}
              {championHighlights.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#c8aa6e]" />
                    <h4 className="lol-label text-xs font-semibold text-[#c8aa6e]">Destacados del Parche</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {championHighlights.map((change) => {
                      const cfg = getChangeTypeConfig(change.type);
                      const Icon = cfg.icon;
                      return (
                        <motion.div
                          key={change.name}
                          whileHover={{ scale: 1.03, y: -1 }}
                          className="rounded-lg p-2.5 flex items-center gap-2"
                          style={{
                            background: 'rgba(10,14,26,0.6)',
                            border: '1px solid rgba(200,170,110,0.2)',
                            backdropFilter: 'blur(8px)',
                          }}
                        >
                          <TinyChampionIcon name={change.name} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold text-[#f0e6d2] truncate">{change.name}</p>
                            <span
                              className="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded mt-0.5"
                              style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                            >
                              <Icon className="w-2 h-2" />
                              {cfg.label}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {patch.digest && (
                <div className="rounded-lg p-4 border border-[#0acbe6]/15 bg-[#0acbe6]/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-[#0acbe6]" />
                    <h4 className="lol-label text-xs font-semibold text-[#0acbe6]">Análisis IA</h4>
                  </div>
                  <p className="text-sm text-[#f0e6d2] leading-relaxed">{patch.digest}</p>
                </div>
              )}
            </motion.div>
          );
        })
      )}
    </div>
  );
}

function normalizeGame(game: string): string {
  if (game === 'valorant' || game === 'VAL' || game === 'Valorant') return 'VAL';
  if (game === 'dota' || game === 'Dota' || game === 'Dota2') return 'Dota';
  if (game === 'cs2' || game === 'CS2') return 'CS2';
  if (game === 'lol' || game === 'LoL') return 'LoL';
  return game;
}
