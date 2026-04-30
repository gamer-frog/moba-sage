'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Star, LayoutGrid, List, TrendingUp, BarChart3, X, RefreshCw, ArrowUpCircle, ArrowDownCircle, Clock, Database, ArrowUpDown, Crown, Trophy } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { ChampionIcon } from '../champion-icon';
import { RoleBadge } from '../badges';
import { TierSection, TierSectionSkeleton } from '../tier-section';
import { ROLE_CONFIG, TIER_CONFIG, TOURNAMENT_REGIONS } from '../constants';

import { ItemIcon } from '../item-icon';
import { parseBuildItems, getChampionImageUrl, getChampionSplashUrl } from '../helpers';
import { WeeklyWRChart } from '../weekly-wr-chart';
import { C, wrColor, freshnessColor, roleWrColor } from '../theme-colors';
import { StatCard } from '../stat-card';
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

// wrColor is imported from theme-colors.ts now

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
  const [expandedWeekly, setExpandedWeekly] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('winRate');
  const [versionData, setVersionData] = useState<{ cdn: string; gamePatch: string; metaLastUpdated: string; fetchedAt: string } | null>(null);

  // Debounced search — input feels instant, filtering is throttled
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
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
    if (!versionData?.fetchedAt) return { color: C.dim, label: 'Desconocido' };
    const diffMs = Date.now() - new Date(versionData.fetchedAt).getTime();
    const hours = diffMs / 3600000;
    return freshnessColor(hours);
  })();
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
          <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(200,170,110,0.1)' }}>
            <div className="flex items-center gap-2 min-w-0">
              <Database className="w-4 h-4 text-lol-gold shrink-0" />
              <span className="lol-label text-xs font-bold text-lol-gold uppercase tracking-wider truncate">Fuentes de Datos</span>
              <span className="text-[10px] text-lol-dim hidden sm:inline">· {dataSources.length} fuentes activas</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono text-lol-muted">{versionData?.gamePatch || '26.9'}</span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: `${freshnessInfo.color}15`, color: freshnessInfo.color, border: `1px solid ${freshnessInfo.color}30` }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: freshnessInfo.color }} />
                {freshnessInfo.label}
              </span>
            </div>
          </div>
          {/* Row-style source list */}
          <div>
            {dataSources.map((source, i) => {
              const diffMs = Date.now() - new Date(source.lastScraped).getTime();
              const hours = diffMs / 3600000;
              const srcFreshness = freshnessColor(hours);
              return (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-lol-gold/5 min-w-0"
                  style={{ borderBottom: i < dataSources.length - 1 ? '1px solid rgba(200,170,110,0.08)' : 'none' }}
                >
                  <span className="flex-1 text-sm font-semibold text-lol-text truncate min-w-0">{source.name}</span>
                  <span className="text-[10px] text-lol-dim font-mono shrink-0 hidden sm:inline">
                    {new Date(source.lastScraped).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span
                    className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold"
                    style={{ background: `${srcFreshness.color}12`, color: srcFreshness.color, border: `1px solid ${srcFreshness.color}25` }}
                  >
                    {srcFreshness.label}
                  </span>
                </a>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {/* View toggle + Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lol-dim" />
            <Input
              placeholder="Buscar campeón..."
              value={searchQuery}
              onChange={e => { onSearchChange(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 bg-lol-card/60 border-lol-gold-dark/30 text-lol-text placeholder:text-lol-dim focus-visible:border-lol-gold focus-visible:ring-lol-gold/20 h-10 rounded-lg"
              aria-label="Buscar campeón"
              aria-controls="tierlist-suggestions"
              aria-expanded={showSuggestions && searchSuggestions.length > 0}
              aria-autocomplete="list"
              role="combobox"
              id="tierlist-search"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { onSearchChange(''); setShowSuggestions(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3 h-3 text-lol-dim" />
              </button>
            )}
            {showSuggestions && searchSuggestions.length > 0 && searchQuery.length >= 1 && (
              <div id="tierlist-suggestions" role="listbox" aria-labelledby="tierlist-search" className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-50" style={{ background: 'rgba(30,35,40,0.95)', border: '1px solid rgba(200,170,110,0.2)', backdropFilter: 'blur(12px)' }}>
                {searchSuggestions.map(s => (
                  <button
                    key={s.id}
                    role="option"
                    id={`tierlist-option-${s.id}`}
                    aria-selected={false}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-lol-gold/10 transition-colors"
                    onMouseDown={() => { onSearchChange(s.name); setShowSuggestions(false); onChampionClick(s); }}
                  >
                    <ChampionIcon name={s.name} tier={s.tier} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-lol-text truncate">{s.name}</p>
                      <p className="text-[10px] text-lol-dim">{s.role} · {s.winRate}% WR</p>
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
            {viewMode === 'list' ? <LayoutGrid className="w-4 h-4 text-lol-muted" /> : <List className="w-4 h-4 text-lol-muted" />}
          </button>
        </div>

        {/* Role filter — responsive pills, 44px min touch target */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {ROLES.map(role => (
            <button
              key={role}
              onClick={() => onRoleFilterChange(role)}
              className={`
                px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 min-h-[44px]
                ${roleFilter === role
                  ? 'bg-lol-gold/15 text-lol-gold border border-lol-gold/30 shadow-[0_0_12px_rgba(200,170,110,0.1)]'
                  : 'text-lol-muted hover:text-lol-text hover:bg-lol-card/60 border border-lol-gold-dark/15'
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
              px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 min-h-[44px]
              ${roleFilter === '★'
                ? 'bg-lol-warning/15 text-lol-warning border border-lol-warning/30'
                : 'text-lol-muted hover:text-lol-warning hover:bg-lol-card/60 border border-lol-gold-dark/15'
              }
            `}
          >
            <Star className="w-3.5 h-3.5 mr-1.5 inline" fill={roleFilter === '★' ? '#f0c646' : 'none'} />
            Favoritos ({favorites.size})
          </button>
        </div>

        {/* Sort Options — Bigger */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-lol-gold-dark font-semibold">
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
                  ? 'text-lol-gold border border-lol-gold/30'
                  : 'text-lol-gold-dark hover:text-lol-muted border border-transparent hover:border-lol-gold-dark/20'
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

      {/* Rising & Falling Sections — Champion Portrait Cards */}
      {!feedLoading && (risingChampions.length > 0 || fallingChampions.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* EN ASCENSO */}
          {risingChampions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0fba81, #0fba8180)', boxShadow: '0 0 12px rgba(15,186,129,0.3)' }}>
                  <ArrowUpCircle className="w-4 h-4 text-white" />
                </div>
                <span className="lol-title text-sm text-lol-green">En Ascenso</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(15,186,129,0.12)', color: '#0fba81', border: '1px solid rgba(15,186,129,0.2)' }}>{risingChampions.length} campeones</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {risingChampions.map((entry, i) => {
                  const name = extractChampName(entry);
                  const reason = entry.match(/\((.+)\)/)?.[1] || '';
                  const champData = gameChampions.find(c => c.name === name);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className="group relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.03]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(15,186,129,0.08), rgba(15,186,129,0.02))',
                        border: '1.5px solid rgba(15,186,129,0.15)',
                        minWidth: '120px',
                      }}
                      onClick={() => { const c = gameChampions.find(ch => ch.name === name); if (c) onChampionClick(c); }}
                    >
                      {/* Champion portrait */}
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden shrink-0 relative"
                        style={{
                          border: '2.5px solid #0fba81',
                          boxShadow: '0 0 10px rgba(15,186,129,0.35), inset 0 0 4px rgba(15,186,129,0.15)',
                        }}
                      >
                        <Image
                          src={getChampionImageUrl(name)}
                          alt={name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Trend badge */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: '#0fba81', color: '#fff', boxShadow: '0 0 6px rgba(15,186,129,0.5)' }}>
                          ↑
                        </div>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-lol-text truncate leading-tight">{name}</p>
                        {champData && (
                          <p className="text-[10px] text-lol-green font-semibold">{champData.role} · {champData.winRate}% WR</p>
                        )}
                        {reason && (
                          <p className="text-[10px] text-lol-muted mt-0.5 truncate leading-tight">{reason}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EN CAÍDA */}
          {fallingChampions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e84057, #e8405780)', boxShadow: '0 0 12px rgba(232,64,87,0.3)' }}>
                  <ArrowDownCircle className="w-4 h-4 text-white" />
                </div>
                <span className="lol-title text-sm text-lol-danger">En Caída</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(232,64,87,0.12)', color: '#e84057', border: '1px solid rgba(232,64,87,0.2)' }}>{fallingChampions.length} campeones</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {fallingChampions.map((entry, i) => {
                  const name = extractChampName(entry);
                  const reason = entry.match(/\((.+)\)/)?.[1] || '';
                  const champData = gameChampions.find(c => c.name === name);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className="group relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.03]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(232,64,87,0.08), rgba(232,64,87,0.02))',
                        border: '1.5px solid rgba(232,64,87,0.15)',
                        minWidth: '120px',
                      }}
                      onClick={() => { const c = gameChampions.find(ch => ch.name === name); if (c) onChampionClick(c); }}
                    >
                      {/* Champion portrait */}
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden shrink-0 relative"
                        style={{
                          border: '2.5px solid #e84057',
                          boxShadow: '0 0 10px rgba(232,64,87,0.35), inset 0 0 4px rgba(232,64,87,0.15)',
                        }}
                      >
                        <Image
                          src={getChampionImageUrl(name)}
                          alt={name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Trend badge */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: '#e84057', color: '#fff', boxShadow: '0 0 6px rgba(232,64,87,0.5)' }}>
                          ↓
                        </div>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-lol-text truncate leading-tight">{name}</p>
                        {champData && (
                          <p className="text-[10px] text-lol-danger font-semibold">{champData.role} · {champData.winRate}% WR</p>
                        )}
                        {reason && (
                          <p className="text-[10px] text-lol-muted mt-0.5 truncate leading-tight">{reason}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
      {/* Weekly Top Movers — Bar chart section */}
      {!loading && weeklyTop.length > 0 && !debouncedQuery && roleFilter === 'Todos' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-3 sm:p-4 space-y-3 overflow-hidden"
          style={{ border: '1px solid rgba(200,170,110,0.15)' }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <TrendingUp className="w-4 h-4 text-lol-gold shrink-0" />
              <span className="lol-label text-xs font-semibold text-lol-gold uppercase tracking-wider truncate">
                Top Movimientos Semanales
              </span>
              <span className="text-[10px] text-lol-dim shrink-0">Patch {feedData?.lol?.patch || '26.8'}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  <div className="w-2 h-2 rounded-sm bg-lol-green" />
                  <span className="text-[10px] text-lol-dim">Sube</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <div className="w-2 h-2 rounded-sm bg-lol-danger" />
                  <span className="text-[10px] text-lol-dim">Baja</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-lol-dim">
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
              const barColor = isPositive ? C.green : C.danger;
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
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-lol-bg flex items-center justify-center border border-lol-green/40">
                          <TrendingUp className="w-2.5 h-2.5 text-lol-green" />
                        </div>
                      ) : (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-lol-bg flex items-center justify-center border border-lol-danger/40">
                          <ArrowDownCircle className="w-2.5 h-2.5 text-lol-danger" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-semibold text-lol-text truncate">{mover.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <RoleBadge role={mover.role} />
                          <span
                            className="text-[11px] font-mono font-black px-1.5 py-0.5 rounded hidden sm:inline-flex"
                            style={{
                              color: barColor,
                              background: `${barColor}12`,
                              border: `1px solid ${barColor}25`,
                            }}
                          >
                            {isPositive ? '↑' : '↓'}{Math.abs(mover.change).toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-lol-muted font-mono">{mover.currentWR}%</span>
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
                        <div className="pl-10 sm:pl-14 pr-2 pt-1 pb-2">
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

      {/* Meta Overview — Stats consolidados */}
      {!loading && !debouncedQuery && roleFilter === 'Todos' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-4"
          style={{ border: '1px solid rgba(200,170,110,0.15)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-lol-gold" />
            <span className="lol-label text-xs font-semibold text-lol-gold uppercase tracking-wider">Meta Overview</span>
            <span className="ml-auto text-[10px] text-lol-dim">{gameChampions.length} campeones</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <StatCard
              label="Total Campeones"
              value={`${gameChampions.length}`}
              sub="en el sistema"
              color={C.gold}
              icon={<Database className="w-4 h-4" />}
            />
            <StatCard
              label="Tier S"
              value={`${sTiers.length} campeones`}
              sub="Dioses del meta"
              color={C.gold}
              icon={<Trophy className="w-4 h-4" />}
            />
            <StatCard
              label="WR Promedio"
              value={gameChampions.length > 0
                ? (gameChampions.reduce((s, c) => s + c.winRate, 0) / gameChampions.length).toFixed(1) + '%'
                : '—'}
              sub="todos los campeones"
              color={C.success}
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
              color={C.danger}
              icon={<BarChart3 className="w-4 h-4" />}
            />
            <StatCard
              label="Más Pickeados"
              value={topPick[0]?.pickRate ? `${topPick[0].pickRate}%` : '—'}
              sub={topPick[0]?.name ?? ''}
              color={C.pick}
              icon={<BarChart3 className="w-4 h-4" />}
            />
          </div>
        </motion.div>
      )}

      {/* Role Win Rate Summary Bar */}
      {!loading && !debouncedQuery && roleFilter === 'Todos' && gameChampions.length > 0 && (() => {
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
            <p className="lol-label text-[10px] text-lol-gold mb-3">Promedio WR por Rol</p>
            <div className="flex flex-wrap items-center gap-3">
              {roleData.map(({ role, avg, count }) => {
                const color = roleWrColor(avg);
                return (
                  <div
                    key={role}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[100px] justify-center"
                    style={{ background: `${color}08`, border: `1px solid ${color}18` }}
                  >
                    <span className="lol-label text-[10px] text-lol-muted">{role}</span>
                    <span className="text-sm font-bold font-mono" style={{ color }}>{avg}%</span>
                    <span className="text-[10px] text-lol-dim">({count})</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })()}

      {/* Meta freshness indicator with source attribution */}
      {!loading && (metaLastUpdated || feedLastUpdated) && (
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-lol-gold-dark">
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Datos actualizados: {feedLastUpdated || metaLastUpdated}</span>
            <span className="text-lol-green">●</span>
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
        <div className="text-center py-16 text-lol-gold-dark">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium text-lol-muted">No se encontraron campeones</p>
          <p className="text-sm mt-1 text-lol-gold-dark">Intenta con otro filtro o búsqueda</p>
        </div>
      )}

      {/* ===== ESCENA COMPETITIVA ===== */}
      {selectedGame !== 'wildrift' && proPicks && proPicks.length > 0 && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(120,90,40,0.15)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-lol-warning" />
              <div>
                <h2 className="lol-title text-base text-lol-text">Escena Competitiva</h2>
                <p className="text-[11px] text-lol-dim">Pro picks en torneos profesionales</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {TOURNAMENT_REGIONS.map(r => (
              <button
                key={r.value || 'all'}
                onClick={() => onProRegionFilterChange(r.value)}
                className={`px-3 py-2 rounded-md text-[11px] font-medium transition-all duration-200 min-h-[36px] sm:min-h-[40px]
                  ${proRegionFilter === r.value
                    ? 'bg-lol-warning/15 text-lol-warning border border-lol-warning/30'
                    : 'text-lol-dim hover:text-lol-muted hover:bg-lol-card/40 border border-transparent'
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="hidden sm:grid grid-cols-[3rem_1fr_3.5rem_3.5rem_3.5rem_3.5rem] gap-2 px-3 py-2 lol-label text-[10px] text-lol-dim" style={{ borderBottom: '1px solid rgba(120,90,40,0.15)' }}>
                <div />
                <div>Campeón</div>
                <div>Rol</div>
                <div className="text-right">Pick%</div>
                <div className="text-right">Ban%</div>
                <div className="text-right">WR%</div>
              </div>
              {/* Mobile compact header */}
              <div className="sm:hidden grid grid-cols-[3rem_1fr_3rem] gap-1 px-3 py-2 lol-label text-[10px] text-lol-dim" style={{ borderBottom: '1px solid rgba(120,90,40,0.15)' }}>
                <div />
                <div>Campeón</div>
                <div className="text-right">WR%</div>
              </div>
              <div className="divide-y divide-lol-gold-dark/10">
                {(proRegionFilter ? proPicks.filter(p => p.region === proRegionFilter) : proPicks).map((pick, idx) => {
                  const isRotoPro = pick.winRate >= 54;
                  return (
                  <motion.div
                    key={pick.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="flex items-center gap-2 sm:gap-2.5 px-3 py-2.5 hover:bg-lol-card/40 transition-colors"
                  >
                    <div className="relative shrink-0">
                      <ChampionIcon name={pick.champion} tier="A" />
                      {isRotoPro && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black z-10"
                          style={{ background: '#e84057', color: '#fff', boxShadow: '0 0 6px rgba(232,64,87,0.5)' }}>
                          🔥
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs sm:text-sm font-semibold text-lol-text truncate block">{pick.champion}</span>
                      <span className="sm:hidden text-[10px] text-lol-dim">{pick.role} · P:{pick.pickRate}% B:{pick.banRate}%</span>
                    </div>
                    <div className="w-14 shrink-0 hidden sm:block"><RoleBadge role={pick.role} /></div>
                    <span className="text-[11px] font-mono font-semibold text-lol-success w-12 text-right hidden sm:block">{pick.pickRate}%</span>
                    <span className="text-[11px] font-mono font-semibold w-12 text-right hidden sm:block" style={{ color: pick.banRate > 10 ? '#e84057' : '#a09b8c' }}>{pick.banRate}%</span>
                    <span className="text-[11px] font-mono font-semibold w-12 text-right" style={{ color: pick.winRate >= 54 ? '#0fba81' : pick.winRate >= 50 ? '#a09b8c' : '#e84057' }}>{pick.winRate}%</span>
                  </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
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
        const isATier = tier === 'A';
        return (
          <div key={tier}>
            <div className="flex items-center gap-3 mb-3">
              <span className="lol-title text-xl" style={{ color: cfg.color, textShadow: `0 0 12px ${cfg.color}40` }}>{tier}</span>
              <span className="text-sm text-lol-gold-dark">{cfg.label}</span>
              <span className="text-xs text-lol-dim">{tierChamps.length} campeones</span>
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${cfg.color}30, transparent)` }} />
            </div>
            {/* S-TIER: Hero cards with splash art background + champion portrait */}
            {isSTier ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {tierChamps.map((champ, idx) => {
                  const isBroken = champ.winRate > 52 && champ.banRate > 4;
                  const isRoto = champ.winRate > 52 && !isBroken;
                  const isAltoBan = champ.banRate > 4 && !isBroken;
                  return (
                    <motion.div
                      key={champ.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                    >
                      <motion.div
                        className="relative rounded-xl overflow-hidden cursor-pointer group"
                        style={{
                          minHeight: '185px',
                          border: '2px solid rgba(200,170,110,0.3)',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 24px rgba(200,170,110,0.1)',
                        }}
                        onClick={() => onChampionClick(champ)}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {/* Splash art background */}
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url(${getChampionSplashUrl(champ.name)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center center',
                            filter: 'brightness(0.4) saturate(1.2)',
                          }}
                        >
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 10%, rgba(10,14,26,0.5) 40%, rgba(10,14,26,0.95) 75%, rgba(10,14,26,1) 100%)' }} />
                        </div>
                        {/* Shimmer */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <motion.div
                            className="absolute -inset-full"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(200,170,110,0.08), transparent)' }}
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: idx * 0.5 }}
                          />
                        </div>
                        {/* Tier gradient top border */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] z-10" style={{ background: tierTopGradient[tier] }} />
                        {/* Badges */}
                        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col items-end gap-1">
                          {isBroken && (
                            <motion.span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black"
                              style={{ background: 'rgba(232,64,87,0.9)', color: '#fff', boxShadow: '0 0 12px rgba(232,64,87,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            >
                              {'💀 Broken'}
                            </motion.span>
                          )}
                          {isRoto && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black"
                              style={{ background: 'rgba(232,64,87,0.85)', color: '#fff', boxShadow: '0 0 10px rgba(232,64,87,0.5)', border: '1px solid rgba(232,64,87,0.3)' }}>
                              {'🔥 Roto'}
                            </span>
                          )}
                          {isAltoBan && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black"
                              style={{ background: 'rgba(240,198,70,0.85)', color: '#0a0e1a', boxShadow: '0 0 10px rgba(240,198,70,0.4)', border: '1px solid rgba(240,198,70,0.3)' }}>
                              {'⚠️ Alto Ban'}
                            </span>
                          )}
                        </div>
                        {/* Content overlay */}
                        <div className="relative z-10 p-4 flex flex-col" style={{ minHeight: '185px' }}>
                          <div className="flex items-center gap-3 mb-3">
                            {/* Champion portrait with gold glow */}
                            <div className="relative shrink-0">
                              <div
                                className="w-14 h-14 rounded-full overflow-hidden"
                                style={{
                                  border: '3px solid #c8aa6e',
                                  boxShadow: '0 0 16px rgba(200,170,110,0.4), 0 0 32px rgba(200,170,110,0.15), inset 0 0 6px rgba(200,170,110,0.2)',
                                }}
                              >
                                <Image
                                  src={getChampionImageUrl(champ.name)}
                                  alt={champ.name}
                                  width={56}
                                  height={56}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black z-10"
                                style={{ background: '#c8aa6e', color: '#0a0e1a', border: '2px solid #0a0e1a', boxShadow: '0 0 8px rgba(200,170,110,0.5)' }}>
                                {idx + 1}
                              </div>
                              {trendMap?.[champ.name] && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-lol-bg flex items-center justify-center z-10"
                                  style={{ border: `1.5px solid ${trendMap[champ.name] === 'rising' ? '#0fba81' : '#e84057'}` }}>
                                  <span className="text-[10px] font-black" style={{ color: trendMap[champ.name] === 'rising' ? '#0fba81' : '#e84057' }}>
                                    {trendMap[champ.name] === 'rising' ? '↑' : '↓'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <h3 className="text-base font-bold lol-title text-lol-text leading-tight truncate"
                                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                                  {champ.name}
                                </h3>
                                <button onClick={e => { e.stopPropagation(); onToggleFavorite(champ.id); }} className="shrink-0 cursor-pointer">
                                  <Star className="w-3.5 h-3.5 transition-colors"
                                    style={{ color: favorites.has(champ.id) ? '#f0c646' : '#5b5a56' }}
                                    fill={favorites.has(champ.id) ? '#f0c646' : 'none'} />
                                </button>
                              </div>
                              <RoleBadge role={champ.role} />
                            </div>
                          </div>
                          {/* Stats */}
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-lol-gold-dark w-7 shrink-0">WR</span>
                              <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(120,90,40,0.15)' }}>
                                <motion.div className="h-full rounded-full"
                                  style={{ background: `linear-gradient(90deg, ${wrColor(champ.winRate)}60, ${wrColor(champ.winRate)})` }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((champ.winRate / 58) * 100, 100)}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }} />
                              </div>
                              <span className="text-xs font-bold font-mono w-10 text-right" style={{ color: wrColor(champ.winRate) }}>{champ.winRate}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-lol-gold-dark w-7 shrink-0">Pick</span>
                              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(120,90,40,0.1)' }}>
                                <motion.div className="h-full rounded-full"
                                  style={{ background: 'linear-gradient(90deg, rgba(91,138,245,0.3), #5b8af5)' }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((champ.pickRate / 30) * 100, 100)}%` }}
                                  transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }} />
                              </div>
                              <span className="text-xs font-bold font-mono w-10 text-right text-lol-muted">{champ.pickRate}%</span>
                            </div>
                            {champ.banRate > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-lol-gold-dark w-7 shrink-0">Ban</span>
                                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(120,90,40,0.1)' }}>
                                  <motion.div className="h-full rounded-full"
                                    style={{ background: 'linear-gradient(90deg, rgba(232,64,87,0.3), #e84057)' }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((champ.banRate / 40) * 100, 100)}%` }}
                                    transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }} />
                                </div>
                                <span className="text-xs font-bold font-mono w-10 text-right" style={{ color: champ.banRate > 5 ? '#e84057' : '#a09b8c' }}>{champ.banRate}%</span>
                              </div>
                            )}
                          </div>
                          {/* Build items */}
                          {(() => {
                            const buildItems = champ.builds?.[0]?.items ? parseBuildItems(champ.builds[0].items) : [];
                            if (buildItems.length === 0) return null;
                            return (
                              <div className="flex items-center gap-1 mt-2 pt-2" style={{ borderTop: '1px solid rgba(200,170,110,0.15)' }}>
                                {buildItems.slice(0, 6).map((item, i) => (
                                  <div key={i} className="w-6 h-6 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <ItemIcon name={item} />
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* A and B tiers - Cards with circular champion portraits */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
                {tierChamps.map((champ, idx) => {
                  const roleCfg = ROLE_CONFIG[champ.role];
                  const roleColor = roleCfg?.color || '#5b5a56';
                  const isBroken = champ.winRate > 52 && champ.banRate > 4;
                  const isRoto = champ.winRate > 52 && !isBroken;
                  const isAltoBan = champ.banRate > 4 && !isBroken;
                  const portraitSize = isATier ? 44 : 36;
                  return (
                    <motion.div
                      key={champ.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                    >
                      <motion.div
                        className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group"
                        style={{
                          border: `2px solid ${cfg.color}40`,
                          borderLeft: `4px solid ${roleColor}`,
                          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                        }}
                        onClick={() => onChampionClick(champ)}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {/* Subtle splash art background */}
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url(${getChampionSplashUrl(champ.name)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center center',
                            filter: 'brightness(0.25) saturate(1.1)',
                          }}
                        >
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,14,26,0.7) 0%, rgba(10,14,26,0.85) 50%, rgba(10,14,26,0.95) 100%)' }} />
                        </div>
                        <div className="absolute top-0 left-0 right-0 h-[3px] z-10" style={{ background: tierTopGradient[tier] || 'transparent' }} />
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] z-10 opacity-60" style={{ background: roleColor }} />
                        {(isBroken || isRoto || isAltoBan) && (
                          <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1">
                            {isBroken && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black"
                                style={{ background: 'rgba(232,64,87,0.9)', color: '#fff', boxShadow: '0 0 8px rgba(232,64,87,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                {'💀 Broken'}
                              </span>
                            )}
                            {isRoto && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black"
                                style={{ background: 'rgba(232,64,87,0.85)', color: '#fff', boxShadow: '0 0 8px rgba(232,64,87,0.4)', border: '1px solid rgba(232,64,87,0.3)' }}>
                                {'🔥 Roto'}
                              </span>
                            )}
                            {isAltoBan && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black"
                                style={{ background: 'rgba(240,198,70,0.85)', color: '#0a0e1a', boxShadow: '0 0 8px rgba(240,198,70,0.3)', border: '1px solid rgba(240,198,70,0.3)' }}>
                                {'⚠️ Alto Ban'}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="p-3 relative z-10">
                          <div className="flex items-start gap-2.5 mb-2">
                            {/* Circular champion portrait with tier glow */}
                            <div className="relative shrink-0">
                              <div
                                className="rounded-full overflow-hidden"
                                style={{
                                  width: portraitSize,
                                  height: portraitSize,
                                  border: `2.5px solid ${cfg.color}`,
                                  boxShadow: `0 0 12px ${cfg.color}40, inset 0 0 4px ${cfg.color}20`,
                                }}
                              >
                                <Image
                                  src={getChampionImageUrl(champ.name)}
                                  alt={champ.name}
                                  width={portraitSize}
                                  height={portraitSize}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              {trendMap?.[champ.name] && (
                                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-lol-bg flex items-center justify-center z-10"
                                  style={{ border: `1.5px solid ${trendMap[champ.name] === 'rising' ? '#0fba81' : '#e84057'}` }}>
                                  <span className="text-[10px] font-black" style={{ color: trendMap[champ.name] === 'rising' ? '#0fba81' : '#e84057' }}>
                                    {trendMap[champ.name] === 'rising' ? '↑' : '↓'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-0.5">
                                <h3 className={`font-bold lol-title text-lol-text leading-tight truncate ${isATier ? 'text-sm' : 'text-xs'}`}
                                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                                  {champ.name}
                                </h3>
                                <button onClick={e => { e.stopPropagation(); onToggleFavorite(champ.id); }} className="shrink-0 cursor-pointer">
                                  <Star className="w-3 h-3 transition-colors"
                                    style={{ color: favorites.has(champ.id) ? '#f0c646' : '#5b5a56' }}
                                    fill={favorites.has(champ.id) ? '#f0c646' : 'none'} />
                                </button>
                              </div>
                              <div className="flex items-center gap-1">
                                <RoleBadge role={champ.role} />
                                <span className="text-[10px] font-bold font-mono" style={{ color: wrColor(champ.winRate) }}>{champ.winRate}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-lol-gold-dark w-6 shrink-0">WR</span>
                              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(120,90,40,0.12)' }}>
                                <motion.div className="h-full rounded-full"
                                  style={{ background: `linear-gradient(90deg, ${wrColor(champ.winRate)}60, ${wrColor(champ.winRate)})` }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((champ.winRate / 58) * 100, 100)}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }} />
                              </div>
                              <span className="text-[10px] font-bold font-mono w-9 text-right" style={{ color: wrColor(champ.winRate) }}>{champ.winRate}%</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-lol-gold-dark w-6 shrink-0">Pick</span>
                              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(120,90,40,0.08)' }}>
                                <motion.div className="h-full rounded-full"
                                  style={{ background: 'linear-gradient(90deg, rgba(91,138,245,0.3), #5b8af5)' }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((champ.pickRate / 30) * 100, 100)}%` }}
                                  transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }} />
                              </div>
                              <span className="text-[10px] font-bold font-mono w-9 text-right text-lol-muted">{champ.pickRate}%</span>
                            </div>
                            {champ.banRate > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-lol-gold-dark w-6 shrink-0">Ban</span>
                                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(120,90,40,0.08)' }}>
                                  <motion.div className="h-full rounded-full"
                                    style={{ background: 'linear-gradient(90deg, rgba(232,64,87,0.3), #e84057)' }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((champ.banRate / 40) * 100, 100)}%` }}
                                    transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }} />
                                </div>
                                <span className="text-[10px] font-bold font-mono w-9 text-right" style={{ color: champ.banRate > 5 ? '#e84057' : '#a09b8c' }}>{champ.banRate}%</span>
                              </div>
                            )}
                          </div>
                          {(() => {
                            const buildItems = champ.builds?.[0]?.items ? parseBuildItems(champ.builds[0].items) : [];
                            if (buildItems.length === 0) return null;
                            return (
                              <div className="flex items-center gap-1 mt-2 pt-1.5" style={{ borderTop: '1px solid rgba(120,90,40,0.1)' }}>
                                {buildItems.slice(0, 6).map((item, i) => (
                                  <div key={i} className="w-5 h-5">
                                    <ItemIcon name={item} />
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}