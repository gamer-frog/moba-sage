'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Filter, ExternalLink, Tag, ChevronRight, Gamepad2, Swords } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChampionIcon } from '../champion-icon';

// ---- Local types for guides feed ----
interface GuideEntry {
  id: string;
  champion: string;
  role: string;
  patch: string;
  title: string;
  summary: string;
  tags: string[];
  keyPoints: string[];
  fileName: string;
  game?: string;
}

interface GuidesFeed {
  lastUpdated: string;
  source: string;
  totalGuides: number;
  guides: GuideEntry[];
}

type GameFilter = 'Todos' | 'LoL' | 'Valorant';

const GAME_FILTERS: GameFilter[] = ['Todos', 'LoL', 'Valorant'];

function getGameBadge(game?: string): { label: string; color: string; bg: string } {
  if (game === 'valorant') return { label: 'Valorant', color: '#e84057', bg: 'rgba(232,64,87,0.1)' };
  return { label: 'LoL', color: '#c8aa6e', bg: 'rgba(200,170,110,0.1)' };
}

export function GuidesTab() {
  const [guides, setGuides] = useState<GuideEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameFilter, setGameFilter] = useState<GameFilter>('Todos');

  useEffect(() => {
    async function fetchGuides() {
      try {
        const res = await fetch('/guides-feed.json');
        if (res.ok) {
          const data: GuidesFeed = await res.json();
          setGuides(data.guides || []);
        }
      } catch (err) {
        console.error('Error loading guides:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGuides();
  }, []);

  const filteredGuides = guides.filter(g => {
    if (gameFilter === 'LoL') return !g.game || g.game !== 'valorant';
    if (gameFilter === 'Valorant') return g.game === 'valorant';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookOpen className="w-5 h-5 text-[#c8aa6e]" />
        <div>
          <h2 className="lol-title text-lg text-[#f0e6d2]">Guías & Análisis</h2>
          <p className="text-xs text-[#5b5a56]">Guías de campeones, meta y parches</p>
        </div>
      </div>

      {/* Game Filter Buttons */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-[#5b5a56]" />
        {GAME_FILTERS.map(game => {
          const isActive = gameFilter === game;
          return (
            <button
              key={game}
              onClick={() => setGameFilter(game)}
              className={`
                px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                ${isActive
                  ? 'bg-[#c8aa6e]/15 text-[#c8aa6e] border border-[#c8aa6e]/30 shadow-[0_0_10px_rgba(200,170,110,0.08)]'
                  : 'text-[#5b5a56] hover:text-[#a09b8c] hover:bg-[#1e2328]/40 border border-transparent'
                }
              `}
              aria-pressed={isActive}
            >
              {game === 'Valorant' ? (
                <span className="flex items-center gap-1"><Gamepad2 className="w-3 h-3" /> {game}</span>
              ) : game === 'LoL' ? (
                <span className="flex items-center gap-1"><Swords className="w-3 h-3" /> {game}</span>
              ) : game}
            </button>
          );
        })}
        <span className="ml-auto text-[10px] text-[#5b5a56]">{filteredGuides.length} guía(s)</span>
      </div>

      {/* Loading skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredGuides.length === 0 ? (
        <div className="text-center py-12 text-[#5b5a56]">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No hay guías disponibles para este filtro</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredGuides.map((guide, idx) => {
              const gameBadge = getGameBadge(guide.game);
              const isLoL = !guide.game || guide.game !== 'valorant';
              return (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="glass-card rounded-xl p-5 border border-[#785a28]/25 flex flex-col group hover:border-[#c8aa6e]/30 transition-all duration-300"
                >
                  {/* Top row: icon + title + game badge */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="shrink-0">
                      {isLoL && guide.champion !== 'General' ? (
                        <ChampionIcon name={guide.champion} tier="A" />
                      ) : (
                        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                          style={{ border: `2.5px solid ${gameBadge.color}70`, background: gameBadge.bg }}>
                          {guide.game === 'valorant' ? (
                            <Gamepad2 className="w-5 h-5" style={{ color: gameBadge.color }} />
                          ) : (
                            <Swords className="w-5 h-5" style={{ color: gameBadge.color }} />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#f0e6d2] leading-tight line-clamp-2 group-hover:text-[#c8aa6e] transition-colors">
                        {guide.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {/* Game badge */}
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: gameBadge.bg, color: gameBadge.color, border: `1px solid ${gameBadge.color}30` }}
                        >
                          {gameBadge.label}
                        </span>
                        {/* Patch version */}
                        <span className="text-[10px] font-mono text-[#a09b8c]">v{guide.patch}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-[#a09b8c] leading-relaxed mb-3 line-clamp-2">
                    {guide.summary}
                  </p>

                  {/* Key Points */}
                  {guide.keyPoints && guide.keyPoints.length > 0 && (
                    <div className="space-y-1.5 mb-3 flex-1">
                      {guide.keyPoints.slice(0, 4).map((point, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-[#c8aa6e]/50 shrink-0 mt-1.5" />
                          <span className="text-[11px] text-[#a09b8c] leading-snug">{point}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    <Tag className="w-3 h-3 text-[#785a28]" />
                    {guide.tags.slice(0, 5).map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-medium text-[#a09b8c] bg-[#1e2328]/60 border border-[#785a28]/15"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Leer más */}
                  <div className="pt-3 border-t border-[#785a28]/10">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#c8aa6e] hover:text-[#f0e6d2] transition-colors cursor-pointer group/link">
                      Leer más
                      <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
