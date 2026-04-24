'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Rocket, Sparkles, Clock, GitCommit,
  AlertTriangle, CheckCircle2, Loader2, Bug, Palette, Eye, Filter
} from 'lucide-react';

interface ActivityEntry {
  id: string;
  type: 'deploy' | 'feature' | 'audit' | 'fix' | 'improvement';
  title: string;
  description: string;
  timestamp: string;
  commit?: string;
  category: string;
}

interface ActivityFeed {
  version: string;
  lastUpdated: string;
  entries: ActivityEntry[];
  highlights: string[];
}

const TYPE_CONFIG: Record<string, { icon: typeof Rocket; color: string; label: string; bg: string }> = {
  deploy: { icon: Rocket, color: '#c8aa6e', label: 'Despliegue', bg: 'rgba(200,170,110,0.1)' },
  feature: { icon: Sparkles, color: '#0fba81', label: 'Función', bg: 'rgba(15,186,129,0.1)' },
  audit: { icon: Eye, color: '#0acbe6', label: 'Auditoría', bg: 'rgba(10,203,230,0.1)' },
  fix: { icon: Bug, color: '#e84057', label: 'Corrección', bg: 'rgba(232,64,87,0.1)' },
  improvement: { icon: Palette, color: '#f0c646', label: 'Mejora', bg: 'rgba(240,198,70,0.1)' },
};

const FILTER_OPTIONS: Array<{ value: string; label: string; color: string; bg: string }> = [
  { value: 'all', label: 'Todos', color: '#a09b8c', bg: 'rgba(160,155,140,0.15)' },
  { value: 'feature', label: 'Función', color: '#0fba81', bg: 'rgba(15,186,129,0.15)' },
  { value: 'fix', label: 'Corrección', color: '#e84057', bg: 'rgba(232,64,87,0.15)' },
  { value: 'improvement', label: 'Mejora', color: '#f0c646', bg: 'rgba(240,198,70,0.15)' },
  { value: 'deploy', label: 'Mantenimiento', color: '#c8aa6e', bg: 'rgba(200,170,110,0.15)' },
];

export function ActivityTab() {
  const [feed, setFeed] = useState<ActivityFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await fetch('/activity-feed.json');
        if (res.ok) {
          const data = await res.json();
          setFeed(data);
        }
      } catch (err) {
        console.error('Failed to load activity feed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  const sortedEntries = useMemo(() => {
    if (!feed) return [];
    const entries = [...feed.entries]
      .filter(e => activeFilter === 'all' || e.type === activeFilter)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return entries;
  }, [feed, activeFilter]);

  // Stats summary
  const stats = useMemo(() => {
    if (!feed) return { total: 0, thisWeek: 0, features: 0, fixes: 0, improvements: 0 };
    const total = feed.entries.length;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = feed.entries.filter(e => new Date(e.timestamp) >= weekAgo).length;
    const features = feed.entries.filter(e => e.type === 'feature').length;
    const fixes = feed.entries.filter(e => e.type === 'fix').length;
    const improvements = feed.entries.filter(e => e.type === 'improvement').length;
    return { total, thisWeek, features, fixes, improvements };
  }, [feed]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#c8aa6e]" />
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(30,35,40,0.5)', border: '1px solid rgba(120,90,40,0.15)' }}>
        <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-[#e84057]" />
        <p className="text-sm text-[#a09b8c]">No se pudo cargar el feed de actividad.</p>
      </div>
    );
  }

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${d.getDate()} ${months[d.getMonth()]} ${hours}:${mins}`;
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins <= 0) return 'ahora';
    if (mins < 60) return `hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Rocket className="w-5 h-5 text-[#c8aa6e]" />
        <div>
          <h2 className="text-lg font-bold text-[#f0e6d2]">Novedades</h2>
          <p className="text-xs text-[#5b5a56]">Feed de actividad — cambios, deploys y auditorías</p>
        </div>
      </div>

      {/* ===== Stats Summary Bar ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-3"
      >
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(200,170,110,0.06)', border: '1px solid rgba(200,170,110,0.15)' }}
        >
          <p className="text-lg font-bold text-[#f0e6d2]">{stats.total}</p>
          <p className="text-[10px] text-[#5b5a56]">Total</p>
        </div>
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(10,203,230,0.06)', border: '1px solid rgba(10,203,230,0.15)' }}
        >
          <p className="text-lg font-bold text-[#0acbe6]">{stats.thisWeek}</p>
          <p className="text-[10px] text-[#5b5a56]">Esta semana</p>
        </div>
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(15,186,129,0.06)', border: '1px solid rgba(15,186,129,0.15)' }}
        >
          <p className="text-[10px] text-[#5b5a56] mb-1">Desglose</p>
          <p className="text-[10px]">
            <span style={{ color: '#0fba81' }}>{stats.features} {stats.features === 1 ? 'función' : 'funciones'}</span>
            <span className="text-[#5b5a56]"> · </span>
            <span style={{ color: '#e84057' }}>{stats.fixes} {stats.fixes === 1 ? 'corrección' : 'correcciones'}</span>
            <span className="text-[#5b5a56]"> · </span>
            <span style={{ color: '#f0c646' }}>{stats.improvements} {stats.improvements === 1 ? 'mejora' : 'mejoras'}</span>
          </p>
        </div>
      </motion.div>

      {/* ===== Filter by Type — Pill Buttons ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-2 flex-wrap"
      >
        <Filter className="w-3.5 h-3.5 text-[#5b5a56] shrink-0" />
        {FILTER_OPTIONS.map(opt => {
          const isActive = activeFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={`
                px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200
                ${isActive
                  ? 'shadow-lg'
                  : 'hover:opacity-80 border border-transparent'
                }
              `}
              style={isActive
                ? { backgroundColor: opt.bg, color: opt.color, border: `1px solid ${opt.color}30` }
                : { color: '#5b5a56', backgroundColor: 'rgba(30,35,40,0.4)' }
              }
              aria-pressed={isActive}
            >
              {opt.label}
            </button>
          );
        })}
        <span className="text-[10px] text-[#5b5a56] ml-auto">
          {sortedEntries.length} {sortedEntries.length === 1 ? 'entrada' : 'entradas'}
        </span>
      </motion.div>

      {feed.highlights && feed.highlights.length > 0 && activeFilter === 'all' && (
        <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(200,170,110,0.08), rgba(200,170,110,0.02))', border: '1px solid rgba(200,170,110,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#c8aa6e]" />
            <span className="text-[10px] font-semibold text-[#c8aa6e] uppercase tracking-wider">Lo que tiene la app</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {feed.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-[#a09b8c]">
                <CheckCircle2 className="w-3 h-3 text-[#0fba81] shrink-0" />
                {h}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sortedEntries.map((entry, idx) => {
          const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.feature;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl p-4 transition-all hover:scale-[1.01]"
              style={{ background: 'rgba(30,35,40,0.5)', border: '1px solid rgba(120,90,40,0.1)' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
                  <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-semibold text-[#f0e6d2]">{entry.title}</h4>
                    <span className="text-[8px] font-medium px-1.5 py-0.5 rounded shrink-0" style={{ color: cfg.color, background: cfg.bg }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#785a28] leading-relaxed">{entry.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[9px] text-[#5b5a56]">
                    <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{formatDate(entry.timestamp)}</span>
                    <span>{timeAgo(entry.timestamp)}</span>
                    {entry.commit && (
                      <span className="flex items-center gap-1 font-mono">
                        <GitCommit className="w-2.5 h-2.5" />{entry.commit.slice(0, 7)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center text-[10px] text-[#5b5a56]">
        {feed.entries.length} entradas — Última actualización: {formatDate(feed.lastUpdated)}
      </div>
    </div>
  );
}
