'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, ArrowUp } from 'lucide-react';
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
import { ChampionModal } from '@/components/moba/champion-modal';
import { LoadingScreen } from '@/components/moba/loading-screen';
import { MinimapDecoration } from '@/components/moba/minimap-decoration';
import { ActivityPopup } from '@/components/moba/activity-popup';
import { FloatingNotes } from '@/components/moba/floating-notes';
import { TabContent } from '@/components/moba/tab-content';

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
  const [, setInitialLoadDone] = useState(false);

  // Loading screen: shows for ~12s animation, then user clicks "Entrar"
  const [showLoading, setShowLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // Safety fallback: auto-dismiss loading after 10s (in case user never clicks)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showLoading) {
        setInitialLoadDone(true);
        setAppReady(true);
        setShowLoading(false);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // User clicks "Entrar" — dismiss loading screen
  const handleSkipLoading = useCallback(() => {
    setInitialLoadDone(true);
    setAppReady(true);
    setShowLoading(false);
  }, []);
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

  // Favorites (localStorage) — initialize empty to avoid hydration mismatch
  const [favorites, setFavorites] = useState<Set<number>>(new Set<number>());
  const [favoritesHydrated, setFavoritesHydrated] = useState(false);

  // Hydrate favorites from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('moba-sage-favorites');
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    } catch { /* ignore */ }
    setFavoritesHydrated(true);
  }, []);

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
        if (prevPatch && prevPatch !== currentPatch) setIsNewPatch(true);
        localStorage.setItem('moba-sage-last-patch', currentPatch);
      }
      if (versionData?.fetchedAt) {
        const d = new Date(versionData.fetchedAt);
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        setLastUpdate(`${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`);
      }

      if (!champsData && !patchesData && !insightsData && !tasksData && !proData && !combosData && !versionData) {
        setFetchError(true);
      }
    } catch (err) {
      console.error('Unexpected error in fetchData:', err);
      setFetchError(true);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
      setAppReady(true);
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

  // Filter champions by search query (memoized)
  const searchResults = useMemo(() => {
    return globalSearchQuery.trim().length > 0
      ? champions.filter(c => c.name.toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 8)
      : champions.slice(0, 8);
  }, [globalSearchQuery, champions]);

  function handleSearchSelect(champ: typeof champions[0]) {
    setSelectedChampion(champ);
    setGlobalSearchOpen(false);
    setGlobalSearchQuery('');
  }

  // Persist favorites (only after hydration to avoid overwriting on mount)
  useEffect(() => {
    if (favoritesHydrated) {
      localStorage.setItem('moba-sage-favorites', JSON.stringify([...favorites]));
    }
  }, [favorites, favoritesHydrated]);

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
        try {
          const errData = await res.json();
          setSummonerError(errData.error || 'Error al buscar invocador');
        } catch {
          setSummonerError(`Error ${res.status}: No se pudo buscar el invocador`);
        }
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
    const nextStatus = task.status === 'pending' ? 'running' : task.status === 'running' ? 'done' : 'pending';
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: nextStatus }),
      });
      if (!res.ok) {
        console.error('Task update failed:', res.status);
        return;
      }
      const updated = await res.json();
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: updated.status } : t));
    } catch (err) {
      console.error('Task update error:', err);
    }
  };

  // ============ RENDER ============
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-lol-bg" style={{ width: '100%' }}>
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        className="bg-gradient-to-br from-lol-gold to-lol-gold-dark text-lol-bg"
      >
        Ir al contenido principal
      </a>

      {/* Loading Screen — z-210, self-contained, 12s timeline + "Entrar" button */}
      <AnimatePresence>
        {showLoading && (
          <LoadingScreen
            onSkip={handleSkipLoading}
            dataStats={{
              champions: champions.length,
              insights: insights.length,
              proPicks: proPicks.length,
              combos: combos.length,
              patches: patches.length,
            }}
          />
        )}
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
                <Search className="w-5 h-5 text-lol-gold shrink-0" />
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
                  className="flex-1 bg-transparent text-lol-text text-lg placeholder:text-lol-dim outline-none lol-title"
                  style={{ fontFamily: 'inherit', letterSpacing: '0.05em' }}
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] text-lol-dim bg-lol-gold-dark/10 border border-lol-gold-dark/20">
                  <span className="text-[10px]">⌘</span>K
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto scrollbar-none">
                {searchResults.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <Search className="w-8 h-8 mx-auto mb-2 text-lol-gold-dark/30" />
                    <p className="text-xs text-lol-dim">No se encontraron campeones</p>
                  </div>
                ) : (
                  searchResults.map(champ => (
                    <motion.button
                      key={champ.id}
                      onClick={() => handleSearchSelect(champ)}
                      className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-lol-card/60 transition-colors cursor-pointer"
                      whileTap={{ scale: 0.98 }}
                    >
                      <ChampionIcon name={champ.name} tier={champ.tier} />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-semibold text-lol-text truncate">{champ.name}</p>
                        <p className="text-[10px] text-lol-dim truncate">{champ.title}</p>
                      </div>
                      <RoleBadge role={champ.role} />
                      <span className={`text-[10px] font-mono font-semibold ${champ.winRate >= 52 ? 'text-lol-green' : 'text-lol-muted'}`}>{champ.winRate}%</span>
                    </motion.button>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className="px-5 py-2.5 flex items-center justify-between text-[10px] text-lol-dim border-t border-lol-gold-dark/10">
                <span>{champions.length} campeones disponibles</span>
                <span>Enter para seleccionar · Esc para cerrar</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Popup — only after loading screen is fully gone + 2s delay */}
      {appReady && <ActivityPopup />}

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
              <GameSelectorLanding onSelectGame={handleSelectGame} patchVersion={liveVersions.gamePatch || liveVersions.lol} championCount={champions.length} key="selector" />
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
        {selectedChampion && !showLoading && (
          <ChampionModal key={selectedChampion.id} champion={selectedChampion} onClose={() => setSelectedChampion(null)} />
        )}
      </AnimatePresence>

      {/* Minimap Decoration - only on landing page */}
      {!selectedGame && <MinimapDecoration />}

      {/* Bottom Navigation — mobile only */}
      {selectedGame && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} onOpenSidebar={() => setSidebarOpen(true)} />}

      <div className="lol-divider" />

      {/* Footer — hidden on mobile (sidebar covers it) */}
      <footer className={`border-t border-lol-gold-dark/15 py-4 mt-auto bg-lol-bg/60 ${selectedGame ? 'hidden lg:block' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-xs text-lol-gold-dark">
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
            <ArrowUp className="w-5 h-5 text-lol-bg" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

