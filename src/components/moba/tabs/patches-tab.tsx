'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Clock, Brain, ExternalLink, Filter, Gamepad2, Swords, Crosshair, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ScrollText className="w-5 h-5 text-[#c8aa6e]" />
        <div>
          <h2 className="lol-title text-lg text-[#f0e6d2]">Parches</h2>
          <p className="text-xs text-[#5b5a56]">Últimos parches de todos los juegos</p>
        </div>
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
