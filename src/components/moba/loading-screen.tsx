'use client';

import { motion } from 'framer-motion';
import { Sword } from 'lucide-react';

export function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{
        backgroundColor: '#0a0e1a',
      }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(200,170,110,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Sword icon with rotation */}
      <motion.div
        className="relative mb-8"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(200,170,110,0.2), rgba(200,170,110,0.05))',
            border: '2px solid rgba(200,170,110,0.3)',
            boxShadow: '0 0 40px rgba(200,170,110,0.15), 0 0 80px rgba(200,170,110,0.05)',
          }}
        >
          <Sword className="w-10 h-10" style={{ color: '#c8aa6e' }} />
        </div>
      </motion.div>

      {/* Logo text */}
      <motion.h1
        className="text-4xl sm:text-5xl font-black tracking-[0.2em] mb-4 lol-heading"
        style={{
          color: '#c8aa6e',
          textShadow: '0 0 40px rgba(200,170,110,0.5), 0 0 80px rgba(200,170,110,0.2), 0 2px 8px rgba(0,0,0,0.8)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        MOBA SAGE
      </motion.h1>

      {/* Loading bar */}
      <motion.div
        className="w-48 h-1 rounded-full overflow-hidden"
        style={{ background: 'rgba(200,170,110,0.1)' }}
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 192 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #785a28, #c8aa6e, #785a28)',
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '200% 0%'],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      {/* Loading text */}
      <motion.p
        className="text-sm text-[#785a28] mt-4 tracking-widest uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ delay: 0.6, duration: 2, repeat: Infinity }}
      >
        Cargando datos del Invocador...
      </motion.p>
    </motion.div>
  );
}
