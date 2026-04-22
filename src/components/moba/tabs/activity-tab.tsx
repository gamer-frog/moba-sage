'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Rocket, Sparkles, Clock, GitCommit,
  AlertTriangle, CheckCircle2, Loader2, Bug, Palette, Eye
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
  deploy: { icon: Rocket, color: '#c8aa6e', label: 'Deploy', bg: 'rgba(200,170,110,0.1)' },
  feature: { icon: Sparkles, color: '#0fba81', label: 'Feature', bg: 'rgba(15,186,129,0.1)' },
  audit: { icon: Eye, color: '#0acbe6', label: 'Auditoría', bg: 'rgba(10,203,230,0.1)' },
  fix: { icon: Bug, color: '#e84057', label: 'Fix', bg: 'rgba(232,64,87,0.1)' },
  improvement: { icon: Palette, color: '#f0c646', label: 'Mejora', bg: 'rgba(240,198,70,0.1)' },
};

export function ActivityTab() {
  const [feed, setFeed] = useState<ActivityFeed | null>(null);
  const [loading, setLoading] = useState(true);

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

  const sortedEntries = [...feed.entries].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

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
          <p className="text-xs text-[#5b5a56]">Activity feed — cambios, deploys y auditorías</p>
        </div>
      </div>

      {feed.highlights && feed.highlights.length > 0 && (
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
