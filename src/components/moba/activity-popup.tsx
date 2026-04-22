'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Rocket, Sparkles, Clock,
  CheckCircle2, AlertTriangle, GitCommit, Eye, Bug, Palette
} from 'lucide-react';

interface ActivityEntry {
  id: string;
  type: string;
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

const TYPE_COLORS: Record<string, string> = {
  deploy: '#c8aa6e',
  feature: '#0fba81',
  audit: '#0acbe6',
  fix: '#e84057',
  improvement: '#f0c646',
};

const TYPE_ICONS: Record<string, typeof Rocket> = {
  deploy: Rocket,
  feature: Sparkles,
  audit: Eye,
  fix: AlertTriangle,
  improvement: Sparkles,
};

export function ActivityPopup() {
  const [feed, setFeed] = useState<ActivityFeed | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const sessionKey = 'moba-sage-popup-seen';
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    async function loadFeed() {
      try {
        const res = await fetch('/activity-feed.json');
        if (res.ok) {
          const data = await res.json();
          setFeed(data);
          setTimeout(() => setVisible(true), 800);
        }
      } catch (err) {
        console.error('Failed to load activity feed for popup:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('moba-sage-popup-seen', 'true');
  };

  if (loading || dismissed || !feed) return null;

  const recentEntries = feed.entries
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={handleDismiss}
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(30,35,40,0.98), rgba(10,14,26,0.98))',
              border: '1.5px solid rgba(200,170,110,0.3)',
              boxShadow: '0 0 60px rgba(200,170,110,0.1), 0 25px 50px rgba(0,0,0,0.5)',
            }}
          >
            <div className="relative p-5 pb-3" style={{ borderBottom: '1px solid rgba(120,90,40,0.15)' }}>
              <button onClick={handleDismiss} className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="Cerrar novedades">
                <X className="text-[#a09b8c] text-sm" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,170,110,0.15)', border: '1px solid rgba(200,170,110,0.3)' }}>
                  <Rocket className="w-5 h-5 text-[#c8aa6e]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#f0e6d2]">Novedades</h2>
                  <p className="text-[10px] text-[#5b5a56]">Lo último que pasó en MOBA SAGE</p>
                </div>
              </div>
            </div>

            {feed.highlights.length > 0 && (
              <div className="px-5 pt-3">
                <div className="rounded-lg p-3" style={{ background: 'rgba(15,186,129,0.04)', border: '1px solid rgba(15,186,129,0.1)' }}>
                  <p className="text-[9px] text-[#0fba81] font-semibold uppercase tracking-wider mb-2">La app tiene</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {feed.highlights.map((h, i) => (
                      <span key={i} className="text-[10px] text-[#a09b8c] flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-[#0fba81]" />
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="px-5 py-3 space-y-2">
              <p className="text-[9px] text-[#5b5a56] uppercase tracking-wider font-medium">Actividad reciente</p>
              {recentEntries.map((entry) => {
                const color = TYPE_COLORS[entry.type] || '#a09b8c';
                const Icon = TYPE_ICONS[entry.type] || Sparkles;
                return (
                  <div key={entry.id} className="flex items-start gap-2.5 py-2" style={{ borderBottom: '1px solid rgba(120,90,40,0.08)' }}>
                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                      <Icon className="w-3 h-3" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-[#f0e6d2]">{entry.title}</p>
                      <p className="text-[9px] text-[#5b5a56] truncate">{entry.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[8px] text-[#5b5a56]">
                        <Clock className="w-2 h-2" />
                        {timeAgo(entry.timestamp)}
                        {entry.commit && <span className="font-mono">{entry.commit.slice(0, 7)}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-5 pb-4">
              <button onClick={handleDismiss} className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, rgba(200,170,110,0.2), rgba(200,170,110,0.1))', border: '1px solid rgba(200,170,110,0.3)', color: '#c8aa6e' }}>
                Entendido
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
