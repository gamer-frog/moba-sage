'use client';

import { useEffect, useState } from 'react';
import { Database } from 'lucide-react';
import {
  CollapsibleSection,
} from './collapsible-section';

interface DDragonStatus {
  version: string;
  fetchedAt: string;
  status: string;
  count?: number;
}

interface SourceStatus {
  id: string;
  name: string;
  color: string;
  status: 'live' | 'cached' | 'static' | 'offline';
  lastUpdate: string;
  detail: string;
  icon: string;
}

export function DataSourcesPanel() {
  const [ddragonStatus, setDdragonStatus] = useState<DDragonStatus | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const [ddRes, champRes, itemRes, runeRes] = await Promise.all([
          fetch('/api/ddragon'),
          fetch('/api/ddragon/champions'),
          fetch('/api/ddragon/items'),
          fetch('/api/ddragon/runes'),
        ]);

        const dd = await ddRes.json();
        const champ = await champRes.json();
        const item = await itemRes.json();
        const rune = await runeRes.json();

        setDdragonStatus({
          version: dd.version || '—',
          fetchedAt: dd.fetchedAt || champ.fetchedAt || '—',
          status: dd.status || 'ok',
          count: champ.count,
        });
      } catch {
        setDdragonStatus({ version: '16.8.1', fetchedAt: new Date().toISOString(), status: 'fallback' });
      }
    }
    fetchStatus();
  }, []);

  const sources: SourceStatus[] = [
    {
      id: 'ddragon',
      name: 'Data Dragon (Riot)',
      color: '#c8aa6e',
      status: ddragonStatus?.status === 'ok' ? 'live' : 'cached',
      lastUpdate: ddragonStatus?.fetchedAt
        ? new Date(ddragonStatus.fetchedAt).toLocaleString('es-AR', { timeZone: 'America/Buenos_Aires' })
        : '—',
      detail: `v${ddragonStatus?.version || '?'} · ${ddragonStatus?.count || '—'} campeones`,
      icon: '🎮',
    },
    {
      id: 'ugg',
      name: 'U.GG',
      color: '#0acbe6',
      status: 'cached',
      lastUpdate: '25/04/2026',
      detail: 'Tier list + builds Emerald+',
      icon: '📊',
    },
    {
      id: 'opgg',
      name: 'OP.GG',
      color: '#4f8cff',
      status: 'cached',
      lastUpdate: '25/04/2026',
      detail: 'Win/Pick/Ban rates por rol',
      icon: '📈',
    },
    {
      id: 'mobalytics',
      name: 'Mobalytics',
      color: '#9d48e0',
      status: 'cached',
      lastUpdate: '25/04/2026',
      detail: 'Tier list + GPI analysis',
      icon: '🧠',
    },
    {
      id: 'lolalytics',
      name: 'LoLalytics',
      color: '#0fba81',
      status: 'cached',
      lastUpdate: '25/04/2026',
      detail: 'Matchups + advanced stats',
      icon: '🔍',
    },
    {
      id: 'metabot',
      name: 'MetaBot.GG',
      color: '#f0c646',
      status: 'cached',
      lastUpdate: '25/04/2026',
      detail: 'Win rate rankings global',
      icon: '🤖',
    },
  ];

  const statusColors = {
    live: 'bg-emerald-500',
    cached: 'bg-amber-500',
    static: 'bg-gray-500',
    offline: 'bg-red-500',
  };

  const statusLabels = {
    live: 'EN VIVO',
    cached: 'CACHEADO',
    static: 'ESTÁTICO',
    offline: 'OFFLINE',
  };

  return (
    <CollapsibleSection title="Fuentes de Datos" icon={Database} color="#5b5a56" defaultOpen={false}>
      <div className="space-y-2">
        {sources.map((source) => (
          <div
            key={source.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#1a2328] hover:bg-[#242d34] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm flex-shrink-0">{source.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#f0e6d2]">{source.name}</span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${statusColors[source.status]} text-white`}>
                    {statusLabels[source.status]}
                  </span>
                </div>
                <p className="text-[10px] text-[#a09b8c] truncate">{source.detail}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="text-[10px] text-[#a09b8c]">{source.lastUpdate}</p>
            </div>
          </div>
        ))}
        <div className="mt-3 pt-2 border-t border-[#785a28]/30">
          <p className="text-[10px] text-[#a09b8c] text-center">
            Patch <span className="text-[#c8aa6e] font-medium">26.9</span> · Season 2 Pandemonium
          </p>
          <p className="text-[9px] text-[#a09b8c]/60 text-center mt-1">
            © Riot Games, Inc. League of Legends y todo el contenido relacionado son marcas registradas de Riot Games, Inc.
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
