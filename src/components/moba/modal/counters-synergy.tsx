'use client';

import { Crosshair, Users } from 'lucide-react';
import { ChampionIcon, TinyChampionIcon } from '../champion-icon';
import type { Champion } from '../types';

const NON_CHAMP_WORDS = ['para', 'con', 'que', 'follow', 'peel', 'comp', 'root', 'poke', 'engage', 'chase', 'hyper', 'maxim', 'protecc', 'lock', 'total', 'crea', 'prep', 'burst', 'elim', 'devasta', 'buena', 'buen', 'fuerte', 'activar', 'rapida', 'invenc', 'trampa', 'mortal', 'masivo', 'fights', 'carry', 'mejor', 'detect', 'perder', 'sino', 'util', 'cuando'];

export function CountersSynergyGrid({ champion }: { champion: Champion }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {champion.counterPick && (() => {
        const counterNames = champion.counterPick.split(/[,;\—]/).map(s => s.replace(/\(.*?\)/g, '').trim()).filter(n => n.length > 0 && n !== champion.name && !NON_CHAMP_WORDS.some(w => n.toLowerCase().includes(w)));
        return (
          <div className="rounded-lg p-3" style={{ background: 'rgba(232,64,87,0.06)', border: '1px solid rgba(232,64,87,0.15)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Crosshair className="w-3.5 h-3.5 text-[#e84057]" />
              <h4 className="text-[10px] font-semibold text-[#e84057] uppercase tracking-wider">Counters</h4>
            </div>
            <div className="flex items-center gap-2">
              {counterNames.slice(0, 3).map((name) => (
                <div key={name} className="flex flex-col items-center gap-1">
                  <TinyChampionIcon name={name} />
                  <span className="text-[8px] text-[#a09b8c] leading-none truncate max-w-[40px] text-center">{name}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
      {champion.synergy && (() => {
        const synNames = champion.synergy.split(/[,;—]/).map(s => s.replace(/—.*/g, '').replace(/\(.*?\)/g, '').trim()).filter(n => n.length > 0 && n !== champion.name && !NON_CHAMP_WORDS.some(w => n.toLowerCase().includes(w)));
        return (
          <div className="rounded-lg p-3" style={{ background: 'rgba(10,203,230,0.06)', border: '1px solid rgba(10,203,230,0.15)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-[#0acbe6]" />
              <h4 className="text-[10px] font-semibold text-[#0acbe6] uppercase tracking-wider">Sinergia</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {synNames.slice(0, 3).map((name) => (
                <div key={name} className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{ background: 'rgba(10,203,230,0.06)', border: '1px solid rgba(10,203,230,0.12)' }}>
                  <ChampionIcon name={name} tier={champion.tier} />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-[#f0e6d2] leading-tight">{name}</span>
                    <span className="text-[8px] text-[#0acbe6]">Sinergia</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
