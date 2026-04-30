'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import {
  Sword, Database, Shield, Swords, TrendingUp,
  Zap, Globe, Trophy, Flame, Sparkles, ChevronRight,
  Lightbulb, CircleDot
} from 'lucide-react';
import { APP_NAME, APP_VERSION } from '@/data/constants';

/* ================================================================
   MOBA SAGE — Loading Screen v8.0
   - Scrollable on short screens
   - No redundant steps (removed)
   - Bigger progress bar with percentage
   - Rotating LoL tips while loading
   - Keyboard support (Enter / Escape to enter)
   - Clean visual hierarchy
   - "Entrar" button always visible
   ================================================================ */

interface VersionInfo {
  lol: string;
  wr: string;
  gamePatch: string;
  metaLastUpdated: string;
  fetchedAt: string;
  ddragonStatus: string;
}

interface SourceDef {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  doneLabel: string;
  records: string;
  appearAt: number;
  doneAt: number;
}

const TIPS = [
  'Sabias que el invocador con mas partidas tiene mas de 30,000 games?',
  'El porcentaje de winrate ideal para escalar es 54-56%.',
  'Wardear el bosque enemigo en los primeros 3 minutos puede prevenir ganks.',
  'Los campeones con mas bans en ranked son Zeri, Yuumi y Irelia.',
  'CS > Kills. 15 minions = 1 kill de oro aproximadamente.',
  'El flash tiene un cooldown de 300s (5 min). Contalo en tu head.',
  'El Baron Nashor da 300g de experiencia al equipo que lo mata.',
  'Un buen soporte puede ganar el 70% de las partidas en el early game.',
  'El control de vision es el factor mas importante en ranked.',
  'Los pro players hacen entre 7-10 CS por minuto en promedio.',
];

export interface LoadingScreenProps {
  onSkip?: () => void;
  dataStats?: {
    champions: number;
    insights: number;
    proPicks: number;
    combos: number;
    patches: number;
  };
}

export function LoadingScreen({ onSkip, dataStats }: LoadingScreenProps) {
  const [version, setVersion] = useState<VersionInfo | null>(null);
  const [, setElapsed] = useState(0);
  const [mountedAt] = useState(() => Date.now());
  const [tipIdx, setTipIdx] = useState(0);

  // Fetch version for display
  useEffect(() => {
    fetch('/api/version')
      .then(r => r.json())
      .then(d => setVersion(d))
      .catch(() => {});
  }, []);

  // Timer + tip rotation
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      setElapsed(Math.floor((now - mountedAt) / 100) / 10);
      // Rotate tip every 3s
      const idx = Math.floor((now - mountedAt) / 3000) % TIPS.length;
      setTipIdx(idx);
    }, 100);
    return () => clearInterval(iv);
  }, [mountedAt]);

  // Keyboard support: Enter or Escape to skip
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
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Buenos dias';
    if (h >= 12 && h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const formatDate = (iso: string) => {
    if (!iso) return '...';
    const d = new Date(iso);
    const m = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
  };

  // 7 data sources — staggered across 2s minimum display time
  const sources: SourceDef[] = [
    { id: 'ddragon',   name: 'Data Dragon (Riot Games)',    icon: <Shield className="w-3.5 h-3.5" />,     color: '#c8aa6e', doneLabel: version ? `v${version.lol} (CDN Live)` : 'v16.9.1', records: 'Live',     appearAt: 120,   doneAt: 440 },
    { id: 'champions', name: 'Base de Campeones',            icon: <Swords className="w-3.5 h-3.5" />,    color: '#0acbe6', doneLabel: dataStats ? `${dataStats.champions} campeones cargados` : '-- campeones',                 records: dataStats ? String(dataStats.champions) : '--',   appearAt: 320,  doneAt: 760 },
    { id: 'tierlist',  name: 'Tier List & Meta Data',         icon: <TrendingUp className="w-3.5 h-3.5" />, color: '#0fba81', doneLabel: dataStats ? `${dataStats.insights} insights generados` : '-- insights',                   records: dataStats ? String(dataStats.insights) : '--',    appearAt: 560,  doneAt: 1040 },
    { id: 'probuilds', name: 'Pro Builds & Tournament Picks', icon: <Trophy className="w-3.5 h-3.5" />,    color: '#f0c646', doneLabel: dataStats ? `${dataStats.proPicks} picks profesionales` : '-- picks profesionales',   records: dataStats ? String(dataStats.proPicks) : '--',    appearAt: 760,  doneAt: 1300 },
    { id: 'insights',  name: 'Insights de IA',               icon: <Sparkles className="w-3.5 h-3.5" />,  color: '#a78bfa', doneLabel: 'Modelo IA preparado',                               records: 'IA',      appearAt: 960,  doneAt: 1500 },
    { id: 'combos',    name: 'Combos Rotos',                icon: <Flame className="w-3.5 h-3.5" />,     color: '#e84057', doneLabel: dataStats ? `${dataStats.combos} combos identificados` : '-- combos',                     records: dataStats ? String(dataStats.combos) : '--',    appearAt: 1120,  doneAt: 1700 },
    { id: 'patches',   name: 'Patch Notes & Cambios',         icon: <Zap className="w-3.5 h-3.5" />,       color: '#785a28', doneLabel: dataStats ? `${dataStats.patches} parches analizados` : '-- parches',                   records: dataStats ? String(dataStats.patches) : '--',    appearAt: 1360,  doneAt: 2000 },
  ];

  const ms = Date.now() - mountedAt;
  const doneCount = sources.filter(s => ms >= s.doneAt).length;
  const allDone = doneCount === sources.length;
  const progressPct = Math.min(100, Math.round((ms / 2000) * 100));

  return (
    <motion.div
      className="fixed inset-0 z-[210] flex flex-col items-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      style={{ backgroundColor: '#060a12' }}
    >
      {/* BG layers */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 15%, rgba(200,170,110,0.08) 0%, transparent 50%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(10,203,230,0.04) 0%, transparent 35%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 70%, rgba(15,186,129,0.03) 0%, transparent 30%)' }} />

      {/* Animated floating orbs */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(200,170,110,0.03) 0%, transparent 70%)', top: '10%', left: '-5%' }}
        animate={{ x: [0, 30, -10, 20, 0], y: [0, -20, 10, -15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[250px] h-[250px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(10,203,230,0.02) 0%, transparent 70%)', bottom: '10%', right: '-5%' }}
        animate={{ x: [0, -20, 15, -10, 0], y: [0, 15, -20, 10, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Scrollable content area */}
      <div className="relative z-10 w-full max-w-[400px] px-5 py-8 flex flex-col items-center overflow-y-auto scrollbar-none" style={{ maxHeight: '100vh' }}>

        {/* Logo */}
        <motion.div className="relative mb-4" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
          <motion.div className="absolute -inset-5" animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}>
            <div className="w-full h-full rounded-full" style={{ border: '1px dashed rgba(200,170,110,0.1)' }} />
          </motion.div>
          <motion.div
            className="relative w-[64px] h-[64px] rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(145deg, rgba(200,170,110,0.14), rgba(200,170,110,0.04))', border: '1.5px solid rgba(200,170,110,0.2)', boxShadow: '0 0 40px rgba(200,170,110,0.06)' }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sword className="w-7 h-7 text-lol-gold" />
          </motion.div>
        </motion.div>

        {/* Title + Greeting */}
        <motion.h1 className="text-[26px] sm:text-[30px] font-black tracking-[0.2em] mb-0.5"
          style={{ color: '#c8aa6e', fontFamily: 'var(--font-cinzel), serif', textShadow: '0 0 30px rgba(200,170,110,0.3)' }}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
          MOBA SAGE
        </motion.h1>
        <motion.p className="text-[10px] tracking-[0.2em] uppercase mb-4 text-lol-dim"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.4 }}>
          {getGreeting()}, invocador
        </motion.p>

        {/* Progress bar — bigger, with percentage */}
        <motion.div className="w-full mb-5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.3 }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: allDone ? '#0fba81' : '#c8aa6e' }}>
              {allDone ? 'Todo listo' : 'Cargando datos'}
            </span>
            <span className="text-[10px] font-mono font-bold" style={{ color: allDone ? '#0fba81' : '#785a28' }}>
              {progressPct}%
            </span>
          </div>
          <div className="w-full h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(200,170,110,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: allDone
                  ? 'linear-gradient(90deg, #0fba81, #0fba81cc)'
                  : 'linear-gradient(90deg, #785a28, #c8aa6e, #0acbe6)',
                boxShadow: allDone ? '0 0 12px rgba(15,186,129,0.4)' : '0 0 8px rgba(200,170,110,0.15)',
              }}
              animate={{ width: `${Math.max(progressPct, 1)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Patch info card — compact */}
        <motion.div className="w-full rounded-xl p-3 mb-3"
          style={{ background: 'linear-gradient(135deg, rgba(30,35,40,0.6), rgba(18,22,30,0.8))', border: '1px solid rgba(200,170,110,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-lol-gold-dark" />
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-lol-gold-dark">Versiones</span>
            </div>
            <div className="flex items-center gap-1.5">
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full" style={{ background: version?.ddragonStatus === 'live' ? '#0fba81' : '#f0c646' }} />
              <span className="text-[10px] font-mono font-bold" style={{ color: version?.ddragonStatus === 'live' ? '#0fba81' : '#f0c646' }}>
                {version?.ddragonStatus === 'live' ? 'CDN LIVE' : '...'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(10,14,26,0.5)' }}>
              <p className="text-[10px] uppercase tracking-wider mb-0.5 text-lol-dim">LoL</p>
              <p className="text-[15px] font-bold font-mono text-lol-text">{version ? version.lol : '...'}</p>
            </div>
            <div className="w-px h-7 shrink-0" style={{ background: 'rgba(200,170,110,0.08)' }} />
            <div className="flex-1 rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(10,14,26,0.5)' }}>
              <p className="text-[10px] uppercase tracking-wider mb-0.5 text-lol-dim">Wild Rift</p>
              <p className="text-[15px] font-bold font-mono text-lol-text">{version ? version.wr : '...'}</p>
            </div>
            <div className="w-px h-7 shrink-0" style={{ background: 'rgba(200,170,110,0.08)' }} />
            <div className="flex-1 rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(10,14,26,0.5)' }}>
              <p className="text-[10px] uppercase tracking-wider mb-0.5 text-lol-dim">Meta</p>
              <p className="text-[10px] font-mono font-semibold mt-0.5 text-lol-gold-dark">
                {version?.metaLastUpdated ? formatDate(version.metaLastUpdated) : '...'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data Sources card */}
        <motion.div className="w-full rounded-xl p-3 mb-3"
          style={{ background: 'linear-gradient(135deg, rgba(30,35,40,0.6), rgba(18,22,30,0.8))', border: '1px solid rgba(10,203,230,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4 }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-lol-success" />
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-lol-success">Fuentes de datos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold" style={{ color: allDone ? '#0fba81' : '#f0c646' }}>{doneCount}/{sources.length}</span>
              <CircleDot className="w-3 h-3" style={{ color: allDone ? '#0fba81' : '#f0c646' }} />
            </div>
          </div>
          <div className="space-y-0.5">
            {sources.map((source) => {
              const visible = ms >= source.appearAt;
              const done = ms >= source.doneAt;
              const loading = visible && !done;
              return (
                <motion.div key={source.id} className="flex items-center justify-between rounded-lg px-2.5 py-[6px]"
                  style={{ background: done ? `${source.color}05` : loading ? 'rgba(200,170,110,0.03)' : 'rgba(10,14,26,0.3)' }}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: visible ? 1 : 0, x: 0 }}
                  transition={{ duration: 0.2 }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          className="w-3 h-3 rounded-sm" style={{ border: '1.5px solid rgba(200,170,110,0.15)', borderTopColor: source.color }} />
                      ) : done ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                          className="w-3 h-3 rounded-full flex items-center justify-center" style={{ background: `${source.color}18` }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: source.color }} />
                        </motion.div>
                      ) : (
                        <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(91,90,86,0.12)' }} />
                      )}
                    </div>
                    <span className="text-[10px] shrink-0" style={{ color: !visible ? '#3d3c38' : done ? '#a09b8c' : '#785a28' }}>
                      {source.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {done && (
                      <span className="text-[10px] font-mono px-1 py-0.5 rounded" style={{ background: `${source.color}10`, color: source.color }}>
                        {source.records}
                      </span>
                    )}
                    <span className="text-[10px] font-mono max-w-[120px] truncate text-right" style={{
                      color: loading ? '#c8aa6e' : done ? '#5b5a56' : '#3d3c38',
                    }}>
                      {!visible ? '' : loading ? 'Conectando...' : source.doneLabel}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Tip card — rotating LoL tips */}
        <motion.div className="w-full rounded-xl p-3 mb-4"
          style={{ background: 'linear-gradient(135deg, rgba(120,90,40,0.08), rgba(18,22,30,0.5))', border: '1px solid rgba(200,170,110,0.06)' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }}>
          <div className="flex items-start gap-2">
            <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-lol-warning" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-1 text-lol-gold-dark">Tip del dia</p>
              <motion.p
                key={tipIdx}
                className="text-[10px] leading-relaxed text-lol-muted"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
              >
                {TIPS[tipIdx]}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* ===== ENTRAR BUTTON ===== */}
        {onSkip && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="w-full mb-3"
          >
            <motion.button
              type="button"
              onClick={onSkip}
              className="w-full py-3.5 rounded-xl text-sm font-bold tracking-[0.12em] uppercase cursor-pointer relative overflow-hidden"
              style={{
                background: allDone
                  ? 'linear-gradient(135deg, #c8aa6e, #785a28)'
                  : 'linear-gradient(135deg, rgba(200,170,110,0.15), rgba(120,90,40,0.1))',
                border: allDone
                  ? '1.5px solid rgba(200,170,110,0.5)'
                  : '1.5px solid rgba(200,170,110,0.25)',
                color: allDone ? '#0a0e1a' : '#c8aa6e',
                boxShadow: allDone
                  ? '0 0 30px rgba(200,170,110,0.2), 0 4px 16px rgba(0,0,0,0.4)'
                  : '0 0 8px rgba(200,170,110,0.04)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {allDone && (
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                />
              )}
              <div className="relative flex items-center justify-center gap-2">
                <Sword className="w-4 h-4" />
                <span>{allDone ? 'Entrar a MOBA SAGE' : 'Entrar'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.button>

            <div className="flex items-center justify-center gap-3 mt-2">
              {!allDone && (
                <span className="text-[10px] tracking-wider text-lol-dim">
                  {doneCount}/{sources.length} fuentes
                </span>
              )}
              <span className="text-[10px] tracking-wider" style={{ color: '#3d3c38' }}>
                Enter para entrar
              </span>
            </div>
          </motion.div>
        )}

        {/* Bottom shimmer */}
        <motion.div className="w-full h-[1px] rounded-full overflow-hidden" style={{ background: 'rgba(200,170,110,0.03)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.3 }}>
          <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,170,110,0.3), transparent)', width: '40%' }}
            initial={{ x: '-40%' }} animate={{ x: '140%' }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
        </motion.div>

        <motion.p className="text-[10px] mt-2 tracking-wider" style={{ color: '#1e1e1c' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 0.3 }}>
          {APP_NAME} v{APP_VERSION} — Datos de Riot Games y comunidad — No afiliado a Riot Games
        </motion.p>
      </div>
    </motion.div>
  );
}
