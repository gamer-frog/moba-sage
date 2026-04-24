'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WeeklyDataPoint {
  week: string;
  wr: number;
  change: number; // change from previous week
}

// Deterministic pseudo-random based on seed string
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

// Direction-aware color: GREEN if WR went UP, RED if DOWN
function directionColor(change: number): string {
  if (change > 0.1) return '#0fba81';  // verde = sube
  if (change < -0.1) return '#e84057'; // rojo = baja
  return '#c8aa6e';                     // amarillo = neutral
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
  const data = getWeeklyWRHistory(championName, currentWR);
  const maxWR = Math.max(...data.map(d => d.wr));
  const minWR = Math.min(...data.map(d => d.wr));
  const range = Math.max(maxWR - minWR, 1.5);
  const overallTrend = data[data.length - 1].wr - data[0].wr;
  const trendColor = overallTrend > 0.3 ? '#0fba81' : overallTrend < -0.3 ? '#e84057' : '#c8aa6e';

  // Compact sparkline — each bar colored by DIRECTION (green up, red down)
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

  // Full chart — clear GREEN/RED per bar with change arrows
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-[#5b5a56] uppercase tracking-wider">Tendencia 4 Semanas</span>
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

      {/* Legend */}
      <div className="flex items-center gap-3 text-[8px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-[#0fba81]" />
          <span className="text-[#5b5a56]">Sube</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-[#e84057]" />
          <span className="text-[#5b5a56]">Baja</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-[#c8aa6e]" />
          <span className="text-[#5b5a56]">Estable</span>
        </div>
      </div>

      <div className="flex items-end gap-2 h-20 px-1">
        {data.map((d, i) => {
          const height = 20 + ((d.wr - minWR) / range) * 80;
          const isLast = i === data.length - 1;
          const color = directionColor(d.change);
          const bgGrad = `linear-gradient(to top, ${color}40, ${color})`;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              {/* WR value */}
              <motion.span
                className="text-[9px] font-mono font-bold leading-none"
                style={{ color }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 + 0.2 }}
              >
                {d.wr}%
              </motion.span>
              {/* Change indicator */}
              <motion.div
                className="flex items-center gap-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 + 0.3 }}
              >
                {d.change > 0.1 ? (
                  <span className="text-[8px] font-mono font-bold text-[#0fba81]">+{d.change.toFixed(1)}</span>
                ) : d.change < -0.1 ? (
                  <span className="text-[8px] font-mono font-bold text-[#e84057]">{d.change.toFixed(1)}</span>
                ) : (
                  <span className="text-[8px] font-mono text-[#c8aa6e]">0.0</span>
                )}
              </motion.div>
              {/* Bar */}
              <div className="w-full h-12 flex items-end">
                <motion.div
                  className="w-full rounded-t"
                  style={{
                    background: bgGrad,
                    opacity: isLast ? 1 : 0.75,
                    boxShadow: isLast ? `0 0 8px ${color}40` : 'none',
                    border: isLast ? `1px solid ${color}60` : '1px solid transparent',
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                />
              </div>
              {/* Week label */}
              <span className="text-[7px] text-[#5b5a56] font-mono">{d.week}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
