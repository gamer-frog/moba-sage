'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, Filter, Star, LayoutGrid, List, TrendingUp, BarChart3, X, RefreshCw, ArrowUpCircle, ArrowDownCircle, Clock, ExternalLink, Database, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ChampionIcon } from '../champion-icon';
import { RoleBadge } from '../badges';
import { TierSection, TierSectionSkeleton } from '../tier-section';
import { TIER_CONFIG } from '../constants';
import { ChampionCard } from '../champion-card';
import { WeeklyWRChart } from '../weekly-wr-chart';
import type { Champion, GameSelection } from './types';

// ---- Local types for tierlist feed ----
interface TierlistFeed {
  lastUpdated: string;
  source: string;
  version: number;
  sources?: Array<{ name: string; url: string; lastScraped: string }>;
  lol?: {
    patch?: string;
    rising?: string[];
    falling?: string[];
    sTier?: Array<{ name: string; role: string; winrate?: string; reason?: string }>;
    aTier?: Array<{ name: string; role: string; winrate?: string; reason?: string }>;
    watch26_9?: string[];
    weeklyTop?: Array<{ name: string; role: string; currentWR: number; change: number }>;
  };
  valorant?: Record<string, unknown>;
  cs2?: Record<string, unknown>;
}

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

// Extract champion name from feed entry (e.g. "Taliyah (buff 26.9)" → "Taliyah")
function extractChampName(entry: string): string {
  return entry.replace(/\s*\(.*\)\s*$/, '').trim();
}

export function TierListTab({
  champions, loading, selectedGame,
  searchQuery, onSearchChange, roleFilter, onRoleFilterChange,
  favorites, onToggleFavorite, onChampionClick, metaLastUpdated,
}: TierListTabProps) {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [feedData, setFeedData] = useState<TierlistFeed | null>(null);
  const [feedLoading, setFeedLoading] = useState(true);
  const [showSources, setShowSources] = useState(false);
  const [expandedWeekly, setExpandedWeekly] = useState<string | null>(null);

  // Fetch tierlist-feed.json on mount
  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch('/tierlist-feed.json');
        if (res.ok) {
          const data: TierlistFeed = await res.json();
          setFeedData(data);
        }
      } catch (err) {
        console.error('Error loading tierlist feed:', err);
      } finally {
        setFeedLoading(false);
      }
    }
    fetchFeed();
  }, []);

  // Build trend map from feed data
  const trendMap: Record<string, 'rising' | 'falling'> = {};
  if (feedData?.lol?.rising) {
    for (const entry of feedData.lol.rising) {
      trendMap[extractChampName(entry)] = 'rising';
    }
  }
  if (feedData?.lol?.falling) {
    for (const entry of feedData.lol.falling) {
      trendMap[extractChampName(entry)] = 'falling';
    }
  }

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

  // Rising & falling data from feed
  const risingChampions = feedData?.lol?.rising || [];
  const fallingChampions = feedData?.lol?.falling || [];

  // Weekly top movers
  const weeklyTop = feedData?.lol?.weeklyTop || [];

  // Data sources
  const dataSources = feedData?.sources || [
    { name: 'U.GG', url: 'https://u.gg', lastScraped: new Date().toISOString() },
    { name: 'OP.GG', url: 'https://op.gg', lastScraped: new Date().toISOString() },
    { name: 'Mobalytics', url: 'https://mobalytics.com', lastScraped: new Date().toISOString() },
  ];

  const feedLastUpdated = feedData?.lastUpdated
    ? new Date(feedData.lastUpdated).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

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

      {/* Rising & Falling Sections from tierlist-feed.json */}
      {!feedLoading && (risingChampions.length > 0 || fallingChampions.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {risingChampions.length > 0 && (
            <div className="rounded-xl p-3 border border-[#0fba81]/20" style={{ background: 'rgba(15,186,129,0.04)' }}>
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpCircle className="w-4 h-4 text-[#0fba81]" />
                <span className="lol-title text-xs text-[#0fba81]">En Ascenso</span>
                <span className="text-[9px] text-[#5b5a56] ml-auto">{risingChampions.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {risingChampions.map((entry, i) => {
                  const name = extractChampName(entry);
                  const reason = entry.match(/\((.+)\)/)?.[1] || '';
                  return (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-[#0fba81]" style={{ background: 'rgba(15,186,129,0.08)', border: '1px solid rgba(15,186,129,0.15)' }}>
                      <span className="font-bold">↑</span>
                      {name}
                      {reason && <span className="text-[8px] text-[#5b5a56]">{reason}</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {fallingChampions.length > 0 && (
            <div className="rounded-xl p-3 border border-[#e84057]/20" style={{ background: 'rgba(232,64,87,0.04)' }}>
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownCircle className="w-4 h-4 text-[#e84057]" />
                <span className="lol-title text-xs text-[#e84057]">En Caída</span>
                <span className="text-[9px] text-[#5b5a56] ml-auto">{fallingChampions.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {fallingChampions.map((entry, i) => {
                  const name = extractChampName(entry);
                  const reason = entry.match(/\((.+)\)/)?.[1] || '';
                  return (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-[#e84057]" style={{ background: 'rgba(232,64,87,0.08)', border: '1px solid rgba(232,64,87,0.15)' }}>
                      <span className="font-bold">↓</span>
                      {name}
                      {reason && <span className="text-[8px] text-[#5b5a56]">{reason}</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Weekly Top Movers — Bar chart section */}
      {!loading && weeklyTop.length > 0 && !searchQuery && roleFilter === 'Todos' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-4 space-y-3"
          style={{ border: '1px solid rgba(200,170,110,0.15)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#c8aa6e]" />
              <span className="lol-label text-xs font-semibold text-[#c8aa6e] uppercase tracking-wider">
                Top Movimientos Semanales
              </span>
              <span className="text-[9px] text-[#5b5a56]">Patch {feedData?.lol?.patch || '26.8'}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Green/Red legend */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  <div className="w-2 h-2 rounded-sm bg-[#0fba81]" />
                  <span className="text-[8px] text-[#5b5a56]">Sube</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <div className="w-2 h-2 rounded-sm bg-[#e84057]" />
                  <span className="text-[8px] text-[#5b5a56]">Baja</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-[#5b5a56]">
                <Clock className="w-3 h-3" />
                {feedLastUpdated || 'Actualizado hoy'}
              </div>
            </div>
          </div>

          {/* Bar chart — horizontal bars for weekly changes, GREEN=up RED=down */}
          <div className="space-y-2">
            {weeklyTop.map((mover, i) => {
              const champ = gameChampions.find(c => c.name === mover.name);
              if (!champ) return null;
              const isPositive = mover.change > 0;
              const barColor = isPositive ? '#0fba81' : '#e84057';
              const barWidth = Math.min(Math.abs(mover.change) * 12, 85);
              const isExpanded = expandedWeekly === mover.name;

              return (
                <motion.div
                  key={mover.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <button
                    onClick={() => setExpandedWeekly(isExpanded ? null : mover.name)}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors text-left cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <ChampionIcon name={mover.name} tier={champ.tier} />
                      {isPositive ? (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0a0e1a] flex items-center justify-center border border-[#0fba81]/40">
                          <TrendingUp className="w-2.5 h-2.5 text-[#0fba81]" />
                        </div>
                      ) : (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0a0e1a] flex items-center justify-center border border-[#e84057]/40">
                          <ArrowDownCircle className="w-2.5 h-2.5 text-[#e84057]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-semibold text-[#f0e6d2] truncate">{mover.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <RoleBadge role={mover.role} />
                          {/* Clear direction indicator */}
                          <span
                            className="text-[11px] font-mono font-black px-1.5 py-0.5 rounded"
                            style={{
                              color: barColor,
                              background: `${barColor}12`,
                              border: `1px solid ${barColor}25`,
                            }}
                          >
                            {isPositive ? '↑' : '↓'}{Math.abs(mover.change).toFixed(1)}%
                          </span>
                          <span className="text-[9px] text-[#a09b8c] font-mono">{mover.currentWR}%</span>
                        </div>
                      </div>
                      {/* Animated bar — GREEN fills right if positive, RED fills left if negative */}
                      <div className="w-full h-2 rounded-full overflow-hidden relative" style={{ background: 'rgba(120,90,40,0.08)' }}>
                        {isPositive ? (
                          <motion.div
                            className="absolute right-0 top-0 h-full rounded-full"
                            style={{
                              background: `linear-gradient(270deg, ${barColor}, ${barColor}50)`,
                              boxShadow: `0 0 8px ${barColor}30`,
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.7, delay: i * 0.05, ease: 'easeOut' }}
                          />
                        ) : (
                          <motion.div
                            className="absolute left-0 top-0 h-full rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${barColor}, ${barColor}50)`,
                              boxShadow: `0 0 8px ${barColor}30`,
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.7, delay: i * 0.05, ease: 'easeOut' }}
                          />
                        )}
                      </div>
                    </div>
                  </button>
                  {/* Expanded weekly chart */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-14 pr-2 pt-1 pb-2">
                          <WeeklyWRChart championName={mover.name} currentWR={mover.currentWR} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

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

      {/* Role Win Rate Summary Bar */}
      {!loading && !searchQuery && roleFilter === 'Todos' && gameChampions.length > 0 && (() => {
        const roles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'] as const;
        const roleData = roles.map(role => {
          const champs = gameChampions.filter(c => c.role === role);
          if (champs.length === 0) return { role, avg: 0, count: 0 };
          const avg = champs.reduce((sum, c) => sum + c.winRate, 0) / champs.length;
          return { role, avg: Math.round(avg * 10) / 10, count: champs.length };
        });
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-4"
          >
            <p className="lol-label text-[10px] text-[#c8aa6e] mb-3">Promedio WR por Rol</p>
            <div className="flex flex-wrap items-center gap-3">
              {roleData.map(({ role, avg, count }) => {
                const color = avg > 51 ? '#0fba81' : avg > 50 ? '#c8aa6e' : '#e84057';
                return (
                  <div
                    key={role}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[100px] justify-center"
                    style={{ background: `${color}08`, border: `1px solid ${color}18` }}
                  >
                    <span className="lol-label text-[10px] text-[#a09b8c]">{role}</span>
                    <span className="text-sm font-bold font-mono" style={{ color }}>{avg}%</span>
                    <span className="text-[8px] text-[#5b5a56]">({count})</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })()}

      {/* Meta freshness indicator with source attribution */}
      {!loading && (metaLastUpdated || feedLastUpdated) && (
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#5b5a56]">
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" />
            <span>Datos actualizados: {feedLastUpdated || metaLastUpdated}</span>
            <span className="text-[#0fba81]">●</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="w-3 h-3" />
            <span>Fuentes: </span>
            {dataSources.map((s, i) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[#a09b8c] hover:text-[#c8aa6e] transition-colors"
              >
                {s.name}
                <ExternalLink className="w-2 h-2" />
                {i < dataSources.length - 1 && <span className="text-[#785a28]">·</span>}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible Data Sources */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(120,90,40,0.2)' }}
        >
          <button
            onClick={() => setShowSources(!showSources)}
            className="w-full flex items-center gap-2 p-3 text-left hover:bg-white/[0.02] transition-colors"
          >
            <Database className="w-4 h-4 text-[#c8aa6e]" />
            <span className="lol-label text-xs font-semibold text-[#c8aa6e] uppercase tracking-wider">
              Fuentes de Datos
            </span>
            <span className="text-[9px] text-[#5b5a56]">{dataSources.length} fuentes</span>
            <ChevronDown
              className={`w-3.5 h-3.5 ml-auto text-[#5b5a56] transition-transform duration-200 ${showSources ? '' : '-rotate-90'}`}
            />
          </button>
          <AnimatePresence>
            {showSources && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {dataSources.map((source) => (
                      <a
                        key={source.name}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2.5 transition-all duration-200 hover:scale-[1.01] hover:bg-white/[0.02]"
                        style={{
                          background: 'rgba(200,170,110,0.04)',
                          border: '1px solid rgba(200,170,110,0.1)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-[#f0e6d2]">{source.name}</span>
                          <ExternalLink className="w-3 h-3 text-[#5b5a56]" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-[#5b5a56]" />
                          <span className="text-[8px] text-[#5b5a56] font-mono">
                            {new Date(source.lastScraped).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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
            trendMap={trendMap}
            showWeeklyChart={true}
          />
        ))
      ) : (
        <BoardView champions={filteredChampions} favorites={favorites} onChampionClick={onChampionClick} onToggleFavorite={onToggleFavorite} trendMap={trendMap} />
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
        <span className="lol-label text-[10px] text-[#5b5a56]">{label}</span>
      </div>
      <span className="text-base font-bold font-mono" style={{ color }}>{value}</span>
      <span className="text-[10px] text-[#a09b8c] truncate">{sub}</span>
    </div>
  );
}

function BoardView({ champions, favorites, onChampionClick, onToggleFavorite, trendMap }: {
  champions: Champion[];
  favorites: Set<number>;
  onChampionClick: (c: Champion) => void;
  onToggleFavorite: (id: number) => void;
  trendMap?: Record<string, 'rising' | 'falling'>;
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
              <span className="lol-title text-sm" style={{ color: cfg.color, textShadow: `0 0 10px ${cfg.color}30` }}>{tier}</span>
              <span className="text-[10px] text-[#5b5a56]">{cfg.label}</span>
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${cfg.color}30, transparent)` }} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {tierChamps.map(champ => (
                <ChampionCard
                  key={champ.id}
                  champion={champ}
                  onClick={() => onChampionClick(champ)}
                  showFavorite={true}
                  isFavorite={favorites.has(champ.id)}
                  trend={trendMap?.[champ.name]}
                  size="sm"
                  showWeeklyChart={false}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
