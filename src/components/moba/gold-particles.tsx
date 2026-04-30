'use client';

import { useEffect, useState, useMemo } from 'react';

export function GoldParticles() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Memoize particles so random positions are stable across re-renders
  const particles = useMemo(() => {
    const count = reducedMotion ? 0 : 25;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${2 + Math.random() * 3}px`,
      duration: `${10 + Math.random() * 15}s`,
      delay: `${Math.random() * 10}s`,
      drift: `${-30 + Math.random() * 60}px`,
      glow: `${4 + Math.random() * 8}px`,
    }));
  }, [reducedMotion]);

  return (
    <div className="lol-gold-particles" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            '--left': p.left,
            '--size': p.size,
            '--duration': p.duration,
            '--delay': p.delay,
            '--drift': p.drift,
            '--glow': p.glow,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
