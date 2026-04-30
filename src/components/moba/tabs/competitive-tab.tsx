'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChampionIcon, SplashArtIcon } from '../champion-icon';
import { RoleBadge, TournamentBadge } from '../badges';
import { TOURNAMENT_REGIONS } from '../constants';
import type { ProPick, GameSelection } from '../types';

export function CompetitiveTab({
  proPicks, loading, selectedGame, proRegionFilter, onProRegionFilterChange,
}: {
  proPicks: ProPick[];
  loading: boolean;
  selectedGame: GameSelection;
  proRegionFilter: string;
  onProRegionFilterChange: (r: string) => void;
}) {
  const isWR = selectedGame === 'wildrift';
  const gamePicks = isWR ? [] : proPicks;
  const filteredPicks = proRegionFilter
    ? gamePicks.filter(p => p.region === proRegionFilter)
    : gamePicks;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Crown className="w-5 h-5 text-lol-warning" />
        <div>
          <h2 className="lol-title text-lg text-lol-text">Escena Competitiva</h2>
          <p className="text-xs text-lol-dim">Campeones más pickados en torneos profesionales</p>
        </div>
      </div>

      {isWR ? (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="text-center py-16 px-6">
            <Crown className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <h3 className="text-base font-semibold text-lol-text mb-2">Wild Rift Competitivo</h3>
            <p className="text-xs text-lol-dim max-w-xs mx-auto">
              Datos de la escena competitiva de Wild Rift próximamente.
              Mientras tanto, explorá las demás pestañas para encontrar info de WR.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {TOURNAMENT_REGIONS.map(r => (
              <button
                key={r.value || 'all'}
                onClick={() => onProRegionFilterChange(r.value)}
                className={`
                  px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                  ${proRegionFilter === r.value
                    ? 'bg-lol-warning/15 text-lol-warning border border-lol-warning/30'
                    : 'text-lol-dim hover:text-lol-muted hover:bg-lol-card/40 border border-transparent'
                  }
                `}
                aria-pressed={proRegionFilter === r.value}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block">
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="grid grid-cols-[2.5rem_1fr_4rem_5rem_3.5rem_3.5rem_3.5rem] gap-2 px-4 py-2 lol-label text-[10px] text-lol-dim border-b border-lol-gold-dark/15">
                <div />
                <div>Campeón</div>
                <div>Rol</div>
                <div>Torneo</div>
                <div className="text-right">Pick%</div>
                <div className="text-right">Ban%</div>
                <div className="text-right">WR%</div>
              </div>

              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-lol-gold-dark/10">
                  {filteredPicks.map((pick, idx) => (
                    <motion.div
                      key={pick.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-lol-card/40 transition-colors"
                    >
                      <ChampionIcon name={pick.champion} tier="A" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-lol-text">{pick.champion}</span>
                      </div>
                      <div className="w-16 shrink-0">
                        <RoleBadge role={pick.role} />
                      </div>
                      <div className="w-20 shrink-0">
                        <TournamentBadge tournament={pick.tournament} />
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0 text-[11px] w-[10.5rem] justify-end">
                        <span className="font-mono font-semibold text-lol-success w-14 text-right">{pick.pickRate}%</span>
                        <span className={`font-mono font-semibold w-14 text-right ${pick.banRate > 10 ? 'text-lol-danger' : 'text-lol-muted'}`}>{pick.banRate}%</span>
                        <span className={`font-mono font-semibold w-14 text-right ${pick.winRate >= 54 ? 'text-lol-success' : pick.winRate >= 50 ? 'text-lol-muted' : 'text-lol-danger'}`}>{pick.winRate}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton className="w-10 h-10 rounded-xl" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Skeleton className="h-10 rounded-lg" />
                      <Skeleton className="h-10 rounded-lg" />
                      <Skeleton className="h-10 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              filteredPicks.map((pick, idx) => (
                <ProPickCard key={pick.id} pick={pick} index={idx} />
              ))
            )}
          </div>

          {!loading && filteredPicks.length === 0 && (
            <div className="text-center py-12 text-lol-dim">
              <Crown className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No hay datos para esta región</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProPickCard({ pick, index }: { pick: ProPick; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-card rounded-xl overflow-hidden cursor-pointer lol-card-hover"
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={`${pick.champion} — ${pick.role} — ${pick.tournament}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded); } }}
    >
      <div className="p-4">
        {/* Header: champion icon + name + badges */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 border-lol-gold/30">
            <SplashArtIcon name={pick.champion} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-lol-text truncate">{pick.champion}</span>
              <ChevronUp
                className={`w-3.5 h-3.5 text-lol-dim shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
            </div>
            <div className="flex items-center gap-2">
              <RoleBadge role={pick.role} />
              <TournamentBadge tournament={pick.tournament} />
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg p-2 text-center bg-lol-success/8 border border-lol-success/15">
            <p className="text-sm font-mono font-bold text-lol-success">{pick.pickRate}%</p>
            <p className="text-[10px] text-lol-dim uppercase tracking-wider mt-0.5">Pick</p>
          </div>
          <div className={`rounded-lg p-2 text-center border ${pick.banRate > 10 ? 'bg-lol-danger/8 border-lol-danger/15' : 'bg-lol-muted/5 border-lol-muted/10'}`}>
            <p className={`text-sm font-mono font-bold ${pick.banRate > 10 ? 'text-lol-danger' : 'text-lol-muted'}`}>{pick.banRate}%</p>
            <p className="text-[10px] text-lol-dim uppercase tracking-wider mt-0.5">Ban</p>
          </div>
          <div className="rounded-lg p-2 text-center bg-lol-green/8 border border-lol-green/15">
            <p className={`text-sm font-mono font-bold ${pick.winRate >= 54 ? 'text-lol-success' : pick.winRate >= 50 ? 'text-lol-muted' : 'text-lol-danger'}`}>{pick.winRate}%</p>
            <p className="text-[10px] text-lol-dim uppercase tracking-wider mt-0.5">WR</p>
          </div>
        </div>
      </div>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-lol-gold-dark/10">
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="space-y-1">
                  <p className="text-[10px] text-lol-dim uppercase tracking-wider">Región</p>
                  <TournamentBadge tournament={pick.tournament} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-lol-dim uppercase tracking-wider">Patch</p>
                  <span className="text-xs font-mono text-lol-muted">{pick.patch}</span>
                </div>
              </div>
              <p className="text-[10px] text-lol-gold-dark mt-2 italic">
                {pick.champion} es pickado el {pick.pickRate}% de las partidas en {pick.tournament}, con un win rate del {pick.winRate}% y ban rate del {pick.banRate}%.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
