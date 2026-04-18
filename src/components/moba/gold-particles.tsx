'use client';

export function GoldParticles() {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${2 + Math.random() * 3}px`,
    duration: `${10 + Math.random() * 15}s`,
    delay: `${Math.random() * 10}s`,
    drift: `${-30 + Math.random() * 60}px`,
    glow: `${4 + Math.random() * 8}px`,
  }));

  return (
    <div className="lol-gold-particles">
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
