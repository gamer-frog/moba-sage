'use client';

import type { Champion } from '../types';

interface CounterStrategy {
  title: string;
  desc: string;
  severity: 'strong' | 'moderate';
}

export function getCounterStrategies(champ: Champion): CounterStrategy[] {
  const strats: CounterStrategy[] = [];

  // Positioning counters (universal)
  if (champ.winRate >= 53) {
    strats.push({ title: 'Evitar 1v1 temprano', desc: `${champ.name} es muy fuerte early. Pida ayuda de su jungler antes de level 3. No fuerce trades hasta tener su power spike.`, severity: 'strong' });
  }
  if (champ.banRate >= 5) {
    strats.push({ title: 'Considerar banear', desc: `${champ.name} tiene ${champ.banRate}% de ban rate — probablemente merece un ban si nadie en su equipo lo juega.`, severity: 'strong' });
  }
  if (champ.pickRate >= 15) {
    strats.push({ title: 'Preparar counters', desc: `Alta pick rate (${champ.pickRate}%) — es probable que lo enfrenten. Tenga un campeón con CC o gap-close listo.`, severity: 'moderate' });
  }

  // Role-specific tips
  if (champ.role === 'Top' || champ.role === 'Jungle') {
    strats.push({ title: 'Control de oleada', desc: 'Mantenga la ola empujando hacia su torre. No permita que forme una slow push — eso le da control del lane y evita ganks.', severity: 'moderate' });
  }
  if (champ.role === 'Mid') {
    strats.push({ title: 'Vision de robo', desc: 'Roam cuando empuje — no se quede mid. Ward de río para evitar ser flankeado.', severity: 'moderate' });
  }
  if (champ.role === 'ADC') {
    strats.push({ title: 'Posicionarse detrás', desc: 'Nunca esté primero en una teamfight. Quedese detrás del frontline y kitee. GA o QSS son items defensivos recomendados.', severity: 'strong' });
  }
  if (champ.role === 'Support') {
    strats.push({ title: 'Peel priority', desc: 'Si enfrenta un carry fuerte, enfoquese en peelar a su ADC. Use CC y exhaust a tiempo.', severity: 'moderate' });
  }

  // High ban rate + high WR = broken
  if (champ.winRate >= 52 && champ.banRate >= 4) {
    strats.push({ title: 'Campeón roto', desc: `${champ.name} es considerado roto este patch (${champ.winRate}% WR, ${champ.banRate}% ban). Evite enfrentarlo en lanes donde es fuerte.`, severity: 'strong' });
  }

  return strats;
}
