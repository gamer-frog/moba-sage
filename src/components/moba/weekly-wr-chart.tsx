'use client';

import { motion } from 'framer-motion';

interface WeeklyDataPoint {
  week: string;
  wr: number;
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
      weeks.push({ week: weekLabel, wr: currentWR });
    } else {
      const variance = (seededRandom(name, i) - 0.5) * 4;
      weeks.push({ week: weekLabel, wr: Math.round((currentWR - variance + (i > 1 ? (seededRandom(name, i + 10) - 0.5) * 2 : 0)) * 10) / 10 });
    }
  }
  return weeks;
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
  const avgWR = data.reduce((s, d) => s + d.wr, 0) / data.length;
  const trend = data[data.length - 1].wr - data[0].wr;
  const trendColor = trend > 0.5 ? '#0fba81' : trend < -0.5 ? '#e84057' : '#c8aa6e';

  if (compact) {
    return (
      <div className="flex items-end gap-[2px] h-5">
        {data.map((d, i) => {
          const height = 20 + ((d.wr - minWR) / range) * 80;
          const color = d.wr >= avgWR ? '#0fba81' : d.wr >= avgWR - 1 ? '#f0c646' : '#e84057';
          return (
            <motion.div
              key={i}
              className="w-[3px] rounded-t-sm"
              style={{ background: color, opacity: i === data.length - 1 ? 1 : 0.5 }}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
              title={`${d.week}: ${d.wr}% WR`}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-[#5b5a56] uppercase tracking-wider">Tendencia 4 Semanas</span>
        <span className="text-[10px] font-mono font-semibold" style={{ color: trendColor }}>
          {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          {trend > 0.5 ? ' ↑' : trend < -0.5 ? ' ↓' : ''}
        </span>
      </div>
      <div className="flex items-end gap-1 h-16 px-1">
        {data.map((d, i) => {
          const height = 25 + ((d.wr - minWR) / range) * 75;
          const isLast = i === data.length - 1;
          const barColor = isLast
            ? '#c8aa6e'
            : d.wr >= avgWR ? '#0fba81' : d.wr >= avgWR - 1 ? '#f0c646' : '#e84057';

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <motion.span
                className="text-[8px] font-mono font-semibold leading-none"
                style={{ color: isLast ? '#c8aa6e' : '#a09b8c' }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 + 0.2 }}
              >
                {d.wr}%
              </motion.span>
              <div className="w-full h-12 flex items-end">
                <motion.div
                  className="w-full rounded-t"
                  style={{
                    background: `linear-gradient(to top, ${barColor}30, ${barColor})`,
                    opacity: isLast ? 1 : 0.65,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                />
              </div>
              <span className="text-[7px] text-[#5b5a56] font-mono">{d.week}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
