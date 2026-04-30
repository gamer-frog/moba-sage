'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

// Shared safeJson fetcher — accepts AbortSignal for cancellation
const safeJson = async <T,>(url: string, signal?: AbortSignal): Promise<T | null> => {
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json() as T;
  } catch (e) {
    if (signal?.aborted) return null;
    console.warn(`[MOBA SAGE] Failed: ${url}`, e);
    return null;
  }
};

// Deduplicated fetch-all helper — single source of truth for endpoints
async function fetchAllEndpoints(signal?: AbortSignal) {
  return Promise.all([
    safeJson<Champion[]>('/api/champions', signal),
    safeJson<PatchNote[]>('/api/patches', signal),
    safeJson<AiInsight[]>('/api/insights', signal),
    safeJson<TaskItem[]>('/api/tasks', signal),
    safeJson<ProPick[]>('/api/pro-picks', signal),
    safeJson<BrokenCombo[]>('/api/combos', signal),
    safeJson<VersionData | null>('/api/version', signal),
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

  // AbortController ref for initial fetch (survives re-renders)
  const initialControllerRef = useRef<AbortController | null>(null);

  // Initial data fetch (with loading overlay)
  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await fetchAllEndpoints(signal);
      if (signal?.aborted) return;
      const allFailed = applyData(data);
      if (allFailed) setFetchError(true);
    } catch (err) {
      if (signal?.aborted) return;
      console.error('Unexpected error in fetchData:', err);
      setFetchError(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [applyData]);

  useEffect(() => {
    const controller = new AbortController();
    initialControllerRef.current = controller;
    fetchData(controller.signal);
    return () => {
      controller.abort();
      initialControllerRef.current = null;
    };
  }, [fetchData]);

  // AbortController ref for refresh
  const refreshControllerRef = useRef<AbortController | null>(null);

  // Silent refresh (no loading overlay — no flicker)
  const handleRefresh = useCallback(async () => {
    refreshControllerRef.current?.abort();
    const controller = new AbortController();
    refreshControllerRef.current = controller;
    setIsRefreshing(true);
    setFetchError(false);
    try {
      const data = await fetchAllEndpoints(controller.signal);
      if (controller.signal.aborted) return;
      await applyData(data);
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error('Silent refresh error:', err);
    } finally {
      if (!controller.signal.aborted) setIsRefreshing(false);
    }
  }, [applyData]);

  // Cleanup refresh controller on unmount
  useEffect(() => () => refreshControllerRef.current?.abort(), []);

  return {
    champions, patches, insights, tasks, proPicks, combos,
    loading, fetchError, liveVersions, lastUpdate, isNewPatch, isRefreshing,
    fetchData, handleRefresh,
    setTasks, setIsNewPatch,
  };
}
