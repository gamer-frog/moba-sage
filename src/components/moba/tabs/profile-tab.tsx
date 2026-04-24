'use client';

import { motion } from 'framer-motion';
import { User, Search, MapPin, ChevronDown, Loader2, Crown, AlertTriangle, Sparkles, Trophy, Clock, Key } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SmallChampionIcon } from '../champion-icon';
import { REGIONS, TIER_COLORS } from '../constants';
import type { SummonerData } from '../types';
import type { LucideIcon } from 'lucide-react';

export function ProfileTab({
  summonerName, onSummonerNameChange,
  summonerRegion, onSummonerRegionChange,
  summonerData, summonerLoading, summonerError,
  onSearchSummoner,
}: {
  summonerName: string;
  onSummonerNameChange: (v: string) => void;
  summonerRegion: string;
  onSummonerRegionChange: (v: string) => void;
  summonerData: SummonerData | null;
  summonerLoading: boolean;
  summonerError: string;
  onSearchSummoner: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="w-5 h-5 text-[#c8aa6e]" />
        <div>
          <h2 className="text-lg font-bold text-[#f0e6d2]">Perfil de Invocador</h2>
          <p className="text-xs text-[#5b5a56]">Busca cualquier invocador para ver su perfil</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(200,170,110,0.08)', border: '1px solid rgba(200,170,110,0.15)' }}>
        <Sparkles className="w-4 h-4 text-[#c8aa6e] shrink-0" />
        <p className="text-xs text-[#a09b8c]">Modo Demo — Conecta tu API Key de Riot para datos reales</p>
      </div>

      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[#a09b8c] mb-1.5 block tracking-wide uppercase">Nombre de Invocador</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5b5a56]" />
              <Input
                placeholder="Ej: Faker"
                value={summonerName}
                onChange={e => onSummonerNameChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSearchSummoner()}
                className="pl-10 bg-[#0a0e1a]/60 border-[#785a28]/30 text-[#f0e6d2] placeholder:text-[#5b5a56] focus-visible:border-[#c8aa6e] focus-visible:ring-[#c8aa6e]/20 h-10 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#a09b8c] mb-1.5 block tracking-wide uppercase">Región</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5b5a56] pointer-events-none" />
              <select
                value={summonerRegion}
                onChange={e => onSummonerRegionChange(e.target.value)}
                className="w-full pl-10 pr-8 h-10 rounded-lg bg-[#0a0e1a]/60 border-[#785a28]/30 text-[#f0e6d2] text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#c8aa6e] focus:ring-[#c8aa6e]/20"
                style={{ backgroundImage: 'none' }}
              >
                {REGIONS.map(r => (
                  <option key={r.value} value={r.value} className="bg-[#1e2328] text-[#f0e6d2]">{r.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5b5a56] pointer-events-none" />
            </div>
          </div>
        </div>
        <Button onClick={onSearchSummoner} disabled={summonerLoading || !summonerName.trim()} className="w-full bg-[#c8aa6e] text-[#0a0e1a] hover:bg-[#c8aa6e]/90 font-semibold rounded-lg gap-2">
          {summonerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Buscar
        </Button>
      </div>

      {summonerError && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#e84057]/30" style={{ background: 'rgba(232,64,87,0.08)' }}>
          <AlertTriangle className="w-4 h-4 text-[#e84057] shrink-0" />
          <p className="text-sm text-[#e84057]">{summonerError}</p>
        </motion.div>
      )}

      {summonerLoading && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="h-40 rounded-xl" />
        </div>
      )}

      {summonerData && !summonerLoading && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 relative" style={{ border: '3px solid #c8aa6e', boxShadow: '0 0 20px rgba(200,170,110,0.2)' }}>
                <Image src={`https://ddragon.leagueoflegends.com/cdn/img/profileicon/${summonerData.profileIconId}.png`} alt={summonerData.name} fill className="object-cover" unoptimized />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-[#f0e6d2] truncate">{summonerData.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Crown className="w-4 h-4 text-[#c8aa6e]" />
                  <span className="text-sm text-[#a09b8c]">Nivel {summonerData.level}</span>
                </div>
                <Badge variant="outline" className="mt-2 text-[10px] border-[#0acbe6]/30 text-[#0acbe6]">{summonerRegion}</Badge>
              </div>
            </div>
          </div>

          {summonerData.ranked.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summonerData.ranked.map(entry => {
                const queueLabel = entry.queueType === 'RANKED_SOLO_5x5' ? 'Solo/Duo' : 'Flex 5v5';
                const queueIcon: LucideIcon = entry.queueType === 'RANKED_SOLO_5x5' ? Crown : User;
                const tierColor = TIER_COLORS[entry.tier] || '#a09b8c';
                const totalGames = entry.wins + entry.losses;
                const winRate = totalGames > 0 ? ((entry.wins / totalGames) * 100).toFixed(1) : '0';
                const Icon = queueIcon;

                return (
                  <motion.div key={entry.queueType} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-4 h-4" style={{ color: tierColor }} />
                      <span className="text-xs font-medium text-[#a09b8c] uppercase tracking-wider">{queueLabel}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${tierColor}20, ${tierColor}08)`, border: `1.5px solid ${tierColor}40` }}>
                          <span className="text-lg font-black block leading-none" style={{ color: tierColor }}>{entry.tier[0]}{entry.rank}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#f0e6d2]">{entry.tier} {entry.rank}</p>
                        <p className="text-xs text-[#a09b8c]"><span className="font-mono font-semibold" style={{ color: '#c8aa6e' }}>{entry.lp}</span> LP</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                          <span className="text-[#0acbe6]">{entry.wins}V</span>
                          <span className="text-[#5b5a56]">/</span>
                          <span className="text-[#e84057]">{entry.losses}D</span>
                          <span className="text-[#a09b8c] ml-1">({winRate}%)</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {summonerData.mostPlayed.length > 0 && (
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-[#c8aa6e]" />
                <h4 className="text-sm font-semibold text-[#f0e6d2]">Campeones Más Jugados</h4>
              </div>
              <div className="space-y-2">
                {summonerData.mostPlayed.map((entry, idx) => (
                  <motion.div key={entry.champion} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1e2328]/60 transition-colors">
                    <SmallChampionIcon name={entry.champion} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#f0e6d2] truncate">{entry.champion}</p>
                      <p className="text-[11px] text-[#5b5a56]">{entry.games} partidas</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold font-mono" style={{ color: entry.winRate >= 52 ? '#0acbe6' : entry.winRate >= 48 ? '#a09b8c' : '#e84057' }}>{entry.winRate}%</p>
                      <p className="text-[10px] text-[#5b5a56]">Win Rate</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {!summonerData && !summonerLoading && !summonerError && (
        <div className="space-y-6">
          {/* Empty state for search */}
          <div className="text-center py-10">
            <User className="w-16 h-16 mx-auto mb-4 text-[#785a28]/30" />
            <p className="text-[#5b5a56] text-sm">Busca un invocador para ver su perfil</p>
            <p className="text-[#785a28]/40 text-xs mt-1">Escribe el nombre y selecciona una región</p>
          </div>

          {/* Match History Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[#c8aa6e]" />
              <h4 className="text-sm font-semibold text-[#f0e6d2] lol-title">Historial de Partidas</h4>
            </div>
            <div className="relative pl-6">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-px" style={{ background: 'linear-gradient(180deg, rgba(200,170,110,0.3), rgba(120,90,40,0.1), transparent)' }} />

              {Array.from({ length: 5 }).map((_, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.08 }}
                  className="relative mb-3 last:mb-0"
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-6 top-4 w-[9px] h-[9px] rounded-full"
                    style={{ background: 'rgba(120,90,40,0.3)', border: '2px solid rgba(120,90,40,0.15)' }}
                  />

                  {/* Match slot */}
                  <div
                    className="rounded-xl p-4 flex items-center gap-4"
                    style={{
                      background: 'rgba(30,35,40,0.3)',
                      border: '2px dashed rgba(120,90,40,0.15)',
                    }}
                  >
                    {/* Faded champion silhouette placeholder */}
                    <div
                      className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
                      style={{ background: 'rgba(120,90,40,0.08)', border: '1px solid rgba(120,90,40,0.1)' }}
                    >
                      <User className="w-5 h-5 text-[#785a28]/15" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#5b5a56]/50 truncate">Partida {5 - idx}</p>
                      <p className="text-[10px] text-[#5b5a56]/30 mt-0.5">Esperando datos...</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'rgba(120,90,40,0.08)' }}>
                        <span className="text-[8px] text-[#5b5a56]/30">—</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Connect API Key hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-5 rounded-xl p-4 flex items-center gap-3"
              style={{ background: 'rgba(200,170,110,0.06)', border: '1px solid rgba(200,170,110,0.12)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(200,170,110,0.1)', border: '1px solid rgba(200,170,110,0.2)' }}>
                <Key className="w-4 h-4 text-[#c8aa6e]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#c8aa6e]">Conecta tu API Key de Riot</p>
                <p className="text-[10px] text-[#5b5a56] mt-0.5">para ver tu historial de partidas completo</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
