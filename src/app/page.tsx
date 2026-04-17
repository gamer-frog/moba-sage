'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Sword, ScrollText, AlertTriangle, ListTodo,
  Brain, ChevronRight, Zap, Shield, Target, Crosshair,
  RefreshCw, Clock, CheckCircle2, Circle, Loader2, TrendingUp,
  ArrowUpCircle, ArrowDownCircle, Users, Sparkles, Trophy
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============ TYPES ============
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

interface AiReasoning {
  reasoning: string;
  confidence: number;
  factors: string[];
  relatedChampions: string[];
}

// ============ CONSTANTS ============
const TIERS = ['S', 'A'] as const;

const TIER_CONFIG: Record<string, { color: string; label: string }> = {
  S: {
    color: '#c8aa6e',
    label: 'Dioses del Meta',
  },
  A: {
    color: '#0acbe6',
    label: 'Fuertes',
  },
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

// ============ CHAMPION IMAGE URL HELPER ============
const CHAMPION_NAME_MAP: Record<string, string> = {
  'Wukong': 'MonkeyKing',
  'Nunu': 'Nunu',
  'Fiddlesticks': 'FiddleSticks',
  "Bel'Veth": 'Belveth',
  "K'Sante": 'KSante',
  "Renata Glasc": 'Renata',
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

// ============ TAB ICONS ============
const TAB_ITEMS = [
  { id: 'tierlist', label: 'Tier List', icon: Trophy },
  { id: 'patches', label: 'Parches', icon: ScrollText },
  { id: 'broken', label: 'Cosas Rotas', icon: AlertTriangle },
  { id: 'tasks', label: 'Tareas', icon: ListTodo },
];

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

// ============ CHAMPION ROW ============
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
      {/* Champion Icon */}
      <ChampionIcon name={champion.name} tier={champion.tier} />

      {/* Name + Title */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[13px] text-[#f0e6d2] truncate group-hover:text-[#c8aa6e] transition-colors leading-tight">
          {champion.name}
        </h3>
        <p className="text-[10px] text-[#5b5a56] truncate leading-tight mt-0.5">{champion.title}</p>
      </div>

      {/* Role Badge */}
      <RoleBadge role={champion.role} />

      {/* Stats - inline */}
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

      {/* Expand */}
      <ChevronRight className="w-4 h-4 text-[#785a28] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

// ============ TIER SECTION ============
function TierSection({ tier, champions, onChampionClick }: { tier: string; champions: Champion[]; onChampionClick: (c: Champion) => void }) {
  const cfg = TIER_CONFIG[tier];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-4">
      {/* Tier Header Bar */}
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

      {/* Stats sub-header — desktop only */}
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

      {/* Champion Rows */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 p-1 rounded-b-xl"
        style={{
          background: 'rgba(20, 24, 30, 0.5)',
          border: '1px solid rgba(120, 90, 40, 0.12)',
          borderTop: 'none',
        }}
      >
        {champions.map(champ => (
          <ChampionRow key={champ.id} champion={champ} onClick={() => onChampionClick(champ)} />
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

// ============ MAIN APP ============
export default function Home() {
  const [activeTab, setActiveTab] = useState('tierlist');
  const [champions, setChampions] = useState<Champion[]>([]);
  const [patches, setPatches] = useState<PatchNote[]>([]);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');

  // AI Reasoning state
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiReasoning, setAiReasoning] = useState<AiReasoning | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // ============ FETCH DATA ============
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [champsRes, patchesRes, insightsRes, tasksRes] = await Promise.all([
        fetch('/api/champions'),
        fetch('/api/patches'),
        fetch('/api/insights'),
        fetch('/api/tasks'),
      ]);
      const [champsData, patchesData, insightsData, tasksData] = await Promise.all([
        champsRes.json(),
        patchesRes.json(),
        insightsRes.json(),
        tasksRes.json(),
      ]);
      setChampions(champsData);
      setPatches(patchesData);
      setInsights(insightsData);
      setTasks(tasksData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ============ FILTER CHAMPIONS ============
  const filteredChampions = champions.filter(c => {
    if (roleFilter !== 'Todos' && c.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
    }
    return true;
  });

  // Group by tier (only S and A)
  const groupedChampions: Record<string, Champion[]> = {};
  TIERS.forEach(tier => {
    const tierChamps = filteredChampions.filter(c => c.tier === tier);
    if (tierChamps.length > 0) groupedChampions[tier] = tierChamps;
  });

  // ============ AI REASONING HANDLER ============
  const handleOpenAi = (champion: Champion) => {
    setSelectedChampion(champion);
    setAiQuestion(`¿Por qué ${champion.name} es Tier ${champion.tier}? Analiza su estado actual en el meta.`);
    setAiReasoning(null);
    setAiDialogOpen(true);
  };

  const handleAskAi = async () => {
    if (!aiQuestion.trim() || !selectedChampion) return;
    setAiLoading(true);
    setAiReasoning(null);
    try {
      const res = await fetch('/api/ai-reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: aiQuestion,
          champion: selectedChampion.name,
          role: selectedChampion.role,
          patch: selectedChampion.patch,
        }),
      });
      const data = await res.json();
      setAiReasoning(data);
    } catch (err) {
      console.error('AI reasoning error:', err);
    } finally {
      setAiLoading(false);
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
        {/* Search & Filter */}
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

        {/* Tier Groups */}
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
              onChampionClick={handleOpenAi}
            />
          ))
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
            <motion.div
              key={patch.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-xl p-5 border border-[#785a28]/25"
            >
              <div className="flex items-start gap-3 mb-4">
                <Badge className="bg-[#c8aa6e] text-[#0a0e1a] font-bold text-sm px-3 py-1 shrink-0">
                  {patch.version}
                </Badge>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[#f0e6d2]">{patch.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#5b5a56] mt-1 flex-wrap">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(patch.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <Badge variant="outline" className="text-[10px] border-[#785a28]/40 text-[#5b5a56]">
                      {patch.sourceGame}
                    </Badge>
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

  // ============ BROKEN STUFF TAB ============
  function BrokenStuffTab() {
    const metaInsights = insights.filter(i => i.category === 'meta' || i.category === 'buff');

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#e84057]" />
          <div>
            <h2 className="text-lg font-bold text-[#f0e6d2]">Cosas Rotas & Combos OP</h2>
            <p className="text-xs text-[#5b5a56]">Campeones y combinaciones que están dominando el meta</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#5b5a56]">
          <Zap className="w-4 h-4 text-[#f0c646]" />
          <span className="text-sm">{metaInsights.length} insight(s) de meta/buff</span>
        </div>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-5 space-y-3">
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

        {/* Stats */}
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

        {/* Task List */}
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

  // ============ AI DIALOG ============
  function AiDialog() {
    return (
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col bg-[#1e2328] border-[#785a28]/40 rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#c8aa6e]" />
              <span className="text-[#f0e6d2]">
                {selectedChampion ? `Análisis de ${selectedChampion.name}` : 'Análisis con IA'}
              </span>
            </DialogTitle>
            <DialogDescription className="text-[#5b5a56]">
              {selectedChampion ? (
                <span className="flex items-center gap-2 flex-wrap">
                  <RoleBadge role={selectedChampion.role} />
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ color: TIER_CONFIG[selectedChampion.tier]?.color, borderColor: `${TIER_CONFIG[selectedChampion.tier]?.color}40` }}
                  >
                    Tier {selectedChampion.tier}
                  </Badge>
                  <span className="text-xs">Patch {selectedChampion.patch}</span>
                  <span className="text-xs text-[#0acbe6]">WR {selectedChampion.winRate}%</span>
                </span>
              ) : ''}
            </DialogDescription>
          </DialogHeader>

          {/* Question Input */}
          <div className="flex gap-2">
            <Input
              value={aiQuestion}
              onChange={e => setAiQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAskAi()}
              placeholder="Pregunta sobre el meta..."
              className="bg-[#0a0e1a]/60 border-[#785a28]/30 text-[#f0e6d2] placeholder:text-[#5b5a56] focus-visible:border-[#c8aa6e] focus-visible:ring-[#c8aa6e]/20"
              disabled={aiLoading}
            />
            <Button
              onClick={handleAskAi}
              disabled={aiLoading || !aiQuestion.trim()}
              className="bg-[#c8aa6e] text-[#0a0e1a] hover:bg-[#c8aa6e]/90 shrink-0 rounded-lg"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            </Button>
          </div>

          {/* AI Response */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            {aiLoading && (
              <div className="space-y-3 py-4">
                <div className="flex items-center gap-2 text-[#c8aa6e]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analizando con IA...</span>
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            )}

            {aiReasoning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 py-2"
              >
                {/* Reasoning */}
                <div className="rounded-lg p-4 bg-[#0a0e1a]/60 border border-[#785a28]/15">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#c8aa6e]" />
                    <h4 className="text-xs font-semibold text-[#c8aa6e] uppercase tracking-wider">Análisis</h4>
                  </div>
                  <p className="text-sm text-[#f0e6d2] leading-relaxed whitespace-pre-wrap">{aiReasoning.reasoning}</p>
                </div>

                {/* Confidence */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#5b5a56] shrink-0">Confianza</span>
                  <Progress value={aiReasoning.confidence * 100} className="h-2 flex-1" />
                  <span className="text-xs font-mono text-[#c8aa6e] shrink-0">
                    {(aiReasoning.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Factors */}
                {aiReasoning.factors.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-[#5b5a56] uppercase tracking-wider mb-2">Factores Clave</h4>
                    <div className="space-y-1.5">
                      {aiReasoning.factors.map((factor, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#a09b8c]">
                          <ChevronRight className="w-3 h-3 text-[#c8aa6e] shrink-0 mt-0.5" />
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Champions */}
                {aiReasoning.relatedChampions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-[#5b5a56] uppercase tracking-wider mb-2">Campeones Relacionados</h4>
                    <div className="flex flex-wrap gap-2">
                      {aiReasoning.relatedChampions.map(name => {
                        const champ = champions.find(c => c.name === name);
                        return (
                          <Badge
                            key={name}
                            variant="outline"
                            className="border-[#785a28]/40 text-[#f0e6d2] hover:border-[#c8aa6e] cursor-pointer transition-colors text-xs"
                            onClick={() => {
                              if (champ) {
                                setSelectedChampion(champ);
                                setAiQuestion(`¿Por qué ${champ.name} es Tier ${champ.tier}? Analiza su estado actual en el meta.`);
                                setAiReasoning(null);
                              }
                            }}
                          >
                            {name}
                            {champ && <span className="ml-1 opacity-60">({champ.tier})</span>}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {!aiLoading && !aiReasoning && (
              <div className="text-center py-8 text-[#5b5a56]">
                <Brain className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Haz una pregunta sobre el meta</p>
                <p className="text-xs mt-1">La IA analizará datos y generará un insight</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  // ============ RENDER ============
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0e1a' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#785a28]/20" style={{ backgroundColor: 'rgba(10, 14, 26, 0.94)', backdropFilter: 'blur(20px) saturate(1.2)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c8aa6e, #9a7b4f)' }}>
              <Sword className="w-4 h-4 text-[#0a0e1a]" />
            </div>
            <div>
              <h1
                className="text-lg font-black tracking-wider leading-none"
                style={{ color: '#c8aa6e', textShadow: '0 0 20px rgba(200,170,110,0.25)' }}
              >
                MOBA SAGE
              </h1>
              <p className="text-[9px] text-[#5b5a56] tracking-[0.2em] uppercase leading-none mt-0.5">Analytics con IA</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] border-[#785a28]/30 text-[#5b5a56]">
              Patch 14.8
            </Badge>
            <Badge className="bg-[#0acbe6]/15 text-[#0acbe6] border border-[#0acbe6]/25 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0acbe6] mr-1.5 animate-pulse" />
              En vivo
            </Badge>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
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

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'tierlist' && <TierListTab />}
            {activeTab === 'patches' && <PatchesTab />}
            {activeTab === 'broken' && <BrokenStuffTab />}
            {activeTab === 'tasks' && <TasksTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#785a28]/15 py-4 mt-auto" style={{ backgroundColor: 'rgba(10, 14, 26, 0.6)' }}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-xs text-[#785a28]">
          <span>MOBA SAGE © 2024</span>
          <span className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            Powered by IA
          </span>
        </div>
      </footer>

      {/* AI Dialog */}
      <AiDialog />
    </div>
  );
}
