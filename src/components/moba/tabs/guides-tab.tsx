'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Filter, ExternalLink, Tag, ChevronRight, Gamepad2, Swords, X, Clock, FileText } from 'lucide-react';
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

// ---- Guide Detail Modal ----
function GuideModal({ guide, onClose }: { guide: GuideEntry; onClose: () => void }) {
  const gameBadge = getGameBadge(guide.game);
  const isLoL = !guide.game || guide.game !== 'valorant';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl scrollbar-none"
        style={{
          background: 'linear-gradient(180deg, #1e2328 0%, #0a0e1a 100%)',
          border: '1px solid rgba(200,170,110,0.25)',
          boxShadow: '0 0 60px rgba(200,170,110,0.1), 0 25px 50px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg, transparent, #c8aa6e, transparent)' }} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-[#1e2328] text-[#5b5a56] hover:text-[#f0e6d2]"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="shrink-0">
              {isLoL && guide.champion !== 'General' ? (
                <ChampionIcon name={guide.champion} tier="A" />
              ) : (
                <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center"
                  style={{ border: `2.5px solid ${gameBadge.color}70`, background: gameBadge.bg }}>
                  {guide.game === 'valorant' ? (
                    <Gamepad2 className="w-6 h-6" style={{ color: gameBadge.color }} />
                  ) : (
                    <Swords className="w-6 h-6" style={{ color: gameBadge.color }} />
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="lol-title text-lg text-[#f0e6d2] leading-tight mb-2">{guide.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: gameBadge.bg, color: gameBadge.color, border: `1px solid ${gameBadge.color}30` }}
                >
                  {gameBadge.label}
                </span>
                <span className="text-[10px] font-mono text-[#a09b8c] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> v{guide.patch}
                </span>
                {guide.role && (
                  <span className="text-[10px] text-[#5b5a56]">· {guide.role}</span>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm text-[#a09b8c] leading-relaxed">{guide.summary}</p>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(120,90,40,0.3), transparent)' }} />

        {/* Key Points */}
        <div className="p-6">
          <h3 className="lol-label text-xs font-semibold text-[#c8aa6e] mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            Puntos Clave
          </h3>
          <div className="space-y-2.5">
            {guide.keyPoints.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(200,170,110,0.1)', border: '1px solid rgba(200,170,110,0.2)' }}>
                  <span className="text-[9px] font-bold text-[#c8aa6e]">{i + 1}</span>
                </div>
                <span className="text-xs text-[#a09b8c] leading-relaxed">{point}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tags */}
        {guide.tags && guide.tags.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3 h-3 text-[#785a28]" />
              {guide.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-medium text-[#a09b8c] bg-[#1e2328]/60 border border-[#785a28]/15"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content coming soon */}
        <div className="mx-6 mb-6 p-4 rounded-xl text-center"
          style={{ background: 'rgba(200,170,110,0.04)', border: '1px solid rgba(200,170,110,0.1)' }}>
          <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
            style={{ background: 'rgba(200,170,110,0.1)', border: '1px solid rgba(200,170,110,0.15)' }}>
            <Clock className="w-5 h-5 text-[#c8aa6e]" />
          </div>
          <p className="text-xs font-semibold text-[#f0e6d2] mb-1">Contenido en desarrollo</p>
          <p className="text-[10px] text-[#5b5a56]">La guía completa con builds, runas y strategias estará disponible próximamente.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function GuidesTab() {
  const [guides, setGuides] = useState<GuideEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameFilter, setGameFilter] = useState<GameFilter>('Todos');
  const [selectedGuide, setSelectedGuide] = useState<GuideEntry | null>(null);

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
                  className="glass-card rounded-xl p-5 border border-[#785a28]/25 flex flex-col group hover:border-[#c8aa6e]/30 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedGuide(guide)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
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
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#c8aa6e] group-hover/link:text-[#f0e6d2] transition-colors">
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

      {/* Guide Detail Modal */}
      <AnimatePresence>
        {selectedGuide && (
          <GuideModal guide={selectedGuide} onClose={() => setSelectedGuide(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
