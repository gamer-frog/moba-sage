'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, ArrowUp } from 'lucide-react';
import { ChampionIcon } from '@/components/moba/champion-icon';
import { RoleBadge } from '@/components/moba/badges';
import type { Champion, GameSelection, TaskItem } from '@/components/moba/types';

// Hooks
import { useGameData } from '@/hooks/use-game-data';
import { useFavorites } from '@/hooks/use-favorites';
import { useGlobalSearch } from '@/hooks/use-global-search';
import { useScrollToTop } from '@/hooks/use-scroll-to-top';
import { useSummonerSearch } from '@/hooks/use-summoner-search';
import { GameDataContext } from '@/hooks/game-data-context';

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
  // ---- Game & navigation state ----
  const [selectedGame, setSelectedGame] = useState<GameSelection>(null);
  const [activeTab, setActiveTab] = useState('tierlist');

  // ---- Data fetching (hook) ----
  const {
    champions, patches, insights, tasks, proPicks, combos,
    loading, fetchError, liveVersions, lastUpdate, isNewPatch, isRefreshing,
    fetchData, handleRefresh, setTasks, setIsNewPatch,
  } = useGameData();

  // ---- Loading screen ----
  const [showLoading, setShowLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // Safety fallback: auto-dismiss loading after 10s
  useEffect(() => {
    if (!showLoading) return;
    const timer = setTimeout(() => {
      setAppReady(true);
      setShowLoading(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [showLoading]);

  const handleSkipLoading = useCallback(() => {
    setAppReady(true);
    setShowLoading(false);
  }, []);

  // Mark app ready when initial fetch completes
  useEffect(() => {
    if (!loading) {
      setAppReady(true);
    }
  }, [loading]);

  // ---- Search & filter state ----
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [proRegionFilter, setProRegionFilter] = useState('');

  // ---- Champion modal ----
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);

  // ---- Favorites (hook) ----
  const { favorites, toggleFavorite } = useFavorites();

  // ---- Summoner search (hook) ----
  const {
    summonerName, setSummonerName,
    summonerRegion, setSummonerRegion,
    summonerData, summonerLoading, summonerError,
    handleSearchSummoner,
  } = useSummonerSearch();

  // ---- Global search (hook) ----
  const {
    globalSearchOpen, setGlobalSearchOpen,
    globalSearchQuery, setGlobalSearchQuery,
    globalSearchRef, searchResults,
  } = useGlobalSearch(selectedGame, champions);

  // ---- Scroll to top (hook) ----
  const { showBackToTop, scrollToTop } = useScrollToTop();

  // ---- Game transition flash ----
  const [flashColor, setFlashColor] = useState<string | null>(null);

  // ---- Mobile sidebar drawer ----
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ---- Tab change with scroll-to-top ----
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ---- Listen for notification bell tab switch ----
  useEffect(() => {
    function handleTabSwitch(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === 'string') setActiveTab(detail);
    }
    window.addEventListener('moba-sage-switch-tab', handleTabSwitch);
    return () => window.removeEventListener('moba-sage-switch-tab', handleTabSwitch);
  }, []);

  // ---- Game selection ----
  const handleSelectGame = useCallback((game: GameSelection) => {
    setFlashColor(game === 'lol' ? 'rgba(200,170,110,0.15)' : 'rgba(10,203,230,0.15)');
    setTimeout(() => setFlashColor(null), 400);
    setSelectedGame(game);
    setActiveTab('tierlist');
  }, []);

  const handleBackToSelector = useCallback(() => setSelectedGame(null), []);

  // ---- Champion toggle (modal) ----
  const handleToggleChampion = useCallback((champion: Champion) => {
    setSelectedChampion(prev => prev?.id === champion.id ? null : champion);
  }, []);

  // ---- Search select (global command palette) ----
  const handleSearchSelect = useCallback((champ: Champion) => {
    setSelectedChampion(champ);
    setGlobalSearchOpen(false);
    setGlobalSearchQuery('');
  }, []);

  // ---- Task status toggle ----
  const handleToggleTask = useCallback(async (task: TaskItem) => {
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
  }, []);

  // ---- Build context value (memoized — prevents unnecessary re-renders in all consumers) ----
  const contextValue = useMemo(() => ({
    activeTab, selectedGame,
    champions, patches, insights, tasks, combos, proPicks,
    loading, fetchError,
    searchQuery, roleFilter, proRegionFilter,
    favorites,
    summonerName, summonerRegion, summonerData, summonerLoading, summonerError,
    liveVersions,
    onSearchChange: setSearchQuery,
    onRoleFilterChange: setRoleFilter,
    onProRegionFilterChange: setProRegionFilter,
    onToggleFavorite: toggleFavorite,
    onChampionClick: handleToggleChampion,
    onSummonerNameChange: setSummonerName,
    onSummonerRegionChange: setSummonerRegion,
    onSearchSummoner: handleSearchSummoner,
    fetchData,
    handleToggleTask,
    onRetryFetch: () => { fetchError && fetchData(); },
  }), [
    activeTab, selectedGame, champions, patches, insights, tasks, combos, proPicks,
    loading, fetchError, searchQuery, roleFilter, proRegionFilter, favorites,
    summonerName, summonerRegion, summonerData, summonerLoading, summonerError,
    liveVersions, toggleFavorite, handleToggleChampion, handleSearchSummoner, fetchData, handleToggleTask,
  ]);

  // ============ RENDER ============
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-lol-bg" style={{ width: '100%' }}>
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold bg-gradient-to-br from-lol-gold to-lol-gold-dark text-lol-bg"
      >
        Ir al contenido principal
      </a>

      {/* Loading Screen — z-210, self-contained, timeline + "Entrar" button */}
      <AnimatePresence>
        {showLoading && (
          <LoadingScreen
            onSkip={handleSkipLoading}
            dataReady={!loading}
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
              role="dialog"
              aria-modal="true"
              aria-label="Buscar campeón"
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
                  placeholder="Buscar campeon..."
                  className="flex-1 bg-transparent text-lol-text text-lg placeholder:text-lol-dim outline-none lol-title"
                  style={{ fontFamily: 'inherit', letterSpacing: '0.05em' }}
                  role="searchbox"
                  aria-label="Buscar campeón"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] text-lol-dim bg-lol-gold-dark/10 border border-lol-gold-dark/20">
                  <span className="text-[10px]">&#8984;</span>K
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto scrollbar-none" role="listbox" aria-label="Resultados de búsqueda">
                {searchResults.length === 0 && globalSearchQuery.trim().length > 0 ? (
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
                      role="option"
                      aria-selected={false}
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
                <span aria-live="polite">{searchResults.length} campeones disponibles</span>
                <span>Enter para seleccionar · Esc para cerrar</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Popup — only after loading screen is fully gone */}
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
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
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
              <GameDataContext.Provider value={contextValue}>
                <TabContent />
              </GameDataContext.Provider>
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
          <span>MOBA SAGE &copy; 2026</span>
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
