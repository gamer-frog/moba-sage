'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Rocket, Sparkles, Clock,
  CheckCircle2, GitCommit, ExternalLink
} from 'lucide-react';
import { ActivityEntry, ActivityFeed, TYPE_COLORS, TYPE_ICONS } from '@/lib/activity';
import { timeAgo } from '@/lib/time';

export function ActivityPopup() {
  const [feed, setFeed] = useState<ActivityFeed | null>(null);
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleDismissPermanently = useCallback(() => {
    setShow(false);
    localStorage.setItem('moba-sage-popup-dismissed', 'true');
  }, []);

  const handleDismiss = useCallback(() => {
    setShow(false);
    sessionStorage.setItem('moba-sage-popup-seen', 'true');
  }, []);

  useEffect(() => {
    if (localStorage.getItem('moba-sage-popup-dismissed')) return;
    if (sessionStorage.getItem('moba-sage-popup-seen')) return;

    let cancelled = false;
    let showTimer: ReturnType<typeof setTimeout>;
    let dismissTimer: ReturnType<typeof setTimeout>;
    (async () => {
      try {
        const res = await fetch('/activity-feed.json');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setFeed(data);
          setMounted(true);
          showTimer = setTimeout(() => { if (!cancelled) setShow(true); }, 800);
          dismissTimer = setTimeout(() => { if (!cancelled) {
            setShow(false);
            sessionStorage.setItem('moba-sage-popup-seen', 'true');
          }}, 8000);
        }
      } catch (err) {
        console.error('Failed to load activity feed for popup:', err);
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  // Escape key handler
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, handleDismiss]);

  const recentEntries = feed?.entries
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5) || [];

  const latestEntry = recentEntries[0];

  // Always render AnimatePresence for exit animations
  if (!feed || !mounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="activity-popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[201] flex items-end sm:items-center justify-center p-4"
          onClick={handleDismiss}
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div
            key="activity-popup-card"
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            onClick={(e) => { e.stopPropagation(); }}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(30,35,40,0.98), rgba(10,14,26,0.98))',
              border: '1.5px solid rgba(200,170,110,0.35)',
              boxShadow: '0 0 60px rgba(200,170,110,0.15), 0 0 120px rgba(200,170,110,0.05), 0 25px 50px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header with gold glow border accent */}
            <div className="relative p-5 pb-3" style={{ borderBottom: '1px solid rgba(120,90,40,0.15)' }}>
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Cerrar novedades"
              >
                <X className="text-lol-muted text-base" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(200,170,110,0.2), rgba(200,170,110,0.05))',
                    border: '1.5px solid rgba(200,170,110,0.4)',
                    boxShadow: '0 0 20px rgba(200,170,110,0.1)',
                  }}>
                  <Rocket className="w-6 h-6 text-lol-gold" />
                </div>
                <div>
                  <h2 className="lol-title text-base text-lol-text">Novedades</h2>
                  <p className="lol-subtitle text-lol-dim">Lo último que pasó en MOBA SAGE</p>
                </div>
              </div>
            </div>

            {/* Latest entry hero */}
            {latestEntry && (
              <div className="px-5 pt-4 pb-3">
                <div className="rounded-xl p-4 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(200,170,110,0.06), rgba(200,170,110,0.02))',
                    border: '1px solid rgba(200,170,110,0.2)',
                  }}>
                  <div className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(200,170,110,0.5), transparent)' }} />
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${TYPE_COLORS[latestEntry.type] || '#a09b8c'}18`, border: `1px solid ${TYPE_COLORS[latestEntry.type] || '#a09b8c'}30` }}>
                      {(() => { const Icon = TYPE_ICONS[latestEntry.type] || Sparkles; return <Icon className="w-5 h-5" style={{ color: TYPE_COLORS[latestEntry.type] || '#a09b8c' }} />; })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-lol-text">{latestEntry.title}</p>
                      <p className="text-[11px] text-lol-muted mt-1 leading-relaxed line-clamp-2">{latestEntry.description}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1 text-[10px] text-lol-dim">
                          <Clock className="w-2.5 h-2.5" />
                          {timeAgo(latestEntry.timestamp)}
                        </div>
                        {latestEntry.commit && (
                          <a
                            href={`https://github.com/gamer-frog/moba-sage/commit/${latestEntry.commit}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Commit: ${latestEntry.commit.slice(0, 7)}`}
                            className="flex items-center gap-1 text-[10px] text-lol-success hover:text-lol-text transition-colors font-mono"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GitCommit className="w-2.5 h-2.5" />
                            Ver commit
                            <ExternalLink className="w-2 h-2" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Highlights */}
            {feed.highlights.length > 0 && (
              <div className="px-5 py-2">
                <div className="rounded-lg p-3" style={{ background: 'rgba(15,186,129,0.04)', border: '1px solid rgba(15,186,129,0.1)' }}>
                  <p className="lol-label text-[10px] text-lol-green mb-2">La app tiene</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {feed.highlights.map((h, i) => (
                      <span key={i} className="text-[10px] text-lol-muted flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-lol-green" />
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent activity entries */}
            <div className="px-5 py-2 space-y-1">
              <p className="lol-label text-[10px] text-lol-dim mb-2">Actividad reciente</p>
              {recentEntries.slice(1).map((entry) => {
                const color = TYPE_COLORS[entry.type] || '#a09b8c';
                const Icon = TYPE_ICONS[entry.type] || Sparkles;
                return (
                  <div key={entry.id} className="flex items-start gap-2.5 py-2" style={{ borderBottom: '1px solid rgba(120,90,40,0.08)' }}>
                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                      <Icon className="w-3 h-3" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-lol-text">{entry.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-lol-dim">
                        <Clock className="w-2 h-2" />
                        {timeAgo(entry.timestamp)}
                        {entry.commit && (
                          <a
                            href={`https://github.com/gamer-frog/moba-sage/commit/${entry.commit}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-lol-success hover:text-lol-text transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Ver commit
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="px-5 pb-4 pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer lol-label"
                style={{ background: 'linear-gradient(135deg, rgba(200,170,110,0.2), rgba(200,170,110,0.1))', border: '1px solid rgba(200,170,110,0.3)', color: '#c8aa6e' }}
              >
                Entendido
              </button>
              <button
                type="button"
                onClick={handleDismissPermanently}
                className="py-2.5 px-4 rounded-xl text-[10px] font-medium transition-all hover:bg-white/5 cursor-pointer text-lol-dim hover:text-lol-muted"
                style={{ border: '1px solid rgba(120,90,40,0.2)' }}
              >
                No volver a mostrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
