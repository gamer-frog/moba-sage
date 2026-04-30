'use client';

import { useState, useCallback } from 'react';
import type { SummonerData } from '@/components/moba/types';

export function useSummonerSearch() {
  const [summonerName, setSummonerName] = useState('');
  const [summonerRegion, setSummonerRegion] = useState('LAS');
  const [summonerData, setSummonerData] = useState<SummonerData | null>(null);
  const [summonerLoading, setSummonerLoading] = useState(false);
  const [summonerError, setSummonerError] = useState('');

  const handleSearchSummoner = useCallback(async () => {
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
      setSummonerError('Error de conexion. Intenta de nuevo.');
    } finally {
      setSummonerLoading(false);
    }
  }, [summonerName, summonerRegion]);

  return {
    summonerName, setSummonerName,
    summonerRegion, setSummonerRegion,
    summonerData, summonerLoading, summonerError,
    handleSearchSummoner,
  };
}
