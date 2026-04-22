'use client';

import { motion } from 'framer-motion';
import { Sword, ArrowLeft, Bell, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from './theme-toggle';
import type { GameSelection } from './types';

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
            <h1 className="text-lg font-black tracking-[0.2em] leading-none lol-heading" style={{ color: '#c8aa6e', textShadow: '0 0 30px rgba(200,170,110,0.4), 0 2px 4px rgba(0,0,0,0.8)' }}>MOBA SAGE</h1>
            <p className="text-[9px] text-[#5b5a56] tracking-[0.2em] uppercase leading-none mt-0.5">Analytics con IA</p>
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
            <Badge variant="outline" className="text-[10px] border-[#c8aa6e]/30 text-[#c8aa6e]">League of Legends</Badge>
          )}
          {selectedGame === 'wildrift' && (
            <Badge variant="outline" className="text-[10px] border-[#0acbe6]/30 text-[#0acbe6]">Wild Rift</Badge>
          )}
          <Badge variant="outline" className="text-[10px] border-[#785a28]/30 text-[#5b5a56]">{selectedGame === 'wildrift' ? `Patch ${liveVersions.wr || '6.4'}` : `Patch ${liveVersions.gamePatch || liveVersions.lol || '16.8'}`}</Badge>
          {isNewPatch && (
            <Badge className="lol-new-patch-badge bg-[#0fba81]/15 text-[#0fba81] border border-[#0fba81]/40 text-[10px] cursor-pointer" onClick={onDismissPatch}>
              <Bell className="w-3 h-3 mr-1" />
              NUEVO PARCHE
            </Badge>
          )}
          <Badge className="lol-live-badge bg-[#c8aa6e]/10 text-[#c8aa6e] border border-[#c8aa6e]/25 text-[10px] hidden sm:inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0fba81] mr-1.5 animate-pulse" />
            En vivo
          </Badge>
          <span className="hidden md:inline text-[9px] text-[#5b5a56] ml-1">
            Update: {lastUpdate || 'Cargando...'}
          </span>
        </div>
      </div>
    </header>
  );
}
