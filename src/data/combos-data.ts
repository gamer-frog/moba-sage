// ============================================================
// MOBA SAGE — Combos / Pro Comp Data
// ============================================================

export interface CompEntry {
  name: string;
  champions: string[];
  playstyle: string;
  description: string;
}

export const proComps: CompEntry[] = [
  { name: 'Engage y Teamfight', champions: ['Malphite', 'Jarvan IV', 'Orianna', 'Jinx', 'Thresh'], playstyle: 'Engage brutal + follow-up', description: 'Malphite R + Jarvan EQ + Orianna R = team wipe. Jinx limpiando. Thresh protege y engancha stragglers. Comp muy fuerte en el meta actual por la cantidad de AP bruisers.' },
  { name: 'Poke & Siege', champions: ['Jayce', 'Zoe', 'Varus', 'Lulu', 'Karma'], playstyle: 'Dolor a distancia + disengage', description: 'Jayce y Zoe pokean desde fuera de rango. Varus R + Lulu R = pelea forzada a tu favor. Karma shield + speedboost para kiting. Excelente en objective setups.' },
  { name: 'Split Push', champions: ['Fiora', 'Nidalee', 'Trundle', 'Sivir', 'Shen'], playstyle: 'Presión lateral + respuesta global', description: 'Fiora/Trundle splitanean. Shen R + Sivir R para responder a 4v4. Nidalee controla jungle y objetivos. Funciona con comunicación de team.' },
  { name: 'Pick Comp', champions: ['Blitzcrank', 'Elise', 'LeBlanc', 'Ezreal', 'Nautilus'], playstyle: 'Catchear y eliminar', description: 'Blitz/Nautilus hook + Elise/LB burst = muerte instantánea. Ezreal limpia desde lejos. Excelente en ranked donde un catch = Baron/Nexus.' },
  { name: 'Proteger al ADC', champions: ['Ornn', 'Lee Sin', 'Orianna', 'Jinx', 'Yuumi'], playstyle: 'Peel intenso + hiper carry', description: 'Todo el team protege a Jinx. Ornn items para todo el team. Yuumi unbound a Jinx = inmortal en late game. Lee Sin kick para peel.' },
];
