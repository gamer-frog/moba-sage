'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, ChevronDown, ExternalLink } from 'lucide-react';

interface SourceInfo {
  name: string;
  url: string;
  color: string;
  logo: string;
  lastUpdated: string;
  dataPoints: number;
}

const SOURCES: SourceInfo[] = [
  { name: 'U.GG', url: 'https://u.gg', color: '#0acbe6', logo: 'UG', lastUpdated: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }), dataPoints: 66 },
  { name: 'OP.GG', url: 'https://op.gg', color: '#4f8cff', logo: 'OP', lastUpdated: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }), dataPoints: 58 },
  { name: 'Mobalytics', url: 'https://mobalytics.com', color: '#9d48e0', logo: 'MA', lastUpdated: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }), dataPoints: 45 },
  { name: 'Blitz.gg', url: 'https://blitz.gg', color: '#3c8cff', logo: 'BZ', lastUpdated: new Date(Date.now() - 3600000).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }), dataPoints: 52 },
  { name: 'Buildzcrank', url: 'https://buildzcrank.com', color: '#f0c646', logo: 'BC', lastUpdated: new Date(Date.now() - 7200000).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }), dataPoints: 33 },
  { name: 'PropelRC', url: 'https://propelrc.com', color: '#0fba81', logo: 'PR', lastUpdated: new Date(Date.now() - 10800000).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }), dataPoints: 28 },
];

export function DataSourcesPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const totalDataPoints = SOURCES.reduce((sum, s) => sum + s.dataPoints, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(120,90,40,0.2)' }}
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-3 text-left hover:bg-white/[0.02] transition-colors"
        aria-expanded={isOpen}
      >
        <Database className="w-4 h-4 text-[#c8aa6e]" />
        <span className="lol-label text-xs font-semibold text-[#c8aa6e] uppercase tracking-wider">
          Fuentes de Datos
        </span>
        <span className="text-[9px] text-[#5b5a56] ml-1">
          {totalDataPoints} builds
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 ml-auto text-[#5b5a56] transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
        />
      </button>

      {/* Source cards */}
      {isOpen && (
        <div className="px-3 pb-3">
          {/* Mobile: horizontal scroll, Desktop: grid */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 md:grid md:grid-cols-3 md:overflow-x-visible">
            {SOURCES.map((source, i) => (
              <motion.a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="shrink-0 w-[140px] md:w-auto rounded-lg p-2.5 transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: `${source.color}06`,
                  border: `1px solid ${source.color}18`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {/* Logo box */}
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-black shrink-0"
                    style={{
                      backgroundColor: `${source.color}20`,
                      color: source.color,
                      border: `1px solid ${source.color}35`,
                    }}
                  >
                    {source.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-semibold text-[#f0e6d2] truncate">{source.name}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-[#5b5a56] shrink-0" />
                    </div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <p className="text-[9px] text-[#5b5a56]">
                    Actualizado: <span className="font-mono text-[#a09b8c]">{source.lastUpdated}</span>
                  </p>
                  <p className="text-[9px] text-[#5b5a56]">
                    <span className="font-mono font-semibold" style={{ color: source.color }}>{source.dataPoints}</span> builds
                  </p>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Total bar */}
          <div
            className="mt-2 flex items-center justify-center gap-2 py-1.5 rounded-lg"
            style={{
              background: 'rgba(200,170,110,0.06)',
              border: '1px solid rgba(200,170,110,0.12)',
            }}
          >
            <span className="text-[9px] text-[#5b5a56]">Total datos agregados:</span>
            <span className="text-[11px] font-mono font-bold text-[#c8aa6e]">{totalDataPoints}</span>
            <span className="text-[9px] text-[#5b5a56]">builds de {SOURCES.length} fuentes</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
