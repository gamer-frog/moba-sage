'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Sword, Database, Shield, Swords, Target, TrendingUp,
  Zap, Globe, Trophy, Flame, Sparkles
} from 'lucide-react';

/* ================================================================
   MOBA SAGE — Loading Screen v3.0
   - Receives all data via props from parent (no own fetches)
   - Shows real-time progress per data source
   - Minimum display time of 2.5s for smooth experience
   - z-index 210 (above ActivityPopup z-201)
   ================================================================ */

export interface LoadingSource {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  status: 'pending' | 'loading' | 'done' | 'error';
  detail: string;
  records?: string;
  latency?: number;
}

interface LoadingScreenProps {
  version: {
    lol: string;
    wr: string;
    gamePatch: string;
    metaLastUpdated: string;
    fetchedAt: string;
    ddragonStatus: string;
  } | null;
  sources: LoadingSource[];
  champCount: number | null;
  step: number; // 0-5 progress step
}

export function LoadingScreen({ version, sources, champCount, step }: LoadingScreenProps) {
  const [elapsed, setElapsed] = useState(0);
  const [mountedAt] = useState(Date.now());

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - mountedAt) / 100) / 10);
    }, 100);
    return () => clearInterval(interval);
  }, [mountedAt]);

  // Time-based greeting
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Buenos dias';
    if (h >= 12 && h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '...';
    const d = new Date(isoStr);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTime = (isoStr: string) => {
    if (!isoStr) return '...';
    const d = new Date(isoStr);
    return d.toLocaleTimeString('es-AR', { timeZone: 'America/Buenos_Aires', hour: '2-digit', minute: '2-digit' });
  };

  const doneCount = sources.filter(s => s.status === 'done').length;
  const liveCount = sources.filter(s => s.status === 'done' || s.status === 'loading').length;
  const progressPct = Math.round((step / 5) * 100);

  const steps = [
    { label: 'Inicializando conexion', active: step >= 0, done: step > 0 },
    { label: 'Consultando Data Dragon', active: step >= 1, done: step > 1 },
    { label: 'Cargando campeones', active: step >= 2, done: step > 2 },
    { label: 'Descargando meta data', active: step >= 3, done: step > 3 },
    { label: 'Procesando combos y parches', active: step >= 4, done: step > 4 },
    { label: 'Preparando interfaz', active: step >= 5, done: step >= 5 && doneCount === sources.length },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[210] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      style={{ backgroundColor: '#060a12' }}
    >
      {/* Background layers */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 20%, rgba(200,170,110,0.07) 0%, transparent 55%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 15% 85%, rgba(10,203,230,0.04) 0%, transparent 35%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 85% 75%, rgba(15,186,129,0.03) 0%, transparent 35%)',
      }} />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `
          linear-gradient(30deg, rgba(200,170,110,0.4) 12%, transparent 12.5%, transparent 87%, rgba(200,170,110,0.4) 87.5%, rgba(200,170,110,0.4)),
          linear-gradient(150deg, rgba(200,170,110,0.4) 12%, transparent 12.5%, transparent 87%, rgba(200,170,110,0.4) 87.5%, rgba(200,170,110,0.4))
        `,
        backgroundSize: '80px 140px',
        backgroundPosition: '0 0, 40px 70px',
      }} />

      <div className="relative z-10 w-full max-w-[400px] px-5 flex flex-col items-center">

        {/* Logo */}
        <motion.div
          className="relative mb-5"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            className="absolute -inset-5"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-full h-full rounded-full" style={{
              border: '1px dashed rgba(200,170,110,0.12)',
            }} />
          </motion.div>

          <motion.div
            className="absolute -inset-3 rounded-full"
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'radial-gradient(circle, rgba(200,170,110,0.18) 0%, transparent 70%)',
            }}
          />

          <motion.div
            className="relative w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, rgba(200,170,110,0.14), rgba(200,170,110,0.04))',
              border: '1.5px solid rgba(200,170,110,0.22)',
              boxShadow: '0 0 50px rgba(200,170,110,0.08), inset 0 1px 0 rgba(200,170,110,0.08)',
            }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sword className="w-8 h-8" style={{ color: '#c8aa6e' }} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-[28px] sm:text-[32px] font-black tracking-[0.22em] mb-0.5"
          style={{
            color: '#c8aa6e',
            fontFamily: 'var(--font-cinzel), serif',
            textShadow: '0 0 30px rgba(200,170,110,0.35), 0 0 60px rgba(200,170,110,0.12)',
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          MOBA SAGE
        </motion.h1>

        <motion.p
          className="text-[10px] tracking-[0.25em] uppercase mb-1"
          style={{ color: '#5b5a56' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {getGreeting()}, invocador
        </motion.p>

        {/* CARGANDO DATOS */}
        <motion.div
          className="mb-5 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="w-3 h-3 rounded-full"
            style={{
              border: '2px solid rgba(200,170,110,0.2)',
              borderTopColor: '#c8aa6e',
            }}
          />
          <span
            className="text-[11px] font-semibold tracking-[0.15em] uppercase"
            style={{ color: '#c8aa6e' }}
          >
            Cargando datos
          </span>
          <motion.span
            className="text-[11px]"
            style={{ color: '#785a28' }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ...
          </motion.span>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="w-full h-[3px] rounded-full overflow-hidden mb-5"
          style={{ background: 'rgba(200,170,110,0.06)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #785a28, #c8aa6e, #0acbe6)',
            }}
            animate={{ width: `${Math.max(progressPct, 5)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </motion.div>

        {/* Patch info card */}
        <motion.div
          className="w-full rounded-xl p-3 mb-3"
          style={{
            background: 'linear-gradient(135deg, rgba(30,35,40,0.65), rgba(18,22,30,0.85))',
            border: '1px solid rgba(200,170,110,0.1)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3 h-3" style={{ color: '#785a28' }} />
              <span className="text-[9px] font-semibold tracking-[0.18em] uppercase" style={{ color: '#785a28' }}>
                Versiones del juego
              </span>
            </div>
            <span className="text-[9px] font-mono" style={{ color: '#5b5a56' }}>
              {elapsed.toFixed(1)}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(10,14,26,0.5)' }}>
              <p className="text-[8px] uppercase tracking-wider mb-0.5" style={{ color: '#5b5a56' }}>League of Legends</p>
              <p className="text-base font-bold font-mono" style={{ color: '#f0e6d2' }}>
                {version ? version.lol : '...'}
              </p>
            </div>
            <div className="w-px h-7 shrink-0" style={{ background: 'rgba(200,170,110,0.08)' }} />
            <div className="flex-1 rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(10,14,26,0.5)' }}>
              <p className="text-[8px] uppercase tracking-wider mb-0.5" style={{ color: '#5b5a56' }}>Wild Rift</p>
              <p className="text-base font-bold font-mono" style={{ color: '#f0e6d2' }}>
                {version ? version.wr : '...'}
              </p>
            </div>
            <div className="w-px h-7 shrink-0" style={{ background: 'rgba(200,170,110,0.08)' }} />
            <div className="flex-1 rounded-lg px-2.5 py-1.5 flex flex-col items-center justify-center" style={{ background: 'rgba(10,14,26,0.5)' }}>
              <p className="text-[8px] uppercase tracking-wider mb-0.5" style={{ color: '#5b5a56' }}>CDN</p>
              <div className="flex items-center gap-1">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: version?.ddragonStatus === 'live' ? '#0fba81' : '#f0c646' }}
                />
                <span className="text-[10px] font-bold font-mono" style={{
                  color: version?.ddragonStatus === 'live' ? '#0fba81' : '#f0c646',
                }}>
                  {version?.ddragonStatus === 'live' ? 'LIVE' : '...'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid rgba(200,170,110,0.06)' }}>
            <span className="text-[8px]" style={{ color: '#5b5a56' }}>
              Meta: <span style={{ color: '#785a28' }}>{version?.metaLastUpdated ? formatDate(version.metaLastUpdated) : '...'}</span>
            </span>
            <span className="text-[8px]" style={{ color: '#5b5a56' }}>
              Datos: <span style={{ color: '#785a28' }}>{version?.fetchedAt ? formatTime(version.fetchedAt) : '...'}</span>
            </span>
          </div>
        </motion.div>

        {/* Data Sources card */}
        <motion.div
          className="w-full rounded-xl p-3 mb-3"
          style={{
            background: 'linear-gradient(135deg, rgba(30,35,40,0.65), rgba(18,22,30,0.85))',
            border: '1px solid rgba(10,203,230,0.06)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3" style={{ color: '#0acbe6' }} />
              <span className="text-[9px] font-semibold tracking-[0.18em] uppercase" style={{ color: '#0acbe6' }}>
                Fuentes de datos
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-mono" style={{ color: '#5b5a56' }}>
                {doneCount}/{sources.length}
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: doneCount === sources.length ? '#0fba81' : '#f0c646' }}
              />
            </div>
          </div>

          <div className="space-y-1">
            {sources.map((source, i) => (
              <motion.div
                key={source.id}
                className="flex items-center justify-between rounded-lg px-2.5 py-[6px]"
                style={{
                  background: source.status === 'loading'
                    ? 'rgba(200,170,110,0.04)'
                    : 'rgba(10,14,26,0.35)',
                }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.06, duration: 0.2 }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative shrink-0">
                    {source.status === 'loading' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-3 h-3 rounded-sm"
                        style={{
                          border: '1.5px solid rgba(200,170,110,0.2)',
                          borderTopColor: source.color,
                        }}
                      />
                    ) : source.status === 'done' ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        className="w-3 h-3 rounded-full flex items-center justify-center"
                        style={{ background: `${source.color}22` }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: source.color }} />
                      </motion.div>
                    ) : (
                      <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(91,90,86,0.15)' }} />
                    )}
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: source.status === 'pending' ? '#3d3c38' : '#a09b8c' }}>
                    {source.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {source.records && source.status === 'done' && (
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{
                      background: `${source.color}10`,
                      color: source.color,
                    }}>
                      {source.records}
                    </span>
                  )}
                  <span className="text-[9px] font-mono max-w-[110px] truncate text-right" style={{
                    color: source.status === 'loading'
                      ? '#c8aa6e'
                      : source.status === 'done'
                        ? '#5b5a56'
                        : '#3d3c38',
                  }}>
                    {source.status === 'pending' ? 'En espera' : source.detail}
                  </span>
                  {source.latency !== undefined && source.status === 'done' && (
                    <span className="text-[8px] font-mono" style={{ color: source.latency < 500 ? '#0fba81' : '#f0c646' }}>
                      {source.latency}ms
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Steps (compact) */}
        <motion.div
          className="w-full space-y-1.5 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 px-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 + i * 0.12, duration: 0.2 }}
            >
              <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{
                background: s.done
                  ? 'rgba(15,186,129,0.12)'
                  : s.active && !s.done
                    ? 'rgba(200,170,110,0.12)'
                    : 'rgba(91,90,86,0.05)',
                border: `1px solid ${
                  s.done
                    ? 'rgba(15,186,129,0.25)'
                    : s.active && !s.done
                      ? 'rgba(200,170,110,0.25)'
                      : 'rgba(91,90,86,0.08)'
                }`,
              }}>
                {s.done ? (
                  <svg className="w-2.5 h-2.5" style={{ color: '#0fba81' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : s.active && !s.done ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{
                      border: '1.5px solid rgba(200,170,110,0.2)',
                      borderTopColor: '#c8aa6e',
                    }}
                  />
                ) : (
                  <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(91,90,86,0.2)' }} />
                )}
              </div>
              <span className="text-[10px]" style={{
                color: s.done ? '#0fba8180' : s.active && !s.done ? '#c8aa6e' : '#3d3c38',
              }}>
                {s.label}
              </span>
              {s.active && !s.done && (
                <motion.div className="flex gap-0.5 ml-auto">
                  {[0, 1, 2].map(dot => (
                    <motion.div
                      key={dot}
                      className="w-[3px] h-[3px] rounded-full"
                      style={{ background: '#c8aa6e' }}
                      animate={{ opacity: [0.2, 0.8, 0.2] }}
                      transition={{ duration: 1, repeat: Infinity, delay: dot * 0.2 }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Stats footer */}
        <motion.div
          className="w-full rounded-xl p-2.5"
          style={{
            background: 'rgba(30,35,40,0.4)',
            border: '1px solid rgba(200,170,110,0.05)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.4 }}
        >
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-[8px] uppercase tracking-wider" style={{ color: '#5b5a56' }}>Campeones</p>
              <p className="text-sm font-bold font-mono" style={{ color: champCount ? '#f0e6d2' : '#3d3c38' }}>
                {champCount ?? '...'}
              </p>
            </div>
            <div className="w-px h-6" style={{ background: 'rgba(200,170,110,0.06)' }} />
            <div className="text-center">
              <p className="text-[8px] uppercase tracking-wider" style={{ color: '#5b5a56' }}>Fuentes</p>
              <p className="text-sm font-bold font-mono" style={{ color: '#f0e6d2' }}>
                {doneCount}/{sources.length}
              </p>
            </div>
            <div className="w-px h-6" style={{ background: 'rgba(200,170,110,0.06)' }} />
            <div className="text-center">
              <p className="text-[8px] uppercase tracking-wider" style={{ color: '#5b5a56' }}>Estado</p>
              <p className="text-sm font-bold" style={{
                color: doneCount === sources.length ? '#0fba81' : '#f0c646',
              }}>
                {doneCount === sources.length ? 'Listo' : 'Cargando'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom shimmer */}
        <motion.div
          className="w-full h-[1px] mt-4 rounded-full overflow-hidden"
          style={{ background: 'rgba(200,170,110,0.04)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.3 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(200,170,110,0.4) 50%, transparent 100%)',
              width: '40%',
            }}
            initial={{ x: '-40%' }}
            animate={{ x: '140%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        <motion.p
          className="text-[7px] mt-2.5 tracking-wider"
          style={{ color: '#2a2a26' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.3 }}
        >
          MOBA SAGE v0.3.0 — Datos de Riot Games y comunidad — No afiliado a Riot Games
        </motion.p>
      </div>
    </motion.div>
  );
}
