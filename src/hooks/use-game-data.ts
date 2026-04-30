'use client';

import { useState, useEffect, useCallback } from 'react';
import { updateDdVersion } from '@/components/moba/helpers';
import type {
  Champion, PatchNote, AiInsight, TaskItem,
  ProPick, BrokenCombo,
} from '@/components/moba/types';

interface LiveVersions {
  lol: string;
  wr: string;
  gamePatch: string;
  metaLastUpdated: string;
}

interface VersionData {
  lol: string;
  wr: string;
  gamePatch: string;
  metaLastUpdated: string;
  fetchedAt?: string;
}

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Shared safeJson fetcher
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

// Deduplicated fetch-all helper — single source of truth for endpoints
async function fetchAllEndpoints() {
  return Promise.all([
    safeJson<Champion[]>('/api/champions'),
    safeJson<PatchNote[]>('/api/patches'),
    safeJson<AiInsight[]>('/api/insights'),
    safeJson<TaskItem[]>('/api/tasks'),
    safeJson<ProPick[]>('/api/pro-picks'),
    safeJson<BrokenCombo[]>('/api/combos'),
    safeJson<VersionData | null>('/api/version'),
  ]) as Promise<[Champion[] | null, PatchNote[] | null, AiInsight[] | null, TaskItem[] | null, ProPick[] | null, BrokenCombo[] | null, VersionData | null]>;
}

export function useGameData() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [patches, setPatches] = useState<PatchNote[]>([]);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [proPicks, setProPicks] = useState<ProPick[]>([]);
  const [combos, setCombos] = useState<BrokenCombo[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [liveVersions, setLiveVersions] = useState<LiveVersions>({ lol: '', wr: '', gamePatch: '', metaLastUpdated: '' });
  const [lastUpdate, setLastUpdate] = useState('');
  const [isNewPatch, setIsNewPatch] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Process version data (shared between initial fetch and silent refresh)
  const processVersionData = useCallback((versionData: VersionData | null) => {
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
      setLastUpdate(`${d.getDate()} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`);
    }
  }, []);

  // Apply fetched data to state (shared between initial fetch and silent refresh)
  const applyData = useCallback((data: Awaited<ReturnType<typeof fetchAllEndpoints>>) => {
    const [champsData, patchesData, insightsData, tasksData, proData, combosData, versionData] = data;
    if (champsData) setChampions(champsData);
    if (patchesData) setPatches(patchesData);
    if (insightsData) setInsights(insightsData);
    if (tasksData) setTasks(tasksData);
    if (proData) setProPicks(proData);
    if (combosData) setCombos(combosData);
    processVersionData(versionData);
    // Return whether ALL endpoints failed
    return !champsData && !patchesData && !insightsData && !tasksData && !proData && !combosData && !versionData;
  }, [processVersionData]);

  // Initial data fetch (with loading overlay)
  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setFetchError(false);
    try {
      const data = await fetchAllEndpoints();
      if (controller.signal.aborted) return;
      const allFailed = applyData(data);
      if (allFailed) setFetchError(true);
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error('Unexpected error in fetchData:', err);
      setFetchError(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
    return () => controller.abort();
  }, [applyData]);

  useEffect(() => {
    const cleanup = fetchData();
    return () => cleanup?.();
  }, [fetchData]);

  // Silent refresh (no loading overlay — no flicker)
  const handleRefresh = useCallback(async () => {
    const controller = new AbortController();
    setIsRefreshing(true);
    setFetchError(false);
    try {
      const data = await fetchAllEndpoints();
      if (controller.signal.aborted) return;
      await applyData(data);
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error('Silent refresh error:', err);
    } finally {
      if (!controller.signal.aborted) setIsRefreshing(false);
    }
    return () => controller.abort();
  }, [applyData]);

  return {
    champions, patches, insights, tasks, proPicks, combos,
    loading, fetchError, liveVersions, lastUpdate, isNewPatch, isRefreshing,
    fetchData, handleRefresh,
    setTasks, setIsNewPatch,
  };
}
