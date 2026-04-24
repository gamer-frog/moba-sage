'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';
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

// Tabs
import { TierListTab } from '@/components/moba/tabs/tier-list-tab';
import { PatchesTab } from '@/components/moba/tabs/patches-tab';
import { BrokenStuffTab } from '@/components/moba/tabs/broken-stuff-tab';
import { TasksTab } from '@/components/moba/tabs/tasks-tab';
import { IdeasTab } from '@/components/moba/tabs/ideas-tab';
import { CombosTab } from '@/components/moba/tabs/combos-tab';
import { CompetitiveTab } from '@/components/moba/tabs/competitive-tab';
import { ProfileTab } from '@/components/moba/tabs/profile-tab';
import { ActivityTab } from '@/components/moba/tabs/activity-tab';
import { GuidesTab } from '@/components/moba/tabs/guides-tab';
import { CoachingTab } from '@/components/moba/tabs/coaching-tab';
import { ActivityPopup } from '@/components/moba/activity-popup';

// ============ TAB CONTENT RENDERER ============
function TabContent({
  activeTab, selectedGame, champions, loading, patches, insights, tasks, combos, proPicks,
  searchQuery, onSearchChange, roleFilter, onRoleFilterChange, favorites, onToggleFavorite,
  onChampionClick, summonerName, onSummonerNameChange, summonerRegion, onSummonerRegionChange,
  summonerData, summonerLoading, summonerError, onSearchSummoner, liveVersions, fetchData,
  proRegionFilter, onProRegionFilterChange, handleToggleTask,
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
}) {
  const renderTab = () => {
    switch (activeTab) {
      case 'tierlist': return <TierListTab champions={champions} loading={loading} selectedGame={selectedGame} searchQuery={searchQuery} onSearchChange={onSearchChange} roleFilter={roleFilter} onRoleFilterChange={onRoleFilterChange} favorites={favorites} onToggleFavorite={onToggleFavorite} onChampionClick={onChampionClick} metaLastUpdated={liveVersions.metaLastUpdated} />;
      case 'patches': return <PatchesTab patches={patches} loading={loading} selectedGame={selectedGame} />;
      case 'broken': return <BrokenStuffTab champions={champions} insights={insights} loading={loading} selectedGame={selectedGame} />;
      case 'combos': return <CombosTab combos={combos} loading={loading} selectedGame={selectedGame} />;
      case 'competitive': return <CompetitiveTab proPicks={proPicks} loading={loading} selectedGame={selectedGame} proRegionFilter={proRegionFilter} onProRegionFilterChange={onProRegionFilterChange} />;
      case 'guides': return <GuidesTab />;
      case 'coaching': return <CoachingTab selectedGame={selectedGame || ''} />;
      case 'profile': return <ProfileTab summonerName={summonerName} onSummonerNameChange={onSummonerNameChange} summonerRegion={summonerRegion} onSummonerRegionChange={onSummonerRegionChange} summonerData={summonerData} summonerLoading={summonerLoading} summonerError={summonerError} onSearchSummoner={onSearchSummoner} />;
      case 'novedades': return <ActivityTab />;
      case 'ideas': return <IdeasTab />;
      case 'tasks': return <TasksTab tasks={tasks} loading={loading} onRefresh={fetchData} onToggleTask={handleToggleTask} />;
      default: return <TierListTab champions={champions} loading={loading} selectedGame={selectedGame} searchQuery={searchQuery} onSearchChange={onSearchChange} roleFilter={roleFilter} onRoleFilterChange={onRoleFilterChange} favorites={favorites} onToggleFavorite={onToggleFavorite} onChampionClick={onChampionClick} metaLastUpdated={liveVersions.metaLastUpdated} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
        {selectedGame === 'wildrift' && <WildRiftHeader version={liveVersions.wr} />}
        {renderTab()}
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

  // ============ GAME SELECTION ============

  // ============ FETCH DATA ============
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [champsRes, patchesRes, insightsRes, tasksRes, proRes, combosRes, versionRes] = await Promise.all([
        fetch('/api/champions'),
        fetch('/api/patches'),
        fetch('/api/insights'),
        fetch('/api/tasks'),
        fetch('/api/pro-picks'),
        fetch('/api/combos'),
        fetch('/api/version'),
      ]);
      const [champsData, patchesData, insightsData, tasksData, proData, combosData, versionData] = await Promise.all([
        champsRes.json(),
        patchesRes.json(),
        insightsRes.json(),
        tasksRes.json(),
        proRes.json(),
        combosRes.json(),
        versionRes.json(),
      ]);
      setChampions(champsData);
      setPatches(patchesData);
      setInsights(insightsData);
      setTasks(tasksData);
      setProPicks(proData);
      setCombos(combosData);
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
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Listen for notification bell tab switch
  useEffect(() => {
    function handleTabSwitch(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === 'string') setActiveTab(detail);
    }
    window.addEventListener('moba-sage-switch-tab', handleTabSwitch);
    return () => window.removeEventListener('moba-sage-switch-tab', handleTabSwitch);
  }, []);

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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0e1a' }}>
      {/* Loading Screen (initial only) */}
      <AnimatePresence>
        {!initialLoadDone && <LoadingScreen />}
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
      {selectedGame && <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} gamePatch={selectedGame === 'wildrift' ? liveVersions.wr : liveVersions.gamePatch} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      {/* Content — offset for sidebar on desktop, bottom nav on mobile */}
      <main className={`flex-1 w-full px-4 py-6 transition-all duration-300 ${selectedGame ? 'lg:ml-[220px] pb-24 lg:pb-6' : ''}`}>
        <div className={selectedGame ? 'max-w-5xl mx-auto' : ''}>
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
              />
            )}
          </AnimatePresence>
        </div>
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
      {selectedGame && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onOpenSidebar={() => setSidebarOpen(true)} />}

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
    </div>
  );
}
