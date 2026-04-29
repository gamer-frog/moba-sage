'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sword, Database, Shield, Swords, Target, TrendingUp } from 'lucide-react';

interface VersionInfo {
  lol: string;
  wr: string;
  gamePatch: string;
  metaLastUpdated: string;
  fetchedAt?: string;
  ddragonStatus?: string;
}

interface LoadStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'loading' | 'done';
}

export function LoadingScreen() {
  const [version, setVersion] = useState<VersionInfo | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps: LoadStep[] = [
    { id: 'connect', label: 'Conectando con servidores', icon: <Database className="w-4 h-4" />, status: currentStep >= 0 ? (currentStep > 0 ? 'done' : 'loading') : 'pending' },
    { id: 'version', label: 'Verificando version del juego', icon: <Shield className="w-4 h-4" />, status: currentStep >= 1 ? (currentStep > 1 ? 'done' : 'loading') : 'pending' },
    { id: 'champions', label: 'Cargando base de campeones', icon: <Swords className="w-4 h-4" />, status: currentStep >= 2 ? (currentStep > 2 ? 'done' : 'loading') : 'pending' },
    { id: 'meta', label: 'Analizando datos del meta', icon: <TrendingUp className="w-4 h-4" />, status: currentStep >= 3 ? (currentStep > 3 ? 'done' : 'loading') : 'pending' },
    { id: 'ready', label: 'Preparando interfaz', icon: <Target className="w-4 h-4" />, status: currentStep >= 4 ? 'done' : 'pending' },
  ];

  // Fetch version data on mount
  useEffect(() => {
    async function fetchVersion() {
      try {
        const res = await fetch('/api/version');
        const data = await res.json();
        setVersion(data);
      } catch { /* silent */ }
    }
    fetchVersion();
  }, []);

  // Advance steps over time
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setCurrentStep(1), 600),
      setTimeout(() => setCurrentStep(2), 1400),
      setTimeout(() => setCurrentStep(3), 2200),
      setTimeout(() => setCurrentStep(4), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Elapsed timer
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 100) / 10);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Format date for display
  const formatDate = (isoStr: string) => {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTime = (isoStr: string) => {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleTimeString('es-AR', { timeZone: 'America/Buenos_Aires', hour: '2-digit', minute: '2-digit' });
  };

  // Data source items
  const dataSources = [
    { name: 'Data Dragon (Riot Games)', color: '#c8aa6e', detail: version ? `v${version.lol}` : '...' },
    { name: 'U.GG / OP.GG / Mobalytics', color: '#0acbe6', detail: 'Tier list + builds' },
    { name: 'LoLalytics / MetaBot', color: '#0fba81', detail: 'Win rates + matchups' },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      style={{ backgroundColor: '#070b14' }}
    >
      {/* Background ambient effects */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(200,170,110,0.06) 0%, transparent 60%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(10,203,230,0.03) 0%, transparent 40%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 70%, rgba(200,170,110,0.03) 0%, transparent 40%)' }} />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(200,170,110,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(200,170,110,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
        {/* Logo area */}
        <motion.div
          className="relative mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Rotating outer ring */}
          <motion.div
            className="absolute -inset-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-full h-full rounded-full" style={{
              border: '1px dashed rgba(200,170,110,0.15)',
            }} />
          </motion.div>

          {/* Pulsing glow */}
          <motion.div
            className="absolute -inset-2 rounded-full"
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'radial-gradient(circle, rgba(200,170,110,0.15) 0%, transparent 70%)',
            }}
          />

          {/* Sword icon container */}
          <motion.div
            className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, rgba(200,170,110,0.15), rgba(200,170,110,0.05))',
              border: '1.5px solid rgba(200,170,110,0.25)',
              boxShadow: '0 0 40px rgba(200,170,110,0.1), inset 0 1px 0 rgba(200,170,110,0.1)',
            }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sword className="w-9 h-9" style={{ color: '#c8aa6e' }} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl sm:text-4xl font-black tracking-[0.25em] mb-1"
          style={{
            color: '#c8aa6e',
            fontFamily: 'var(--font-cinzel), serif',
            textShadow: '0 0 30px rgba(200,170,110,0.4), 0 0 60px rgba(200,170,110,0.15)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          MOBA SAGE
        </motion.h1>

        <motion.p
          className="text-[10px] tracking-[0.3em] uppercase mb-8"
          style={{ color: '#5b5a56' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Tu asistente de meta inteligente
        </motion.p>

        {/* Stats bar — game info */}
        <motion.div
          className="w-full rounded-xl p-3.5 mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(30,35,40,0.6), rgba(20,24,32,0.8))',
            border: '1px solid rgba(200,170,110,0.12)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[9px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#785a28' }}>
              Patch actual
            </span>
            <span className="text-[9px] tracking-wider" style={{ color: '#5b5a56' }}>
              {elapsed.toFixed(1)}s
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-lg px-3 py-2" style={{ background: 'rgba(10,14,26,0.5)' }}>
              <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: '#5b5a56' }}>League of Legends</p>
              <p className="text-lg font-bold font-mono" style={{ color: '#f0e6d2' }}>
                {version ? version.lol : '...'}
                <span className="text-xs font-normal ml-1.5" style={{ color: '#785a28' }}>26.9</span>
              </p>
            </div>
            <div className="w-px h-8" style={{ background: 'rgba(200,170,110,0.1)' }} />
            <div className="flex-1 rounded-lg px-3 py-2" style={{ background: 'rgba(10,14,26,0.5)' }}>
              <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: '#5b5a56' }}>Wild Rift</p>
              <p className="text-lg font-bold font-mono" style={{ color: '#f0e6d2' }}>
                {version ? version.wr : '...'}
              </p>
            </div>
            <div className="w-px h-8" style={{ background: 'rgba(200,170,110,0.1)' }} />
            <div className="flex-1 rounded-lg px-3 py-2" style={{ background: 'rgba(10,14,26,0.5)' }}>
              <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: '#5b5a56' }}>DDragon</p>
              <p className="text-lg font-bold font-mono" style={{ color: version?.ddragonStatus === 'live' ? '#0fba81' : '#f0c646' }}>
                {version?.ddragonStatus === 'live' ? 'LIVE' : '...'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data sources */}
        <motion.div
          className="w-full rounded-xl p-3.5 mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(30,35,40,0.6), rgba(20,24,32,0.8))',
            border: '1px solid rgba(10,203,230,0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-center gap-1.5 mb-2.5">
            <Database className="w-3 h-3" style={{ color: '#0acbe6' }} />
            <span className="text-[9px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#0acbe6' }}>
              Fuentes de datos
            </span>
          </div>
          <div className="space-y-1.5">
            {dataSources.map((source, i) => (
              <motion.div
                key={source.name}
                className="flex items-center justify-between rounded-lg px-3 py-1.5"
                style={{ background: 'rgba(10,14,26,0.4)' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.15, duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="text-[11px]" style={{ color: '#a09b8c' }}>{source.name}</span>
                </div>
                <span className="text-[10px] font-mono" style={{ color: '#5b5a56' }}>{source.detail}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-2 pt-2 flex items-center justify-between" style={{ borderTop: '1px solid rgba(120,90,40,0.1)' }}>
            <span className="text-[9px]" style={{ color: '#5b5a56' }}>
              Meta actualizado: <span style={{ color: '#785a28' }}>{version?.metaLastUpdated ? formatDate(version.metaLastUpdated) : '...'}</span>
            </span>
            <span className="text-[9px]" style={{ color: '#5b5a56' }}>
              Datos: <span style={{ color: '#785a28' }}>{version?.fetchedAt ? formatTime(version.fetchedAt) : '...'}</span>
            </span>
          </div>
        </motion.div>

        {/* Loading steps */}
        <motion.div
          className="w-full space-y-2 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              className="flex items-center gap-2.5 px-1"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 + i * 0.3, duration: 0.3 }}
            >
              {/* Status indicator */}
              <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{
                background: step.status === 'done'
                  ? 'rgba(15,186,129,0.15)'
                  : step.status === 'loading'
                    ? 'rgba(200,170,110,0.15)'
                    : 'rgba(91,90,86,0.08)',
                border: `1px solid ${step.status === 'done'
                  ? 'rgba(15,186,129,0.3)'
                  : step.status === 'loading'
                    ? 'rgba(200,170,110,0.3)'
                    : 'rgba(91,90,86,0.1)'}`,
              }}>
                {step.status === 'done' ? (
                  <svg className="w-3 h-3" style={{ color: '#0fba81' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.status === 'loading' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      border: '1.5px solid rgba(200,170,110,0.2)',
                      borderTopColor: '#c8aa6e',
                    }}
                  />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(91,90,86,0.3)' }} />
                )}
              </div>

              {/* Step text */}
              <span className="text-[11px]" style={{
                color: step.status === 'done' ? '#0fba81' : step.status === 'loading' ? '#c8aa6e' : '#5b5a56',
                fontWeight: step.status === 'loading' ? 500 : 400,
              }}>
                {step.label}
              </span>

              {/* Loading dots for active step */}
              {step.status === 'loading' && (
                <motion.div className="flex gap-0.5 ml-auto">
                  {[0, 1, 2].map(dot => (
                    <motion.div
                      key={dot}
                      className="w-1 h-1 rounded-full"
                      style={{ background: '#c8aa6e' }}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1, repeat: Infinity, delay: dot * 0.2 }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom: animated progress bar */}
        <motion.div
          className="w-full h-[2px] rounded-full overflow-hidden"
          style={{ background: 'rgba(200,170,110,0.06)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, #c8aa6e, #785a28, transparent)',
              backgroundSize: '200% 100%',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.5 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
