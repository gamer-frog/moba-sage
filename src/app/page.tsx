'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, ArrowUp, RefreshCw, WifiOff } from 'lucide-react';
import { ChampionIcon } from '@/components/moba/champion-icon';
import { RoleBadge } from '@/components/moba/badges';
import { updateDdVersion } from '@/components/moba/helpers';
import type {
  Champion, PatchNote, AiInsight, TaskItem,
  ProPick, BrokenCombo, SummonerData, GameSelection,
} from '@/components/moba/types';

// Components
import { GoldParticles } from '@/components/moba/gold-particles';
import { AppHeader } from '@/components/moba/app-header';
import { SidebarNav } from '@/components/moba/sidebar-nav';
import { BottomNav } from '@/components/moba/bottom-nav';
import { GameSelectorLanding } from '@/components/moba/game-selector';
import { WildRiftHeader } from '@/components/moba/wr-banner';
import { ChampionModal } from '@/components/moba/champion-modal';
import { LoadingScreen } from '@/components/moba/loading-screen';
import { MinimapDecoration } from '@/components/moba/minimap-decoration';
import { ActivityPopup } from '@/components/moba/activity-popup';
import { FloatingNotes } from '@/components/moba/floating-notes';

// Tabs — core tabs loaded eagerly, secondary tabs lazy loaded
import { TierListTab } from '@/components/moba/tabs/tier-list-tab';
import { PatchesTab } from '@/components/moba/tabs/patches-tab';
import { BrokenStuffTab } from '@/components/moba/tabs/broken-stuff-tab';
import { CoachingTab } from '@/components/moba/tabs/coaching-tab';
import { ProfileTab } from '@/components/moba/tabs/profile-tab';

// Lazy-loaded tabs (code splitting for less-visited pages)
const CombosTab = dynamic(() => import('@/components/moba/tabs/combos-tab').then(m => ({ default: m.CombosTab })), { loading: () => <TabSkeleton /> });
const ComparisonTab = dynamic(() => import('@/components/moba/tabs/comparison-tab').then(m => ({ default: m.ComparisonTab })), { loading: () => <TabSkeleton /> });
const CompetitiveTab = dynamic(() => import('@/components/moba/tabs/competitive-tab').then(m => ({ default: m.CompetitiveTab })), { loading: () => <TabSkeleton /> });
const GuidesTab = dynamic(() => import('@/components/moba/tabs/guides-tab').then(m => ({ default: m.GuidesTab })), { loading: () => <TabSkeleton /> });
const TasksTab = dynamic(() => import('@/components/moba/tabs/tasks-tab').then(m => ({ default: m.TasksTab })), { loading: () => <TabSkeleton /> });
const IdeasTab = dynamic(() => import('@/components/moba/tabs/ideas-tab').then(m => ({ default: m.IdeasTab })), { loading: () => <TabSkeleton /> });
const ActivityTab = dynamic(() => import('@/components/moba/tabs/activity-tab').then(m => ({ default: m.ActivityTab })), { loading: () => <TabSkeleton /> });
const RoadmapTab = dynamic(() => import('@/components/moba/tabs/roadmap-tab').then(m => ({ default: m.RoadmapTab })), { loading: () => <TabSkeleton /> });

// ============ TAB SKELETON (lazy loading placeholder) ============
function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-40 rounded-lg bg-[#1e2328]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(30,35,40,0.4)', border: '1px solid rgba(120,90,40,0.1)' }}>
            <div className="h-5 w-32 rounded bg-[#1e2328]" />
            <div className="h-4 w-full rounded bg-[#1e2328]" />
            <div className="h-4 w-3/4 rounded bg-[#1e2328]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ TAB CONTENT RENDERER ============
function TabContent({
  activeTab, selectedGame, champions, loading, patches, insights, tasks, combos, proPicks,
  searchQuery, onSearchChange, roleFilter, onRoleFilterChange, favorites, onToggleFavorite,
  onChampionClick, summonerName, onSummonerNameChange, summonerRegion, onSummonerRegionChange,
  summonerData, summonerLoading, summonerError, onSearchSummoner, liveVersions, fetchData,
  proRegionFilter, onProRegionFilterChange, handleToggleTask, fetchError, onRetryFetch,
}: {
  activeTab: string; selectedGame: GameSelection; champions: Champion[];
  loading: boolean; patches: PatchNote[]; insights: AiInsight[];
  tasks: TaskItem[]; combos: BrokenCombo[]; proPicks: ProPick[];
  searchQuery: string; onSearchChange: (q: string) => void;
  roleFilter: string; onRoleFilterChange: (r: string) => void;
  favorites: Set<number>; onToggleFavorite: (id: number) => void;
  onChampionClick: (c: Champion) => void;
  summonerName: string; onSummonerNameChange: (n: string) => void;
  summonerRegion: string; onSummonerRegionChange: (r: string) => void;
  summonerData: SummonerData | null; summonerLoading: boolean;
  summonerError: string; onSearchSummoner: () => void;
  liveVersions: { lol: string; wr: string; gamePatch: string; metaLastUpdated: string };
  fetchData: () => void;
  proRegionFilter: string; onProRegionFilterChange: (r: string) => void;
  handleToggleTask: (t: TaskItem) => void;
  fetchError: boolean; onRetryFetch: () => void;
}) {
  const renderTab = () => {
    switch (activeTab) {
      case 'tierlist': return <TierListTab champions={champions} loading={loading} selectedGame={selectedGame} searchQuery={searchQuery} onSearchChange={onSearchChange} roleFilter={roleFilter} onRoleFilterChange={onRoleFilterChange} favorites={favorites} onToggleFavorite={onToggleFavorite} onChampionClick={onChampionClick} metaLastUpdated={liveVersions.metaLastUpdated} proPicks={proPicks} proRegionFilter={proRegionFilter} onProRegionFilterChange={onProRegionFilterChange} />;
      case 'patches': return <PatchesTab patches={patches} loading={loading} selectedGame={selectedGame} />;
      case 'broken': return <BrokenStuffTab champions={champions} insights={insights} loading={loading} selectedGame={selectedGame} />;
      case 'combos': return <CombosTab combos={combos} loading={loading} selectedGame={selectedGame} />;
      case 'comparison': return <ComparisonTab champions={champions} loading={loading} selectedGame={selectedGame} onChampionClick={onChampionClick} />;
      case 'coaching': return <CoachingTab selectedGame={selectedGame || ''} />;
      case 'competitive': return <CompetitiveTab proPicks={proPicks} loading={loading} selectedGame={selectedGame} proRegionFilter={proRegionFilter} onProRegionFilterChange={onProRegionFilterChange} />;
      case 'guides': return <GuidesTab />;
      case 'profile': return <ProfileTab summonerName={summonerName} onSummonerNameChange={onSummonerNameChange} summonerRegion={summonerRegion} onSummonerRegionChange={onSummonerRegionChange} summonerData={summonerData} summonerLoading={summonerLoading} summonerError={summonerError} onSearchSummoner={onSearchSummoner} />;
      case 'novedades': return <ActivityTab />;
      case 'ideas': return <IdeasTab />;
      case 'tasks': return <TasksTab tasks={tasks} loading={loading} onRefresh={fetchData} onToggleTask={handleToggleTask} />;
      case 'roadmap': return <RoadmapTab />;
      default: return <TierListTab champions={champions} loading={loading} selectedGame={selectedGame} searchQuery={searchQuery} onSearchChange={onSearchChange} roleFilter={roleFilter} onRoleFilterChange={onRoleFilterChange} favorites={favorites} onToggleFavorite={onToggleFavorite} onChampionClick={onChampionClick} metaLastUpdated={liveVersions.metaLastUpdated} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div key={activeTab} id={`tabpanel-${activeTab}`} role="tabpanel" aria-label={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
        {selectedGame === 'wildrift' && <WildRiftHeader version={liveVersions.wr} />}
        {fetchError && !loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-12 text-center max-w-md mx-auto"
            style={{ border: '1px solid rgba(232,64,87,0.2)' }}
          >
            <WifiOff className="w-12 h-12 mx-auto mb-4 text-[#e84057]/60" />
            <h3 className="lol-title text-lg text-[#f0e6d2] mb-2">Error al cargar datos</h3>
            <p className="text-sm text-[#a09b8c] mb-6">No se pudo conectar con el servidor. Verificá tu conexión e intentá de nuevo.</p>
            <motion.button
              onClick={onRetryFetch}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #c8aa6e, #785a28)', color: '#0a0e1a', boxShadow: '0 0 20px rgba(200,170,110,0.2)' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </motion.button>
          </motion.div>
        ) : (
          renderTab()
        )}
      </motion.div>
    </AnimatePresence>
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
  const [fetchError, setFetchError] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [proRegionFilter, setProRegionFilter] = useState('');

  // Expanded champion → modal
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);

  // Summoner profile state
  const [summonerName, setSummonerName] = useState('');
  const [summonerRegion, setSummonerRegion] = useState('LAS');
  const [summonerData, setSummonerData] = useState<SummonerData | null>(null);
  const [summonerLoading, setSummonerLoading] = useState(false);
  const [summonerError, setSummonerError] = useState('');

  // Live version state
  const [liveVersions, setLiveVersions] = useState<{ lol: string; wr: string; gamePatch: string; metaLastUpdated: string }>({ lol: '', wr: '', gamePatch: '', metaLastUpdated: '' });
  const [lastUpdate, setLastUpdate] = useState('');
  const [isNewPatch, setIsNewPatch] = useState(false);

  // Favorites (localStorage)
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('moba-sage-favorites');
        return saved ? new Set(JSON.parse(saved)) : new Set<number>();
      } catch { return new Set<number>(); }
    }
    return new Set<number>();
  });

  // Game transition flash
  const [flashColor, setFlashColor] = useState<string | null>(null);

  // Mobile sidebar drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global search state
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const globalSearchRef = useRef<HTMLInputElement>(null);

  // Back to Top state
  const [showBackToTop, setShowBackToTop] = useState(false);

  // ============ FETCH DATA ============
  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(false);

    // Fetch each endpoint independently — one failure won't crash the entire app
    const safeJson = async <T,>(url: string): Promise<T | null> => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status}`);
        return await res.json() as T;
      } catch (e) {
        console.warn(`[MOBA SAGE] Failed: ${url}`, e);
        return null;
      }
    };

    try {
      const [champsData, patchesData, insightsData, tasksData, proData, combosData, versionData] = await Promise.all<Promise<unknown>>([
        safeJson('/api/champions'),
        safeJson('/api/patches'),
        safeJson('/api/insights'),
        safeJson('/api/tasks'),
        safeJson('/api/pro-picks'),
        safeJson('/api/combos'),
        safeJson('/api/version'),
      ]) as [Champion[], PatchNote[], AiInsight[], TaskItem[], ProPick[], BrokenCombo[], { lol: string; wr: string; gamePatch: string; metaLastUpdated: string; fetchedAt?: string } | null];

      // Apply results — only update state for successful fetches
      if (champsData) setChampions(champsData as Champion[]);
      if (patchesData) setPatches(patchesData as PatchNote[]);
      if (insightsData) setInsights(insightsData as AiInsight[]);
      if (tasksData) setTasks(tasksData as TaskItem[]);
      if (proData) setProPicks(proData as ProPick[]);
      if (combosData) setCombos(combosData as BrokenCombo[]);

      if (versionData?.lol) {
        const fullVer = versionData.lol;
        setLiveVersions({
          lol: fullVer.split('.').slice(0, 2).join('.'),
          wr: versionData.wr || '6.4',
          gamePatch: versionData.gamePatch || fullVer.split('.').slice(0, 2).join('.'),
          metaLastUpdated: versionData.metaLastUpdated || '',
        });
        updateDdVersion(fullVer);
        const prevPatch = localStorage.getItem('moba-sage-last-patch');
        const currentPatch = fullVer.split('.').slice(0, 2).join('.');
        if (prevPatch && prevPatch !== currentPatch) {
          setIsNewPatch(true);
        }
        localStorage.setItem('moba-sage-last-patch', currentPatch);
      }
      if (versionData?.fetchedAt) {
        const d = new Date(versionData.fetchedAt);
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        setLastUpdate(`${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`);
      }

      // Only show full error if ALL endpoints failed
      if (!champsData && !patchesData && !insightsData && !tasksData && !proData && !combosData && !versionData) {
        setFetchError(true);
      }
    } catch (err) {
      console.error('Unexpected error in fetchData:', err);
      setFetchError(true);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Scroll listener for Back to Top
  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 300);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to top when switching tabs
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen for notification bell tab switch + search button
  useEffect(() => {
    function handleTabSwitch(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === 'string') setActiveTab(detail);
    }
    function handleOpenSearch() {
      setGlobalSearchOpen(true);
      setGlobalSearchQuery('');
    }
    window.addEventListener('moba-sage-switch-tab', handleTabSwitch);
    window.addEventListener('moba-sage-open-search', handleOpenSearch);
    return () => {
      window.removeEventListener('moba-sage-switch-tab', handleTabSwitch);
      window.removeEventListener('moba-sage-open-search', handleOpenSearch);
    };
  }, []);

  // Ctrl+K / Cmd+K global search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (selectedGame) {
          setGlobalSearchOpen(prev => !prev);
          setGlobalSearchQuery('');
        }
      }
      if (e.key === 'Escape' && globalSearchOpen) {
        setGlobalSearchOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedGame, globalSearchOpen]);

  // Auto-focus search input
  useEffect(() => {
    if (globalSearchOpen && globalSearchRef.current) {
      setTimeout(() => globalSearchRef.current?.focus(), 100);
    }
  }, [globalSearchOpen]);

  // Filter champions by search query
  const searchResults = globalSearchQuery.trim().length > 0
    ? champions.filter(c => c.name.toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 8)
    : champions.slice(0, 8);

  function handleSearchSelect(champ: typeof champions[0]) {
    setSelectedChampion(champ);
    setGlobalSearchOpen(false);
    setGlobalSearchQuery('');
  }

  // Persist favorites
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('moba-sage-favorites', JSON.stringify([...favorites]));
    }
  }, [favorites]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ============ GAME SELECTION ============
  const handleSelectGame = (game: GameSelection) => {
    setFlashColor(game === 'lol' ? 'rgba(200,170,110,0.15)' : 'rgba(10,203,230,0.15)');
    setTimeout(() => setFlashColor(null), 400);
    setSelectedGame(game);
    setActiveTab('tierlist');
  };

  const handleBackToSelector = () => {
    setSelectedGame(null);
  };

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

  // ============ RENDER ============
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ backgroundColor: '#0a0e1a', width: '100%' }}>
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        style={{ background: 'linear-gradient(135deg, #c8aa6e, #785a28)', color: '#0a0e1a' }}
      >
        Ir al contenido principal
      </a>

      {/* Loading Screen (initial only) */}
      <AnimatePresence>
        {!initialLoadDone && <LoadingScreen />}
      </AnimatePresence>

      {/* Global Search Overlay (Command Palette) */}
      <AnimatePresence>
        {globalSearchOpen && selectedGame && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setGlobalSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(30,35,40,0.98), rgba(10,14,26,0.98))',
                border: '1.5px solid rgba(200,170,110,0.3)',
                boxShadow: '0 0 60px rgba(200,170,110,0.1), 0 25px 50px rgba(0,0,0,0.6)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(120,90,40,0.15)' }}>
                <Search className="w-5 h-5 text-[#c8aa6e] shrink-0" />
                <input
                  ref={globalSearchRef}
                  type="text"
                  value={globalSearchQuery}
                  onChange={e => setGlobalSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && searchResults.length > 0) {
                      handleSearchSelect(searchResults[0]);
                    }
                  }}
                  placeholder="Buscar campeón..."
                  className="flex-1 bg-transparent text-[#f0e6d2] text-lg placeholder:text-[#5b5a56] outline-none lol-title"
                  style={{ fontFamily: 'inherit', letterSpacing: '0.05em' }}
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] text-[#5b5a56]" style={{ background: 'rgba(120,90,40,0.12)', border: '1px solid rgba(120,90,40,0.2)' }}>
                  <span className="text-[8px]">⌘</span>K
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto scrollbar-none">
                {searchResults.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <Search className="w-8 h-8 mx-auto mb-2 text-[#785a28]/30" />
                    <p className="text-xs text-[#5b5a56]">No se encontraron campeones</p>
                  </div>
                ) : (
                  searchResults.map(champ => (
                    <motion.button
                      key={champ.id}
                      onClick={() => handleSearchSelect(champ)}
                      className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-[#1e2328]/60 transition-colors cursor-pointer"
                      whileTap={{ scale: 0.98 }}
                    >
                      <ChampionIcon name={champ.name} tier={champ.tier} />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-semibold text-[#f0e6d2] truncate">{champ.name}</p>
                        <p className="text-[10px] text-[#5b5a56] truncate">{champ.title}</p>
                      </div>
                      <RoleBadge role={champ.role} />
                      <span className="text-[10px] font-mono font-semibold" style={{ color: champ.winRate >= 52 ? '#0fba81' : '#a09b8c' }}>{champ.winRate}%</span>
                    </motion.button>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className="px-5 py-2.5 flex items-center justify-between text-[10px] text-[#5b5a56]" style={{ borderTop: '1px solid rgba(120,90,40,0.1)' }}>
                <span>{champions.length} campeones disponibles</span>
                <span>Enter para seleccionar · Esc para cerrar</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Popup (once per session) */}
      <ActivityPopup />

      {/* Gold Particles */}
      <GoldParticles />

      {/* Game Switch Flash Overlay */}
      <AnimatePresence>
        {flashColor && (
          <motion.div
            className="fixed inset-0 z-[100] pointer-events-none lol-flash-overlay"
            style={{ backgroundColor: flashColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <AppHeader
        selectedGame={selectedGame}
        liveVersions={liveVersions}
        lastUpdate={lastUpdate}
        isNewPatch={isNewPatch}
        onBackToSelector={handleBackToSelector}
        onDismissPatch={() => setIsNewPatch(false)}
        onMenuToggle={() => setSidebarOpen(prev => !prev)}
      />

      {/* Sidebar Navigation — desktop fixed + mobile drawer */}
      {selectedGame && <SidebarNav activeTab={activeTab} onTabChange={handleTabChange} gamePatch={selectedGame === 'wildrift' ? liveVersions.wr : liveVersions.gamePatch} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      {/* Content — offset for sidebar on desktop, bottom nav on mobile */}
      <main id="main-content" className={`flex-1 w-full px-3 sm:px-4 py-4 sm:py-6 transition-all duration-300 overflow-x-hidden ${selectedGame ? 'lg:ml-[220px] lg:w-[calc(100%-220px)] pb-24 lg:pb-6' : ''}`} role="main">
        <div className={selectedGame ? 'max-w-6xl mx-auto' : ''}>
          <AnimatePresence mode="popLayout">
            {!selectedGame ? (
              <GameSelectorLanding onSelectGame={handleSelectGame} key="selector" />
            ) : (
              <TabContent
                activeTab={activeTab}
                selectedGame={selectedGame}
                champions={champions}
                loading={loading}
                patches={patches}
                insights={insights}
                tasks={tasks}
                combos={combos}
                proPicks={proPicks}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onChampionClick={handleToggleChampion}
                summonerName={summonerName}
                onSummonerNameChange={setSummonerName}
                summonerRegion={summonerRegion}
                onSummonerRegionChange={setSummonerRegion}
                summonerData={summonerData}
                summonerLoading={summonerLoading}
                summonerError={summonerError}
                onSearchSummoner={handleSearchSummoner}
                liveVersions={liveVersions}
                fetchData={fetchData}
                proRegionFilter={proRegionFilter}
                onProRegionFilterChange={setProRegionFilter}
                handleToggleTask={handleToggleTask}
                fetchError={fetchError}
                onRetryFetch={() => { setFetchError(false); fetchData(); }}
              />
            )}
          </AnimatePresence>
        </div>
            {selectedGame && <FloatingNotes />}
    </main>

      {/* Champion Modal */}
      <AnimatePresence>
        {selectedChampion && (
          <ChampionModal key={selectedChampion.id} champion={selectedChampion} onClose={() => setSelectedChampion(null)} />
        )}
      </AnimatePresence>

      {/* Minimap Decoration - only on landing page */}
      {!selectedGame && <MinimapDecoration />}

      {/* Bottom Navigation — mobile only */}
      {selectedGame && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} onOpenSidebar={() => setSidebarOpen(true)} />}

      <div className="lol-divider" />

      {/* Footer — hidden on mobile (sidebar covers it) */}
      <footer className={`border-t border-[#785a28]/15 py-4 mt-auto ${selectedGame ? 'hidden lg:block' : ''}`} style={{ backgroundColor: 'rgba(10, 14, 26, 0.6)' }}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-xs text-[#785a28]">
          <span>MOBA SAGE © 2026</span>
          <span className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            Powered by IA
          </span>
        </div>
      </footer>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={scrollToTop}
            className="fixed bottom-[140px] lg:bottom-8 right-4 w-10 h-10 rounded-full flex items-center justify-center z-30 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #c8aa6e, #785a28)',
              boxShadow: '0 0 20px rgba(200,170,110,0.3), 0 4px 12px rgba(0,0,0,0.4)',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Volver arriba"
          >
            <ArrowUp className="w-5 h-5 text-[#0a0e1a]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

