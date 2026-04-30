'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_TAB_ITEMS, DEV_TAB_ITEMS } from './constants';
import { Trophy, ScrollText, Flame, User, Rocket, Lightbulb, Wrench, ChevronRight, X, GraduationCap, GitCompare, Crown, BookMarked } from 'lucide-react';
import { APP_NAME, APP_VERSION } from '@/data/constants';

const DEV_ICONS: Record<string, typeof Wrench> = {
  novedades: Rocket,
  ideas: Lightbulb,
  tasks: Wrench,
};

const GAME_ICONS: Record<string, typeof Trophy> = {
  tierlist: Trophy,
  patches: ScrollText,
  combos: Flame,
  comparison: GitCompare,
  coaching: GraduationCap,
  competitive: Crown,
  guides: BookMarked,
  profile: User,
};

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  gamePatch?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

function SidebarContent({ activeTab, onTabChange, gamePatch, onClose }: SidebarNavProps) {
  const [devExpanded, setDevExpanded] = useState(false);
  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile close button */}
      {onClose && (
        <div className="flex items-center justify-between px-4 pt-3 pb-1 lg:hidden">
          <p className="lol-label text-[10px] text-lol-gold-dark">Navegación</p>
          <button onClick={onClose} className="text-lol-dim hover:text-lol-muted transition-colors p-1" aria-label="Cerrar menú">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Game Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-none">
        <p className="lol-label text-[10px] text-lol-gold-dark px-3 mb-2">Análisis</p>
        <div className="space-y-0.5">
          {GAME_TAB_ITEMS.map((tab) => {
            const Icon = GAME_ICONS[tab.id] || Trophy;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-lol-gold/10 text-lol-gold'
                    : 'text-lol-dim hover:text-lol-muted hover:bg-lol-card/40'
                  }
                `}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ background: 'linear-gradient(180deg, #c8aa6e, #785a28)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-lol-gold' : 'text-lol-gold-dark group-hover:text-lol-muted'}`} />
                <span className='lol-label'>{tab.label}</span>
                {isActive && (
                  <motion.div
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-lol-gold"
                    layoutId="sidebar-dot"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="my-4 mx-3 flex items-center gap-2">
          <div className="flex-1 h-px bg-lol-gold-dark/15" />
        </div>

        {/* Dev Navigation (collapsible, dimmer) */}
        <button
          onClick={() => setDevExpanded(!devExpanded)}
          className="w-full flex items-center gap-2 px-3 mb-2 text-[10px] text-lol-dim hover:text-lol-gold-dark transition-colors lol-label"
        >
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-lol-dim/15 text-lol-dim border border-lol-dim/20">
            DEV
          </span>
          <Wrench className="w-3 h-3" />
          <span>Desarrollo</span>
          <motion.div animate={{ rotate: devExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="w-3 h-3 ml-auto" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {devExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="space-y-0.5">
                {DEV_TAB_ITEMS.map((tab) => {
                  const Icon = DEV_ICONS[tab.id] || Wrench;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 group relative
                        ${isActive
                          ? 'bg-lol-success/10 text-lol-success'
                          : 'text-lol-dim hover:text-lol-gold-dark hover:bg-lol-card/40'
                        }
                      `}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                          style={{ background: 'linear-gradient(180deg, #0acbe6, #0a7a8f)' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <Icon className={`w-3 h-3 shrink-0 ${isActive ? 'text-lol-success' : 'text-lol-dim group-hover:text-lol-gold-dark'}`} />
                      <span className='lol-label text-[11px]'>
                        <span className="text-[10px] mr-1 opacity-50">[DEV]</span>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar footer with patch badge */}
      <div className="px-4 py-3 border-t border-lol-gold-dark/10 mb-20 lg:mb-0">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-lol-gold-dark/60 tracking-wider">{APP_NAME} v{APP_VERSION}</p>
          {gamePatch && (
            <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(15,186,129,0.1)', border: '1px solid rgba(15,186,129,0.2)', color: '#0fba81' }}>
              <span className="w-1 h-1 rounded-full bg-lol-green animate-pulse" />
              {gamePatch}
            </span>
          )}
        </div>

        {/* Keyboard shortcut hints — desktop only */}
        <div className="mt-2 pt-2 border-t border-lol-gold-dark/8 space-y-1 hidden lg:block">
          <p className="text-[10px] text-lol-dim/60 flex items-center gap-1.5">
            <span className="inline-flex px-1 py-0.5 rounded text-[10px] font-mono" style={{ background: 'rgba(30,35,40,0.6)', border: '1px solid rgba(120,90,40,0.15)' }}>Ctrl+K</span>
            Buscar campeón
          </p>
          <p className="text-[10px] text-lol-dim/60 flex items-center gap-1.5">
            <span className="inline-flex px-1 py-0.5 rounded text-[10px] font-mono" style={{ background: 'rgba(30,35,40,0.6)', border: '1px solid rgba(120,90,40,0.15)' }}>Esc</span>
            Cerrar paneles
          </p>
        </div>
      </div>
    </div>
  );
}

export function SidebarNav(props: SidebarNavProps) {
  const { isOpen, onClose } = props;

  return (
    <>
      {/* Desktop: always visible fixed sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-[57px] bottom-0 w-[220px] border-r border-lol-gold-dark/15 z-30"
        role="navigation"
        aria-label="Navegación principal"
        style={{ backgroundColor: 'rgba(10, 14, 26, 0.96)', backdropFilter: 'blur(20px)' }}>
        <SidebarContent {...props} />
      </aside>

      {/* Mobile/Tablet: slide-in drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[45] bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            {/* Drawer panel */}
            <motion.aside
              className="fixed left-0 top-[57px] bottom-0 w-[260px] z-[46] border-r border-lol-gold-dark/15 lg:hidden"
              role="navigation"
              aria-label="Navegación principal"
              style={{ backgroundColor: 'rgba(10, 14, 26, 0.98)', backdropFilter: 'blur(20px)' }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <SidebarContent {...props} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
