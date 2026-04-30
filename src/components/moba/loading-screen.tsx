'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sword, Shield, Swords, TrendingUp,
  Zap, Trophy, Flame, Sparkles, ChevronRight,
  Lightbulb, Activity, Database, Radio, Clock
} from 'lucide-react';
import { APP_NAME, APP_VERSION } from '@/data/constants';
import { C } from '@/components/moba/theme-colors';
import { timeAgo, formatTime, formatDateShort } from '@/lib/time';

/* ================================================================
   MOBA SAGE — Loading Screen v10.0
   - Animated SVG progress ring around logo
   - Data stream bars with fill animation
   - Animated big number counter (0 → N)
   - Data freshness gauge (visual data age)
   - REAL timestamps with hours/minutes (ARG timezone)
   - Cinematic staggered intro with grid BG + scan line
   - Real data integration (dataReady prop)
   - Keyboard support (Enter / Escape)
   ================================================================ */

// ---- Animated counter hook ----

interface VersionInfo {
  lol: string;
  wr: string;
  gamePatch: string;
  metaLastUpdated: string;
  fetchedAt: string;
  ddragonStatus: string;
}

interface LoadingScreenProps {
  onSkip?: () => void;
  dataReady?: boolean;
  fetchError?: boolean;
  dataStats?: {
    champions: number;
    insights: number;
    proPicks: number;
    combos: number;
    patches: number;
  };
}

// ---- Animated counter hook ----
function useAnimatedCounter(target: number, duration: number, shouldStart: boolean) {
  const [value, setValue] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!shouldStart || hasStarted.current) return;
    hasStarted.current = true;

    const startTime = Date.now();
    let raf: number;
    const tick = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shouldStart, target, duration]);

  return value;
}

const TIPS = [
  'Sabias que el invocador con mas partidas tiene mas de 30,000 games?',
  'El porcentaje de winrate ideal para escalar es 54-56%.',
  'Wardear el bosque enemigo en los primeros 3 min puede prevenir ganks.',
  'Los campeones con mas bans son Zeri, Yuumi e Irelia.',
  'CS > Kills. 15 minions = 1 kill de oro aproximadamente.',
  'El Flash tiene cooldown de 300s (5 min). Contalo en tu head.',
  'El Baron Nashor da 300g de experiencia al equipo.',
  'Un buen soporte puede ganar el 70% en early game.',
  'El control de vision es el factor mas importante en ranked.',
  'Los pro players hacen 7-10 CS por minuto en promedio.',
];

// SVG progress ring constants
const RING_RADIUS = 38;
const RING_STROKE = 3;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

export function LoadingScreen({ onSkip, dataReady = false, fetchError = false, dataStats }: LoadingScreenProps) {
  const [version, setVersion] = useState<VersionInfo | null>(null);
  const [mountedAt] = useState(() => Date.now());
  const [tipIdx, setTipIdx] = useState(0);
  // Current time (updates every second for live clock display)
  const [now, setNow] = useState(() => Date.now());

  // Fetch version data
  useEffect(() => {
    fetch('/api/version').then(r => r.json()).then(d => setVersion(d)).catch(() => {});
  }, []);

  // Tip rotation — one render per 3.5s (was 20/s before)
  useEffect(() => {
    const iv = setInterval(() => {
      setTipIdx(prev => (prev + 1) % TIPS.length);
    }, 3500);
    return () => clearInterval(iv);
  }, []);

  // Time updater — 1 tick/sec for live elapsed time & timeAgo (was 50ms)
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Keyboard: Enter / Escape to skip
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      onSkip?.();
    }
  }, [onSkip]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getGreeting = () => {
    const h = parseInt(new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: 'numeric',
      hour12: false,
    }).format(new Date()), 10);
    if (h >= 5 && h < 12) return 'Buenos dias';
    if (h >= 12 && h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // ---- Data sources config (time-based stagger) ----
  const sources = [
    { id: 'ddragon',   name: 'Data Dragon (Riot)',   icon: <Shield className="w-3.5 h-3.5" />,     color: '#c8aa6e', num: version ? 1 : 0,                label: 'CDN Live',       appearAt: 100,  doneAt: 400 },
    { id: 'champions', name: 'Campeones',             icon: <Swords className="w-3.5 h-3.5" />,    color: '#0acbe6', num: dataStats?.champions ?? 0,       label: 'cargados',      appearAt: 300,  doneAt: 700 },
    { id: 'tierlist',  name: 'Meta & Insights',        icon: <TrendingUp className="w-3.5 h-3.5" />, color: '#0fba81', num: dataStats?.insights ?? 0,        label: 'generados',     appearAt: 520,  doneAt: 1020 },
    { id: 'probuilds', name: 'Pro Builds & Picks',     icon: <Trophy className="w-3.5 h-3.5" />,    color: '#f0c646', num: dataStats?.proPicks ?? 0,        label: 'profesionales',  appearAt: 740,  doneAt: 1320 },
    { id: 'insights',  name: 'IA Engine',             icon: <Sparkles className="w-3.5 h-3.5" />,  color: '#a78bfa', num: 1,                               label: 'listo',          appearAt: 940,  doneAt: 1520 },
    { id: 'combos',    name: 'Combos Rotos',          icon: <Flame className="w-3.5 h-3.5" />,     color: '#e84057', num: dataStats?.combos ?? 0,          label: 'identificados',  appearAt: 1120, doneAt: 1720 },
    { id: 'patches',   name: 'Patch Notes',           icon: <Zap className="w-3.5 h-3.5" />,       color: '#785a28', num: dataStats?.patches ?? 0,         label: 'analizados',    appearAt: 1300, doneAt: 2000 },
  ];

  // ---- Derived state (recalculated every render) ----
  const ms = now - mountedAt;
  const progress = dataReady ? 100 : Math.min(100, (ms / 2000) * 100);

  const sourceStates = sources.map(s => {
    const done = dataReady || ms >= s.doneAt;
    const visible = ms >= s.appearAt;
    const loading = visible && !done;
    const barPct = done ? 100 : loading ? Math.min(100, ((ms - s.appearAt) / (s.doneAt - s.appearAt)) * 100) : 0;
    return { ...s, done, visible, loading, barPct };
  });

  const doneCount = sourceStates.filter(s => s.done).length;
  const allDone = doneCount === sources.length;
  const ringOffset = RING_CIRC - (progress / 100) * RING_CIRC;

  // ---- Freshness calculation ----
  const freshness = (() => {
    if (!version?.fetchedAt) return { pct: 0, label: 'Cargando...', color: C.dim };
    const hours = (now - new Date(version.fetchedAt).getTime()) / 3600000;
    if (hours < 0.5) return { pct: 100, label: 'Ultra fresco', color: C.green };
    if (hours < 2)   return { pct: 82,  label: 'Fresco',     color: C.green };
    if (hours < 6)   return { pct: 55,  label: 'Aceptable',  color: C.warning };
    if (hours < 24)  return { pct: 28,  label: 'Antiguo',    color: C.danger };
    return { pct: 10, label: 'Muy antiguo', color: C.danger };
  })();

  // ---- Big animated total counter ----
  const totalRecords = (dataStats?.champions ?? 0) + (dataStats?.insights ?? 0) + (dataStats?.proPicks ?? 0) + (dataStats?.combos ?? 0) + (dataStats?.patches ?? 0);
  const displayTotal = useAnimatedCounter(totalRecords, 1800, dataReady);

  // ============ RENDER ============
  return (
    <motion.div
      className="fixed inset-0 z-[210] flex flex-col items-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      style={{ backgroundColor: '#050810' }}
    >
      {/* ======= BACKGROUND LAYERS ======= */}
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(200,170,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,170,110,1) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      {/* Animated horizontal scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(200,170,110,0.5) 50%, transparent 95%)', opacity: 0.15 }}
        animate={{ top: ['-2%', '102%'] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
      />
      {/* Second scan line (offset) */}
      <motion.div
        className="absolute left-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(10,203,230,0.3) 50%, transparent 90%)', opacity: 0.08 }}
        animate={{ top: ['102%', '-2%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />
      {/* Gradient orbs */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 18%, rgba(200,170,110,0.06) 0%, transparent 50%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 18% 78%, rgba(10,203,230,0.03) 0%, transparent 35%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 82% 62%, rgba(15,186,129,0.025) 0%, transparent 30%)' }} />

      {/* ======= SCROLLABLE CONTENT ======= */}
      <div className="relative z-10 w-full max-w-[420px] px-5 py-8 flex flex-col items-center overflow-y-auto scrollbar-none" style={{ maxHeight: '100vh' }}>

        {/* ---- LOGO + PROGRESS RING ---- */}
        <motion.div className="relative mb-3" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
          {/* SVG progress ring */}
          <svg className="absolute" style={{ inset: '-16px' }} width="96" height="96" viewBox="0 0 96 96" fill="none">
            {/* Background track */}
            <circle cx="48" cy="48" r={RING_RADIUS} stroke="rgba(200,170,110,0.06)" strokeWidth={RING_STROKE} />
            {/* Progress arc */}
            <motion.circle
              cx="48" cy="48" r={RING_RADIUS}
              stroke={allDone ? '#0fba81' : 'url(#ringGrad)'}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              animate={{ strokeDashoffset: ringOffset }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', filter: allDone ? 'drop-shadow(0 0 6px rgba(15,186,129,0.5))' : 'drop-shadow(0 0 3px rgba(200,170,110,0.25))' }}
            />
            {/* Gradient def */}
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#785a28" />
                <stop offset="50%" stopColor="#c8aa6e" />
                <stop offset="100%" stopColor="#0acbe6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Rotating dashed outer ring */}
          <motion.div className="absolute" style={{ inset: '-12px' }} animate={{ rotate: 360 }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}>
            <div className="w-full h-full rounded-full" style={{ border: '1px dashed rgba(200,170,110,0.06)' }} />
          </motion.div>

          {/* Logo icon container */}
          <motion.div
            className="relative w-[64px] h-[64px] rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(145deg, rgba(200,170,110,0.12), rgba(200,170,110,0.03))', border: '1.5px solid rgba(200,170,110,0.15)' }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sword className="w-7 h-7 text-lol-gold" />
            {/* Done glow pulse */}
            {allDone && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: '0 0 35px rgba(15,186,129,0.3)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>

          {/* Percentage badge */}
          <motion.div
            className="absolute -bottom-1 -right-1 min-w-[32px] h-8 rounded-full flex items-center justify-center px-1.5 text-[10px] font-mono font-bold"
            style={{
              background: allDone ? 'rgba(15,186,129,0.12)' : 'rgba(10,14,26,0.95)',
              border: `1.5px solid ${allDone ? 'rgba(15,186,129,0.3)' : 'rgba(200,170,110,0.12)'}`,
              color: allDone ? '#0fba81' : '#c8aa6e',
            }}
            animate={{ scale: allDone ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 0.6 }}
          >
            {Math.round(progress)}%
          </motion.div>
        </motion.div>

        {/* ---- TITLE ---- */}
        <motion.h1
          className="text-[28px] sm:text-[32px] font-black tracking-[0.25em] mb-0.5"
          style={{ color: '#c8aa6e', fontFamily: 'var(--font-cinzel), serif', textShadow: '0 0 40px rgba(200,170,110,0.3)' }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
        >
          MOBA SAGE
        </motion.h1>
        <motion.p className="text-[10px] tracking-[0.2em] uppercase mb-3 text-lol-dim"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.4 }}>
          {getGreeting()}, invocador
        </motion.p>

        {/* ---- BIG DATA COUNTER (appears when data loads) ---- */}
        <motion.div
          className="flex items-center gap-2 mb-3 h-5"
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: dataReady ? 1 : 0, y: dataReady ? 0 : 4 }}
          transition={{ duration: 0.5 }}
        >
          <Database className="w-3.5 h-3.5 text-lol-success shrink-0" />
          <span className="text-[13px] font-bold font-mono text-lol-text">{displayTotal.toLocaleString()}</span>
          <span className="text-[10px] text-lol-dim">registros de datos</span>
          <motion.div className="w-1.5 h-1.5 rounded-full bg-lol-green ml-1"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </motion.div>

        {/* ---- DATA STREAMS PANEL ---- */}
        <motion.div
          className="w-full rounded-xl overflow-hidden mb-3"
          style={{ background: 'linear-gradient(180deg, rgba(18,22,30,0.85), rgba(10,14,26,0.95))', border: '1px solid rgba(200,170,110,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-3 h-3 text-lol-success" />
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-lol-gold-dark">Data Streams</span>
            </div>
            <div className="flex items-center gap-1.5">
              <motion.div className="w-1.5 h-1.5 rounded-full"
                style={{ background: allDone ? '#0fba81' : '#f0c646' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }} />
              <span className="text-[10px] font-mono font-bold" style={{ color: allDone ? '#0fba81' : '#f0c646' }}>
                {doneCount}/{sources.length}
              </span>
            </div>
          </div>

          {/* Source rows with fill bars */}
          <div className="px-3 pb-3 space-y-[3px]">
            {sourceStates.map((src, i) => (
              <motion.div key={src.id} className="rounded-lg overflow-hidden"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: src.visible ? 1 : 0, x: 0 }}
                transition={{ duration: 0.25, delay: Math.max(0, (src.appearAt - 100) / 1000) }}
              >
                {/* Row content */}
                <div className="flex items-center gap-2 px-2.5 py-[5px]">
                  {/* Status dot */}
                  <div className="relative shrink-0 w-4 h-4 flex items-center justify-center">
                    {src.loading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-3 h-3 rounded-sm" style={{ border: '1.5px solid rgba(200,170,110,0.1)', borderTopColor: src.color }} />
                    ) : src.done ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: src.color, boxShadow: `0 0 6px ${src.color}60` }} />
                      </motion.div>
                    ) : (
                      <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(91,90,86,0.12)' }} />
                    )}
                  </div>

                  {/* Icon + name */}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span style={{ color: src.visible ? (src.done ? '#a09b8c' : src.color) : '#3d3c38' }}>{src.icon}</span>
                    <span className="text-[10px] truncate" style={{ color: src.visible ? (src.done ? '#a09b8c' : '#785a28') : '#2a2a28' }}>
                      {src.name}
                    </span>
                  </div>

                  {/* Number + label */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    {src.done && (
                      <motion.span className="text-[10px] font-mono font-bold" style={{ color: src.color }}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        {src.num}
                      </motion.span>
                    )}
                    {src.done && (
                      <span className="text-[9px] text-lol-dim hidden sm:inline">{src.label}</span>
                    )}
                    {src.loading && (
                      <span className="text-[9px]" style={{ color: src.color }}>
                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}>
                          conectando
                        </motion.span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Fill bar underneath */}
                <div className="h-[2px] mx-2.5 mb-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(200,170,110,0.03)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{
                      background: src.done
                        ? src.color
                        : `linear-gradient(90deg, ${src.color}30, ${src.color}90)`,
                      boxShadow: src.done ? `0 0 8px ${src.color}30` : 'none',
                    }}
                    animate={{ width: `${Math.max(src.barPct, 0)}%` }}
                    transition={{ duration: src.done ? 0.25 : 0.4, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ---- FRESHNESS + VERSION PANEL ---- */}
        <motion.div
          className="w-full rounded-xl p-3 mb-3"
          style={{ background: 'linear-gradient(135deg, rgba(18,22,30,0.7), rgba(10,14,26,0.85))', border: '1px solid rgba(200,170,110,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4 }}
        >
          {/* Freshness header + live clock badge */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-lol-success" />
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-lol-gold-dark">Data Frescura</span>
            </div>
            <div className="flex items-center gap-1.5">
              <motion.div className="w-1.5 h-1.5 rounded-full"
                style={{ background: freshness.color }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <span className="text-[10px] font-bold" style={{ color: freshness.color }}>{freshness.label}</span>
            </div>
          </div>

          {/* Freshness gauge bar */}
          <div className="w-full h-[4px] rounded-full overflow-hidden mb-3" style={{ background: 'rgba(200,170,110,0.04)' }}>
            <motion.div className="h-full rounded-full"
              style={{ background: freshness.color, boxShadow: `0 0 10px ${freshness.color}25` }}
              animate={{ width: `${freshness.pct}%` }}
              transition={{ duration: 1.8, ease: 'easeOut', delay: 0.6 }}
            />
          </div>

          {/* Timestamp rows — actual hours of data freshness */}
          {version?.fetchedAt && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(10,14,26,0.5)' }}>
                <p className="text-[9px] uppercase tracking-wider text-lol-dim mb-0.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#0fba81' }} />
                  Datos obtenidos
                </p>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" style={{ color: '#0fba81' }} />
                  <p className="text-[16px] font-bold font-mono text-lol-text leading-tight">{formatTime(version.fetchedAt)}</p>
                </div>
                <p className="text-[9px] font-mono mt-0.5 text-lol-dim">
                  {formatDateShort(version.fetchedAt)} &middot; {timeAgo(version.fetchedAt)}
                </p>
              </div>
              <div className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(10,14,26,0.5)' }}>
                <p className="text-[9px] uppercase tracking-wider text-lol-dim mb-0.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#0acbe6' }} />
                  Meta actualizada
                </p>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" style={{ color: '#0acbe6' }} />
                  <p className="text-[16px] font-bold font-mono text-lol-text leading-tight">
                    {version?.metaLastUpdated ? formatTime(version.metaLastUpdated) : '...'}
                  </p>
                </div>
                <p className="text-[9px] font-mono mt-0.5 text-lol-dim">
                {version?.metaLastUpdated ? `${formatDateShort(version.metaLastUpdated)} · ${timeAgo(version.metaLastUpdated)}` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Version grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(10,14,26,0.5)' }}>
              <p className="text-[9px] uppercase tracking-wider text-lol-dim mb-0.5">LoL</p>
              <p className="text-[15px] font-bold font-mono text-lol-text leading-tight">{version ? version.lol : '...'}</p>
            </div>
            <div className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(10,14,26,0.5)' }}>
              <p className="text-[9px] uppercase tracking-wider text-lol-dim mb-0.5">Wild Rift</p>
              <p className="text-[15px] font-bold font-mono text-lol-text leading-tight">{version ? version.wr : '...'}</p>
            </div>
            <div className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(10,14,26,0.5)' }}>
              <p className="text-[9px] uppercase tracking-wider text-lol-dim mb-1">CDN</p>
              <div className="flex items-center gap-1">
                <motion.div className="w-1.5 h-1.5 rounded-full"
                  style={{ background: version?.ddragonStatus === 'live' ? '#0fba81' : '#f0c646' }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
                <span className="text-[10px] font-bold font-mono" style={{ color: version?.ddragonStatus === 'live' ? '#0fba81' : '#f0c646' }}>
                  {version?.ddragonStatus === 'live' ? 'LIVE' : '...'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ---- TIP CARD ---- */}
        <motion.div className="w-full rounded-xl p-3 mb-4"
          style={{ background: 'linear-gradient(135deg, rgba(120,90,40,0.06), rgba(18,22,30,0.4))', border: '1px solid rgba(200,170,110,0.04)' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }}>
          <div className="flex items-start gap-2">
            <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-lol-warning" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-1 text-lol-gold-dark">Tip del dia</p>
              <AnimatePresence mode="wait">
                <motion.p key={tipIdx} className="text-[10px] leading-relaxed text-lol-muted"
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }}>
                  {TIPS[tipIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ---- ENTRAR BUTTON ---- */}
        {onSkip && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.4 }} className="w-full mb-3">
            <motion.button type="button" onClick={onSkip}
              className="w-full py-3.5 rounded-xl text-sm font-bold tracking-[0.12em] uppercase cursor-pointer relative overflow-hidden"
              style={{
                background: allDone ? 'linear-gradient(135deg, #c8aa6e, #785a28)' : 'linear-gradient(135deg, rgba(200,170,110,0.12), rgba(120,90,40,0.06))',
                border: allDone ? '1.5px solid rgba(200,170,110,0.5)' : '1.5px solid rgba(200,170,110,0.18)',
                color: allDone ? '#0a0e1a' : '#c8aa6e',
                boxShadow: allDone ? '0 0 30px rgba(200,170,110,0.2), 0 4px 16px rgba(0,0,0,0.4)' : 'none',
              }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {/* Shimmer sweep when done */}
              {allDone && (
                <motion.div className="absolute inset-0"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }}
                  initial={{ x: '-100%' }} animate={{ x: '200%' }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 0.8 }} />
              )}
              <div className="relative flex items-center justify-center gap-2">
                <Sword className="w-4 h-4" />
                <span>{allDone ? 'Entrar a MOBA SAGE' : 'Entrar'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.button>

            <div className="flex items-center justify-center gap-3 mt-2">
              {!allDone && (
                <motion.span className="text-[10px] tracking-wider text-lol-dim"
                  animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                  {doneCount}/{sources.length} fuentes
                </motion.span>
              )}
              <span className="text-[10px] tracking-wider" style={{ color: '#222220' }}>Enter para entrar</span>
            </div>
          </motion.div>
        )}

        {/* ---- BOTTOM ACCENT LINE ---- */}
        <motion.div className="w-full h-[1px] rounded-full overflow-hidden" style={{ background: 'rgba(200,170,110,0.02)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,170,110,0.18), transparent)', width: '40%' }}
            initial={{ x: '-40%' }} animate={{ x: '140%' }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
        </motion.div>
        <motion.p className="text-[9px] mt-1.5 tracking-wider" style={{ color: '#1a1a18' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
          {APP_NAME} v{APP_VERSION} — Datos de Riot Games — No afiliado a Riot Games
        </motion.p>
      </div>
    </motion.div>
  );
}
