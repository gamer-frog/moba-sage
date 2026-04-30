'use client';

import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Sword, Monitor, Smartphone, Gamepad2, ChevronRight, Database, Clock, Shield, GraduationCap, Trophy, Zap } from 'lucide-react';
import Image from 'next/image';
import { GAME_TAB_ITEMS, DEV_TAB_ITEMS } from './constants';
import type { GameSelection } from './types';

const TOTAL_TABS = GAME_TAB_ITEMS.length + DEV_TAB_ITEMS.length;

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const SPLASH_CHAMPIONS = ['Yasuo', 'Jinx', 'Ahri', 'LeeSin'];
const SHOWCASE_CHAMPIONS = ['Jinx', 'Ahri', 'Yasuo', 'LeeSin', 'Katarina', 'Thresh', 'Darius', 'Vi'];

const _SplashCarousel = memo(function _SplashCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % SPLASH_CHAMPIONS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {SPLASH_CHAMPIONS.map((key, i) => (
        <div
          key={key}
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: i === current ? 0.08 : 0,
            backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${key}_0.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}
    </div>
  );
});

export function GameSelectorLanding({ onSelectGame, patchVersion: externalPatch, championCount: externalCount }: { onSelectGame: (game: GameSelection) => void; patchVersion?: string; championCount?: number }) {
  const now = new Date();
  const argDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  const formattedDate = `${argDate.getDate()} ${MONTHS_ES[argDate.getMonth()]} ${argDate.getFullYear()}`;

  // Use props from parent when available, fallback to safe defaults
  const patchVersion = externalPatch || '26.9';
  const championCount = externalCount ?? '--';

  return (
    <motion.div
      className="min-h-[calc(100vh-57px)] flex flex-col items-center justify-center px-4 py-12 relative overflow-x-hidden max-w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4 }}
    >
      <_SplashCarousel />

      {/* Meta Report Banner */}
      <motion.div
        className="w-full max-w-2xl mb-8 relative z-10 cursor-pointer"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectGame('lol')}
      >
        <div
          className="rounded-xl p-4 sm:p-5 relative overflow-hidden border-2 border-lol-gold/35"
          style={{
            background: 'linear-gradient(135deg, rgba(200,170,110,0.12), rgba(200,170,110,0.03))',
            boxShadow: '0 0 30px rgba(200,170,110,0.1), 0 0 60px rgba(200,170,110,0.05)',
          }}
        >
          {/* Animated gradient border effect */}
          <div className="absolute inset-0 rounded-xl" style={{
            background: 'linear-gradient(135deg, rgba(200,170,110,0.4), transparent, rgba(200,170,110,0.2))',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '2px',
            borderRadius: '12px',
          }} />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-lol-gold/35" style={{
              background: 'linear-gradient(135deg, rgba(200,170,110,0.25), rgba(200,170,110,0.08))',
            }}>
              <Trophy className="w-6 h-6 text-lol-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-lol-gold lol-title">Patch {patchVersion} — Meta Report</h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-lol-green/15 text-lol-green border border-lol-green/25">
                  <Zap className="w-2.5 h-2.5" />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-lol-muted mt-0.5">{championCount} campeones analizados · 6 parches trackeados · 7 guías disponibles · Coaching IA</p>
            </div>
            <ChevronRight className="w-5 h-5 text-lol-gold-dark shrink-0" />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="text-center mb-12 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <h2
          className="text-4xl sm:text-5xl font-black tracking-[0.15em] mb-3 lol-heading text-lol-gold"
          style={{
            textShadow: '0 0 40px rgba(200,170,110,0.4), 0 0 80px rgba(200,170,110,0.15), 0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          ELIGE TU JUEGO
        </h2>
        <p className="text-lol-dim text-sm sm:text-base tracking-widest uppercase">
          Selecciona la plataforma para ver análisis
        </p>
        <div className="w-24 h-0.5 mx-auto mt-4" style={{ background: 'linear-gradient(90deg, transparent, #c8aa6e, transparent)' }} />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full max-w-2xl relative z-10">
        <motion.button
          onClick={() => onSelectGame('lol')}
          className="group relative overflow-hidden rounded-2xl p-6 sm:p-8 lg:p-10 text-left cursor-pointer transition-all duration-500 border border-lol-gold/20"
          style={{
            background: 'linear-gradient(135deg, rgba(200,170,110,0.08), rgba(200,170,110,0.02))',
            backdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{
            scale: 1.03,
            boxShadow: '0 0 60px rgba(200,170,110,0.15), 0 0 120px rgba(200,170,110,0.05)',
            borderColor: 'rgba(200,170,110,0.5)',
          }}
          whileTap={{ scale: 0.98 }}
          role="button"
          aria-label="Seleccionar League of Legends"
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(200,170,110,0.1), transparent 70%)',
            }}
          />
          <div className="relative z-10">
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-6 border border-lol-gold/30"
              style={{
                background: 'linear-gradient(135deg, rgba(200,170,110,0.2), rgba(200,170,110,0.05))',
                boxShadow: '0 0 30px rgba(200,170,110,0.1)',
              }}
              whileHover={{ rotate: [-2, 2, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Sword className="w-8 h-8 sm:w-10 sm:h-10 text-lol-gold" />
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-black tracking-[0.2em] mb-2 text-lol-gold" style={{ textShadow: '0 0 20px rgba(200,170,110,0.3)' }}>
              LEAGUE OF LEGENDS
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-4 h-4 text-lol-dim" />
              <p className="text-sm text-lol-dim tracking-wide">PC Analytics</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-lol-gold-dark group-hover:text-lol-gold transition-colors">
              <span>Campeones &bull; Tier List &bull; Coaching</span>
              <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-lol-gold/30" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-lol-gold/30" />
        </motion.button>

        <motion.button
          onClick={() => onSelectGame('wildrift')}
          className="group relative overflow-hidden rounded-2xl p-6 sm:p-8 lg:p-10 text-left cursor-pointer transition-all duration-500 border border-lol-success/20"
          style={{
            background: 'linear-gradient(135deg, rgba(10,203,230,0.08), rgba(10,203,230,0.02))',
            backdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{
            scale: 1.03,
            boxShadow: '0 0 60px rgba(10,203,230,0.15), 0 0 120px rgba(10,203,230,0.05)',
            borderColor: 'rgba(10,203,230,0.5)',
          }}
          whileTap={{ scale: 0.98 }}
          role="button"
          aria-label="Seleccionar Wild Rift"
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(10,203,230,0.1), transparent 70%)',
            }}
          />
          <div className="relative z-10">
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-6 border border-lol-success/30"
              style={{
                background: 'linear-gradient(135deg, rgba(10,203,230,0.2), rgba(10,203,230,0.05))',
                boxShadow: '0 0 30px rgba(10,203,230,0.1)',
              }}
              whileHover={{ rotate: [-2, 2, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-lol-success" />
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-black tracking-[0.2em] mb-2 text-lol-success" style={{ textShadow: '0 0 20px rgba(10,203,230,0.3)' }}>
              WILD RIFT
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-4 h-4 text-lol-dim" />
              <p className="text-sm text-lol-dim tracking-wide">Mobile Analytics</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-lol-dim group-hover:text-lol-success transition-colors">
              <span>Campeones &bull; Tier List &bull; Builds</span>
              <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-lol-success/30" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-lol-success/30" />
        </motion.button>
      </div>

      {/* Champion Showcase Strip — sm+ only */}
      <motion.div
        className="w-full max-w-2xl mt-10 relative z-10 hidden sm:block"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <p className="lol-label text-[10px] text-lol-gold-dark mb-3 tracking-wider uppercase">Campeones Destacados</p>
        <div className="relative overflow-hidden rounded-xl py-2" style={{ maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)' }}>
          <div
            className="flex gap-3 animate-marquee"
            style={{ width: 'max-content' }}
          >
            {[...SHOWCASE_CHAMPIONS, ...SHOWCASE_CHAMPIONS].map((champ, i) => (
              <button
                key={`${champ}-${i}`}
                onClick={() => onSelectGame('lol')}
                className="shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all duration-300 hover:scale-110 hover:ring-2 hover:ring-lol-gold hover:shadow-[0_0_12px_rgba(200,170,110,0.4)] border border-lol-gold-dark/25"
                title={champ}
                aria-label={champ}
              >
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ}_0.jpg`}
                  alt={champ}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div className="mt-12 max-w-2xl w-full relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card rounded-xl p-4 text-center">
            <Database className="w-6 h-6 text-lol-gold mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-lol-text mb-1">Fuentes de Datos</h4>
            <p className="text-[10px] text-lol-dim">Riot Data Dragon<br/>U.GG / OP.GG / Mobalytics<br/>CommunityDragon API</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-lol-success mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-lol-text mb-1">Datos del Meta</h4>
            <p className="text-[10px] text-lol-dim">Campeones (S/A/B)<br/>Builds con iconos<br/>Combos Rotos</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Shield className="w-6 h-6 text-lol-warning mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-lol-text mb-1">{TOTAL_TABS} Pestañas</h4>
            <p className="text-[10px] text-lol-dim">Tier List &bull; Parches<br/>Cosas Rotas &bull; Combos<br/>Competitivo &bull; Perfil</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <GraduationCap className="w-6 h-6 text-lol-green mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-lol-text mb-1">Coaching IA</h4>
            <p className="text-[10px] text-lol-dim">Mecánicas clave<br/>Warding y Visión<br/>Composiciones Pro</p>
          </div>
        </div>
      </motion.div>

      <motion.p
        className="text-[10px] text-lol-gold-dark mt-10 tracking-wider relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Powered by IA &bull; Datos del meta actual
      </motion.p>

      {/* Version info */}
      <motion.p
        className="text-[10px] text-lol-dim/40 mt-2 tracking-wider relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Última actualización: {formattedDate}
      </motion.p>
    </motion.div>
  );
}