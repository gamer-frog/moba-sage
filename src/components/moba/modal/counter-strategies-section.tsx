'use client';

import { AlertTriangle } from 'lucide-react';
import { CollapsibleSection } from '../collapsible-section';
import { Swords } from 'lucide-react';
import type { Champion } from '../types';
import { getCounterStrategies } from './counter-strategies';

interface CounterStrategiesSectionProps {
  champion: Champion;
}

export function CounterStrategiesSection({ champion }: CounterStrategiesSectionProps) {
  const counterStrats = getCounterStrategies(champion);
  if (counterStrats.length === 0) return null;

  return (
    <CollapsibleSection title="Estrategias Contra" icon={Swords} color="#e84057" defaultOpen={champion.winRate >= 53}>
      <div className="space-y-2 mt-2">
        {counterStrats.map((strat, i) => (
          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg" style={{
            background: strat.severity === 'strong' ? 'rgba(232,64,87,0.06)' : 'rgba(240,198,70,0.06)',
            border: `1px solid ${strat.severity === 'strong' ? 'rgba(232,64,87,0.15)' : 'rgba(240,198,70,0.15)'}`,
            borderLeft: `2px solid ${strat.severity === 'strong' ? '#e84057' : '#f0c646'}`,
          }}>
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: strat.severity === 'strong' ? '#e84057' : '#f0c646' }} />
            <div>
              <p className="text-[11px] font-semibold text-[#f0e6d2]">{strat.title}</p>
              <p className="text-[10px] text-[#a09b8c] leading-relaxed mt-0.5">{strat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}
