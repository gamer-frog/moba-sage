'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Sword, ScrollText, AlertTriangle, ListTodo,
  Brain, ChevronRight, Zap, Shield, Target, Crosshair,
  RefreshCw, Clock, CheckCircle2, Circle, Loader2, TrendingUp,
  ArrowUpCircle, ArrowDownCircle, Users, Sparkles, Trophy,
  User, Smartphone, ArrowLeft, ChevronDown, Crown, Gamepad2,
  Monitor, MapPin, ExternalLink, Map, Database, Wrench, Image as ImageIcon,
  Flame
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============ TYPES ============
interface ChampionBuild {
  name: string;
  items: string;
  winRate: number;
}

interface Champion {
  id: number;
  name: string;
  title: string;
  role: string;
  tier: string;
  winRate: number;
  pickRate: number;
  banRate: number;
  patch: string;
  game: string;
  builds?: ChampionBuild[];
  counterPick?: string;
  synergy?: string;
  aiAnalysis?: string;
  proPickRate?: number;
  brokenThings?: string[];
  buildLinks?: { label: string; url: string }[];
  runes?: { primary: string; secondary: string; shards: string };
}

interface PatchNote {
  id: number;
  version: string;
  title: string;
  summary: string;
  digest: string;
  date: string;
  sourceGame: string;
}

interface AiInsight {
  id: number;
  champion: string;
  category: string;
  content: string;
  confidence: number;
  date: string;
}

interface TaskItem {
  id: number;
  title: string;
  description: string;
  status: string;
  pointer: number;
  interval: number;
}

interface ProPick {
  id: number;
  champion: string;
  role: string;
  tournament: string;
  region: string;
  pickRate: number;
  banRate: number;
  winRate: number;
  patch: string;
}

interface BrokenCombo {
  id: number;
  name: string;
  champions: string[];
  description: string;
  winRate: number;
  game: string;
  difficulty: string;
}

interface SummonerRanked {
  queueType: string;
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
}

interface SummonerMostPlayed {
  champion: string;
  games: number;
  winRate: number;
}

interface SummonerData {
  name: string;
  level: number;
  profileIconId: number;
  ranked: SummonerRanked[];
  mostPlayed: SummonerMostPlayed[];
}

// ============ CONSTANTS ============
type GameSelection = null | 'lol' | 'wildrift';

const TIERS = ['S', 'A'] as const;

const TIER_CONFIG: Record<string, { color: string; label: string }> = {
  S: { color: '#c8aa6e', label: 'Dioses del Meta' },
  A: { color: '#0acbe6', label: 'Fuertes' },
};

const ROLE_CONFIG: Record<string, { color: string; label: string; icon: typeof Sword }> = {
  Top: { color: '#c8aa6e', label: 'TOP', icon: Shield },
  Jungle: { color: '#0acbe6', label: 'JNG', icon: Crosshair },
  Mid: { color: '#e84057', label: 'MID', icon: Zap },
  ADC: { color: '#f0c646', label: 'ADC', icon: Target },
  Support: { color: '#5b8af5', label: 'SUP', icon: Users },
};

const CATEGORY_CONFIG: Record<string, { color: string; label: string; icon: typeof ArrowUpCircle }> = {
  'tier-change': { color: '#c8aa6e', label: 'Cambio de Tier', icon: TrendingUp },
  buff: { color: '#0acbe6', label: 'Buff', icon: ArrowUpCircle },
  nerf: { color: '#e84057', label: 'Nerf', icon: ArrowDownCircle },
  meta: { color: '#f0c646', label: 'Meta', icon: Sparkles },
  counter: { color: '#5b8af5', label: 'Counter', icon: Crosshair },
  synergy: { color: '#0acbe6', label: 'Sinergia', icon: Users },
};

const ROLES = ['Todos', 'Top', 'Jungle', 'Mid', 'ADC', 'Support'];

const REGIONS = [
  { value: 'LAS', label: 'LAS' },
];

const TOURNAMENT_REGIONS = [
  { value: '', label: 'Todos' },
  { value: 'KR', label: 'LCK' },
  { value: 'CN', label: 'LPL' },
  { value: 'EU', label: 'LEC' },
  { value: 'NA', label: 'LCS' },
];

// ============ CHAMPION IMAGE URL HELPER ============
const CHAMPION_NAME_MAP: Record<string, string> = {
  'Wukong': 'MonkeyKing',
  'Nunu': 'Nunu',
  'Fiddlesticks': 'FiddleSticks',
  "Bel'Veth": 'Belveth',
  "K'Sante": 'KSante',
  'Aurelion Sol': 'AurelionSol',
  'Cho\'Gath': 'Chogath',
  'Kha\'Zix': 'Khazix',
  'Rek\'Sai': 'RekSai',
  'Vel\'Koz': 'Velkoz',
  'LeBlanc': 'Leblanc',
  'Miss Fortune': 'MissFortune',
  'Twitch': 'Twitch',
  'Twisted Fate': 'TwistedFate',
  'Lee Sin': 'LeeSin',
  'Master Yi': 'MasterYi',
  'Xin Zhao': 'XinZhao',
  'Jarvan IV': 'JarvanIV',
  'Aatrox': 'Aatrox',
};

function getChampionImageUrl(name: string): string {
  const mapped = CHAMPION_NAME_MAP[name];
  if (mapped) {
    return `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${mapped}.png`;
  }
  const normalized = name
    .replace(/'/g, '')
    .replace(/ /g, '')
    .replace(/\./g, '')
    .replace(/&/g, '');
  return `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${normalized}.png`;
}

// ============ ITEM ICON HELPERS ============
const ITEM_NAME_MAP: Record<string, string> = {
  'Filo de la Noche': '6672', 'Eclipse': '6692', 'Hidra Titánica': '3748',
  'Fuerza de la Trinidad': '3071', 'Filo Infinito': '3031', 'Huracán de Runaan': '3085',
  'Bailarín Espectral': '3124', 'Sed de Sangre': '6333', 'Botas de Berserker': '3006',
  'Sombrero de Rabadon': '3089', 'Reloj de Zhonya': '3157', 'Llamasomo': '3166',
  'Morellonomicon': '3165', 'Botas del Vacío': '3020', 'El Colector': '6676',
  'Última Piedad': '3036', 'Cosechador Nocturno': '6694', 'Poder de Kraken Slayer': '6673',
  'La Séptima': '6671', 'Muramana': '3004', 'Hielo Eterno': '6662',
  'Redención': '3107', 'Convergencia de Zeke': '3190', 'Medallón de los Solari de Hierro': '3194',
  'Mikael': '3222', 'Botas de Mercurio': '3111', 'Botas de Movilidad': '3009',
  'Botas de CD': '3158', 'Roca del Eclipse': '6693', 'Guardián Angel': '3026',
  'El Protegido': '3193', 'Pozo de la Noche': '6695', 'Filo Divino': '6696',
  'Resistencia Divina': '3065', 'Mandato Imperial': '6632', 'Cetro de Rylai': '3116',
  'Guja Botadora': '3153', 'Centro de Gravedad': '6664', 'Hydratación Letal': '3074',
};

function getItemIconUrl(itemName: string): string | null {
  const id = ITEM_NAME_MAP[itemName];
  if (id) return `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${id}.png`;
  return null;
}

function parseBuildItems(itemsStr: string): string[] {
  return itemsStr.split(/[→,\n]/).map(s => s.replace(/[→]/g, '').trim()).filter(Boolean);
}

function getBuildExternalUrl(champName: string): { ugg: string; mobalytics: string; opgg: string } {
  const safe = champName.toLowerCase().replace(/ /g, '').replace(/'/g, '');
  return {
    ugg: `https://u.gg/lol/champions/${safe}/build`,
    mobalytics: `https://www.mobalytics.com/lol/champions/${safe}`,
    opgg: `https://www.op.gg/champions/${safe}`,
  };
}

// ============ TAB ICONS ============
const TAB_ITEMS = [
  { id: 'tierlist', label: 'Tier List', icon: Trophy },
  { id: 'patches', label: 'Parches', icon: ScrollText },
  { id: 'broken', label: 'Cosas Rotas', icon: AlertTriangle },
  { id: 'tasks', label: 'Tareas', icon: ListTodo },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'combos', label: 'Combos', icon: Flame },
  { id: 'competitive', label: 'Competitivo', icon: Crown },
  { id: 'profile', label: 'Perfil', icon: User },
];

// ============ TIER COLORS FOR RANK ============
const TIER_COLORS: Record<string, string> = {
  Iron: '#5b5a56',
  Bronze: '#8c5e3c',
  Silver: '#a0a0a0',
  Gold: '#c8aa6e',
  Platinum: '#0acbe6',
  Emerald: '#0fba81',
  Diamond: '#e84057',
  Master: '#9d48e0',
  Grandmaster: '#e040f5',
  Challenger: '#f0c646',
};

// ============ HELPER COMPONENTS ============
function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role];
  if (!cfg) return <Badge variant="outline" className="text-[10px] px-2 py-0.5">{role}</Badge>;
  const Icon = cfg.icon;
  return (
    <Badge
      variant="outline"
      className="gap-1 text-[10px] font-semibold px-2 py-0.5 shrink-0"
      style={{
        borderColor: `${cfg.color}40`,
        color: cfg.color,
        backgroundColor: `${cfg.color}12`,
      }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string; label: string }> = {
    pending: { color: '#a09b8c', label: 'Pendiente' },
    running: { color: '#0acbe6', label: 'Ejecutando' },
    done: { color: '#0acbe6', label: 'Completado' },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: `${c.color}15`,
        color: c.color,
        borderColor: `${c.color}30`,
      }}
    >
      {status === 'pending' && <Circle className="w-3 h-3" />}
      {status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === 'done' && <CheckCircle2 className="w-3 h-3" />}
      {c.label}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.meta;
  const Icon = cfg.icon;
  return (
    <Badge
      variant="outline"
      className="gap-1 text-[10px]"
      style={{ borderColor: cfg.color, color: cfg.color }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

function RoadmapStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string; label: string }> = {
    done: { color: '#0fba81', label: 'Completado' },
    progress: { color: '#0acbe6', label: 'En progreso' },
    planned: { color: '#5b5a56', label: 'Planificado' },
    cancelled: { color: '#e84057', label: 'CANCELADO' },
  };
  const c = cfg[status] || cfg.planned;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border"
      style={{
        backgroundColor: `${c.color}12`,
        color: c.color,
        borderColor: `${c.color}25`,
      }}
    >
      {c.label}
    </span>
  );
}

function TournamentBadge({ tournament }: { tournament: string }) {
  const colors: Record<string, string> = {
    LCK: '#e84057',
    LPL: '#0fba81',
    LEC: '#0acbe6',
    LCS: '#c8aa6e',
  };
  const color = colors[tournament] || '#5b5a56';
  return (
    <Badge
      variant="outline"
      className="text-[10px] font-semibold px-2 py-0.5"
      style={{
        borderColor: `${color}40`,
        color: color,
        backgroundColor: `${color}12`,
      }}
    >
      {tournament}
    </Badge>
  );
}

// ============ SMALL CHAMPION ICON (for profile) ============
function SmallChampionIcon({ name }: { name: string }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div
      className="w-10 h-10 rounded-full overflow-hidden shrink-0"
      style={{ border: '2px solid rgba(120,90,40,0.25)' }}
    >
      {!imgError ? (
        <img
          src={getChampionImageUrl(name)}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-[#1e2328] text-[#a09b8c]">
          {name[0]}
        </div>
      )}
    </div>
  );
}

// ============ CHAMPION ICON ============
function ChampionIcon({ name, tier }: { name: string; tier: string }) {
  const cfg = TIER_CONFIG[tier];
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="w-11 h-11 rounded-full overflow-hidden shrink-0 relative"
      style={{
        border: `2.5px solid ${cfg.color}70`,
        boxShadow: `0 0 12px ${cfg.color}25, inset 0 0 6px ${cfg.color}10`,
      }}
    >
      {!imgError ? (
        <img
          src={getChampionImageUrl(name)}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
        >
          {name[0]}
        </div>
      )}
    </div>
  );
}

// ============ SPLASH ART ICON (larger, for Broken Stuff cards) ============
function SplashArtIcon({ name }: { name: string }) {
  const [imgError, setImgError] = useState(false);
  return (
    !imgError ? (
      <img
        src={getChampionImageUrl(name)}
        alt={name}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setImgError(true)}
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-lg font-black" style={{ backgroundColor: 'rgba(200,170,110,0.15)', color: '#c8aa6e' }}>
        {name[0]}
      </div>
    )
  );
}

// ============ TINY CHAMPION ICON (for Broken Stuff / Competitive) ============
function TinyChampionIcon({ name }: { name: string }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div
      className="w-8 h-8 rounded-full overflow-hidden shrink-0"
      style={{ border: '2px solid rgba(120,90,40,0.3)' }}
    >
      {!imgError ? (
        <img
          src={getChampionImageUrl(name)}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold bg-[#1e2328] text-[#a09b8c]">
          {name[0]}
        </div>
      )}
    </div>
  );
}

// ============ CHAMPION ROW (Expandable) ============
function ChampionRow({ champion, onClick }: { champion: Champion; onClick: () => void }) {
  const cfg = TIER_CONFIG[champion.tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="champion-row flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group"
    >
      <ChampionIcon name={champion.name} tier={champion.tier} />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[13px] text-[#f0e6d2] truncate group-hover:text-[#c8aa6e] transition-colors leading-tight">
          {champion.name}
        </h3>
        <p className="text-[10px] text-[#5b5a56] truncate leading-tight mt-0.5">{champion.title}</p>
      </div>
      <RoleBadge role={champion.role} />
      <div className="hidden sm:flex items-center gap-2.5 shrink-0 text-[11px]">
        <div className="flex flex-col items-end">
          <span className="text-[8px] text-[#5b5a56] uppercase tracking-wider leading-none">WR</span>
          <span className="font-mono font-semibold leading-tight" style={{ color: champion.winRate >= 52 ? '#0acbe6' : '#a09b8c' }}>
            {champion.winRate}%
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] text-[#5b5a56] uppercase tracking-wider leading-none">Pick</span>
          <span className="font-mono font-semibold text-[#a09b8c] leading-tight">{champion.pickRate}%</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] text-[#5b5a56] uppercase tracking-wider leading-none">Ban</span>
          <span className="font-mono font-semibold leading-tight" style={{ color: champion.banRate > 5 ? '#e84057' : '#a09b8c' }}>
            {champion.banRate}%
          </span>
        </div>
      </div>
      <ChevronDown className="w-4 h-4 text-[#785a28] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

// ============ CHAMPION MODAL (full card overlay) ============
function ChampionModal({ champion, onClose }: { champion: Champion; onClose: () => void }) {
  const cfg = TIER_CONFIG[champion.tier];
  const extUrls = getBuildExternalUrl(champion.name);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(30,35,40,0.98), rgba(10,14,26,0.98))',
          border: `1.5px solid ${cfg.color}40`,
          boxShadow: `0 0 60px ${cfg.color}15, 0 25px 50px rgba(0,0,0,0.5)`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with splash art */}
        <div className="relative p-5 pb-4" style={{ borderBottom: `1px solid ${cfg.color}20` }}>
          {/* Close button */}
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors z-10">
            <span className="text-[#a09b8c] text-lg font-light">×</span>
          </button>

          {/* Splash art background */}
          <div className="absolute inset-0 opacity-10">
            {!imgError ? (
              <img src={getChampionImageUrl(champion.name)} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
            ) : null}
          </div>

          <div className="relative flex items-start gap-4">
            {/* Champion icon */}
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0" style={{ border: `3px solid ${cfg.color}`, boxShadow: `0 0 20px ${cfg.color}30` }}>
              <SplashArtIcon name={champion.name} />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-[#f0e6d2]">{champion.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black" style={{ backgroundColor: cfg.color, color: '#0a0e1a' }}>{champion.tier}</span>
              </div>
              <p className="text-xs text-[#a09b8c] mb-2 italic">{champion.title}</p>
              <div className="flex items-center gap-3">
                <RoleBadge role={champion.role} />
                <span className="text-[10px] text-[#5b5a56]">Patch {champion.patch}</span>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 mt-4">
            {[
              { label: 'WR', value: champion.winRate, good: champion.winRate >= 52, color: '#0acbe6' },
              { label: 'Pick', value: champion.pickRate, good: champion.pickRate >= 10, color: '#f0c646' },
              { label: 'Ban', value: champion.banRate, good: champion.banRate > 5, color: '#e84057' },
            ].map(stat => (
              <div key={stat.label} className="flex-1 text-center">
                <p className="text-lg font-mono font-bold" style={{ color: stat.value >= (stat.good ? 52 : 5) || stat.label === 'Pick' ? stat.color : '#a09b8c' }}>
                  {stat.value}%
                </p>
                <p className="text-[9px] text-[#5b5a56] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
            {champion.proPickRate && (
              <div className="text-center">
                <p className="text-lg font-mono font-bold text-[#f0c646]">{champion.proPickRate}%</p>
                <p className="text-[9px] text-[#5b5a56] uppercase tracking-wider">Pro</p>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Broken Things */}
          {champion.brokenThings && champion.brokenThings.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#e84057]" />
                <h4 className="text-xs font-semibold text-[#e84057] uppercase tracking-wider">Cosas Rotas</h4>
              </div>
              <div className="space-y-1.5">
                {champion.brokenThings.map((thing, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <span className="text-[#e84057] mt-0.5">▸</span>
                    <span className="text-[#a09b8c]">{thing}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Builds with item icons */}
          {champion.builds && champion.builds.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-4 h-4 text-[#c8aa6e]" />
                <h4 className="text-xs font-semibold text-[#c8aa6e] uppercase tracking-wider">Builds</h4>
              </div>
              <div className="space-y-2">
                {champion.builds.map((build, i) => {
                  const items = parseBuildItems(build.items);
                  return (
                    <div key={i} className="rounded-lg p-3" style={{ background: 'rgba(30,35,40,0.5)', border: '1px solid rgba(120,90,40,0.1)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#f0e6d2]">{build.name}</span>
                        <span className="text-[10px] font-mono" style={{ color: build.winRate >= 53 ? '#0acbe6' : '#a09b8c' }}>
                          {build.winRate}% WR
                        </span>
                      </div>
                      {/* Item icons row */}
                      <div className="flex items-center gap-1.5 mb-2">
                        {items.map((item, j) => {
                          const iconUrl = getItemIconUrl(item);
                          return (
                            <div key={j} className="relative group" title={item}>
                              {iconUrl ? (
                                <img src={iconUrl} alt={item} className="w-7 h-7 rounded" style={{ border: '1px solid rgba(200,170,110,0.2)' }} loading="lazy" />
                              ) : (
                                <div className="w-7 h-7 rounded bg-[#1e2328] flex items-center justify-center text-[8px] text-[#5b5a56] border border-[#785a28]/20">
                                  {item[0]}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {/* External links */}
                      <div className="flex items-center gap-2">
                        <a href={extUrls.ugg} target="_blank" rel="noopener" className="text-[9px] text-[#5b5a56] hover:text-[#0acbe6] flex items-center gap-0.5 transition-colors">
                          <ExternalLink className="w-2.5 h-2.5" /> U.GG
                        </a>
                        <a href={extUrls.mobalytics} target="_blank" rel="noopener" className="text-[9px] text-[#5b5a56] hover:text-[#0acbe6] flex items-center gap-0.5 transition-colors">
                          <ExternalLink className="w-2.5 h-2.5" /> Mobalytics
                        </a>
                        <a href={extUrls.opgg} target="_blank" rel="noopener" className="text-[9px] text-[#5b5a56] hover:text-[#0acbe6] flex items-center gap-0.5 transition-colors">
                          <ExternalLink className="w-2.5 h-2.5" /> OP.GG
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Runas */}
          {champion.runes && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#f0c646]" />
                <h4 className="text-xs font-semibold text-[#f0c646] uppercase tracking-wider">Runas</h4>
              </div>
              <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(240,198,70,0.04)', border: '1px solid rgba(240,198,70,0.12)' }}>
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-semibold text-[#c8aa6e] shrink-0 w-16 uppercase">Ruta 1</span>
                  <span className="text-[11px] text-[#a09b8c]">{champion.runes.primary}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-semibold text-[#c8aa6e] shrink-0 w-16 uppercase">Ruta 2</span>
                  <span className="text-[11px] text-[#a09b8c]">{champion.runes.secondary}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-semibold text-[#c8aa6e] shrink-0 w-16 uppercase">Fragments</span>
                  <span className="text-[11px] text-[#a09b8c]">{champion.runes.shards}</span>
                </div>
              </div>
            </div>
          )}

          {/* Counter + Synergy with champion icons */}
          <div className="grid grid-cols-2 gap-3">
            {champion.counterPick && (() => {
              const counterNames = champion.counterPick.split(/[,;\—]/).map(s => s.replace(/\(.*?\)/g, '').trim()).filter(n => n.length > 0 && n !== champion.name);
              return (
                <div className="rounded-lg p-3" style={{ background: 'rgba(232,64,87,0.06)', border: '1px solid rgba(232,64,87,0.15)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Crosshair className="w-3.5 h-3.5 text-[#e84057]" />
                    <h4 className="text-[10px] font-semibold text-[#e84057] uppercase tracking-wider">Counters</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {counterNames.slice(0, 3).map((name) => (
                      <div key={name} className="flex flex-col items-center gap-1">
                        <TinyChampionIcon name={name} />
                        <span className="text-[8px] text-[#a09b8c] leading-none truncate max-w-[40px] text-center">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {champion.synergy && (() => {
              const synNames = champion.synergy.split(/[,;—]/).map(s => s.replace(/—.*/g, '').replace(/\(.*?\)/g, '').trim()).filter(n => n.length > 0 && n !== champion.name && n.length < 25);
              return (
                <div className="rounded-lg p-3" style={{ background: 'rgba(10,203,230,0.06)', border: '1px solid rgba(10,203,230,0.15)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Users className="w-3.5 h-3.5 text-[#0acbe6]" />
                    <h4 className="text-[10px] font-semibold text-[#0acbe6] uppercase tracking-wider">Sinergia</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {synNames.slice(0, 3).map((name) => (
                      <div key={name} className="flex flex-col items-center gap-1">
                        <TinyChampionIcon name={name} />
                        <span className="text-[8px] text-[#a09b8c] leading-none truncate max-w-[40px] text-center">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* AI Analysis */}
          {champion.aiAnalysis && (
            <div className="rounded-lg p-4" style={{ background: 'rgba(200,170,110,0.05)', border: '1px solid rgba(200,170,110,0.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#c8aa6e]" />
                <h4 className="text-xs font-semibold text-[#c8aa6e] uppercase tracking-wider">Análisis IA</h4>
              </div>
              <p className="text-[11px] text-[#a09b8c] leading-relaxed whitespace-pre-wrap">{champion.aiAnalysis}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============ ITEM ICON (for builds) ============
function ItemIcon({ name }: { name: string }) {
  const url = getItemIconUrl(name);
  const [err, setErr] = useState(false);
  if (!url || err) return <div className="w-6 h-6 rounded bg-[#1e2328] flex items-center justify-center text-[8px] text-[#5b5a56] border border-[#785a28]/20 shrink-0">{name[0]}</div>;
  return <img src={url} alt={name} className="w-6 h-6 rounded shrink-0" style={{ border: '1px solid rgba(200,170,110,0.15)' }} loading="lazy" onError={() => setErr(true)} />;
}

// ============ TIER SECTION ============
function TierSection({ tier, champions, onChampionClick }: { tier: string; champions: Champion[]; onChampionClick: (c: Champion) => void }) {
  const cfg = TIER_CONFIG[tier];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-4">
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-t-xl"
        style={{
          background: `linear-gradient(90deg, ${cfg.color}18, ${cfg.color}05)`,
          borderTop: `2px solid ${cfg.color}`,
          borderLeft: `1px solid ${cfg.color}25`,
          borderRight: `1px solid ${cfg.color}25`,
        }}
      >
        <span
          className="text-lg font-black tracking-wide"
          style={{ color: cfg.color, textShadow: `0 0 12px ${cfg.color}30` }}
        >
          {tier}
        </span>
        <div className="w-px h-4 bg-[#785a28]/40" />
        <span className="text-xs font-medium" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        <span className="text-[10px] text-[#5b5a56] ml-auto">
          {champions.length} campeones
        </span>
      </div>

      <div
        className="hidden sm:flex items-center px-4 py-1.5 text-[8px] text-[#5b5a56] uppercase tracking-widest font-medium"
        style={{
          background: 'rgba(20, 24, 30, 0.8)',
          borderLeft: `1px solid rgba(120, 90, 40, 0.15)`,
          borderRight: `1px solid rgba(120, 90, 40, 0.15)`,
        }}
      >
        <div className="w-11 shrink-0" />
        <div className="flex-1" />
        <div className="w-14 shrink-0" />
        <div className="flex items-center gap-2.5 shrink-0 ml-3">
          <span className="w-8 text-center">WR</span>
          <span className="w-8 text-center">Pick</span>
          <span className="w-8 text-center">Ban</span>
        </div>
        <div className="w-4 shrink-0" />
      </div>

      <div
        className="space-y-0.5 p-1 rounded-b-xl"
        style={{
          background: 'rgba(20, 24, 30, 0.5)',
          border: '1px solid rgba(120, 90, 40, 0.12)',
          borderTop: 'none',
        }}
      >
        {champions.map(champ => (
          <div key={champ.id}>
            <ChampionRow champion={champ} onClick={() => onChampionClick(champ)} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ============ SKELETON LOADING ============
function TierSectionSkeleton() {
  return (
    <div className="mb-4">
      <div className="h-10 rounded-t-xl bg-[#1e2328]/50 mb-1" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 p-1 rounded-b-xl bg-[#14181e]/50">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg">
            <Skeleton className="w-11 h-11 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-2.5 w-28" />
            </div>
            <Skeleton className="h-5 w-10 rounded-full" />
            <Skeleton className="h-4 w-16 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ GAME SELECTOR LANDING ============
function GameSelectorLanding({ onSelectGame }: { onSelectGame: (game: GameSelection) => void }) {
  return (
    <motion.div
      className="min-h-[calc(100vh-57px)] flex flex-col items-center justify-center px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4 }}
    >
      {/* Title */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <h2
          className="text-4xl sm:text-5xl font-black tracking-[0.15em] mb-3"
          style={{
            color: '#c8aa6e',
            textShadow: '0 0 40px rgba(200,170,110,0.4), 0 0 80px rgba(200,170,110,0.15), 0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          ELIGE TU JUEGO
        </h2>
        <p className="text-[#5b5a56] text-sm sm:text-base tracking-widest uppercase">
          Selecciona la plataforma para ver análisis
        </p>
        <div className="w-24 h-0.5 mx-auto mt-4" style={{ background: 'linear-gradient(90deg, transparent, #c8aa6e, transparent)' }} />
      </motion.div>

      {/* Game Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full max-w-2xl">
        {/* League of Legends Card */}
        <motion.button
          onClick={() => onSelectGame('lol')}
          className="group relative overflow-hidden rounded-2xl p-8 sm:p-10 text-left cursor-pointer transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(200,170,110,0.08), rgba(200,170,110,0.02))',
            border: '1px solid rgba(200,170,110,0.2)',
            backdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{
            scale: 1.03,
            boxShadow: '0 0 60px rgba(200,170,110,0.15), 0 0 120px rgba(200,170,110,0.05)',
            borderColor: 'rgba(200,170,110,0.5)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(200,170,110,0.1), transparent 70%)',
            }}
          />
          <div className="relative z-10">
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(200,170,110,0.2), rgba(200,170,110,0.05))',
                border: '1px solid rgba(200,170,110,0.3)',
                boxShadow: '0 0 30px rgba(200,170,110,0.1)',
              }}
              whileHover={{ rotate: [-2, 2, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Sword className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#c8aa6e' }} />
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-black tracking-[0.2em] mb-2" style={{ color: '#c8aa6e', textShadow: '0 0 20px rgba(200,170,110,0.3)' }}>
              LEAGUE OF LEGENDS
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-4 h-4 text-[#5b5a56]" />
              <p className="text-sm text-[#5b5a56] tracking-wide">PC Analytics</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#785a28] group-hover:text-[#c8aa6e] transition-colors">
              <span>Tier List &bull; Meta &bull; Insights</span>
              <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="absolute top-3 right-3 w-6 h-6" style={{ borderTop: '1px solid rgba(200,170,110,0.3)', borderRight: '1px solid rgba(200,170,110,0.3)' }} />
          <div className="absolute bottom-3 left-3 w-6 h-6" style={{ borderBottom: '1px solid rgba(200,170,110,0.3)', borderLeft: '1px solid rgba(200,170,110,0.3)' }} />
        </motion.button>

        {/* Wild Rift Card */}
        <motion.button
          onClick={() => onSelectGame('wildrift')}
          className="group relative overflow-hidden rounded-2xl p-8 sm:p-10 text-left cursor-pointer transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(10,203,230,0.08), rgba(10,203,230,0.02))',
            border: '1px solid rgba(10,203,230,0.2)',
            backdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{
            scale: 1.03,
            boxShadow: '0 0 60px rgba(10,203,230,0.15), 0 0 120px rgba(10,203,230,0.05)',
            borderColor: 'rgba(10,203,230,0.5)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(10,203,230,0.1), transparent 70%)',
            }}
          />
          <div className="relative z-10">
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(10,203,230,0.2), rgba(10,203,230,0.05))',
                border: '1px solid rgba(10,203,230,0.3)',
                boxShadow: '0 0 30px rgba(10,203,230,0.1)',
              }}
              whileHover={{ rotate: [-2, 2, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Smartphone className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#0acbe6' }} />
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-black tracking-[0.2em] mb-2" style={{ color: '#0acbe6', textShadow: '0 0 20px rgba(10,203,230,0.3)' }}>
              WILD RIFT
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-4 h-4 text-[#5b5a56]" />
              <p className="text-sm text-[#5b5a56] tracking-wide">Mobile Analytics</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#5b5a56] group-hover:text-[#0acbe6] transition-colors">
              <span>Tier List &bull; Meta &bull; Builds</span>
              <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="absolute top-3 right-3 w-6 h-6" style={{ borderTop: '1px solid rgba(10,203,230,0.3)', borderRight: '1px solid rgba(10,203,230,0.3)' }} />
          <div className="absolute bottom-3 left-3 w-6 h-6" style={{ borderBottom: '1px solid rgba(10,203,230,0.3)', borderLeft: '1px solid rgba(10,203,230,0.3)' }} />
        </motion.button>
      </div>

      {/* Info Section */}
      <motion.div className="mt-12 max-w-2xl w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4 text-center">
            <Database className="w-6 h-6 text-[#c8aa6e] mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-[#f0e6d2] mb-1">Fuentes de Datos</h4>
            <p className="text-[10px] text-[#5b5a56]">Riot Data Dragon CDN<br/>IA Generativa (GLM)<br/>Estadísticas del Meta</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-[#0acbe6] mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-[#f0e6d2] mb-1">Última Actualización</h4>
            <p className="text-[10px] text-[#5b5a56]">Patch 14.8<br/>18 Abril, 2026<br/>Pipeline: 14 tareas activas</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Shield className="w-6 h-6 text-[#f0c646] mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-[#f0e6d2] mb-1">Beneficios</h4>
            <p className="text-[10px] text-[#5b5a56]">Tier Lists con IA<br/>Análisis de Campeones<br/>Scout de Invocadores</p>
          </div>
        </div>
      </motion.div>

      {/* Footer hint */}
      <motion.p
        className="text-[10px] text-[#785a28] mt-10 tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Powered by IA &bull; Datos actualizados al meta actual
      </motion.p>
    </motion.div>
  );
}

// ============ WILD RIFT HEADER BANNER ============
function WildRiftHeader() {
  return (
    <motion.div
      className="mb-4 rounded-xl p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(10,203,230,0.08), rgba(10,203,230,0.02))',
        border: '1px solid rgba(10,203,230,0.2)',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(10,203,230,0.2), rgba(10,203,230,0.05))', border: '1px solid rgba(10,203,230,0.3)' }}>
          <Smartphone className="w-5 h-5" style={{ color: '#0acbe6' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold" style={{ color: '#0acbe6' }}>WILD RIFT — Patch 6.4</h3>
          <p className="text-[10px] text-[#5b5a56]">Mobile Analytics — 18 campeones S/A tier con builds y análisis</p>
        </div>
        <Badge variant="outline" className="text-[10px] border-[#0acbe6]/30 text-[#0acbe6]">6 S-Tier</Badge>
      </div>
    </motion.div>
  );
}



// ============ MAIN APP ============
export default function Home() {
  const [selectedGame, setSelectedGame] = useState<GameSelection>(null);
  const [activeTab, setActiveTab] = useState('tierlist');
  const [champions, setChampions] = useState<Champion[]>([]);
  const [patches, setPatches] = useState<PatchNote[]>([]);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [proPicks, setProPicks] = useState<ProPick[]>([]);
  const [combos, setCombos] = useState<BrokenCombo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [proRegionFilter, setProRegionFilter] = useState('');

  // Expanded champion → now a full modal
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);

  // Summoner profile state
  const [summonerName, setSummonerName] = useState('');
  const [summonerRegion, setSummonerRegion] = useState('LAS');
  const [summonerData, setSummonerData] = useState<SummonerData | null>(null);
  const [summonerLoading, setSummonerLoading] = useState(false);
  const [summonerError, setSummonerError] = useState('');

  // ============ FETCH DATA ============
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [champsRes, patchesRes, insightsRes, tasksRes, proRes, combosRes] = await Promise.all([
        fetch('/api/champions'),
        fetch('/api/patches'),
        fetch('/api/insights'),
        fetch('/api/tasks'),
        fetch('/api/pro-picks'),
        fetch('/api/combos'),
      ]);
      const [champsData, patchesData, insightsData, tasksData, proData, combosData] = await Promise.all([
        champsRes.json(),
        patchesRes.json(),
        insightsRes.json(),
        tasksRes.json(),
        proRes.json(),
        combosRes.json(),
      ]);
      setChampions(champsData);
      setPatches(patchesData);
      setInsights(insightsData);
      setTasks(tasksData);
      setProPicks(proData);
      setCombos(combosData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ============ GAME SELECTION ============
  const handleSelectGame = (game: GameSelection) => {
    setSelectedGame(game);
    setActiveTab('tierlist');
  };

  const handleBackToSelector = () => {
    setSelectedGame(null);
  };

  // ============ FILTER CHAMPIONS ============
  const filteredChampions = champions.filter(c => {
    // Filter by selected game
    if (selectedGame === 'lol' && c.game !== 'LoL') return false;
    if (selectedGame === 'wildrift' && c.game !== 'WR') return false;
    if (roleFilter !== 'Todos' && c.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
    }
    return true;
  });

  const groupedChampions: Record<string, Champion[]> = {};
  TIERS.forEach(tier => {
    const tierChamps = filteredChampions.filter(c => c.tier === tier);
    if (tierChamps.length > 0) groupedChampions[tier] = tierChamps;
  });

  // ============ CHAMPION SELECT (opens modal) ============
  const handleToggleChampion = (champion: Champion) => {
    setSelectedChampion(prev => prev?.id === champion.id ? null : champion);
  };

  // ============ SUMMONER SEARCH ============
  const handleSearchSummoner = async () => {
    if (!summonerName.trim()) return;
    setSummonerLoading(true);
    setSummonerError('');
    setSummonerData(null);
    try {
      const res = await fetch(`/api/summoner?name=${encodeURIComponent(summonerName)}&region=${summonerRegion}`);
      if (!res.ok) {
        const errData = await res.json();
        setSummonerError(errData.error || 'Error al buscar invocador');
        return;
      }
      const data = await res.json();
      setSummonerData(data);
    } catch (err) {
      console.error('Summoner search error:', err);
      setSummonerError('Error de conexión. Intenta de nuevo.');
    } finally {
      setSummonerLoading(false);
    }
  };

  // ============ TASK STATUS TOGGLE ============
  const handleToggleTask = async (task: TaskItem) => {
    const nextStatus = task.status === 'done' ? 'pending' : 'running';
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: nextStatus }),
      });
      const updated = await res.json();
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: updated.status } : t));
    } catch (err) {
      console.error('Task update error:', err);
    }
  };

  // ============ TIER LIST TAB ============
  function TierListTab() {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5b5a56]" />
            <Input
              placeholder="Buscar campeón..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1e2328]/60 border-[#785a28]/30 text-[#f0e6d2] placeholder:text-[#5b5a56] focus-visible:border-[#c8aa6e] focus-visible:ring-[#c8aa6e]/20 h-10 rounded-lg"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {ROLES.map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`
                  px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                  ${roleFilter === role
                    ? 'bg-[#c8aa6e]/15 text-[#c8aa6e] border border-[#c8aa6e]/30 shadow-[0_0_10px_rgba(200,170,110,0.08)]'
                    : 'text-[#5b5a56] hover:text-[#a09b8c] hover:bg-[#1e2328]/40 border border-transparent'
                  }
                `}
              >
                {role === 'Todos' && <Filter className="w-3 h-3 mr-1 inline" />}
                {role}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <>
            <TierSectionSkeleton />
            <TierSectionSkeleton />
          </>
        ) : (
          Object.entries(groupedChampions).map(([tier, champs]) => (
            <TierSection
              key={tier}
              tier={tier}
              champions={champs}
              onChampionClick={handleToggleChampion}
            />
          ))
        )}

        {/* Expanded Champion Details → now a Modal */}
        <AnimatePresence>
          {selectedChampion && (
            <ChampionModal champion={selectedChampion} onClose={() => setSelectedChampion(null)} />
          )}
        </AnimatePresence>

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

  // ============ PATCH NOTES TAB ============
  function PatchesTab() {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[#5b5a56]">
          <ScrollText className="w-4 h-4" />
          <span className="text-sm">{patches.length} parche(s) encontrado(s)</span>
        </div>

        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-6 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))
        ) : (
          patches.map(patch => (
            <motion.div key={patch.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="glass-card rounded-xl p-5 border border-[#785a28]/25">
              <div className="flex items-start gap-3 mb-4">
                <Badge className="bg-[#c8aa6e] text-[#0a0e1a] font-bold text-sm px-3 py-1 shrink-0">{patch.version}</Badge>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[#f0e6d2]">{patch.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#5b5a56] mt-1 flex-wrap">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(patch.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <Badge variant="outline" className="text-[10px] border-[#785a28]/40 text-[#5b5a56]">{patch.sourceGame}</Badge>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-[#c8aa6e] uppercase tracking-wider mb-2">Resumen</h4>
                <p className="text-sm text-[#a09b8c] leading-relaxed">{patch.summary}</p>
              </div>
              {patch.digest && (
                <div className="rounded-lg p-4 border border-[#0acbe6]/15 bg-[#0acbe6]/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-[#0acbe6]" />
                    <h4 className="text-xs font-semibold text-[#0acbe6] uppercase tracking-wider">Análisis IA</h4>
                  </div>
                  <p className="text-sm text-[#f0e6d2] leading-relaxed">{patch.digest}</p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    );
  }

  // ============ BROKEN STUFF TAB (FIXED with icons) ============
  function BrokenStuffTab() {
    const metaInsights = insights.filter(i => i.category === 'meta' || i.category === 'buff');
    const sTierChamps = champions.filter(c => c.tier === 'S');
    const aTierChamps = champions.filter(c => c.tier === 'A').slice(0, 8);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#e84057]" />
          <div>
            <h2 className="text-lg font-bold text-[#f0e6d2]">Cosas Rotas & Combos OP</h2>
            <p className="text-xs text-[#5b5a56]">Campeones y combinaciones que están dominando el meta</p>
          </div>
        </div>

        {/* ===== S-TIER BROKEN CHAMPIONS ===== */}
        {!loading && sTierChamps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-black tracking-wider" style={{ color: '#c8aa6e', textShadow: '0 0 10px rgba(200,170,110,0.3)' }}>S TIER</span>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(200,170,110,0.3), transparent)' }} />
              <Badge className="bg-[#e84057]/20 text-[#e84057] border border-[#e84057]/30 text-[10px]">
                <AlertTriangle className="w-3 h-3 mr-1" />
                ROTOP
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sTierChamps.map((champ, idx) => {
                const mainBuild = champ.builds?.[0];
                return (
                  <motion.div
                    key={champ.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card rounded-xl overflow-hidden group"
                    style={{ border: '1px solid rgba(200,170,110,0.2)' }}
                  >
                    {/* Top section with splash art */}
                    <div className="flex items-start gap-3 p-4">
                      <div className="relative shrink-0">
                        <div
                          className="w-16 h-16 rounded-xl overflow-hidden"
                          style={{
                            border: '2.5px solid #c8aa6e',
                            boxShadow: '0 0 20px rgba(200,170,110,0.2), 0 0 40px rgba(200,170,110,0.05)',
                          }}
                        >
                          <SplashArtIcon name={champ.name} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black" style={{ backgroundColor: '#c8aa6e', color: '#0a0e1a' }}>
                          S
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-[#f0e6d2] text-sm truncate">{champ.name}</h3>
                          <RoleBadge role={champ.role} />
                        </div>
                        <div className="flex items-center gap-3 text-[11px] mb-1">
                          <span className="font-mono font-bold" style={{ color: champ.winRate >= 53 ? '#0acbe6' : '#c8aa6e' }}>
                            {champ.winRate}% WR
                          </span>
                          <span className="text-[#5b5a56]">|</span>
                          <span className="font-mono text-[#a09b8c]">{champ.pickRate}% Pick</span>
                          {champ.banRate > 5 && (
                            <>
                              <span className="text-[#5b5a56]">|</span>
                              <span className="font-mono text-[#e84057]">{champ.banRate}% Ban</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Build section */}
                    {mainBuild && (
                      <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(200,170,110,0.1)', background: 'rgba(200,170,110,0.03)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Wrench className="w-3 h-3 text-[#c8aa6e]" />
                          <span className="text-[10px] font-semibold text-[#c8aa6e] uppercase tracking-wider">Build Roto</span>
                          <span className="text-[9px] font-mono text-[#0acbe6] ml-auto">{mainBuild.winRate}% WR</span>
                        </div>
                        <p className="text-[10px] text-[#a09b8c] leading-relaxed">{mainBuild.items}</p>
                      </div>
                    )}

                    {/* Counter + Synergy */}
                    {(champ.counterPick || champ.synergy) && (
                      <div className="grid grid-cols-2 gap-2 px-4 py-2" style={{ borderTop: '1px solid rgba(120,90,40,0.1)' }}>
                        {champ.counterPick && (
                          <div>
                            <span className="text-[9px] text-[#e84057] uppercase tracking-wider font-medium">Counters</span>
                            <p className="text-[10px] text-[#a09b8c] mt-0.5">{champ.counterPick}</p>
                          </div>
                        )}
                        {champ.synergy && (
                          <div>
                            <span className="text-[9px] text-[#0acbe6] uppercase tracking-wider font-medium">Sinergia</span>
                            <p className="text-[10px] text-[#a09b8c] mt-0.5">{champ.synergy}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== A-TIER ALSO STRONG ===== */}
        {!loading && aTierChamps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-black tracking-wider" style={{ color: '#0acbe6', textShadow: '0 0 10px rgba(10,203,230,0.3)' }}>A TIER</span>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(10,203,230,0.3), transparent)' }} />
              <span className="text-[10px] text-[#5b5a56]">También fuertes</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {aTierChamps.map(champ => (
                <motion.div
                  key={champ.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-2.5 rounded-lg"
                  style={{ background: 'rgba(10,203,230,0.04)', border: '1px solid rgba(10,203,230,0.12)' }}
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0" style={{ border: '2px solid #0acbe680' }}>
                    <TinyChampionIcon name={champ.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-[#f0e6d2] truncate">{champ.name}</p>
                    <p className="text-[9px] text-[#5b5a56]">{champ.role}</p>
                    <p className="text-[10px] font-mono font-semibold" style={{ color: champ.winRate >= 51 ? '#0acbe6' : '#a09b8c' }}>
                      {champ.winRate}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ===== AI INSIGHTS ===== */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#f0c646]" />
            <span className="text-sm font-semibold text-[#a09b8c]">Insights de IA</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(240,198,70,0.2), transparent)' }} />
            <span className="text-[10px] text-[#5b5a56]">{metaInsights.length} insights</span>
          </div>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-5 space-y-3 mb-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-32 rounded-full" />
              </div>
            ))
          ) : (
            <div className="space-y-3">
              {metaInsights.map(insight => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card rounded-xl p-4 border-l-4 hover:border-[#c8aa6e]/30 transition-colors"
                  style={{
                    borderLeftColor: insight.category === 'meta' ? '#f0c646' : '#0acbe6',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <TinyChampionIcon name={insight.champion} />
                        <span className="font-semibold text-[#f0e6d2] text-sm">{insight.champion}</span>
                        <CategoryBadge category={insight.category} />
                        {insight.category === 'meta' && (
                          <Badge className="bg-[#e84057]/20 text-[#e84057] border border-[#e84057]/30 text-[10px]">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            ROTOP
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#a09b8c] leading-relaxed mb-3">{insight.content}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-[10px] text-[#5b5a56] shrink-0">Confianza</span>
                          <Progress value={insight.confidence * 100} className="h-1.5 flex-1" />
                          <span className="text-[10px] font-mono text-[#c8aa6e] shrink-0">
                            {(insight.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#785a28] shrink-0 mt-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============ TASK QUEUE TAB ============
  function TasksTab() {
    const runningCount = tasks.filter(t => t.status === 'running').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const pendingCount = tasks.filter(t => t.status === 'pending').length;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <ListTodo className="w-5 h-5 text-[#c8aa6e]" />
          <div>
            <h2 className="text-lg font-bold text-[#f0e6d2]">Cola de Tareas Circulares</h2>
            <p className="text-xs text-[#5b5a56]">14 tareas automáticas que mantienen los datos actualizados</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-[#0acbe6]">{runningCount}</p>
            <p className="text-[10px] text-[#5b5a56]">Ejecutando</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-[#0acbe6]">{doneCount}</p>
            <p className="text-[10px] text-[#5b5a56]">Completados</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-[#5b5a56]">{pendingCount}</p>
            <p className="text-[10px] text-[#5b5a56]">Pendientes</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          className="border-[#785a28]/30 text-[#5b5a56] hover:text-[#f0e6d2] hover:border-[#c8aa6e]/50 text-xs"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Refrescar
        </Button>

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))
        ) : (
          <div className="space-y-2">
            {tasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: idx * 0.03 }}
                className="glass-card rounded-xl p-4 flex items-start gap-3 group hover:border-[#c8aa6e]/30 transition-colors cursor-pointer"
                onClick={() => handleToggleTask(task)}
              >
                <div className="mt-0.5 shrink-0">
                  <span className="text-xs font-mono text-[#785a28]">#{task.pointer}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-sm font-medium text-[#f0e6d2]">{task.title}</h4>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="text-xs text-[#5b5a56] leading-relaxed mb-1">{task.description}</p>
                  <div className="flex items-center gap-1 text-[10px] text-[#785a28]">
                    <Clock className="w-3 h-3" />
                    <span>{task.interval} min</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#785a28] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ============ ROADMAP TAB ============
  function RoadmapTab() {
    const roadmapCategories = [
      {
        title: 'Datos & APIs', icon: Database, items: [
          { name: 'Conexión Riot API completa', status: 'progress', desc: 'API key configurada, datos reales de invocadores, ranked, historial' },
          { name: 'Datos en tiempo real (U.GG / Mobalytics)', status: 'planned', desc: 'Conectar APIs de terceros para estadísticas actualizadas automáticamente' },
          { name: 'Wild Rift - Datos completos', status: 'done', desc: '18 campeones con tier list, builds, counters, sinergias e IA' },
          { name: 'Community Dragon Assets', status: 'done', desc: 'CDN Data Dragon para iconos de campeones, items y splash arts' },
        ]
      },
      {
        title: 'IA & Analytics', icon: Brain, items: [
          { name: 'Auto-análisis IA (sin botón)', status: 'done', desc: 'La IA analiza automáticamente y muestra conclusiones pre-escritas' },
          { name: 'Coach IA (Chatbot)', status: 'cancelled', desc: 'Chat con IA especializado en coaching de LoL' },
          { name: 'Análisis de VODs', status: 'cancelled', desc: 'Subir replay/VOD y obtener análisis con IA' },
          { name: 'Team Comp Analyzer', status: 'cancelled', desc: 'Reemplazado por Combos Rotos' },
          { name: 'Predicción de patches', status: 'cancelled', desc: 'IA predice cambios de balance antes del parche' },
        ]
      },
      {
        title: 'Competitivo', icon: Trophy, items: [
          { name: 'Campeones Pro (LCK/LPL/LEC/LCS)', status: 'done', desc: 'Listado de campeones más usados en esports profesionales' },
          { name: 'Ban/Pick Analysis Pro', status: 'cancelled', desc: 'Análisis de bans y picks en series profesionales' },
          { name: 'Meta regional', status: 'planned', desc: 'Diferencias de meta entre regiones (KR vs NA vs EU)' },
        ]
      },
      {
        title: 'Builds & Runas', icon: Wrench, items: [
          { name: 'Builds recomendados', status: 'done', desc: '1-2 builds rotas para cada campeón S/A con iconos de items' },
          { name: 'Runas óptimas', status: 'planned', desc: 'Runas recomendadas por campeon y rol' },
          { name: 'Item build paths', status: 'planned', desc: 'Order de compra de items optimizado' },
          { name: 'Counter builds', status: 'planned', desc: 'Items específicos contra cada campeon' },
        ]
      },
      {
        title: 'Social & Usuarios', icon: Users, items: [
          { name: 'Autenticación Riot OAuth2', status: 'cancelled', desc: 'Login con cuenta de Riot Games' },
          { name: 'Perfiles guardados', status: 'cancelled', desc: 'Guardar favoritos, tier lists personalizadas' },
          { name: 'Comunidad', status: 'cancelled', desc: 'Compartir análisis, votar tier lists' },
          { name: 'Discord Bot', status: 'cancelled', desc: 'Notificaciones de meta en canales de Discord' },
        ]
      },
      {
        title: 'Plataforma', icon: Smartphone, items: [
          { name: 'PWA completa', status: 'cancelled', desc: 'Service worker, offline, installable' },
          { name: 'Notificaciones Push', status: 'cancelled', desc: 'Alertas de buffs/nerfs de campeones principales' },
          { name: 'Multi-idioma', status: 'cancelled', desc: 'Español, inglés, portugués, más' },
          { name: 'Tema claro/oscuro', status: 'cancelled', desc: 'Toggle entre temas' },
        ]
      },
      {
        title: 'Combos Rotos', icon: Zap, items: [
          { name: 'Combos de 2 campeones (Dúos)', status: 'done', desc: 'Sinergias rotas entre 2 campeones con win rate y dificultad' },
          { name: 'Combos de 3 campeones (Tríos)', status: 'done', desc: 'Tríos de campeones con gran sinergia en mapa' },
          { name: 'Combos de 4 campeones', status: 'done', desc: 'Composiciones de 4 con objetivo claro' },
          { name: 'Combos de 5 campeones (Equipos)', status: 'done', desc: 'Team comps completas rotas para ranked' },
        ]
      },
      {
        title: 'Assets & Data que podemos agregar', icon: ImageIcon, items: [
          { name: 'Spell icons (Q/W/E/R)', status: 'planned', desc: 'Iconos de habilidades de cada campeón' },
          { name: 'Item icons', status: 'done', desc: 'Imágenes de items del juego en builds' },
          { name: 'Rune icons', status: 'planned', desc: 'Iconos de runas (Precisión, Dominación, etc.)' },
          { name: 'Mapa de visión', status: 'planned', desc: 'Visualización de ward spots óptimos' },
          { name: 'Splash arts de skins', status: 'planned', desc: 'Galería de skins alternativas' },
          { name: 'Emotes/Iconos de perfil', status: 'planned', desc: 'Explorador de emotes y iconos' },
          { name: 'Datos de ranked distribution', status: 'planned', desc: 'Gráfico de distribución de rangos' },
          { name: 'Champion.gg / U.GG synergy data', status: 'planned', desc: 'Sinergias y matchups basados en millones de partidas' },
        ]
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Map className="w-5 h-5 text-[#c8aa6e]" />
          <div>
            <h2 className="text-lg font-bold text-[#f0e6d2]">Roadmap</h2>
            <p className="text-xs text-[#5b5a56]">Plan de desarrollo y features futuras</p>
          </div>
        </div>

        <div className="space-y-4">
          {roadmapCategories.map((cat, catIdx) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.05 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              {/* Category Header */}
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(120,90,40,0.15)' }}>
                <cat.icon className="w-4 h-4 text-[#c8aa6e]" />
                <h3 className="text-sm font-semibold text-[#f0e6d2]">{cat.title}</h3>
                <span className="text-[10px] text-[#5b5a56] ml-auto">{cat.items.length} items</span>
              </div>

              {/* Items */}
              <div className="divide-y divide-[#785a28]/10">
                {cat.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 px-4 py-3 hover:bg-[#1e2328]/40 transition-colors">
                    <div className="mt-0.5 shrink-0">
                      <RoadmapStatusBadge status={item.status} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-[#f0e6d2]">{item.name}</h4>
                      <p className="text-[10px] text-[#5b5a56] mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ============ COMBOS TAB ============
  function CombosTab() {
    const [sizeFilter, setSizeFilter] = useState<number | null>(null);
    const gameFilter = selectedGame === 'wildrift' ? 'WR' : 'LoL';
    const filtered = combos
      .filter(c => c.game === gameFilter)
      .filter(c => sizeFilter === null || c.champions.length === sizeFilter);

    const sizeOptions = [
      { value: null, label: 'Todos' },
      { value: 2, label: 'Dúos (2)' },
      { value: 3, label: 'Tríos (3)' },
      { value: 4, label: 'Cuartetos (4)' },
      { value: 5, label: 'Equipos (5)' },
    ];

    const diffColors: Record<string, { bg: string; border: string; text: string }> = {
      facil: { bg: 'rgba(15,186,129,0.1)', border: 'rgba(15,186,129,0.3)', text: '#0fba81' },
      media: { bg: 'rgba(10,203,230,0.1)', border: 'rgba(10,203,230,0.3)', text: '#0acbe6' },
      dificil: { bg: 'rgba(232,64,87,0.1)', border: 'rgba(232,64,87,0.3)', text: '#e84057' },
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Flame className="w-5 h-5 text-[#e84057]" />
          <div>
            <h2 className="text-lg font-bold text-[#f0e6d2]">Combos Rotos</h2>
            <p className="text-xs text-[#5b5a56]">Combinaciones más tóxicas del meta — Ordenadas por win rate</p>
          </div>
        </div>

        {/* Size filter */}
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => setSizeFilter(opt.value)}
              className={`
                px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                ${sizeFilter === opt.value
                  ? 'bg-[#e84057]/15 text-[#e84057] border border-[#e84057]/30'
                  : 'text-[#5b5a56] hover:text-[#a09b8c] hover:bg-[#1e2328]/40 border border-transparent'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Combos Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((combo, idx) => {
              const dc = diffColors[combo.difficulty] || diffColors.media;
              return (
                <motion.div
                  key={combo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="glass-card rounded-xl p-4 cursor-pointer hover:border-[#e84057]/30 transition-all duration-300 group"
                  style={{ border: '1px solid rgba(120,90,40,0.12)' }}
                  whileHover={{ scale: 1.01 }}
                >
                  {/* Champions row */}
                  <div className="flex items-center gap-2 mb-3">
                    {combo.champions.map((name, i) => (
                      <div key={name} className="flex items-center gap-2">
                        <TinyChampionIcon name={name} />
                        {i < combo.champions.length - 1 && (
                          <span className="text-[10px] text-[#785a28] font-bold">+</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Name + description */}
                  <h3 className="text-sm font-bold text-[#f0e6d2] group-hover:text-[#e84057] transition-colors">{combo.name}</h3>
                  <p className="text-[11px] text-[#a09b8c] mt-1 leading-relaxed">{combo.description}</p>
                  {/* Badges */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: combo.winRate >= 57 ? 'rgba(10,203,230,0.1)' : 'rgba(160,155,140,0.1)', color: combo.winRate >= 57 ? '#0acbe6' : '#a09b8c', border: `1px solid ${combo.winRate >= 57 ? 'rgba(10,203,230,0.3)' : 'rgba(160,155,140,0.2)'}` }}>
                      {combo.winRate}% WR
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded" style={{ backgroundColor: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>
                      {combo.difficulty}
                    </span>
                    <span className="text-[9px] text-[#5b5a56] ml-auto">
                      {combo.champions.length} champ{combo.champions.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-[#5b5a56]">
            <Flame className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No hay combos para este filtro</p>
          </div>
        )}
      </div>
    );
  }

  // ============ COMPETITIVE TAB ============
  function CompetitiveTab() {
    const filteredPicks = proRegionFilter
      ? proPicks.filter(p => p.region === proRegionFilter)
      : proPicks;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-[#f0c646]" />
          <div>
            <h2 className="text-lg font-bold text-[#f0e6d2]">Escena Competitiva</h2>
            <p className="text-xs text-[#5b5a56]">Campeones más pickados en torneos profesionales — Patch 14.8</p>
          </div>
        </div>

        {/* Region Filter */}
        <div className="flex flex-wrap gap-2">
          {TOURNAMENT_REGIONS.map(r => (
            <button
              key={r.value || 'all'}
              onClick={() => setProRegionFilter(r.value)}
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

        {/* Picks List */}
        <div className="glass-card rounded-xl overflow-hidden">
          {/* Header row */}
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

  // ============ PLAYER PROFILE TAB ============
  function ProfileTab() {
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
                  onChange={e => setSummonerName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchSummoner()}
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
                  onChange={e => setSummonerRegion(e.target.value)}
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
          <Button onClick={handleSearchSummoner} disabled={summonerLoading || !summonerName.trim()} className="w-full bg-[#c8aa6e] text-[#0a0e1a] hover:bg-[#c8aa6e]/90 font-semibold rounded-lg gap-2">
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
                <div className="w-20 h-20 rounded-full overflow-hidden shrink-0" style={{ border: '3px solid #c8aa6e', boxShadow: '0 0 20px rgba(200,170,110,0.2)' }}>
                  <img src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/profileicon/${summonerData.profileIconId}.png`} alt={summonerData.name} className="w-full h-full object-cover" />
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
                  const queueIcon = entry.queueType === 'RANKED_SOLO_5x5' ? Sword : Users;
                  const tierColor = TIER_COLORS[entry.tier] || '#a09b8c';
                  const totalGames = entry.wins + entry.losses;
                  const winRate = totalGames > 0 ? ((entry.wins / totalGames) * 100).toFixed(1) : '0';

                  return (
                    <motion.div key={entry.queueType} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <queueIcon className="w-4 h-4" style={{ color: tierColor }} />
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
          <div className="text-center py-16">
            <User className="w-16 h-16 mx-auto mb-4 text-[#785a28]/30" />
            <p className="text-[#5b5a56] text-sm">Busca un invocador para ver su perfil</p>
            <p className="text-[#785a28]/40 text-xs mt-1">Escribe el nombre y selecciona una región</p>
          </div>
        )}
      </div>
    );
  }

  // ============ RENDER ============
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0e1a' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-[#785a28]/30" style={{ backgroundColor: 'rgba(10, 14, 26, 0.94)', backdropFilter: 'blur(20px) saturate(1.2)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={selectedGame ? handleBackToSelector : undefined}
            className={`flex items-center gap-2 ${selectedGame ? 'cursor-pointer group' : ''}`}
          >
            <div className="w-8 h-8 rounded flex items-center justify-center lol-pulse" style={{ background: 'linear-gradient(135deg, #c8aa6e, #785a28)', boxShadow: '0 0 15px rgba(200,170,110,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
              <Sword className="w-4 h-4 text-[#0a0e1a]" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-[0.2em] leading-none" style={{ color: '#c8aa6e', textShadow: '0 0 30px rgba(200,170,110,0.4), 0 2px 4px rgba(0,0,0,0.8)' }}>MOBA SAGE</h1>
              <p className="text-[9px] text-[#5b5a56] tracking-[0.2em] uppercase leading-none mt-0.5">Analytics con IA</p>
            </div>
            {selectedGame && (
              <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="ml-1">
                <ArrowLeft className="w-3 h-3 text-[#785a28] group-hover:text-[#c8aa6e] transition-colors" />
              </motion.div>
            )}
          </button>
          <div className="ml-auto flex items-center gap-2">
            {selectedGame === 'lol' && (
              <Badge variant="outline" className="text-[10px] border-[#c8aa6e]/30 text-[#c8aa6e]">League of Legends</Badge>
            )}
            {selectedGame === 'wildrift' && (
              <Badge variant="outline" className="text-[10px] border-[#0acbe6]/30 text-[#0acbe6]">Wild Rift</Badge>
            )}
            <Badge variant="outline" className="text-[10px] border-[#785a28]/30 text-[#5b5a56]">{selectedGame === 'wildrift' ? 'Patch 6.4' : 'Patch 14.8'}</Badge>
            <Badge className="bg-[#c8aa6e]/10 text-[#c8aa6e] border border-[#c8aa6e]/25 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0fba81] mr-1.5 animate-pulse" />
              En vivo
            </Badge>
            <span className="hidden sm:inline text-[9px] text-[#5b5a56] ml-1">
              Update: 18 Abr 2026
            </span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      {selectedGame && (
        <nav className="sticky top-[57px] z-30 border-b border-[#785a28]/15" style={{ backgroundColor: 'rgba(10, 14, 26, 0.9)', backdropFilter: 'blur(16px)' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
              {TAB_ITEMS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                      ${isActive
                        ? 'bg-[#c8aa6e]/12 text-[#c8aa6e] border border-[#c8aa6e]/25 shadow-[0_0_12px_rgba(200,170,110,0.08)]'
                        : 'text-[#5b5a56] hover:text-[#a09b8c] hover:bg-[#1e2328]/40 border border-transparent'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          {!selectedGame ? (
            <GameSelectorLanding onSelectGame={handleSelectGame} key="selector" />
          ) : selectedGame === 'wildrift' ? (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <WildRiftHeader />
              {activeTab === 'tierlist' && <TierListTab />}
              {activeTab === 'broken' && <BrokenStuffTab />}
              {activeTab === 'tasks' && <TasksTab />}
              {activeTab === 'roadmap' && <RoadmapTab />}
              {activeTab === 'combos' && <CombosTab />}
              {activeTab === 'profile' && <ProfileTab />}
            </motion.div>
          ) : (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {activeTab === 'tierlist' && <TierListTab />}
              {activeTab === 'patches' && <PatchesTab />}
              {activeTab === 'broken' && <BrokenStuffTab />}
              {activeTab === 'tasks' && <TasksTab />}
              {activeTab === 'roadmap' && <RoadmapTab />}
              {activeTab === 'combos' && <CombosTab />}
              {activeTab === 'competitive' && <CompetitiveTab />}
              {activeTab === 'profile' && <ProfileTab />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="lol-divider" />

      {/* Footer */}
      <footer className="border-t border-[#785a28]/15 py-4 mt-auto" style={{ backgroundColor: 'rgba(10, 14, 26, 0.6)' }}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-xs text-[#785a28]">
          <span>MOBA SAGE © 2026</span>
          <span className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            Powered by IA
          </span>
        </div>
      </footer>
    </div>
  );
}
