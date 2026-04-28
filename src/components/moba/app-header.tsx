'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, ArrowLeft, Bell, Menu, Rocket, Sparkles, AlertTriangle, Eye, Bug, Clock, X, ExternalLink, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from './theme-toggle';
import type { GameSelection } from './types';

interface ActivityEntry {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  commit?: string;
  category: string;
}

const TYPE_COLORS: Record<string, string> = {
  deploy: '#c8aa6e',
  feature: '#0fba81',
  audit: '#0acbe6',
  fix: '#e84057',
  improvement: '#f0c646',
  maintenance: '#785a28',
};

const TYPE_ICONS: Record<string, typeof Rocket> = {
  deploy: Rocket,
  feature: Sparkles,
  audit: Eye,
  fix: AlertTriangle,
  improvement: Sparkles,
  maintenance: Bug,
};

function isRecent(ts: string): boolean {
  const diff = Date.now() - new Date(ts).getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return diff >= 0 && diff <= sevenDaysMs;
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins <= 0) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function AppHeader({
  selectedGame,
  liveVersions,
  lastUpdate,
  isNewPatch,
  onBackToSelector,
  onDismissPatch,
  onMenuToggle,
}: {
  selectedGame: GameSelection;
  liveVersions: { lol: string; wr: string; gamePatch: string; metaLastUpdated: string };
  lastUpdate: string;
  isNewPatch: boolean;
  onBackToSelector: () => void;
  onDismissPatch: () => void;
  onMenuToggle?: () => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<ActivityEntry | null>(null);
  const [recentEntries, setRecentEntries] = useState<ActivityEntry[]>([]);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadActivity() {
      try {
        const res = await fetch('/activity-feed.json');
        if (res.ok) {
          const data = await res.json();
          if (data?.entries) {
            setRecentEntries(
              data.entries
                .filter((e: ActivityEntry) => isRecent(e.timestamp))
                .sort((a: ActivityEntry, b: ActivityEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            );
          }
        }
      } catch (err) {
        console.error('Failed to load activity for bell:', err);
      }
    }
    loadActivity();
    const interval = setInterval(loadActivity, 60000);
    return () => clearInterval(interval);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    if (!notifOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        bellRef.current && !bellRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  // Close detail popup on Escape
  useEffect(() => {
    if (!selectedNotif) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedNotif(null);
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [selectedNotif]);

  const notifCount = recentEntries.length;
  const hasNotifs = notifCount > 0;
  const visibleEntries = recentEntries.slice(0, 8);

  function formatTimestamp(ts: string): string {
    const d = new Date(ts);
    const day = d.getDate();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const month = months[d.getMonth()];
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${d.getFullYear()} · ${hours}:${mins}`;
  }

  function handleNotifClick(entry: ActivityEntry) {
    setSelectedNotif(entry);
    setNotifOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#785a28]/30" style={{ backgroundColor: 'rgba(10, 14, 26, 0.94)', backdropFilter: 'blur(20px) saturate(1.2)' }}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Hamburger menu — mobile/tablet only */}
        {selectedGame && onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[#785a28] hover:text-[#c8aa6e] hover:bg-[#1e2328]/40 transition-all duration-200 -ml-1"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={selectedGame ? onBackToSelector : undefined}
          className={`flex items-center gap-2 ${selectedGame ? 'cursor-pointer group' : ''}`}
        >
          <div className="w-8 h-8 rounded flex items-center justify-center lol-pulse" style={{ background: 'linear-gradient(135deg, #c8aa6e, #785a28)', boxShadow: '0 0 15px rgba(200,170,110,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
            <Sword className="w-4 h-4 text-[#0a0e1a]" />
          </div>
          <div className="hidden sm:block">
            <h1 className="lol-title text-lg leading-none" style={{ color: '#c8aa6e', textShadow: '0 0 30px rgba(200,170,110,0.4), 0 2px 4px rgba(0,0,0,0.8)' }}>MOBA SAGE</h1>
            <p className="lol-subtitle text-[9px] text-[#5b5a56] leading-none mt-0.5">Analytics con IA</p>
          </div>
          {selectedGame && (
            <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="ml-1">
              <ArrowLeft className="w-3 h-3 text-[#785a28] group-hover:text-[#c8aa6e] transition-colors" />
            </motion.div>
          )}
        </button>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <ThemeToggle />
          {selectedGame === 'lol' && (
            <Badge variant="outline" className="lol-label text-[10px] border-[#c8aa6e]/30 text-[#c8aa6e] hidden sm:inline-flex">League of Legends</Badge>
          )}
          {selectedGame === 'wildrift' && (
            <Badge variant="outline" className="lol-label text-[10px] border-[#0acbe6]/30 text-[#0acbe6] hidden sm:inline-flex">Wild Rift</Badge>
          )}
          <Badge variant="outline" className="lol-label text-[10px] border-[#785a28]/30 text-[#5b5a56]">{selectedGame === 'wildrift' ? `Patch ${liveVersions.wr || '6.4'}` : `Patch ${liveVersions.gamePatch || liveVersions.lol || '16.8'}`}</Badge>
          {isNewPatch && (
            <Badge className="lol-new-patch-badge lol-label bg-[#0fba81]/15 text-[#0fba81] border border-[#0fba81]/40 text-[10px] cursor-pointer" onClick={onDismissPatch}>
              NUEVO PARCHE
            </Badge>
          )}
          <Badge className="lol-live-badge lol-label bg-[#c8aa6e]/10 text-[#c8aa6e] border border-[#c8aa6e]/25 text-[10px] hidden sm:inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0fba81] mr-1.5 animate-pulse" />
            En vivo
          </Badge>
          <span className="hidden md:inline text-[9px] text-[#5b5a56] ml-1">
            Update: {lastUpdate || 'Cargando...'}
          </span>

          {/* Search Button */}
          {selectedGame && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('moba-sage-open-search'))}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 hover:bg-[#1e2328]/40"
              style={{ color: '#a09b8c' }}
              aria-label="Buscar campeón (Ctrl+K)"
              title="Buscar campeón (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button
              ref={bellRef}
              onClick={() => setNotifOpen(prev => !prev)}
              className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200"
              style={{
                color: hasNotifs ? '#c8aa6e' : '#a09b8c',
                filter: hasNotifs ? 'drop-shadow(0 0 6px rgba(200,170,110,0.4))' : 'none',
              }}
              aria-label="Notificaciones"
              aria-expanded={notifOpen}
              aria-haspopup="true"
            >
              <Bell className="w-4 h-4" fill={hasNotifs ? '#c8aa6e' : 'none'} />
              {hasNotifs && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold"
                  style={{ backgroundColor: '#e84057', color: '#fff', boxShadow: '0 0 6px rgba(232,64,87,0.5)' }}>
                  {notifCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 rounded-xl overflow-hidden z-50"
                  style={{
                    background: 'linear-gradient(180deg, rgba(30,35,40,0.98), rgba(10,14,26,0.98))',
                    border: '1px solid rgba(200,170,110,0.25)',
                    boxShadow: '0 0 30px rgba(200,170,110,0.08), 0 15px 40px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  {/* Dropdown header */}
                  <div className="px-4 py-3 border-b border-[#785a28]/15 flex items-center justify-between">
                    <span className="lol-label text-[10px] text-[#c8aa6e]">Actividad Reciente</span>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                      aria-label="Cerrar"
                    >
                      <X className="w-3 h-3 text-[#5b5a56]" />
                    </button>
                  </div>

                  {/* Entries */}
                  <div className="max-h-72 overflow-y-auto scrollbar-none">
                    {visibleEntries.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-[#785a28]/30" />
                        <p className="text-xs text-[#5b5a56]">Sin actividad en los últimos 7 días</p>
                      </div>
                    ) : (
                      visibleEntries.map((entry) => {
                        const color = TYPE_COLORS[entry.type] || '#a09b8c';
                        const Icon = TYPE_ICONS[entry.type] || Sparkles;
                        return (
                          <div
                            key={entry.id}
                            onClick={() => handleNotifClick(entry)}
                            className="flex items-start gap-2.5 px-4 py-2.5 border-b border-[#785a28]/8 hover:bg-[#1e2328]/60 transition-colors cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleNotifClick(entry); }}
                          >
                            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                              style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                              <Icon className="w-3 h-3" style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium text-[#f0e6d2] truncate">{entry.title}</p>
                              <p className="text-[9px] text-[#5b5a56] truncate">{entry.description}</p>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[8px] text-[#5b5a56]">
                                <Clock className="w-2 h-2" />
                                {timeAgo(entry.timestamp)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {visibleEntries.length > 0 && (
                    <div className="px-4 py-2 border-t border-[#785a28]/15">
                      <button
                        onClick={() => {
                          setNotifOpen(false);
                          // Dispatch custom event for parent to switch tab
                          window.dispatchEvent(new CustomEvent('moba-sage-switch-tab', { detail: 'novedades' }));
                        }}
                        className="w-full text-center text-[10px] text-[#c8aa6e] hover:text-[#f0e6d2] transition-colors py-1 lol-label"
                      >
                        Ver todas
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Notification Detail Popup — Full Screen Overlay */}
      <AnimatePresence>
        {selectedNotif && (() => {
          const notifColor = TYPE_COLORS[selectedNotif.type] || '#a09b8c';
          const NotifIcon = TYPE_ICONS[selectedNotif.type] || Sparkles;
          return (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotif(null)}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="w-full max-w-md rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, rgba(30,35,40,0.98), rgba(10,14,26,0.98))',
                  border: `1.5px solid ${notifColor}40`,
                  boxShadow: `0 0 60px ${notifColor}15, 0 25px 50px rgba(0,0,0,0.6)`,
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* Detail Header */}
                <div className="p-6 pb-4" style={{ borderBottom: `1px solid ${notifColor}15` }}>
                  <button onClick={() => setSelectedNotif(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="Cerrar">
                    <X className="w-4 h-4 text-[#a09b8c]" />
                  </button>

                  {/* Type icon + badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${notifColor}18`, border: `1.5px solid ${notifColor}30`, boxShadow: `0 0 20px ${notifColor}15` }}>
                      <NotifIcon className="w-6 h-6" style={{ color: notifColor }} />
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider lol-label"
                      style={{ background: `${notifColor}15`, color: notifColor, border: `1px solid ${notifColor}30` }}>
                      {selectedNotif.type}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold text-[#f0e6d2] lol-title mb-2" style={{ color: notifColor === '#c8aa6e' ? '#c8aa6e' : '#f0e6d2' }}>
                    {selectedNotif.title}
                  </h2>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-[10px] text-[#5b5a56]">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(selectedNotif.timestamp)}</span>
                    <span className="text-[#785a28]">·</span>
                    <span>{timeAgo(selectedNotif.timestamp)}</span>
                  </div>
                </div>

                {/* Detail Body */}
                <div className="p-6 space-y-4">
                  {/* Description */}
                  <div className="rounded-xl p-4" style={{ background: 'rgba(30,35,40,0.5)', border: '1px solid rgba(120,90,40,0.12)' }}>
                    <p className="text-sm text-[#a09b8c] leading-relaxed">{selectedNotif.description}</p>
                  </div>

                  {/* Category badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#5b5a56] uppercase tracking-wider">Categoría:</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={{ background: 'rgba(200,170,110,0.08)', color: '#c8aa6e', border: '1px solid rgba(200,170,110,0.15)' }}>
                      {selectedNotif.category}
                    </span>
                  </div>

                  {/* Commit link */}
                  {selectedNotif.commit && (
                    <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'rgba(15,186,129,0.06)', border: '1px solid rgba(15,186,129,0.15)' }}>
                      <Rocket className="w-4 h-4 text-[#0fba81] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-[#5b5a56] uppercase tracking-wider">Commit</p>
                        <p className="text-xs text-[#a09b8c] font-mono truncate">{selectedNotif.commit}</p>
                      </div>
                      <a
                        href={`https://github.com/gamer-frog/moba-sage/commit/${selectedNotif.commit}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all hover:scale-105 shrink-0"
                        style={{ background: 'rgba(15,186,129,0.1)', border: '1px solid rgba(15,186,129,0.3)', color: '#0fba81' }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver en GitHub
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </header>
  );
}
