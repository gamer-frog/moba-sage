'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Star, LayoutGrid, List, TrendingUp, BarChart3, X, RefreshCw, ArrowUpCircle, ArrowDownCircle, Clock, ExternalLink, Database, ChevronDown, ArrowUpDown, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ChampionIcon } from '../champion-icon';
import { RoleBadge } from '../badges';
import { TierSection, TierSectionSkeleton } from '../tier-section';
import { ROLE_CONFIG, TIER_CONFIG, TOURNAMENT_REGIONS } from '../constants';
import { TinyChampionIcon } from '../champion-icon';
import { ChampionCard } from '../champion-card';
import { WeeklyWRChart } from '../weekly-wr-chart';
import type { Champion, GameSelection, ProPick } from '../types';

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

type SortOption = 'winRate' | 'pickRate' | 'banRate' | 'name';

const SORT_OPTIONS: Array<{ id: SortOption; label: string }> = [
  { id: 'winRate', label: 'Win Rate' },
  { id: 'pickRate', label: 'Pick Rate' },
  { id: 'banRate', label: 'Ban Rate' },
  { id: 'name', label: 'Nombre' },
];

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
  proPicks?: ProPick[];
  proRegionFilter?: string;
  onProRegionFilterChange?: (r: string) => void;
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

// Sorting comparator
function sortChampions(champions: Champion[], sortBy: SortOption): Champion[] {
  const sorted = [...champions];
  switch (sortBy) {
    case 'winRate':
      return sorted.sort((a, b) => b.winRate - a.winRate);
    case 'pickRate':
      return sorted.sort((a, b) => b.pickRate - a.pickRate);
    case 'banRate':
      return sorted.sort((a, b) => b.banRate - a.banRate);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

export function TierListTab({
  champions, loading, selectedGame,
  searchQuery, onSearchChange, roleFilter, onRoleFilterChange,
  favorites, onToggleFavorite, onChampionClick, metaLastUpdated,
  proPicks = [], proRegionFilter = '', onProRegionFilterChange = () => {},
}: TierListTabProps) {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [feedData, setFeedData] = useState<TierlistFeed | null>(null);
  const [feedLoading, setFeedLoading] = useState(true);
  const [showSources, setShowSources] = useState(false);
  const [expandedWeekly, setExpandedWeekly] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('winRate');
  const [versionData, setVersionData] = useState<{ cdn: string; gamePatch: string; metaLastUpdated: string; fetchedAt: string } | null>(null);

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

  // Fetch /api/version for enhanced data sources
  useEffect(() => {
    async function fetchVersion() {
      try {
        const res = await fetch('/api/version');
        if (res.ok) {
          const data = await res.json();
          setVersionData({
            cdn: data.lol || '',
            gamePatch: data.gamePatch || (data.lol ? data.lol.split('.').slice(0, 2).join('.') : ''),
            metaLastUpdated: data.metaLastUpdated || '',
            fetchedAt: data.fetchedAt || new Date().toISOString(),
          });
        }
      } catch { /* ignore */ }
    }
    fetchVersion();
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

  // Apply sorting to filtered champions
  const sortedChampions = useMemo(() => sortChampions(filteredChampions, sortBy), [filteredChampions, sortBy]);

  const groupedChampions: Record<string, Champion[]> = {};
  ['S', 'A', 'B'].forEach(tier => {
    const tierChamps = sortedChampions.filter(c => c.tier === tier);
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

  // Color-coded freshness
  const freshnessInfo = (() => {
    if (!versionData?.fetchedAt) return { color: '#5b5a56', label: 'Desconocido' };
    const diffMs = Date.now() - new Date(versionData.fetchedAt).getTime();
    const hours = diffMs / 3600000;
    if (hours < 1) return { color: '#0fba81', label: 'Fresco' };
    if (hours < 6) return { color: '#f0c646', label: 'Aceptable' };
    return { color: '#e84057', label: 'Antiguo' };
  })();
  const lastCheckTime = versionData?.fetchedAt
    ? new Date(versionData.fetchedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : '\u2014';

  return (
    <div className="space-y-5">
      {/* ===== DATA SOURCES BAR — Bloomberg Terminal Style ===== */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(200,170,110,0.04)', border: '1px solid rgba(200,170,110,0.15)' }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(200,170,110,0.1)' }}>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#c8aa6e]" />
              <span className="lol-label text-xs font-bold text-[#c8aa6e] uppercase tracking-wider">Fuentes de Datos</span>
              <span className="text-[9px] text-[#5b5a56]">· {dataSources.length} fuentes activas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#a09b8c]">{versionData?.gamePatch || '26.9'}</span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                style={{ background: `${freshnessInfo.color}15`, color: freshnessInfo.color, border: `1px solid ${freshnessInfo.color}30` }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: freshnessInfo.color }} />
                {freshnessInfo.label}
              </span>
            </div>
          </div>
          {/* Spreadsheet-style columns */}
          <div className="overflow-x-auto">
            <div className="flex min-w-[500px]">
              {dataSources.map((source, i) => {
                const diffMs = Date.now() - new Date(source.lastScraped).getTime();
                const hours = diffMs / 3600000;
                const srcFreshness = hours < 1 ? { color: '#0fba81', label: 'Fresco' } : hours < 6 ? { color: '#f0c646', label: 'Aceptable' } : { color: '#e84057', label: 'Antiguo' };
                return (
                  <a
                    key={source.name}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-2 px-4 py-2.5 transition-colors hover:bg-[#c8aa6e]/5"
                    style={{ borderRight: i < dataSources.length - 1 ? '1px solid rgba(200,170,110,0.08)' : 'none' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#f0e6d2] truncate">{source.name}</p>
                      <p className="text-[10px] text-[#5b5a56] font-mono">
                        {new Date(source.lastScraped).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span
                      className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold"
                      style={{ background: `${srcFreshness.color}12`, color: srcFreshness.color, border: `1px solid ${srcFreshness.color}25` }}
                    >
                      {srcFreshness.label}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== SNAPSHOT DEL META ===== */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <p className="lol-label text-xs text-[#c8aa6e] mb-2 tracking-wider uppercase">Snapshot del Meta</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div
              className="rounded-lg px-3 py-2.5 flex flex-col gap-0.5"
              style={{ background: 'rgba(200,170,110,0.06)', border: '1px solid rgba(200,170,110,0.15)' }}
            >
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#c8aa6e] opacity-60" />
                <span className="lol-label text-[10px] text-[#5b5a56]">Total campeones</span>
              </div>
              <span className="text-base font-bold font-mono text-[#c8aa6e]">{gameChampions.length}</span>
              <span className="text-[10px] text-[#a09b8c]">en el sistema</span>
            </div>
            <div
              className="rounded-lg px-3 py-2.5 flex flex-col gap-0.5"
              style={{ background: 'rgba(200,170,110,0.08)', border: '1px solid rgba(200,170,110,0.25)' }}
            >
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#c8aa6e] opacity-60" />
                <span className="lol-label text-[10px] text-[#5b5a56]">Tier S</span>
              </div>
              <span className="text-base font-bold font-mono text-[#c8aa6e]">{sTiers.length}</span>
              <span className="text-[10px] text-[#a09b8c]">Dioses del meta</span>
            </div>
            <div
              className="rounded-lg px-3 py-2.5 flex flex-col gap-0.5"
              style={{ background: 'rgba(10,203,230,0.06)', border: '1px solid rgba(10,203,230,0.15)' }}
            >
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[#0acbe6] opacity-60" />
                <span className="lol-label text-[10px] text-[#5b5a56]">WR Promedio</span>
              </div>
              <span className="text-base font-bold font-mono text-[#0acbe6]">
                {gameChampions.length > 0
                  ? (gameChampions.reduce((s, c) => s + c.winRate, 0) / gameChampions.length).toFixed(1) + '%'
                  : '\u2014'}
              </span>
              <span className="text-[10px] text-[#a09b8c]">todos los campeones</span>
            </div>
            <div
              className="rounded-lg px-3 py-2.5 flex flex-col gap-0.5"
              style={{ background: 'rgba(15,186,129,0.06)', border: '1px solid rgba(15,186,129,0.15)' }}
            >
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#0fba81] opacity-60" />
                <span className="lol-label text-[10px] text-[#5b5a56]">Mayor WR</span>
              </div>
              <span className="text-base font-bold font-mono text-[#0fba81]">
                {topWR[0]?.winRate ? `${topWR[0].winRate}%` : '\u2014'}
              </span>
              <span className="text-[10px] text-[#a09b8c]">{topWR[0]?.name ?? ''}</span>
            </div>
          </div>
        </motion.div>
      )}

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
            aria-label={viewMode === 'list' ? 'Cambiar a Vista Tablero' : 'Cambiar a Vista Lista'}
          >
            {viewMode === 'list' ? <LayoutGrid className="w-4 h-4 text-[#a09b8c]" /> : <List className="w-4 h-4 text-[#a09b8c]" />}
          </button>
        </div>

        {/* Role filter — Bigger buttons */}
        <div className="flex flex-wrap gap-2">
          {ROLES.map(role => (
            <button
              key={role}
              onClick={() => onRoleFilterChange(role)}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${roleFilter === role
                  ? 'bg-[#c8aa6e]/15 text-[#c8aa6e] border border-[#c8aa6e]/30 shadow-[0_0_12px_rgba(200,170,110,0.1)]'
                  : 'text-[#a09b8c] hover:text-[#f0e6d2] hover:bg-[#1e2328]/60 border border-[#785a28]/15'
                }
              `}
              aria-pressed={roleFilter === role}
            >
              {role === 'Todos' && <Filter className="w-3.5 h-3.5 mr-1.5 inline" />}
              {role}
            </button>
          ))}
          <button
            onClick={() => onRoleFilterChange(roleFilter === '★' ? 'Todos' : '★')}
            className={`
              px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
              ${roleFilter === '★'
                ? 'bg-[#f0c646]/15 text-[#f0c646] border border-[#f0c646]/30'
                : 'text-[#a09b8c] hover:text-[#f0c646] hover:bg-[#1e2328]/60 border border-[#785a28]/15'
              }
            `}
          >
            <Star className="w-3.5 h-3.5 mr-1.5 inline" fill={roleFilter === '★' ? '#f0c646' : 'none'} />
            Favoritos ({favorites.size})
          </button>
        </div>

        {/* Sort Options — Bigger */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#785a28] font-semibold">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Ordenar:</span>
          </div>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={`
                px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 relative
                ${sortBy === opt.id
                  ? 'text-[#c8aa6e] border border-[#c8aa6e]/30'
                  : 'text-[#785a28] hover:text-[#a09b8c] border border-transparent hover:border-[#785a28]/20'
                }
              `}
            >
              {sortBy === opt.id && (
                <motion.div
                  layoutId="sort-active-indicator"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'rgba(200,170,110,0.1)', border: '1px solid rgba(200,170,110,0.3)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rising & Falling Sections from tierlist-feed.json */}
      {!feedLoading && (risingChampions.length > 0 || fallingChampions.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Legend */}
          <div className="flex items-center gap-4 px-1">
            <span className="flex items-center gap-1.5 text-[9px] text-[#5b5a56]">
              <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: '#0fba81' }} /> Win Rate sube
            </span>
            <span className="flex items-center gap-1.5 text-[9px] text-[#5b5a56]">
              <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: '#e84057' }} /> Win Rate baja
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {risingChampions.length > 0 && (
              <div className="rounded-xl p-3" style={{ background: 'rgba(15,186,129,0.05)', border: '1.5px solid rgba(15,186,129,0.2)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUpCircle className="w-5 h-5 text-[#0fba81]" style={{ filter: 'drop-shadow(0 0 6px rgba(15,186,129,0.4))' }} />
                  <span className="lol-title text-sm text-[#0fba81]">En Ascenso</span>
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(15,186,129,0.15)', color: '#0fba81' }}>{risingChampions.length}</span>
                </div>
                <div className="space-y-2">
                  {risingChampions.map((entry, i) => {
                    const name = extractChampName(entry);
                    const reason = entry.match(/\((.+)\)/)?.[1] || '';
                    return (
                      <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(15,186,129,0.06)', border: '1px solid rgba(15,186,129,0.1)' }}>
                        <span className="flex items-center justify-center w-5 h-5 rounded text-[10px] font-black" style={{ background: 'rgba(15,186,129,0.2)', color: '#0fba81' }}>▲</span>
                        <span className="text-[11px] font-semibold text-[#f0e6d2]">{name}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(15,186,129,0.1)' }}>
                          <div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, rgba(15,186,129,0.3), #0fba81)', width: `${Math.max(60, 100 - i * 8)}%`, boxShadow: '0 0 6px rgba(15,186,129,0.3)' }} />
                        </div>
                        {reason && <span className="text-[8px] text-[#5b5a56] shrink-0">{reason}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {fallingChampions.length > 0 && (
              <div className="rounded-xl p-3" style={{ background: 'rgba(232,64,87,0.05)', border: '1.5px solid rgba(232,64,87,0.2)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowDownCircle className="w-5 h-5 text-[#e84057]" style={{ filter: 'drop-shadow(0 0 6px rgba(232,64,87,0.4))' }} />
                  <span className="lol-title text-sm text-[#e84057]">En Caída</span>
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(232,64,87,0.15)', color: '#e84057' }}>{fallingChampions.length}</span>
                </div>
                <div className="space-y-2">
                  {fallingChampions.map((entry, i) => {
                    const name = extractChampName(entry);
                    const reason = entry.match(/\((.+)\)/)?.[1] || '';
                    return (
                      <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(232,64,87,0.06)', border: '1px solid rgba(232,64,87,0.1)' }}>
                        <span className="flex items-center justify-center w-5 h-5 rounded text-[10px] font-black" style={{ background: 'rgba(232,64,87,0.2)', color: '#e84057' }}>▼</span>
                        <span className="text-[11px] font-semibold text-[#f0e6d2]">{name}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden flex justify-end" style={{ background: 'rgba(232,64,87,0.1)' }}>
                          <div className="h-full rounded-full" style={{ background: 'linear-gradient(270deg, rgba(232,64,87,0.3), #e84057)', width: `${Math.max(60, 100 - i * 8)}%`, boxShadow: '0 0 6px rgba(232,64,87,0.3)' }} />
                        </div>
                        {reason && <span className="text-[8px] text-[#5b5a56] shrink-0">{reason}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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

          {/* Bar chart — horizontal bars for weekly changes */}
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
            label="Mejor Win Rate"
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
            label="Más Pickeados"
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
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-[#785a28]">
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Datos actualizados: {feedLastUpdated || metaLastUpdated}</span>
            <span className="text-[#0fba81]">●</span>
          </div>
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
            trendMap={trendMap}
            showWeeklyChart={true}
          />
        ))
      ) : (
        <BoardView champions={sortedChampions} favorites={favorites} onChampionClick={onChampionClick} onToggleFavorite={onToggleFavorite} trendMap={trendMap} />
      )}

      {!loading && filteredChampions.length === 0 && (
        <div className="text-center py-16 text-[#785a28]">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium text-[#a09b8c]">No se encontraron campeones</p>
          <p className="text-sm mt-1 text-[#785a28]">Intenta con otro filtro o búsqueda</p>
        </div>
      )}

      {/* ===== ESCENA COMPETITIVA ===== */}
      {selectedGame !== 'wildrift' && proPicks && proPicks.length > 0 && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(120,90,40,0.15)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-[#f0c646]" />
              <div>
                <h2 className="lol-title text-base text-[#f0e6d2]">Escena Competitiva</h2>
                <p className="text-[11px] text-[#5b5a56]">Pro picks en torneos profesionales</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {TOURNAMENT_REGIONS.map(r => (
              <button
                key={r.value || 'all'}
                onClick={() => onProRegionFilterChange(r.value)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-200
                  ${proRegionFilter === r.value
                    ? 'bg-[#f0c646]/15 text-[#f0c646] border border-[#f0c646]/30'
                    : 'text-[#5b5a56] hover:text-[#a09b8c] hover:bg-[#1e2328]/40 border border-transparent'
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="grid grid-cols-[2rem_1fr_3.5rem_3.5rem_3.5rem_3.5rem] gap-2 px-3 py-2 lol-label text-[8px] text-[#5b5a56]" style={{ borderBottom: '1px solid rgba(120,90,40,0.15)' }}>
                <div />
                <div>Campeón</div>
                <div>Rol</div>
                <div className="text-right">Pick%</div>
                <div className="text-right">Ban%</div>
                <div className="text-right">WR%</div>
              </div>
              <div className="divide-y divide-[#785a28]/10">
                {(proRegionFilter ? proPicks.filter(p => p.region === proRegionFilter) : proPicks).map((pick, idx) => (
                  <motion.div
                    key={pick.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#1e2328]/40 transition-colors"
                  >
                    <TinyChampionIcon name={pick.champion} />
                    <span className="text-sm font-medium text-[#f0e6d2] flex-1 truncate">{pick.champion}</span>
                    <div className="w-14 shrink-0"><RoleBadge role={pick.role} /></div>
                    <span className="text-[11px] font-mono font-semibold text-[#0acbe6] w-12 text-right">{pick.pickRate}%</span>
                    <span className="text-[11px] font-mono font-semibold w-12 text-right" style={{ color: pick.banRate > 10 ? '#e84057' : '#a09b8c' }}>{pick.banRate}%</span>
                    <span className="text-[11px] font-mono font-semibold w-12 text-right" style={{ color: pick.winRate >= 54 ? '#0acbe6' : pick.winRate >= 50 ? '#a09b8c' : '#e84057' }}>{pick.winRate}%</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
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
  const tierTopGradient: Record<string, string> = {
    S: 'linear-gradient(90deg, #c8aa6e, #f0c646, #c8aa6e)',
    A: 'linear-gradient(90deg, rgba(10,203,230,0.5), #0acbe6, rgba(10,203,230,0.5))',
    B: 'linear-gradient(90deg, rgba(15,186,129,0.5), #0fba81, rgba(15,186,129,0.5))',
  };

  return (
    <div className="space-y-5">
      {['S', 'A', 'B'].map(tier => {
        const tierChamps = champions.filter(c => c.tier === tier);
        if (tierChamps.length === 0) return null;
        const cfg = TIER_CONFIG[tier];
        const isSTier = tier === 'S';
        return (
          <div key={tier}>
            <div className="flex items-center gap-3 mb-3">
              <span className="lol-title text-xl" style={{ color: cfg.color, textShadow: `0 0 12px ${cfg.color}40` }}>{tier}</span>
              <span className="text-sm text-[#785a28]">{cfg.label}</span>
              <span className="text-xs text-[#5b5a56]">{tierChamps.length} campeones</span>
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${cfg.color}30, transparent)` }} />
            </div>
            <div className={isSTier
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'
            }>
              {tierChamps.map((champ, idx) => {
                const roleCfg = ROLE_CONFIG[champ.role];
                const roleColor = roleCfg?.color || '#5b5a56';
                const isBroken = champ.winRate > 52 && champ.banRate > 4;
                const isRoto = champ.winRate > 52 && !isBroken;
                const isAltoBan = champ.banRate > 4 && !isBroken;
                return (
                  <motion.div
                    key={champ.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className={isSTier ? 'sm:col-span-1' : ''}
                  >
                    <motion.div
                      className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group"
                      style={{
                        border: `2px solid ${cfg.color}40`,
                        borderLeft: `4px solid ${roleColor}`,
                        boxShadow: isSTier
                          ? `0 4px 24px rgba(0,0,0,0.5), 0 0 20px ${cfg.color}15, inset 0 0 30px rgba(200,170,110,0.03)`
                          : `0 4px 16px rgba(0,0,0,0.4)`,
                        background: isSTier
                          ? `linear-gradient(135deg, rgba(200,170,110,0.06), rgba(10,14,26,0.8))`
                          : 'rgba(20,25,32,0.8)',
                      }}
                      onClick={() => onChampionClick(champ)}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {/* Tier gradient top border */}
                      <div className="absolute top-0 left-0 right-0 h-[3px] z-10" style={{ background: tierTopGradient[tier] || 'transparent' }} />

                      {/* Role-colored bottom accent line */}
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] z-10 opacity-60" style={{ background: roleColor }} />

                      {/* S-tier shimmer effect */}
                      {isSTier && (
                        <>
                          <div className="absolute inset-0 pointer-events-none"
                            style={{ boxShadow: 'inset 0 0 40px rgba(200,170,110,0.08)' }} />
                          <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <motion.div
                              className="absolute -inset-full"
                              style={{ background: 'linear-gradient(90deg, transparent, rgba(200,170,110,0.06), transparent)' }}
                              animate={{ x: ['-100%', '200%'] }}
                              transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: idx * 0.5 }}
                            />
                          </div>
                        </>
                      )}

                      {/* Broken indicator badges */}
                      {(isBroken || isRoto || isAltoBan) && (
                        <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1">
                          {isBroken && (
                            <motion.span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black"
                              style={{ background: 'rgba(232,64,87,0.9)', color: '#fff', boxShadow: '0 0 12px rgba(232,64,87,0.6), 0 0 24px rgba(232,64,87,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            >
                              {'💀 Broken'}
                            </motion.span>
                          )}
                          {isRoto && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black"
                              style={{ background: 'rgba(232,64,87,0.85)', color: '#fff', boxShadow: '0 0 10px rgba(232,64,87,0.5)', border: '1px solid rgba(232,64,87,0.3)' }}
                            >
                              {'🔥 Roto'}
                            </span>
                          )}
                          {isAltoBan && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black"
                              style={{ background: 'rgba(240,198,70,0.85)', color: '#0a0e1a', boxShadow: '0 0 10px rgba(240,198,70,0.4)', border: '1px solid rgba(240,198,70,0.3)' }}
                            >
                              {'⚠️ Alto Ban'}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Champion icon + name */}
                      <div className="p-3">
                        <div className="flex items-start gap-2.5 mb-2">
                          <div className="relative shrink-0">
                            <ChampionIcon name={champ.name} tier={champ.tier} />
                            {/* Rank number */}
                            <div
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black z-10"
                              style={{ background: cfg.color, color: '#0a0e1a', border: '1.5px solid #0a0e1a', boxShadow: `0 0 6px ${cfg.color}50` }}
                            >
                              {idx + 1}
                            </div>
                            {/* Trend arrow */}
                            {trendMap?.[champ.name] && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0a0e1a] flex items-center justify-center z-10"
                                style={{ border: `1.5px solid ${trendMap[champ.name] === 'rising' ? '#0fba81' : '#e84057'}` }}>
                                <span className="text-[8px] font-black" style={{ color: trendMap[champ.name] === 'rising' ? '#0fba81' : '#e84057' }}>
                                  {trendMap[champ.name] === 'rising' ? '↑' : '↓'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <h3 className="text-lg font-bold lol-title text-[#f0e6d2] leading-tight truncate"
                              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                              {champ.name}
                            </h3>
                            <RoleBadge role={champ.role} />
                          </div>
                          {/* Favorite */}
                          <button
                            onClick={e => { e.stopPropagation(); onToggleFavorite(champ.id); }}
                            className="shrink-0 mt-0.5 cursor-pointer"
                          >
                            <Star className="w-4 h-4 transition-colors"
                              style={{ color: favorites.has(champ.id) ? '#f0c646' : '#5b5a56' }}
                              fill={favorites.has(champ.id) ? '#f0c646' : 'none'} />
                          </button>
                        </div>

                        {/* Stats bars */}
                        <div className="space-y-1.5">
                          {/* Win Rate */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#785a28] w-8 shrink-0">WR</span>
                            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(120,90,40,0.12)' }}>
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${wrColor(champ.winRate)}60, ${wrColor(champ.winRate)})` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((champ.winRate / 58) * 100, 100)}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>
                            <span className="text-sm font-bold font-mono w-12 text-right" style={{ color: wrColor(champ.winRate) }}>
                              {champ.winRate}%
                            </span>
                          </div>
                          {/* Pick Rate */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#785a28] w-8 shrink-0">Pick</span>
                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(120,90,40,0.08)' }}>
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: 'linear-gradient(90deg, rgba(91,138,245,0.3), #5b8af5)' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((champ.pickRate / 30) * 100, 100)}%` }}
                                transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                              />
                            </div>
                            <span className="text-sm font-bold font-mono w-12 text-right text-[#a09b8c]">
                              {champ.pickRate}%
                            </span>
                          </div>
                          {/* Ban Rate */}
                          {champ.banRate > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#785a28] w-8 shrink-0">Ban</span>
                              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(120,90,40,0.08)' }}>
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ background: `linear-gradient(90deg, rgba(232,64,87,0.3), #e84057)` }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((champ.banRate / 40) * 100, 100)}%` }}
                                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                                />
                              </div>
                              <span className="text-sm font-bold font-mono w-12 text-right" style={{ color: champ.banRate > 5 ? '#e84057' : '#a09b8c' }}>
                                {champ.banRate}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                  </motion.div>
                </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}