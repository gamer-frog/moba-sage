'use client';

import { motion } from 'framer-motion';
import { Crown, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TinyChampionIcon } from '../champion-icon';
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
        <Crown className="w-5 h-5 text-[#f0c646]" />
        <div>
          <h2 className="text-lg font-bold text-[#f0e6d2]">Escena Competitiva</h2>
          <p className="text-xs text-[#5b5a56]">Campeones más pickados en torneos profesionales</p>
        </div>
      </div>

      {isWR && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(10,203,230,0.08)', border: '1px solid rgba(10,203,230,0.2)' }}>
          <Info className="w-4 h-4 text-[#0acbe6] shrink-0" />
          <p className="text-xs text-[#a09b8c]">Datos competitivos de Wild Rift próximamente. Mostrando datos de LoL como referencia.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {TOURNAMENT_REGIONS.map(r => (
          <button
            key={r.value || 'all'}
            onClick={() => onProRegionFilterChange(r.value)}
            className={`
              px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
              ${proRegionFilter === r.value
                ? 'bg-[#f0c646]/15 text-[#f0c646] border border-[#f0c646]/30'
                : 'text-[#5b5a56] hover:text-[#a09b8c] hover:bg-[#1e2328]/40 border border-transparent'
              }
            `}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-[2.5rem_1fr_4rem_5rem_3.5rem_3.5rem_3.5rem] gap-2 px-4 py-2 text-[8px] text-[#5b5a56] uppercase tracking-widest font-medium" style={{ borderBottom: '1px solid rgba(120,90,40,0.15)' }}>
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
          <div className="divide-y divide-[#785a28]/10">
            {filteredPicks.map((pick, idx) => (
              <motion.div
                key={pick.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#1e2328]/40 transition-colors"
              >
                <TinyChampionIcon name={pick.champion} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-[#f0e6d2]">{pick.champion}</span>
                </div>
                <div className="hidden sm:block w-16 shrink-0">
                  <RoleBadge role={pick.role} />
                </div>
                <div className="hidden sm:block w-20 shrink-0">
                  <TournamentBadge tournament={pick.tournament} />
                </div>
                <div className="hidden sm:flex items-center gap-2.5 shrink-0 text-[11px] w-[10.5rem] justify-end">
                  <span className="font-mono font-semibold text-[#0acbe6] w-14 text-right">{pick.pickRate}%</span>
                  <span className="font-mono font-semibold w-14 text-right" style={{ color: pick.banRate > 10 ? '#e84057' : '#a09b8c' }}>{pick.banRate}%</span>
                  <span className="font-mono font-semibold w-14 text-right" style={{ color: pick.winRate >= 54 ? '#0acbe6' : pick.winRate >= 50 ? '#a09b8c' : '#e84057' }}>{pick.winRate}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {!loading && filteredPicks.length === 0 && (
        <div className="text-center py-12 text-[#5b5a56]">
          <Crown className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No hay datos para esta región</p>
        </div>
      )}
    </div>
  );
}
