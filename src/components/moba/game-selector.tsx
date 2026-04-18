'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Sword, Monitor, Smartphone, Gamepad2, ChevronRight, Database, Clock, Shield } from 'lucide-react';
import type { GameSelection } from './types';

const SPLASH_CHAMPIONS = ['Yasuo', 'Jinx', 'Ahri', 'LeeSin'];

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
          className="absolute inset-0 transition-opacity duration-[2000ms]"
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

export function GameSelectorLanding({ onSelectGame }: { onSelectGame: (game: GameSelection) => void }) {
  return (
    <motion.div
      className="min-h-[calc(100vh-57px)] flex flex-col items-center justify-center px-4 py-12 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4 }}
    >
      <_SplashCarousel />

      <motion.div
        className="text-center mb-12 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <h2
          className="text-4xl sm:text-5xl font-black tracking-[0.15em] mb-3 lol-heading"
          style={{
            color: '#c8aa6e',
            textShadow: '0 0 40px rgba(200,170,110,0.4), 0 0 80px rgba(200,170,110,0.15), 0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          ELIGE TU JUEGO
        </h2>
        <p className="text-[#5b5a56] text-sm sm:text-base tracking-widest uppercase">
          Selecciona la plataforma para ver análisis
        </p>
        <div className="w-24 h-0.5 mx-auto mt-4" style={{ background: 'linear-gradient(90deg, transparent, #c8aa6e, transparent)' }} />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full max-w-2xl relative z-10">
        <motion.button
          onClick={() => onSelectGame('lol')}
          className="group relative overflow-hidden rounded-2xl p-8 sm:p-10 text-left cursor-pointer transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(200,170,110,0.08), rgba(200,170,110,0.02))',
            border: '1px solid rgba(200,170,110,0.2)',
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
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(200,170,110,0.1), transparent 70%)',
            }}
          />
          <div className="relative z-10">
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(200,170,110,0.2), rgba(200,170,110,0.05))',
                border: '1px solid rgba(200,170,110,0.3)',
                boxShadow: '0 0 30px rgba(200,170,110,0.1)',
              }}
              whileHover={{ rotate: [-2, 2, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Sword className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#c8aa6e' }} />
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-black tracking-[0.2em] mb-2" style={{ color: '#c8aa6e', textShadow: '0 0 20px rgba(200,170,110,0.3)' }}>
              LEAGUE OF LEGENDS
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-4 h-4 text-[#5b5a56]" />
              <p className="text-sm text-[#5b5a56] tracking-wide">PC Analytics</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#785a28] group-hover:text-[#c8aa6e] transition-colors">
              <span>Campeones &bull; Tier List &bull; Meta</span>
              <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="absolute top-3 right-3 w-6 h-6" style={{ borderTop: '1px solid rgba(200,170,110,0.3)', borderRight: '1px solid rgba(200,170,110,0.3)' }} />
          <div className="absolute bottom-3 left-3 w-6 h-6" style={{ borderBottom: '1px solid rgba(200,170,110,0.3)', borderLeft: '1px solid rgba(200,170,110,0.3)' }} />
        </motion.button>

        <motion.button
          onClick={() => onSelectGame('wildrift')}
          className="group relative overflow-hidden rounded-2xl p-8 sm:p-10 text-left cursor-pointer transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(10,203,230,0.08), rgba(10,203,230,0.02))',
            border: '1px solid rgba(10,203,230,0.2)',
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
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(10,203,230,0.1), transparent 70%)',
            }}
          />
          <div className="relative z-10">
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(10,203,230,0.2), rgba(10,203,230,0.05))',
                border: '1px solid rgba(10,203,230,0.3)',
                boxShadow: '0 0 30px rgba(10,203,230,0.1)',
              }}
              whileHover={{ rotate: [-2, 2, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Smartphone className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#0acbe6' }} />
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-black tracking-[0.2em] mb-2" style={{ color: '#0acbe6', textShadow: '0 0 20px rgba(10,203,230,0.3)' }}>
              WILD RIFT
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-4 h-4 text-[#5b5a56]" />
              <p className="text-sm text-[#5b5a56] tracking-wide">Mobile Analytics</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#5b5a56] group-hover:text-[#0acbe6] transition-colors">
              <span>Campeones &bull; Tier List &bull; Builds</span>
              <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="absolute top-3 right-3 w-6 h-6" style={{ borderTop: '1px solid rgba(10,203,230,0.3)', borderRight: '1px solid rgba(10,203,230,0.3)' }} />
          <div className="absolute bottom-3 left-3 w-6 h-6" style={{ borderBottom: '1px solid rgba(10,203,230,0.3)', borderLeft: '1px solid rgba(10,203,230,0.3)' }} />
        </motion.button>
      </div>

      <motion.div className="mt-12 max-w-2xl w-full relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4 text-center">
            <Database className="w-6 h-6 text-[#c8aa6e] mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-[#f0e6d2] mb-1">Fuentes de Datos</h4>
            <p className="text-[10px] text-[#5b5a56]">Riot Data Dragon<br/>U.GG / OP.GG / Mobalytics<br/>CommunityDragon API</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-[#0acbe6] mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-[#f0e6d2] mb-1">Datos del Meta</h4>
            <p className="text-[10px] text-[#5b5a56]">Campeones (S/A/B)<br/>Builds con iconos<br/>Combos Rotos</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Shield className="w-6 h-6 text-[#f0c646] mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-[#f0e6d2] mb-1">8 Pestañas</h4>
            <p className="text-[10px] text-[#5b5a56]">Tier List &bull; Parches<br/>Cosas Rotas &bull; Combos<br/>Competitivo &bull; Perfil</p>
          </div>
        </div>
      </motion.div>

      <motion.p
        className="text-[10px] text-[#785a28] mt-10 tracking-wider relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Powered by IA &bull; Datos del meta actual
      </motion.p>
    </motion.div>
  );
}
