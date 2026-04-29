'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Palette } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMobaTheme, type MobaTheme } from './theme-provider';

const THEME_COLORS: Record<MobaTheme, string> = {
  'blue-essence': '#c89b3c',
  'red-essence': '#c83232',
  'prestige': '#f0e6d2',
};

const THEME_LABELS: Record<MobaTheme, string> = {
  'blue-essence': 'Esencia Azul',
  'red-essence': 'Esencia Roja',
  'prestige': 'Prestigio',
};

export function ThemeToggle() {
  const { theme, cycleTheme, themeLabel } = useMobaTheme();
  const [showPanel, setShowPanel] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  const color = THEME_COLORS[theme];
  const allThemes: MobaTheme[] = ['blue-essence', 'red-essence', 'prestige'];

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowPanel(prev => !prev)}
        className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all relative"
        style={{
          background: `${color}15`,
          border: `1px solid ${color}30`,
        }}
        whileHover={{
          scale: 1.1,
          boxShadow: `0 0 16px ${color}25`,
        }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Cambiar tema: ${themeLabel}`}
      >
        <Palette className="w-4 h-4" style={{ color }} />
        <motion.div
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
          style={{ background: color }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1.5 right-0 p-2 rounded-xl min-w-[180px] z-50"
            style={{
              background: 'rgba(18,22,30,0.98)',
              border: '1px solid rgba(120,90,40,0.2)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[8px] font-semibold tracking-[0.15em] uppercase px-1 mb-1.5" style={{ color: '#5b5a56' }}>
              Tema
            </div>
            {allThemes.map(t => {
              const isActive = theme === t;
              const tColor = THEME_COLORS[t];
              return (
                <button
                  key={t}
                  onClick={() => { cycleTheme(); setShowPanel(false); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all cursor-pointer"
                  style={{
                    background: isActive ? `${tColor}12` : 'transparent',
                    border: `1px solid ${isActive ? `${tColor}30` : 'transparent'}`,
                  }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ background: tColor, boxShadow: isActive ? `0 0 8px ${tColor}40` : 'none' }} />
                  <div className="flex-1 text-left">
                    <span className="text-[11px] font-semibold" style={{ color: isActive ? tColor : '#a09b8c' }}>
                      {THEME_LABELS[t]}
                    </span>
                  </div>
                  {isActive && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full" style={{ background: tColor }} />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close panel on outside click */}
      {showPanel && (
        <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
      )}
    </div>
  );
}
