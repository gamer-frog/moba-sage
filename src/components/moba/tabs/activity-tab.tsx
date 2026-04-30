'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Rocket, Sparkles, Clock, GitCommit, ExternalLink,
  CheckCircle2, Loader2, Filter, AlertTriangle
} from 'lucide-react';
import { ActivityEntry, ActivityFeed, TYPE_CONFIG } from '@/lib/activity';
import { timeAgo } from '@/lib/time';
import { C } from '@/components/moba/theme-colors';

const FILTER_OPTIONS: Array<{ value: string; label: string; color: string; bg: string }> = [
  { value: 'all', label: 'Todos', color: C.muted, bg: `${C.muted}26` },
  { value: 'feature', label: 'Función', color: C.green, bg: `${C.green}26` },
  { value: 'fix', label: 'Corrección', color: C.danger, bg: `${C.danger}26` },
  { value: 'improvement', label: 'Mejora', color: C.warning, bg: `${C.warning}26` },
  { value: 'deploy', label: 'Mantenimiento', color: C.gold, bg: `${C.gold}26` },
];

function formatDate(ts: string) {
  const d = new Date(ts);
  const day = d.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: 'numeric' });
  const month = d.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', month: 'short' });
  const time = d.toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hour12: false });
  return `${day} ${month} ${time}`;
}

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
        <Loader2 className="w-6 h-6 animate-spin text-lol-gold" />
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(30,35,40,0.5)', border: '1px solid rgba(120,90,40,0.15)' }}>
        <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-lol-danger" />
        <p className="text-sm text-lol-muted">No se pudo cargar el feed de actividad.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Rocket className="w-5 h-5 text-lol-gold" />
        <div>
          <h2 className="text-lg font-bold text-lol-text">Novedades</h2>
          <p className="text-xs text-lol-dim">Feed de actividad — cambios, deploys y auditorías</p>
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
          <p className="text-lg font-bold text-lol-text">{stats.total}</p>
          <p className="text-[10px] text-lol-dim">Total</p>
        </div>
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(10,203,230,0.06)', border: '1px solid rgba(10,203,230,0.15)' }}
        >
          <p className="text-lg font-bold text-lol-success">{stats.thisWeek}</p>
          <p className="text-[10px] text-lol-dim">Esta semana</p>
        </div>
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(15,186,129,0.06)', border: '1px solid rgba(15,186,129,0.15)' }}
        >
          <p className="text-[10px] text-lol-dim mb-1">Desglose</p>
          <p className="text-[10px]">
            <span className="text-lol-green">{stats.features} {stats.features === 1 ? 'función' : 'funciones'}</span>
            <span className="text-lol-dim"> · </span>
            <span className="text-lol-danger">{stats.fixes} {stats.fixes === 1 ? 'corrección' : 'correcciones'}</span>
            <span className="text-lol-dim"> · </span>
            <span className="text-lol-warning">{stats.improvements} {stats.improvements === 1 ? 'mejora' : 'mejoras'}</span>
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
        <Filter className="w-3.5 h-3.5 text-lol-dim shrink-0" />
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
                : { color: C.dim, backgroundColor: `${C.card}66` }
              }
              aria-pressed={isActive}
            >
              {opt.label}
            </button>
          );
        })}
        <span className="text-[10px] text-lol-dim ml-auto">
          {sortedEntries.length} {sortedEntries.length === 1 ? 'entrada' : 'entradas'}
        </span>
      </motion.div>

      {feed.highlights && feed.highlights.length > 0 && activeFilter === 'all' && (
        <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(200,170,110,0.08), rgba(200,170,110,0.02))', border: '1px solid rgba(200,170,110,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-lol-gold" />
            <span className="text-[10px] font-semibold text-lol-gold uppercase tracking-wider">Lo que tiene la app</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {feed.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-lol-muted">
                <CheckCircle2 className="w-3 h-3 text-lol-green shrink-0" />
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
                    <h4 className="text-xs font-semibold text-lol-text">{entry.title}</h4>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0" style={{ color: cfg.color, background: cfg.bg }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-lol-gold-dark leading-relaxed">{entry.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-lol-dim">
                    <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{formatDate(entry.timestamp)}</span>
                    <span>{timeAgo(entry.timestamp)}</span>
                    {entry.commit && (
                      <a
                        href={`https://github.com/gamer-frog/moba-sage/commit/${entry.commit}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-[10px] text-lol-success hover:text-lol-text transition-colors"
                      >
                        <GitCommit className="w-2.5 h-2.5" />{entry.commit.slice(0, 7)}
                        <ExternalLink className="w-2 h-2" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center text-[10px] text-lol-dim">
        {feed.entries.length} entradas — Última actualización: {formatDate(feed.lastUpdated)}
      </div>
    </div>
  );
}
