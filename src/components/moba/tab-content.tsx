'use client';

import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { WildRiftHeader } from '@/components/moba/wr-banner';
import { useGameDataContext } from '@/hooks/game-data-context';

// Core tabs loaded eagerly
import { TierListTab } from '@/components/moba/tabs/tier-list-tab';
import { PatchesMetaTab } from '@/components/moba/tabs/patches-meta-tab';
import { CoachingTab } from '@/components/moba/tabs/coaching-tab';
import { ProfileTab } from '@/components/moba/tabs/profile-tab';

// Lazy-loaded tabs (code splitting for less-visited pages)
function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-40 rounded-lg bg-lol-card" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(30,35,40,0.4)', border: '1px solid rgba(120,90,40,0.1)' }}>
            <div className="h-5 w-32 rounded bg-lol-card" />
            <div className="h-4 w-full rounded bg-lol-card" />
            <div className="h-4 w-3/4 rounded bg-lol-card" />
          </div>
        ))}
      </div>
    </div>
  );
}

const CombosTab = dynamic(() => import('@/components/moba/tabs/combos-tab').then(m => ({ default: m.CombosTab })), { loading: () => <TabSkeleton /> });
const ComparisonTab = dynamic(() => import('@/components/moba/tabs/comparison-tab').then(m => ({ default: m.ComparisonTab })), { loading: () => <TabSkeleton /> });
const CompetitiveTab = dynamic(() => import('@/components/moba/tabs/competitive-tab').then(m => ({ default: m.CompetitiveTab })), { loading: () => <TabSkeleton /> });
const GuidesTab = dynamic(() => import('@/components/moba/tabs/guides-tab').then(m => ({ default: m.GuidesTab })), { loading: () => <TabSkeleton /> });
const TasksTab = dynamic(() => import('@/components/moba/tabs/tasks-tab').then(m => ({ default: m.TasksTab })), { loading: () => <TabSkeleton /> });
const IdeasTab = dynamic(() => import('@/components/moba/tabs/ideas-tab').then(m => ({ default: m.IdeasTab })), { loading: () => <TabSkeleton /> });
const ActivityTab = dynamic(() => import('@/components/moba/tabs/activity-tab').then(m => ({ default: m.ActivityTab })), { loading: () => <TabSkeleton /> });

// ============ TAB CONTENT RENDERER (Context-driven) ============
export function TabContent() {
  const ctx = useGameDataContext();

  const renderTab = () => {
    switch (ctx.activeTab) {
      case 'tierlist': return (
        <TierListTab
          champions={ctx.champions} loading={ctx.loading} selectedGame={ctx.selectedGame}
          searchQuery={ctx.searchQuery} onSearchChange={ctx.onSearchChange}
          roleFilter={ctx.roleFilter} onRoleFilterChange={ctx.onRoleFilterChange}
          favorites={ctx.favorites} onToggleFavorite={ctx.onToggleFavorite}
          onChampionClick={ctx.onChampionClick}
          metaLastUpdated={ctx.liveVersions.metaLastUpdated}
          proPicks={ctx.proPicks}
          proRegionFilter={ctx.proRegionFilter} onProRegionFilterChange={ctx.onProRegionFilterChange}
        />
      );
      case 'patches': return <PatchesMetaTab patches={ctx.patches} champions={ctx.champions} insights={ctx.insights} loading={ctx.loading} selectedGame={ctx.selectedGame} />;
      case 'combos': return <CombosTab combos={ctx.combos} loading={ctx.loading} selectedGame={ctx.selectedGame} />;
      case 'comparison': return <ComparisonTab champions={ctx.champions} selectedGame={ctx.selectedGame} />;
      case 'coaching': return <CoachingTab selectedGame={ctx.selectedGame || ''} />;
      case 'competitive': return <CompetitiveTab proPicks={ctx.proPicks} loading={ctx.loading} selectedGame={ctx.selectedGame} proRegionFilter={ctx.proRegionFilter} onProRegionFilterChange={ctx.onProRegionFilterChange} />;
      case 'guides': return <GuidesTab />;
      case 'profile': return <ProfileTab summonerName={ctx.summonerName} onSummonerNameChange={ctx.onSummonerNameChange} summonerRegion={ctx.summonerRegion} onSummonerRegionChange={ctx.onSummonerRegionChange} summonerData={ctx.summonerData} summonerLoading={ctx.summonerLoading} summonerError={ctx.summonerError} onSearchSummoner={ctx.onSearchSummoner} />;
      case 'novedades': return <ActivityTab />;
      case 'ideas': return <IdeasTab />;
      case 'tasks': return <TasksTab tasks={ctx.tasks} loading={ctx.loading} onRefresh={ctx.fetchData} onToggleTask={ctx.handleToggleTask} />;
      case 'roadmap': return <IdeasTab initialSubTab="roadmap" />;
      default: return (
        <TierListTab
          champions={ctx.champions} loading={ctx.loading} selectedGame={ctx.selectedGame}
          searchQuery={ctx.searchQuery} onSearchChange={ctx.onSearchChange}
          roleFilter={ctx.roleFilter} onRoleFilterChange={ctx.onRoleFilterChange}
          favorites={ctx.favorites} onToggleFavorite={ctx.onToggleFavorite}
          onChampionClick={ctx.onChampionClick}
          metaLastUpdated={ctx.liveVersions.metaLastUpdated}
          proPicks={ctx.proPicks}
          proRegionFilter={ctx.proRegionFilter} onProRegionFilterChange={ctx.onProRegionFilterChange}
        />
      );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div key={ctx.activeTab} id={`tabpanel-${ctx.activeTab}`} role="tabpanel" aria-label={ctx.activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
        {ctx.selectedGame === 'wildrift' && <WildRiftHeader version={ctx.liveVersions.wr} />}
        {ctx.fetchError && !ctx.loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-12 text-center max-w-md mx-auto"
            style={{ border: '1px solid rgba(232,64,87,0.2)' }}
          >
            <WifiOff className="w-12 h-12 mx-auto mb-4 text-lol-danger/60" />
            <h3 className="lol-title text-lg text-lol-text mb-2">Error al cargar datos</h3>
            <p className="text-sm text-lol-muted mb-6">No se pudo conectar con el servidor. Verifica tu conexion e intenta de nuevo.</p>
            <motion.button
              onClick={ctx.onRetryFetch}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer bg-lol-gold text-lol-bg"
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
