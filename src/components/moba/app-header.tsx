'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, ArrowLeft, Bell, Menu, Rocket, Sparkles, AlertTriangle, Eye, Bug, Clock, X } from 'lucide-react';
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

function isToday(ts: string): boolean {
  const d = new Date(ts);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins <= 0) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
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
  const [todayEntries, setTodayEntries] = useState<ActivityEntry[]>([]);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadActivity() {
      try {
        const res = await fetch('/activity-feed.json');
        if (res.ok) {
          const data = await res.json();
          if (data?.entries) {
            setTodayEntries(
              data.entries
                .filter((e: ActivityEntry) => isToday(e.timestamp))
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

  // Click outside to close
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

  const notifCount = todayEntries.length;
  const hasNotifs = notifCount > 0;
  const visibleEntries = todayEntries.slice(0, 5);

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
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {selectedGame === 'lol' && (
            <Badge variant="outline" className="lol-label text-[10px] border-[#c8aa6e]/30 text-[#c8aa6e]">League of Legends</Badge>
          )}
          {selectedGame === 'wildrift' && (
            <Badge variant="outline" className="lol-label text-[10px] border-[#0acbe6]/30 text-[#0acbe6]">Wild Rift</Badge>
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

          {/* Notification Bell */}
          <div className="relative">
            <button
              ref={bellRef}
              onClick={() => setNotifOpen(prev => !prev)}
              className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
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
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold"
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
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden z-50"
                  style={{
                    background: 'linear-gradient(180deg, rgba(30,35,40,0.98), rgba(10,14,26,0.98))',
                    border: '1px solid rgba(200,170,110,0.25)',
                    boxShadow: '0 0 30px rgba(200,170,110,0.08), 0 15px 40px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  {/* Dropdown header */}
                  <div className="px-4 py-3 border-b border-[#785a28]/15 flex items-center justify-between">
                    <span className="lol-label text-[10px] text-[#c8aa6e]">Notificaciones de hoy</span>
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
                        <p className="text-xs text-[#5b5a56]">Sin novedades hoy</p>
                      </div>
                    ) : (
                      visibleEntries.map((entry) => {
                        const color = TYPE_COLORS[entry.type] || '#a09b8c';
                        const Icon = TYPE_ICONS[entry.type] || Sparkles;
                        return (
                          <div
                            key={entry.id}
                            className="flex items-start gap-2.5 px-4 py-2.5 border-b border-[#785a28]/8 hover:bg-[#1e2328]/40 transition-colors"
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
    </header>
  );
}
