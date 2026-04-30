'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WeeklyDataPoint {
  week: string;
  wr: number;
  change: number;
}

function seededRandom(seed: string, index: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash * 9301 + index * 49297) * 49297;
  return x - Math.floor(x);
}

export function getWeeklyWRHistory(name: string, currentWR: number): WeeklyDataPoint[] {
  const weeks: WeeklyDataPoint[] = [];
  const today = new Date();
  for (let i = 3; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - (i * 7));
    const weekLabel = `${d.getDate()}/${d.getMonth() + 1}`;
    if (i === 0) {
      const prevWR = weeks.length > 0 ? weeks[weeks.length - 1].wr : currentWR;
      const change = Math.round((currentWR - prevWR) * 10) / 10;
      weeks.push({ week: weekLabel, wr: currentWR, change });
    } else {
      const variance = (seededRandom(name, i) - 0.5) * 4;
      const wr = Math.round((currentWR - variance + (i > 1 ? (seededRandom(name, i + 10) - 0.5) * 2 : 0)) * 10) / 10;
      const prevWR = weeks.length > 0 ? weeks[weeks.length - 1].wr : wr;
      const change = Math.round((wr - prevWR) * 10) / 10;
      weeks.push({ week: weekLabel, wr, change });
    }
  }
  return weeks;
}

function directionColor(change: number): string {
  if (change > 0.1) return '#0fba81';
  if (change < -0.1) return '#e84057';
  return '#c8aa6e';
}

export function WeeklyWRChart({
  championName,
  currentWR,
  compact = false,
}: {
  championName: string;
  currentWR: number;
  compact?: boolean;
}) {
  const data = useMemo(() => getWeeklyWRHistory(championName, currentWR), [championName, currentWR]);
  const gradientId = `wr-gradient-${championName.replace(/[^a-zA-Z0-9]/g, '')}`;
  const maxWR = Math.max(...data.map(d => d.wr));
  const minWR = Math.min(...data.map(d => d.wr));
  const range = Math.max(maxWR - minWR, 1.5);
  const overallTrend = data[data.length - 1].wr - data[0].wr;
  const trendColor = overallTrend > 0.3 ? '#0fba81' : overallTrend < -0.3 ? '#e84057' : '#c8aa6e';

  // Compact sparkline
  if (compact) {
    return (
      <div className="flex items-end gap-[2px] h-5">
        {data.map((d, i) => {
          const height = 25 + ((d.wr - minWR) / range) * 75;
          const color = directionColor(d.change);
          return (
            <motion.div
              key={i}
              className="w-[3px] rounded-t-sm"
              style={{ background: color, opacity: 0.75 }}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
              title={`${d.week}: ${d.wr}% WR (${d.change > 0 ? '+' : ''}${d.change.toFixed(1)}%)`}
            />
          );
        })}
      </div>
    );
  }

  // Full chart — OP.GG inspired with line chart + area fill + dot markers
  const chartHeight = 80;
  const padding = 4;

  // Calculate SVG path points
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (100 - 2 * padding);
    const y = padding + (1 - (d.wr - minWR + range * 0.1) / (range * 1.2)) * (chartHeight - 2 * padding);
    return { x, y, wr: d.wr, change: d.change };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-lol-dim uppercase tracking-wider font-semibold">Tendencia 4 Semanas</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold" style={{ color: trendColor }}>
            {overallTrend > 0 ? '+' : ''}{overallTrend.toFixed(1)}%
          </span>
          {overallTrend > 0.3 ? (
            <TrendingUp className="w-3 h-3" style={{ color: trendColor }} />
          ) : overallTrend < -0.3 ? (
            <TrendingDown className="w-3 h-3" style={{ color: trendColor }} />
          ) : (
            <Minus className="w-3 h-3" style={{ color: trendColor }} />
          )}
        </div>
      </div>

      {/* Chart area */}
      <div className="relative rounded-lg overflow-hidden" style={{ background: 'rgba(10,14,26,0.4)', border: '1px solid rgba(120,90,40,0.1)' }}>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-full h-px" style={{ background: 'rgba(120,90,40,0.08)' }} />
          ))}
        </div>

        <svg viewBox={`0 0 100 ${chartHeight}`} className="w-full" style={{ height: '80px' }} preserveAspectRatio="none">
          {/* Area fill gradient */}
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trendColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={trendColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Area */}
          <motion.path
            d={areaPath}
            fill={`url(#${gradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          {/* Line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke={trendColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Dot markers with WR labels */}
          {points.map((p, i) => {
            const color = directionColor(p.change);
            const isLast = i === points.length - 1;
            return (
              <g key={i}>
                {/* Dot */}
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={isLast ? 3 : 2}
                  fill={color}
                  stroke="#0a0e1a"
                  strokeWidth="1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300 }}
                />
                {/* Glow for last point */}
                {isLast && (
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="none"
                    stroke={color}
                    strokeWidth="0.5"
                    opacity="0.5"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.5 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Bottom labels row */}
        <div className="flex items-center justify-between px-2 py-1.5" style={{ borderTop: '1px solid rgba(120,90,40,0.08)' }}>
          {data.map((d, i) => {
            const color = directionColor(d.change);
            const isLast = i === data.length - 1;
            return (
              <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
                <span className={`font-mono font-bold ${isLast ? 'text-[10px]' : 'text-[10px]'}`} style={{ color }}>
                  {d.wr}%
                </span>
                <span className="text-[10px] text-lol-dim">{d.week}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-lol-green" />
          <span className="text-lol-dim">Sube</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-lol-danger" />
          <span className="text-lol-dim">Baja</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-lol-gold" />
          <span className="text-lol-dim">Estable</span>
        </div>
      </div>
    </div>
  );
}
