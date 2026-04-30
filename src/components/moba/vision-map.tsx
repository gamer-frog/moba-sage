'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import { C } from '@/components/moba/theme-colors';

// Pre-defined ward positions per role
// Coordinates are in % of map size (0-100)
interface WardPosition {
  id: string;
  x: number;
  y: number;
  type: 'common' | 'deep' | 'objective';
  description: string;
}

const WARD_POSITIONS: Record<string, WardPosition[]> = {
  Top: [
    { id: 'top-tribush', x: 18, y: 22, type: 'common', description: 'Bush tri-lateral: protege del gank por jungle enemigo temprano' },
    { id: 'top-river', x: 35, y: 42, type: 'common', description: 'Río superior: control de vision para roam de mid y jungle' },
    { id: 'top-lanebush', x: 22, y: 35, type: 'common', description: 'Bush de carril: visión de teletransporte y engages' },
    { id: 'top-deep', x: 25, y: 65, type: 'deep', description: 'Jungle enemigo profundo: robar campamentos en invasión' },
  ],
  Jungle: [
    { id: 'jg-pixel', x: 30, y: 30, type: 'deep', description: 'Pixel brush: visión del invasor y control del río' },
    { id: 'jg-dragon', x: 45, y: 62, type: 'objective', description: 'Pozo del dragón: visión del objetivo y control de río' },
    { id: 'jg-baron', x: 45, y: 30, type: 'objective', description: 'Pozo del barón: visión del objetivo en late game' },
    { id: 'jg-entry', x: 30, y: 50, type: 'deep', description: 'Entrada jungle enemigo: rastrear al jungla rival' },
    { id: 'jg-scuttle', x: 50, y: 50, type: 'common', description: 'Scuttle crab: control del río y movimientos' },
  ],
  Mid: [
    { id: 'mid-river-top', x: 40, y: 38, type: 'common', description: 'Bush de río superior: visión de roams y ganks' },
    { id: 'mid-river-bot', x: 60, y: 62, type: 'common', description: 'Bush de río inferior: control del dragón y jungle' },
    { id: 'mid-lane-top', x: 38, y: 30, type: 'common', description: 'Bush superior del carril: prevenir ganks de top' },
    { id: 'mid-raptors', x: 62, y: 62, type: 'common', description: 'Campamento de raptores: visión del jungle enemigo' },
    { id: 'mid-deep', x: 65, y: 35, type: 'deep', description: 'Jungle enemigo medio: rastrear buffos y rutas' },
  ],
  ADC: [
    { id: 'adc-tribush', x: 78, y: 22, type: 'common', description: 'Bush tri-lateral: proteger del gank del jungla' },
    { id: 'adc-dragon', x: 60, y: 65, type: 'objective', description: 'Pozo del dragón: visión del objetivo para teamfights' },
    { id: 'adc-lanebush', x: 78, y: 35, type: 'common', description: 'Bush de carril: evitar emboscadas y engages' },
    { id: 'adc-river', x: 65, y: 55, type: 'common', description: 'Río inferior: visión de rotaciones del equipo rival' },
  ],
  Support: [
    { id: 'sup-river-top', x: 40, y: 38, type: 'common', description: 'Bush de río superior: visión de movimientos de mid' },
    { id: 'sup-river-bot', x: 60, y: 62, type: 'common', description: 'Bush de río inferior: control de dragon y mapa' },
    { id: 'sup-dragon', x: 45, y: 65, type: 'objective', description: 'Pozo del dragón: visión prioritaria del objetivo' },
    { id: 'sup-baron', x: 45, y: 30, type: 'objective', description: 'Pozo del barón: visión en late game para split push' },
    { id: 'sup-deep', x: 25, y: 55, type: 'deep', description: 'Jungle enemigo: warding profundo para rastrear' },
    { id: 'sup-tribush', x: 78, y: 22, type: 'common', description: 'Bush tri-lateral: proteger ADC y prevenir ganks' },
    { id: 'sup-lanebush', x: 78, y: 35, type: 'common', description: 'Bush de carril: controlar la línea y evitar engages' },
  ],
};

const WARD_TYPE_COLORS: Record<string, string> = {
  common: C.green,
  deep: C.danger,
  objective: C.warning,
};

const WARD_TYPE_LABELS: Record<string, string> = {
  common: 'Común',
  deep: 'Profunda',
  objective: 'Objetivo',
};

export function VisionMap({ role }: { role: string }) {
  const [selectedWard, setSelectedWard] = useState<WardPosition | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const wards = WARD_POSITIONS[role] || WARD_POSITIONS['Mid'];

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="relative">
      {/* Map container */}
      <div className="relative rounded-xl overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0d2818, #0a1e2e)',
        border: '1px solid rgba(200,170,110,0.2)',
        aspectRatio: '1 / 1',
      }}>
        {/* Map background layers */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Map base */}
          <rect x="0" y="0" width="100" height="100" fill="#0d1f15" rx="4" />

          {/* River diagonal */}
          <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(10,203,230,0.15)" strokeWidth="8" />
          <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(10,203,230,0.08)" strokeWidth="14" />

          {/* Top lane */}
          <line x1="8" y1="8" x2="8" y2="42" stroke="rgba(200,170,110,0.25)" strokeWidth="3" strokeLinecap="round" />
          <line x1="8" y1="42" x2="42" y2="42" stroke="rgba(200,170,110,0.25)" strokeWidth="3" strokeLinecap="round" />

          {/* Mid lane */}
          <line x1="42" y1="42" x2="58" y2="58" stroke="rgba(200,170,110,0.3)" strokeWidth="3" strokeLinecap="round" />

          {/* Bot lane */}
          <line x1="58" y1="58" x2="92" y2="58" stroke="rgba(200,170,110,0.25)" strokeWidth="3" strokeLinecap="round" />
          <line x1="92" y1="58" x2="92" y2="92" stroke="rgba(200,170,110,0.25)" strokeWidth="3" strokeLinecap="round" />

          {/* Nexus areas */}
          <circle cx="8" cy="8" r="5" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
          <circle cx="92" cy="92" r="5" fill="rgba(232,64,87,0.2)" stroke="rgba(232,64,87,0.3)" strokeWidth="1" />

          {/* Blue side jungle camps */}
          <circle cx="18" cy="20" r="1.5" fill="rgba(59,130,246,0.4)" />
          <circle cx="28" cy="28" r="1.5" fill="rgba(59,130,246,0.4)" />
          <circle cx="15" cy="35" r="1.5" fill="rgba(59,130,246,0.4)" />
          <circle cx="32" cy="20" r="1.5" fill="rgba(59,130,246,0.4)" />

          {/* Red side jungle camps */}
          <circle cx="80" cy="80" r="1.5" fill="rgba(232,64,87,0.4)" />
          <circle cx="70" cy="72" r="1.5" fill="rgba(232,64,87,0.4)" />
          <circle cx="85" cy="65" r="1.5" fill="rgba(232,64,87,0.4)" />
          <circle cx="68" cy="80" r="1.5" fill="rgba(232,64,87,0.4)" />

          {/* Dragon pit */}
          <ellipse cx="52" cy="62" rx="5" ry="4" fill="rgba(240,198,70,0.15)" stroke="rgba(240,198,70,0.25)" strokeWidth="0.8" />

          {/* Baron pit */}
          <ellipse cx="48" cy="30" rx="5" ry="4" fill="rgba(168,85,247,0.15)" stroke="rgba(168,85,247,0.25)" strokeWidth="0.8" />

          {/* Bush indicators (small green circles) */}
          <circle cx="18" cy="22" r="3" fill="rgba(15,186,129,0.08)" stroke="rgba(15,186,129,0.15)" strokeWidth="0.5" />
          <circle cx="78" cy="22" r="3" fill="rgba(15,186,129,0.08)" stroke="rgba(15,186,129,0.15)" strokeWidth="0.5" />
          <circle cx="22" cy="35" r="2.5" fill="rgba(15,186,129,0.08)" stroke="rgba(15,186,129,0.15)" strokeWidth="0.5" />
          <circle cx="78" cy="35" r="2.5" fill="rgba(15,186,129,0.08)" stroke="rgba(15,186,129,0.15)" strokeWidth="0.5" />
          <circle cx="40" cy="38" r="2.5" fill="rgba(15,186,129,0.08)" stroke="rgba(15,186,129,0.15)" strokeWidth="0.5" />
          <circle cx="60" cy="62" r="2.5" fill="rgba(15,186,129,0.08)" stroke="rgba(15,186,129,0.15)" strokeWidth="0.5" />
          <circle cx="30" cy="30" r="2" fill="rgba(15,186,129,0.08)" stroke="rgba(15,186,129,0.15)" strokeWidth="0.5" />

          {/* Lane labels */}
          <text x="6" y="28" fontSize="3" fill="rgba(200,170,110,0.25)" fontFamily="sans-serif">TOP</text>
          <text x="47" y="48" fontSize="3" fill="rgba(200,170,110,0.25)" fontFamily="sans-serif" textAnchor="middle">MID</text>
          <text x="78" y="55" fontSize="3" fill="rgba(200,170,110,0.25)" fontFamily="sans-serif">BOT</text>

          {/* Dragon label */}
          <text x="52" y="63" fontSize="2" fill="rgba(240,198,70,0.4)" fontFamily="sans-serif" textAnchor="middle">DRAGÓN</text>

          {/* Baron label */}
          <text x="48" y="31" fontSize="2" fill="rgba(168,85,247,0.4)" fontFamily="sans-serif" textAnchor="middle">BARÓN</text>
        </svg>

        {/* Ward positions */}
        {wards.map((ward) => {
          const color = WARD_TYPE_COLORS[ward.type];
          return (
            <motion.button
              key={ward.id}
              className="absolute cursor-pointer z-10"
              style={{
                left: `${ward.x}%`,
                top: `${ward.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => setSelectedWard(selectedWard?.id === ward.id ? null : ward)}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              aria-label={ward.description}
            >
              <motion.div
                className="relative flex items-center justify-center"
                animate={reducedMotion ? {
                  boxShadow: `0 0 8px ${color}50`,
                } : {
                  boxShadow: [
                    `0 0 4px ${color}40`,
                    `0 0 12px ${color}60`,
                    `0 0 4px ${color}40`,
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: reducedMotion ? 0 : Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `${color}30`,
                    border: `1.5px solid ${color}`,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Eye className="w-3 h-3" style={{ color }} />
                </div>
              </motion.div>
            </motion.button>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex flex-col gap-1">
          {Object.entries(WARD_TYPE_LABELS).map(([type, label]) => {
            const color = WARD_TYPE_COLORS[type];
            return (
              <div key={type} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px]" style={{ color: `${color}aa` }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip for selected ward */}
      <AnimatePresence>
        {selectedWard && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="mt-3 rounded-lg p-3 relative"
            style={{
              background: 'rgba(30,35,40,0.9)',
              border: `1px solid ${WARD_TYPE_COLORS[selectedWard.type]}40`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <button
              onClick={() => setSelectedWard(null)}
              className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Cerrar tooltip"
            >
              <X className="w-3 h-3 text-lol-dim" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-3.5 h-3.5" style={{ color: WARD_TYPE_COLORS[selectedWard.type] }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: WARD_TYPE_COLORS[selectedWard.type] }}>
                {WARD_TYPE_LABELS[selectedWard.type]}
              </span>
            </div>
            <p className="text-[11px] text-lol-muted leading-relaxed pr-4">
              {selectedWard.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role label */}
      <p className="text-[10px] text-lol-dim mt-2 text-center italic">
        Posiciones de ward recomendadas para {role}
      </p>
    </div>
  );
}
