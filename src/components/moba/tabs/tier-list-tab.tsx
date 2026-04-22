'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Search, Filter, Star, LayoutGrid, List, TrendingUp, BarChart3, X, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ChampionIcon } from '../champion-icon';
import { RoleBadge } from '../badges';
import { TierSection, TierSectionSkeleton } from '../tier-section';
import { TIER_CONFIG } from '../constants';
import type { Champion, GameSelection } from '../types';

interface TierListTabProps {
  champions: Champion[];
  loading: boolean;
  selectedGame: GameSelection;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  roleFilter: string;
  onRoleFilterChange: (r: string) => void;
  favorites: Set<number>;
  onToggleFavorite: (id: number) => void;
  onChampionClick: (c: Champion) => void;
  metaLastUpdated?: string;
}

const ROLES = ['Todos', 'Top', 'Jungle', 'Mid', 'ADC', 'Support'];

function wrColor(wr: number): string {
  if (wr >= 53) return '#0fba81';
  if (wr >= 51) return '#0acbe6';
  if (wr >= 49) return '#f0c646';
  return '#e84057';
}

export function TierListTab({
  champions, loading, selectedGame,
  searchQuery, onSearchChange, roleFilter, onRoleFilterChange,
  favorites, onToggleFavorite, onChampionClick, metaLastUpdated,
}: TierListTabProps) {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const gameChampions = champions.filter(c => {
    if (selectedGame === 'lol' && c.game !== 'LoL') return false;
    if (selectedGame === 'wildrift' && c.game !== 'WR') return false;
    return true;
  });

  const searchSuggestions = searchQuery.length >= 1
    ? gameChampions.filter(c => {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().startsWith(q) || c.title.toLowerCase().includes(q);
      }).slice(0, 5)
    : [];

  const filteredChampions = gameChampions.filter(c => {
    if (roleFilter === '★' && !favorites.has(c.id)) return false;
    if (roleFilter !== 'Todos' && roleFilter !== '★' && c.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
    }
    return true;
  });

  const groupedChampions: Record<string, Champion[]> = {};
  ['S', 'A', 'B'].forEach(tier => {
    const tierChamps = filteredChampions.filter(c => c.tier === tier);
    if (tierChamps.length > 0) groupedChampions[tier] = tierChamps;
  });

  // Meta overview stats
  const sTiers = gameChampions.filter(c => c.tier === 'S');
  const topWR = [...gameChampions].sort((a, b) => b.winRate - a.winRate).slice(0, 3);
  const topBan = [...gameChampions].sort((a, b) => b.banRate - a.banRate).slice(0, 3);
  const topPick = [...gameChampions].sort((a, b) => b.pickRate - a.pickRate).slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {/* View toggle + Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5b5a56]" />
            <Input
              placeholder="Buscar campeón..."
              value={searchQuery}
              onChange={e => { onSearchChange(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 bg-[#1e2328]/60 border-[#785a28]/30 text-[#f0e6d2] placeholder:text-[#5b5a56] focus-visible:border-[#c8aa6e] focus-visible:ring-[#c8aa6e]/20 h-10 rounded-lg"
              aria-label="Buscar campeón"
              aria-expanded={showSuggestions && searchSuggestions.length > 0}
              aria-autocomplete="list"
              role="combobox"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { onSearchChange(''); setShowSuggestions(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3 h-3 text-[#5b5a56]" />
              </button>
            )}
            {showSuggestions && searchSuggestions.length > 0 && searchQuery.length >= 1 && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-50" style={{ background: 'rgba(30,35,40,0.95)', border: '1px solid rgba(200,170,110,0.2)', backdropFilter: 'blur(12px)' }}>
                {searchSuggestions.map(s => (
                  <button
                    key={s.id}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#c8aa6e]/10 transition-colors"
                    onMouseDown={() => { onSearchChange(s.name); setShowSuggestions(false); onChampionClick(s); }}
                  >
                    <ChampionIcon name={s.name} tier={s.tier} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#f0e6d2] truncate">{s.name}</p>
                      <p className="text-[9px] text-[#5b5a56]">{s.role} · {s.winRate}% WR</p>
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: TIER_CONFIG[s.tier]?.color }}>{s.tier}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Board/List toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'board' : 'list')}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'rgba(30,35,40,0.6)', border: '1px solid rgba(120,90,40,0.3)' }}
            title={viewMode === 'list' ? 'Vista Tablero' : 'Vista Lista'}
          >
            {viewMode === 'list' ? <LayoutGrid className="w-4 h-4 text-[#a09b8c]" /> : <List className="w-4 h-4 text-[#a09b8c]" />}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(role => (
            <button
              key={role}
              onClick={() => onRoleFilterChange(role)}
              className={`
                px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                ${roleFilter === role
                  ? 'bg-[#c8aa6e]/15 text-[#c8aa6e] border border-[#c8aa6e]/30 shadow-[0_0_10px_rgba(200,170,110,0.08)]'
                  : 'text-[#5b5a56] hover:text-[#a09b8c] hover:bg-[#1e2328]/40 border border-transparent'
                }
              `}
              aria-pressed={roleFilter === role}
            >
              {role === 'Todos' && <Filter className="w-3 h-3 mr-1 inline" />}
              {role}
            </button>
          ))}
          <button
            onClick={() => onRoleFilterChange(roleFilter === '★' ? 'Todos' : '★')}
            className={`
              px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
              ${roleFilter === '★'
                ? 'bg-[#f0c646]/15 text-[#f0c646] border border-[#f0c646]/30'
                : 'text-[#5b5a56] hover:text-[#f0c646] hover:bg-[#1e2328]/40 border border-transparent'
              }
            `}
          >
            <Star className="w-3 h-3 mr-1 inline" fill={roleFilter === '★' ? '#f0c646' : 'none'} />
            Favoritos ({favorites.size})
          </button>
        </div>
      </div>

      {/* Meta Overview Summary */}
      {!loading && !searchQuery && roleFilter === 'Todos' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2"
        >
          <StatCard
            label="Tier S"
            value={`${sTiers.length} campeones`}
            sub="Dioses del meta"
            color="#c8aa6e"
            icon={<BarChart3 className="w-4 h-4" />}
          />
          <StatCard
            label="Top Win Rate"
            value={topWR[0]?.winRate ? `${topWR[0].winRate}%` : '—'}
            sub={topWR[0]?.name ?? ''}
            color={wrColor(topWR[0]?.winRate ?? 0)}
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <StatCard
            label="Más Baneado"
            value={topBan[0]?.banRate ? `${topBan[0].banRate}%` : '—'}
            sub={topBan[0]?.name ?? ''}
            color="#e84057"
            icon={<BarChart3 className="w-4 h-4" />}
          />
          <StatCard
            label="Más Pick"
            value={topPick[0]?.pickRate ? `${topPick[0].pickRate}%` : '—'}
            sub={topPick[0]?.name ?? ''}
            color="#5b8af5"
            icon={<BarChart3 className="w-4 h-4" />}
          />
        </motion.div>
      )}

      {/* Meta freshness indicator */}
      {!loading && metaLastUpdated && (
        <div className="flex items-center gap-2 text-[10px] text-[#5b5a56]">
          <RefreshCw className="w-3 h-3" />
          <span>Datos actualizados: {new Date(metaLastUpdated).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-[#0fba81]">●</span>
          <span> fuentes: U.GG, Mobalytics, Blitz.gg, Buildzcrank, PropelRC, Amber.gg</span>
        </div>
      )}

      {loading ? (
        <>
          <TierSectionSkeleton />
          <TierSectionSkeleton />
        </>
      ) : viewMode === 'list' ? (
        Object.entries(groupedChampions).map(([tier, champs]) => (
          <TierSection
            key={tier}
            tier={tier}
            champions={champs}
            onChampionClick={onChampionClick}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />
        ))
      ) : (
        <BoardView champions={filteredChampions} favorites={favorites} onChampionClick={onChampionClick} onToggleFavorite={onToggleFavorite} />
      )}

      {!loading && filteredChampions.length === 0 && (
        <div className="text-center py-16 text-[#5b5a56]">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium">No se encontraron campeones</p>
          <p className="text-sm mt-1">Intenta con otro filtro o búsqueda</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color, icon }: {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2.5 flex flex-col gap-0.5"
      style={{
        background: `linear-gradient(135deg, ${color}08, transparent)`,
        border: `1px solid ${color}18`,
      }}
    >
      <div className="flex items-center gap-1.5">
        <div style={{ color }} className="opacity-60">{icon}</div>
        <span className="text-[10px] text-[#5b5a56] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <span className="text-base font-bold font-mono" style={{ color }}>{value}</span>
      <span className="text-[10px] text-[#a09b8c] truncate">{sub}</span>
    </div>
  );
}

function BoardView({ champions, favorites, onChampionClick, onToggleFavorite }: {
  champions: Champion[];
  favorites: Set<number>;
  onChampionClick: (c: Champion) => void;
  onToggleFavorite: (id: number) => void;
}) {
  return (
    <div className="space-y-4">
      {['S', 'A', 'B'].map(tier => {
        const tierChamps = champions.filter(c => c.tier === tier);
        if (tierChamps.length === 0) return null;
        const cfg = TIER_CONFIG[tier];
        return (
          <div key={tier}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-black tracking-wider" style={{ color: cfg.color, textShadow: `0 0 10px ${cfg.color}30` }}>{tier}</span>
              <span className="text-[10px] text-[#5b5a56]">{cfg.label}</span>
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${cfg.color}30, transparent)` }} />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {tierChamps.map(champ => (
                <motion.button
                  key={champ.id}
                  onClick={() => onChampionClick(champ)}
                  className="relative group flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 cursor-pointer"
                  style={{ background: 'rgba(30,35,40,0.5)', border: `1px solid ${cfg.color}20` }}
                  whileHover={{ scale: 1.05, borderColor: `${cfg.color}50` }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChampionIcon name={champ.name} tier={champ.tier} />
                  <div className="text-center min-w-0 w-full">
                    <p className="text-[11px] font-semibold text-[#f0e6d2] truncate">{champ.name}</p>
                    <p className="text-[9px] font-mono" style={{ color: wrColor(champ.winRate) }}>{champ.winRate}%</p>
                  </div>
                  <RoleBadge role={champ.role} />
                  {favorites.has(champ.id) && (
                    <div className="absolute -top-1 -right-1">
                      <Star className="w-3 h-3 text-[#f0c646]" fill="#f0c646" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
