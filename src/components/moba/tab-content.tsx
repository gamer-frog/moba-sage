'use client';

import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { WildRiftHeader } from '@/components/moba/wr-banner';
import type {
  Champion, PatchNote, AiInsight, TaskItem,
  ProPick, BrokenCombo, SummonerData, GameSelection,
} from '@/components/moba/types';

// Core tabs loaded eagerly
import { TierListTab } from '@/components/moba/tabs/tier-list-tab';
import { PatchesMetaTab } from '@/components/moba/tabs/patches-meta-tab';
import { CoachingTab } from '@/components/moba/tabs/coaching-tab';
import { ProfileTab } from '@/components/moba/tabs/profile-tab';

// Lazy-loaded tabs (code splitting for less-visited pages)
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

const CombosTab = dynamic(() => import('@/components/moba/tabs/combos-tab').then(m => ({ default: m.CombosTab })), { loading: () => <TabSkeleton /> });
const ComparisonTab = dynamic(() => import('@/components/moba/tabs/comparison-tab').then(m => ({ default: m.ComparisonTab })), { loading: () => <TabSkeleton /> });
const CompetitiveTab = dynamic(() => import('@/components/moba/tabs/competitive-tab').then(m => ({ default: m.CompetitiveTab })), { loading: () => <TabSkeleton /> });
const GuidesTab = dynamic(() => import('@/components/moba/tabs/guides-tab').then(m => ({ default: m.GuidesTab })), { loading: () => <TabSkeleton /> });
const TasksTab = dynamic(() => import('@/components/moba/tabs/tasks-tab').then(m => ({ default: m.TasksTab })), { loading: () => <TabSkeleton /> });
const IdeasTab = dynamic(() => import('@/components/moba/tabs/ideas-tab').then(m => ({ default: m.IdeasTab })), { loading: () => <TabSkeleton /> });
const ActivityTab = dynamic(() => import('@/components/moba/tabs/activity-tab').then(m => ({ default: m.ActivityTab })), { loading: () => <TabSkeleton /> });
const RoadmapTab = dynamic(() => import('@/components/moba/tabs/roadmap-tab').then(m => ({ default: m.RoadmapTab })), { loading: () => <TabSkeleton /> });

// ============ TAB CONTENT RENDERER ============
export function TabContent({
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
      case 'patches': return <PatchesMetaTab patches={patches} champions={champions} insights={insights} loading={loading} selectedGame={selectedGame} />;
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
