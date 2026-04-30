'use client';

import { motion } from 'framer-motion';
import { User, Search, MapPin, ChevronDown, Loader2, Crown, AlertTriangle, Sparkles, Trophy, Clock, Key, Swords, TrendingUp, Shield } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SmallChampionIcon } from '../champion-icon';
import { REGIONS, TIER_COLORS } from '../constants';
import type { SummonerData } from '../types';
import type { LucideIcon } from 'lucide-react';

const QUICK_STATS = [
  {
    label: 'Partidas Ranked',
    value: '—',
    icon: Swords,
    color: '#c8aa6e',
  },
  {
    label: 'Win Rate',
    value: '—',
    icon: TrendingUp,
    color: '#0acbe6',
  },
  {
    label: 'Rango Actual',
    value: 'Sin conectar',
    icon: Shield,
    color: '#0fba81',
  },
];

const CONNECT_FEATURES = [
  'Historial de partidas con builds y runas',
  'Estadísticas por campeón',
  'Comparativa con el promedio de tu elo',
  'Progresión de ranking en el tiempo',
];

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
  // Use real data when available
  const displayStats = summonerData
    ? [
        {
          label: 'Partidas Ranked',
          value: summonerData.ranked.length > 0
            ? String(summonerData.ranked.reduce((acc, r) => acc + r.wins + r.losses, 0))
            : '0',
          icon: Swords,
          color: '#c8aa6e',
        },
        {
          label: 'Win Rate',
          value: summonerData.ranked.length > 0
            ? (() => {
                const total = summonerData.ranked.reduce((acc, r) => acc + r.wins + r.losses, 0);
                const wins = summonerData.ranked.reduce((acc, r) => acc + r.wins, 0);
                return total > 0 ? `${((wins / total) * 100).toFixed(1)}%` : '—';
              })()
            : '—',
          icon: TrendingUp,
          color: '#0acbe6',
        },
        {
          label: 'Rango Actual',
          value: summonerData.ranked.length > 0
            ? `${summonerData.ranked[0].tier} ${summonerData.ranked[0].rank}`
            : 'Sin ranked',
          icon: Shield,
          color: '#0fba81',
        },
      ]
    : QUICK_STATS;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="w-5 h-5 text-lol-gold" />
        <div>
          <h2 className="text-lg font-bold text-lol-text">Perfil de Invocador</h2>
          <p className="text-xs text-lol-dim">Busca cualquier invocador para ver su perfil</p>
        </div>
      </div>

      {/* ===== Quick Stats Cards ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-3 gap-3"
      >
        {displayStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.03, y: -2 }}
              className="glass-card rounded-xl p-3 text-center"
              style={{ border: '1px solid rgba(200,170,110,0.15)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${stat.color}15`, border: `1px solid ${stat.color}25` }}
              >
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <p className="text-[10px] text-lol-dim mb-0.5 truncate">{stat.label}</p>
              <p className="text-sm font-bold text-lol-text truncate">{stat.value}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ===== Conecta tu Cuenta Card ===== */}
      {!summonerData && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(200,170,110,0.08), rgba(120,90,40,0.04))',
          border: '1.5px solid rgba(200,170,110,0.25)',
          boxShadow: '0 0 20px rgba(200,170,110,0.05)',
        }}
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #c8aa6e, #785a28)',
                boxShadow: '0 0 16px rgba(200,170,110,0.3)',
              }}
            >
              <Key className="w-5 h-5 text-lol-bg" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-lol-text">Conecta tu cuenta</h3>
              <p className="text-[10px] text-lol-muted">Desbloquea estadísticas completas</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {CONNECT_FEATURES.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#c8aa6e', boxShadow: '0 0 6px rgba(200,170,110,0.4)' }} />
                <span className="text-[11px] text-lol-muted">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      )}

      {!summonerData && (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(200,170,110,0.08)', border: '1px solid rgba(200,170,110,0.15)' }}>
        <Sparkles className="w-4 h-4 text-lol-gold shrink-0" />
        <p className="text-xs text-lol-muted">Modo Demo — Conecta tu API Key de Riot para datos reales</p>
      </div>
      )}

      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="space-y-3">
          <div>
            <label htmlFor="summoner-name" className="text-xs font-medium text-lol-muted mb-1.5 block tracking-wide uppercase">Nombre de Invocador</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lol-dim" />
              <Input
                id="summoner-name"
                placeholder="Ej: Faker"
                value={summonerName}
                onChange={e => onSummonerNameChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSearchSummoner()}
                className="pl-10 bg-lol-bg/60 border-lol-gold-dark/30 text-lol-text placeholder:text-lol-dim focus-visible:border-lol-gold focus-visible:ring-lol-gold/20 h-10 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label htmlFor="summoner-region" className="text-xs font-medium text-lol-muted mb-1.5 block tracking-wide uppercase">Región</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lol-dim pointer-events-none" />
              <select
                id="summoner-region"
                value={summonerRegion}
                onChange={e => onSummonerRegionChange(e.target.value)}
                className="w-full pl-10 pr-8 h-10 rounded-lg bg-lol-bg/60 border-lol-gold-dark/30 text-lol-text text-sm appearance-none cursor-pointer focus:outline-none focus:border-lol-gold focus:ring-[#c8aa6e]/20"
                style={{ backgroundImage: 'none' }}
              >
                {REGIONS.map(r => (
                  <option key={r.value} value={r.value} className="bg-lol-card text-lol-text">{r.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lol-dim pointer-events-none" />
            </div>
          </div>
        </div>
        <Button onClick={onSearchSummoner} disabled={summonerLoading || !summonerName.trim()} className="w-full bg-lol-gold text-lol-bg hover:bg-lol-gold/90 font-semibold rounded-lg gap-2">
          {summonerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Buscar
        </Button>
      </div>

      {summonerError && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-lol-danger/30" style={{ background: 'rgba(232,64,87,0.08)' }}>
          <AlertTriangle className="w-4 h-4 text-lol-danger shrink-0" />
          <p className="text-sm text-lol-danger">{summonerError}</p>
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
                <Image src={`https://ddragon.leagueoflegends.com/cdn/img/profileicon/${summonerData.profileIconId}.png`} alt={summonerData.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-lol-text truncate">{summonerData.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Crown className="w-4 h-4 text-lol-gold" />
                  <span className="text-sm text-lol-muted">Nivel {summonerData.level}</span>
                </div>
                <Badge variant="outline" className="mt-2 text-[10px] border-lol-success/30 text-lol-success">{summonerRegion}</Badge>
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
                      <span className="text-xs font-medium text-lol-muted uppercase tracking-wider">{queueLabel}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${tierColor}20, ${tierColor}08)`, border: `1.5px solid ${tierColor}40` }}>
                          <span className="text-lg font-black block leading-none" style={{ color: tierColor }}>{entry.tier[0]}{entry.rank}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-lol-text">{entry.tier} {entry.rank}</p>
                        <p className="text-xs text-lol-muted"><span className="font-mono font-semibold" style={{ color: '#c8aa6e' }}>{entry.lp}</span> LP</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                          <span className="text-lol-success">{entry.wins}V</span>
                          <span className="text-lol-dim">/</span>
                          <span className="text-lol-danger">{entry.losses}D</span>
                          <span className="text-lol-muted ml-1">({winRate}%)</span>
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
                <Trophy className="w-4 h-4 text-lol-gold" />
                <h4 className="text-sm font-semibold text-lol-text">Campeones Más Jugados</h4>
              </div>
              <div className="space-y-2">
                {summonerData.mostPlayed.map((entry, idx) => (
                  <motion.div key={entry.champion} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-lol-card/60 transition-colors">
                    <SmallChampionIcon name={entry.champion} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-lol-text truncate">{entry.champion}</p>
                      <p className="text-[11px] text-lol-dim">{entry.games} partidas</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold font-mono" style={{ color: entry.winRate >= 52 ? '#0acbe6' : entry.winRate >= 48 ? '#a09b8c' : '#e84057' }}>{entry.winRate}%</p>
                      <p className="text-[10px] text-lol-dim">Win Rate</p>
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
            <User className="w-16 h-16 mx-auto mb-4 text-lol-gold-dark/30" />
            <p className="text-lol-dim text-sm">Busca un invocador para ver su perfil</p>
            <p className="text-lol-gold-dark/40 text-xs mt-1">Escribe el nombre y selecciona una región</p>
          </div>

          {/* Match History Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-lol-gold" />
              <h4 className="text-sm font-semibold text-lol-text lol-title">Historial de Partidas</h4>
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
                      <User className="w-5 h-5 text-lol-gold-dark/15" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-lol-dim/50 truncate">Partida {5 - idx}</p>
                      <p className="text-[10px] text-lol-dim/30 mt-0.5">Esperando datos...</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'rgba(120,90,40,0.08)' }}>
                        <span className="text-[10px] text-lol-dim/30">—</span>
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
                <Key className="w-4 h-4 text-lol-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-lol-gold">Conecta tu API Key de Riot</p>
                <p className="text-[10px] text-lol-dim mt-0.5">para ver tu historial de partidas completo</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
