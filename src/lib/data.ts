// ============================================================
// MOBA SAGE — Data Layer
// Fallback: Prisma (local) → Embedded data (Vercel/serverless)
// ============================================================

export interface Champion {
  id: number;
  name: string;
  title: string;
  role: string;
  tier: string;
  winRate: number;
  pickRate: number;
  banRate: number;
  image: string;
  aiInsight: string;
  build: string;
  runes: string;
  counters: string;
  synergies: string;
  patch: string;
  game: string;
  createdAt?: string;
  updatedAt?: string;
  // New fields
  builds?: { name: string; items: string; winRate: number }[];
  counterPick?: string;
  synergy?: string;
  aiAnalysis?: string;
  proPickRate?: number;
  brokenThings?: string[];
  buildLinks?: { label: string; url: string }[];
  runes?: { primary: string; secondary: string; shards: string };
}

export interface PatchNote {
  id: number;
  version: string;
  title: string;
  summary: string;
  digest: string;
  date: string;
  sourceGame: string;
}

export interface AiInsight {
  id: number;
  champion: string;
  category: string;
  content: string;
  confidence: number;
  date: string;
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  status: string;
  pointer: number;
  interval: number;
}

export interface ProPick {
  id: number;
  champion: string;
  role: string;
  tournament: string;
  region: string;
  pickRate: number;
  banRate: number;
  winRate: number;
  patch: string;
}

export interface BrokenCombo {
  id: number;
  name: string;
  champions: string[];      // champion names
  description: string;      // why it's broken
  winRate: number;
  game: string;             // 'LoL' or 'WR'
  difficulty: 'facil' | 'media' | 'dificil';
}

// ============================================================
// EMBEDDED DATA (fallback when Prisma/SQLite isn't available)
// ============================================================

const CHAMPIONS_DATA: Omit<Champion, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Tier S — Dioses del Meta
  {
    name: 'Master Yi', title: 'el Buscador de Wuju', role: 'Jungle', tier: 'S', winRate: 55.2, pickRate: 14.1, banRate: 12.5, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['Q resetea en kills → snowball infinito', 'Combo Yi+Taric invulnerable → sin interacción', 'Alpha Strike dodgea habilidades intargetable'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/masteryi/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/masteryi"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/masteryi"}],
    builds: [
      { name: 'Build Oneshot', items: 'Filo de la Noche → Eclipse → Hydratación Letal → Última Piedad → Fuerza de la Trinidad', winRate: 54.8 },
      { name: 'Build Persistente', items: 'Eclipse → Hydratación Letal → Guardián de Angel → El Protegido → Botas de Mercurio', winRate: 52.1 },
    ],
    counterPick: 'Poppy, Malzahar, Jax',
    synergy: 'Taric, Master Yi + Taric es la composición más tóxica del juego actualmente',
    aiAnalysis: 'Master Yi es actualmente el jungler más dominante del meta. Su Q "Alpha Strike" permite reseteos rápidos tras eliminaciones, generando snowballs devastadoras en partidas de soloQ. Con un win rate del 55.2%, supera a todos los demás jungleres.\n\nBuild recomendado: Filo de la Noche into Eclipse maximiza su burst. La sinergia con Taric sigue siendo una de las composiciones más tóxicas del juego.\n\nConsejo principal: Prioriza farmeo temprano y busca invasiones en la jungla enemiga tras el level 3. Evita teamfights sin tu ultimate listo.',
    proPickRate: 5.2,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Brujería — Colección de Ojos', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  {
    name: 'Jinx', title: 'la Cañón Suelto', role: 'ADC', tier: 'S', winRate: 54.1, pickRate: 12.3, banRate: 5.1, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['Pasiva 1 kill = limpia teamfight', 'W rango buff → poke sin respuesta', 'Kraken + Runaan = AoE masivo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/jinx/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/jinx"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/jinx"}],
    builds: [
      { name: 'Build Hypercarry', items: 'Filo Infinito → Huracán de Runaan → Bailarín Espectral → Sed de Sangre → El Final', winRate: 55.3 },
      { name: 'Build Early Power', items: 'Poder de Kraken Slayer → La Séptima → Infinito → Bailarín Espectral → Botas de Berserker', winRate: 53.1 },
    ],
    counterPick: 'Caitlyn, Varus, Kassadin (gap close)',
    synergy: 'Thresh, Lulu — Thresh para enganchar y lanzar, Lulu para protege',
    aiAnalysis: 'Jinx mantiene su dominio absoluto como ADC en el meta actual. Su pasiva "¡Prepárense!" le permite snowballar teamfights tras una sola eliminación. El buff reciente en su W aumentó su rango de seguridad, haciendo que su fase de lanes sea más fuerte.\n\nEl build de Kraken Slayer maximiza su daño sostenido en teamfights. La sinergia con Thresh es estadísticamente la mejor del parche con un 55%+ de win rate combinado.\n\nConsejo principal: Mantén posicionamiento agresivo en la fase de líneas para abusar de tu rango. En teamfights, busca la primera eliminación para activar tu pasiva y limpiar.',
    proPickRate: 22.1,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Inspiración — Calzado Mágico', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  {
    name: 'Lee Sin', title: 'el Monje Ciego', role: 'Jungle', tier: 'S', winRate: 52.8, pickRate: 10.5, banRate: 6.2, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['Insec Q→R→Flash → pick sin counterplay', 'Pressure level 2-3 inigualable', 'Eclipse burst → mata carries en 1 combo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/leesin/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/leesin"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/leesin"}],
    builds: [
      { name: 'Build Bruiser', items: 'Cosechador Nocturno → Eclipse → Hidra Titánica → Fuerza de la Trinidad → Botas de Mercurio', winRate: 52.5 },
      { name: 'Build Full CD', items: 'Conquistador → Eclipse → Hidra → Fuerza de la Trinidad → Botas de CD', winRate: 51.8 },
    ],
    counterPick: 'Nidalee, Elise, Kindred',
    synergy: 'Ahri, Orianna — Buen follow-up para engages y roam',
    aiAnalysis: 'Lee Sin sigue siendo el jungler más popular en ranked alto y competitivo. Su presión temprana con Q + W es inigualable, permitiéndole controlar ambos lados del mapa desde minuto 3. Aunque su win rate de 52.8% parece modesto, su impacto en el juego es masivo.\n\nEl build de Eclipse maximiza su burst en ganks tempranos. La transición a bruiser con Hidra Titánica le permite escalar correctamente.\n\nConsejo principal: Practica las combo de insec (Q → R → Flash) para ser un factor diferenciante. Controla vision en la jungla enemiga constantemente.',
    proPickRate: 15.3,
    runes: { primary: 'Precisión — Conquistador', secondary: 'Dominación — Golpe de Gracia', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  {
    name: 'Thresh', title: 'el Guardián de Cadenas', role: 'Support', tier: 'S', winRate: 51.9, pickRate: 15.2, banRate: 1.5, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['Lantern repositiona ADC sin riesgo', 'Engage + Peel en un kit → nunca mal pick', 'Pick rate 25%+ → siempre funciona'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/thresh/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/thresh"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/thresh"}],
    builds: [
      { name: 'Build Engage', items: 'Redención → Convergencia de Zeke → Medallón de los Solari de Hierro → Mikael → Botas de Movilidad', winRate: 52.3 },
      { name: 'Build AP', items: 'Reloj de Arena de Zhonya → Morellonomicon → Redención → Centro de Gravedad → Botas de CD', winRate: 50.1 },
    ],
    counterPick: 'Morgana, Nautilus, Leona',
    synergy: 'Jinx, Vayne, Caitlyn — Cualquier ADC de hypercarry',
    aiAnalysis: 'Thresh es el soporte más versátil del meta. Su kit completo (enganche, escudo, lantern pull, peel con E) lo hace útil en cualquier composición. Con el pick rate más alto entre supports (15.2%), es el pick más seguro para la bot lane.\n\nLa sinergia Thresh + Jinx es la más fuerte del parche. El lantern permite repositioning instantáneo de Jinx para teamfights.\n\nConsejo principal: Usa tu E (Flail) para interrumpir engages enemigos. No tengas miedo de usar el lantern ofensivamente para lanzar a tu ADC hacia el enemigo.',
    proPickRate: 25.6,
    runes: { primary: 'Determinación — Guardian', secondary: 'Brujería — Frailidad', shards: 'Armadura + Fuerza + Resistencia' },
  },
  {
    name: 'Darius', title: 'la Mano de Noxus', role: 'Top', tier: 'S', winRate: 53.5, pickRate: 7.8, banRate: 8.3, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['Q heal + hemorragia → gana todos los trades', 'E anchor bajo torre → dive gratis', 'Ban rate 10%+ → nadie quiere facing'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/darius/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/darius"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/darius"}],
    builds: [
      { name: 'Build Bruiser', items: 'Fuerza de Trinidad → Eclipse → Hidra Titánica → Mandato Imperial → Botas de Mercurio', winRate: 54.1 },
      { name: 'Build Anti-Tank', items: 'Pozo de la Noche → Filo Divino → Hidra → Mandato Imperial → Botas de Placas', winRate: 52.7 },
    ],
    counterPick: 'Teemo, Vayne, Gwen',
    synergy: 'Jarvan IV, Orianna — Comps con engage y follow-up',
    aiAnalysis: 'Darius es el top laner más temido del meta. Su Q decimatadora con el heal reciente lo convierte en una máquina de trading en lane. Con un ban rate del 8.3%, es uno de los campeones más evitados en draft.\n\nEl meta actual de bruisers le favorece enormemente. La reducción de defensas mágicas en varios items significa que su Q y passive son más letales que nunca.\n\nConsejo principal: Abusa de tu passive de hemorragia para ganar trades extendidos. Busca anchor con tu E bajo torre para resultados garantizados.',
    proPickRate: 10.3,
    runes: { primary: 'Precisión — Conquistador', secondary: 'Determinación — Segunda Vida', shards: 'Adaptativo + Velocidad + Resistencia' },
  },
  {
    name: 'Ahri', title: 'el Zorro de Nueve Colas', role: 'Mid', tier: 'S', winRate: 53.2, pickRate: 8.1, banRate: 2.8, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['Charm range buff → landing fácil', 'R 3 cargas → roaming impredecible', 'One-shot Rabadon → elimina carries'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/ahri/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/ahri"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/ahri"}],
    builds: [
      { name: 'Build Oneshot', items: 'Sombrero de Rabadon → Reloj de Zhonya → Llamasomo → Morellonomicon → Botas del Vacío', winRate: 54.2 },
      { name: 'Build Utility', items: 'Cetro de Cristal de Rylai → Llamasomo → Morellonomicon → Redención → Botas de CD', winRate: 51.5 },
    ],
    counterPick: 'Galio, Kassadin, Fizz',
    synergy: 'Thresh, Lee Sin — Buen follow-up para engage',
    aiAnalysis: 'Ahri asciende a Tier S gracias a los buffs en su E (Charm). El aumento de rango base le permite atrapar objetivos desde posiciones más seguras. Con un win rate del 53.2%, es la mid laner más consistente del meta.\n\nSu movilidad con ultimate le da un roaming excelente, permitiéndole impactar todas las lanes. El build de Rabadon maximiza su burst para one-shot carries enemigos.\n\nConsejo principal: Usa tu E para castigar errores de posicionamiento. Tras level 6, roam constantemente con tu ultimate para generar ventajas en otras lanes.',
    proPickRate: 18.5,
    runes: { primary: 'Brujería — Cometa Arcano', secondary: 'Precisión — Golpe de Gracia', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  {
    name: 'Yasuo', title: 'el Imperdonable', role: 'Mid', tier: 'S', winRate: 51.8, pickRate: 11.2, banRate: 4.7, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['Q tornado R teamwide → engage masivo', 'Wall bloquea todo AoE enemigo', 'Reset system → snowball sin límite'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/yasuo/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/yasuo"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/yasuo"}],
    builds: [
      { name: 'Build Crit', items: 'Filo de la Noche → Colmillo Infinito → Bailarín Espectral → Sed de Sangre → Botas de Berserker', winRate: 52.3 },
      { name: 'Build Lethality', items: 'Filo de la Noche → Eclipse → El Colector → Última Piedad → Botas de Movilidad', winRate: 50.8 },
    ],
    counterPick: 'Malzahar, Anivia, Lissandra',
    synergy: 'Taliyah, Yasuo + Taliyah wall combo; Gragas, engages con knock-up',
    aiAnalysis: 'Yasuo se mantiene en Tier S a pesar del nerf a su muro de viento (W). Su kit de reseteo con Q en tornado sigue siendo devastador en teamfights, especialmente con compositions que garantizan knock-ups.\n\nEl nerf al W (0.75s menos) lo hace más vulnerable contra habilidades de projectile, pero no afecta su capacidad de teamfight masiva con ultimate.\n\nConsejo principal: No fuerces plays agresivos sin tornado cargado. En la lane phase, usa E inteligentemente para farmar y esquivar habilidades al mismo tiempo.',
    proPickRate: 8.5,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Determinación — Sobrecrecimiento', shards: 'Adaptativo + Velocidad + Resistencia' },
  },
  {
    name: 'Caitlyn', title: 'el Sheriff de Piltover', role: 'ADC', tier: 'S', winRate: 52.5, pickRate: 9.6, banRate: 2.1, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['Rango 650 → domina lane vs todo ADC', 'Trampa + headshot lvl 2 → kill al lvl 2', 'Zoning con trampas → control gratis'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/caitlyn/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/caitlyn"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/caitlyn"}],
    builds: [
      { name: 'Build Poke', items: 'Poder de Kraken Slayer → La Séptima → Filo Infinito → Huracán de Runaan → Botas de Berserker', winRate: 53.1 },
      { name: 'Build Lethality', items: 'Filo de la Noche → Eclipse → El Colector → Filo Infinito → Botas de Movilidad', winRate: 51.7 },
    ],
    counterPick: 'Samira, Draven, Sivir',
    synergy: 'Morgana, Lux — Poke lanes con root para trampas',
    aiAnalysis: 'Caitlyn domina el early game en la bot lane gracias a su rango superior. Su combo de trampa + headshot puede eliminar a ADCs frágiles en el level 2. El buff a Kraken Slayer mejoró significativamente su scaling.\n\nEs especialmente fuerte contraADCs sin gap closer como Jinx en la fase de líneas. Sus trampas de W proporcionan control de mapa invaluable.\n\nConsejo principal: Coloca trampas estratégicamente en los arbustos de la bot lane para controlar la zona. En teamfights, mantén la distancia máxima con tu rango de 650.',
    proPickRate: 20.5,
    runes: { primary: 'Brujería — Cometa Arcano', secondary: 'Precisión — Presencia de Campeón', shards: 'Adaptativo + Fuerza + Resistencia' },
  },

  // Tier A — Fuertes
  { name: 'Orianna', title: 'la Dama de Relojería', role: 'Mid', tier: 'A', winRate: 51.2, pickRate: 6.3, banRate: 0.8, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R teamwide → mejor initiate', 'Ball = harass y peel simultáneo', 'Scaling ilimitado → late monster'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/orianna/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/orianna"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/orianna"}],
    builds: [
      { name: 'Build Control Mage', items: 'Sombrero de Rabadon → Reloj de Zhonya → Llamasomo → Morellonomicon → Botas del Vacío', winRate: 51.8 },
    ],
  },
  { name: 'Vi', title: 'el Ejecutor de Piltover', role: 'Jungle', tier: 'A', winRate: 50.8, pickRate: 5.2, banRate: 1.2, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R point-click → no se puede dodge', 'Eclipse bruiser → tanque y daño', 'Q gap closer → ganks lvl 2 garantizados'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/vi/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/vi"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/vi"}],
    builds: [
      { name: 'Build Bruiser', items: 'Cosechador Nocturno → Eclipse → Hidra Titánica → Fuerza de la Trinidad → Botas de Mercurio', winRate: 50.5 },
    ],
  },
  { name: 'Ezreal', title: 'el Explorador Pródigo', role: 'ADC', tier: 'A', winRate: 49.5, pickRate: 8.9, banRate: 0.5, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['Q spam → nunca en peligro en lane', 'E escape → imposible de gankear', 'Blue build → damage sin riesgo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/ezreal/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/ezreal"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/ezreal"}],
    builds: [
      { name: 'Build Blue Build', items: 'Filo de la Noche → Muramana → Hielo Eterno → Colmillo Infinito → Botas de CD', winRate: 49.8 },
    ],
  },
  { name: 'Lulu', title: 'la Hechicera Fada', role: 'Support', tier: 'A', winRate: 50.1, pickRate: 7.4, banRate: 0.3, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R peeling → protege carry completamente', 'W polymorph → shutdown carries', 'Meta estable → siempre relevante'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/lulu/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/lulu"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/lulu"}],
    builds: [
      { name: 'Build Enchanter', items: 'Redención → Convergencia de Zeke → Mikael → Medallón → Botas de CD', winRate: 50.5 },
    ],
  },
  { name: 'Garen', title: 'el Poder de Demacia', role: 'Top', tier: 'A', winRate: 51.5, pickRate: 6.7, banRate: 1.1, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['E CD reducido → más spins más daño', 'Passive sustain → nunca backea', 'Villain → punish carries sin esfuerzo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/garen/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/garen"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/garen"}],
    builds: [
      { name: 'Build Bruiser', items: 'Fuerza de Trinidad → Eclipse → Hidra Titánica → Resistencia Divina → Botas de Placas', winRate: 52.0 },
    ],
  },
  { name: 'Katarina', title: 'la Hoja Siniestra', role: 'Mid', tier: 'A', winRate: 50.3, pickRate: 7.1, banRate: 2.3, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R dagas AoE → teamwipe instantáneo', 'Mobility → imposible de atrapar', '1 kill = snowball teamfight'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/katarina/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/katarina"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/katarina"}],
    builds: [
      { name: 'Build Oneshot', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 50.8 },
    ],
  },
  { name: 'Graves', title: 'el Proscrito', role: 'Jungle', tier: 'A', winRate: 49.8, pickRate: 4.5, banRate: 0.6, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/graves/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/graves"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/graves"}],
    builds: [{ name: 'Build ADC', items: 'Filo Infinito → Huracán de Runaan → El Colector → Sed de Sangre → Botas de Berserker', winRate: 50.2 }],
  },
  { name: 'Vayne', title: 'la Cazadora Nocturna', role: 'ADC', tier: 'A', winRate: 50.6, pickRate: 5.8, banRate: 0.4, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['W % true damage → mata tanks', 'Q tumble → impossible hit skillshots', 'R burst desde stealth'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/vayne/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/vayne"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/vayne"}],
    builds: [
      { name: 'Build On-Hit', items: 'Guja Botadora → Frenesí de Runaan → Bailarín Espectral → Última Piedad → Botas de Berserker', winRate: 51.2 },
    ],
  },
  { name: 'Leona', title: 'el Amanecer Radiante', role: 'Support', tier: 'A', winRate: 51.0, pickRate: 4.9, banRate: 0.7, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['E+Q lockdown → CC chain infinito', 'Tankiness base → no necesita items', 'Solar flare → engage desde screen'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/leona/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/leona"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/leona"}],
    builds: [{ name: 'Build Tank', items: 'Redención → Medallón de los Solari → Convergencia de Zeke → Mikael → Botas de Movilidad', winRate: 50.5 }],
  },
  { name: 'Renekton', title: 'el Carnicero de las Arenas', role: 'Top', tier: 'A', winRate: 50.4, pickRate: 5.6, banRate: 1.5, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['E double dash → mobility sin igual', 'W empowered stun → trades ganados', 'Early dominance → gana todo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/renekton/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/renekton"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/renekton"}],
    builds: [{ name: 'Build Bruiser', items: 'Fuerza de la Trinidad → Eclipse → Hidra Titánica → Resistencia Divina → Botas de Placas', winRate: 50.2 }],
  },
  { name: 'Zed', title: 'el Maestro de Sombras', role: 'Mid', tier: 'A', winRate: 49.2, pickRate: 8.3, banRate: 3.8, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R shadow → assassinar sin riesgo', 'Energy → sin mana, spam abilities', 'Wave clear → nunca pierde CS'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/zed/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/zed"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/zed"}],
    builds: [{ name: 'Build Lethality', items: 'Filo de la Noche → Eclipse → El Colector → Última Piedad → Botas de Movilidad', winRate: 49.5 }],
  },
  { name: 'Amumu', title: 'la Momia Triste', role: 'Jungle', tier: 'A', winRate: 51.3, pickRate: 6.1, banRate: 0.9, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R AoE stun → mejor engage low elo', 'Clear speed → full clear sin problema', 'Tanky CC bot durable'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/amumu/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/amumu"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/amumu"}],
    builds: [{ name: 'Build Tank', items: 'Hidra Titánica → Fuerza de la Trinidad → Resistencia Divina → Medallón de los Solari → Botas de Placas', winRate: 51.0 }],
  },
  { name: 'Jhin', title: 'el Virtuoso', role: 'ADC', tier: 'A', winRate: 51.7, pickRate: 7.2, banRate: 1.0, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R snipe teamwide → damage a distancia', 'Crit passive → burst 4to shot', 'W root + trampa = pick seguro'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/jhin/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/jhin"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/jhin"}],
    builds: [
      { name: 'Build Crit', items: 'Filo de la Noche → Colmillo Infinito → Huracán de Runaan → Llamasomo → Botas de Berserker', winRate: 52.0 },
    ],
  },
  { name: 'Morgana', title: 'la Caída', role: 'Support', tier: 'A', winRate: 50.5, pickRate: 8.8, banRate: 1.3, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/morgana/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/morgana"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/morgana"}],
    builds: [{ name: 'Build AP', items: 'Morellonomicon → Sombrero de Rabadon → Reloj de Zhonya → Cetro de Rylai → Botas del Vacío', winRate: 50.8 }],
  },
  { name: 'Camille', title: 'la Sombra de Acero', role: 'Top', tier: 'A', winRate: 49.9, pickRate: 5.1, banRate: 2.0, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['Q true damage → trade en 1v1', 'E wall jump → engage + escape', 'R lock → elimina target en teamfight'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/camille/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/camille"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/camille"}],
    builds: [{ name: 'Build Bruiser', items: 'Cosechador Nocturno → Hidra Titánica → Fuerza de la Trinidad → Resistencia Divina → Botas de Mercurio', winRate: 50.5 }],
  },
  { name: 'Diana', title: 'el Desprecio de la Luna', role: 'Jungle', tier: 'A', winRate: 50.2, pickRate: 4.8, banRate: 1.4, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R dash AoE → engage AP instant', 'Shield + burst → trades favorables', 'Assassin jungle meta timing'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/diana/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/diana"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/diana"}],
    builds: [{ name: 'Build AP Assassin', items: 'Sombrero de Rabadon → Llamasomo → Morellonomicon → Reloj de Zhonya → Botas del Vacío', winRate: 50.8 }],
  },
  { name: 'Lux', title: 'la Dama de la Luminosidad', role: 'Mid', tier: 'A', winRate: 48.5, pickRate: 9.2, banRate: 0.6, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R execute global → snipe across map', 'E AoE slow → zone control masivo', 'Q root 2 seg → CC seguro'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/lux/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/lux"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/lux"}],
    builds: [{ name: 'Build Mage', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 49.0 }],
  },
  { name: 'Nami', title: 'la Invocadora de Mareas', role: 'Support', tier: 'A', winRate: 49.1, pickRate: 5.3, banRate: 0.2, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R AoE knockup → disengage perfecto', 'Heal + damage → utility completa', 'E buff → ADC amplificado'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/nami/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/nami"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/nami"}],
    builds: [{ name: 'Build Enchanter', items: 'Redención → Convergencia de Zeke → Mikael → Medallón de los Solari → Botas de CD', winRate: 49.5 }],
  },
  { name: 'Wukong', title: 'el Rey Mono', role: 'Top', tier: 'A', winRate: 48.8, pickRate: 4.2, banRate: 0.8, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R knockup teamwide → engage gratis', 'Clone jukes → engaña en fights', 'E+W → gap closer instantáneo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/wukong/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/wukong"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/wukong"}],
    builds: [{ name: 'Build Bruiser', items: 'Fuerza de la Trinidad → Eclipse → Hidra Titánica → Mandato Imperial → Botas de Mercurio', winRate: 49.2 }],
  },
  { name: 'Volibear', title: 'la Tormenta Implacable', role: 'Top', tier: 'A', winRate: 47.9, pickRate: 3.8, banRate: 0.5, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['E+Q flip → toss carry a tu team', 'W execute → finishing blow', 'Passive shield → impossible dive early'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/volibear/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/volibear"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/volibear"}],
    builds: [{ name: 'Build Tank', items: 'Hidra Titánica → Fuerza de la Trinidad → Resistencia Divina → Medallón de los Solari → Botas de Placas', winRate: 48.5 }],
  },
  { name: 'Twisted Fate', title: 'el Maestro de Cartas', role: 'Mid', tier: 'A', winRate: 48.2, pickRate: 4.5, banRate: 1.1, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R global → presión todas lanes', 'Gold card stun → pick garantizado', 'Wave clear → nunca pierde lane'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/twistedfate/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/twistedfate"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/twistedfate"}],
    builds: [{ name: 'Build AP', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 48.8 }],
  },
  { name: 'Ashe', title: 'la Arquera de Escarcha', role: 'ADC', tier: 'A', winRate: 49.3, pickRate: 6.4, banRate: 0.3, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R global stun → engage desde lejos', 'W slow spam → kite infinito', 'Passive crit → burst inesperado'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/ashe/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/ashe"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/ashe"}],
    builds: [{ name: 'Build Crit', items: 'Filo Infinito → Huracán de Runaan → Bailarín Espectral → Sed de Sangre → Botas de Berserker', winRate: 49.8 }],
  },
  { name: 'Rakan', title: 'el Encantador', role: 'Support', tier: 'A', winRate: 48.1, pickRate: 4.7, banRate: 0.2, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['W engage → pelea por ADC seguro', 'R AoE knockup → combo CC', 'Mobility → impossible to catch'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/rakan/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/rakan"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/rakan"}],
    builds: [{ name: 'Build Enchanter', items: 'Redención → Convergencia de Zeke → Mikael → Medallón de los Solari → Botas de Movilidad', winRate: 48.5 }],
  },
  { name: 'Xin Zhao', title: 'el Senescal de Demacia', role: 'Jungle', tier: 'A', winRate: 48.7, pickRate: 3.9, banRate: 0.4, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/xinzhao/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/xinzhao"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/xinzhao"}],
    builds: [{ name: 'Build Bruiser', items: 'Cosechador Nocturno → Eclipse → Hidra Titánica → Fuerza de la Trinidad → Botas de Mercurio', winRate: 49.0 }],
  },
  { name: 'Tristana', title: 'la Pistolera Yordle', role: 'ADC', tier: 'A', winRate: 48.9, pickRate: 5.1, banRate: 0.5, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['E+Q knockup → lock sin escape', 'R knockback → separation fights', 'Dueling → 1v1 monster'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/tristana/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/tristana"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/tristana"}],
    builds: [{ name: 'Build Crit', items: 'Filo Infinito → Huracán de Runaan → Bailarín Espectral → Sed de Sangre → Botas de Berserker', winRate: 49.5 }],
  },
  { name: 'Shen', title: 'el Ojo del Crepúsculo', role: 'Top', tier: 'A', winRate: 47.5, pickRate: 3.2, banRate: 0.7, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R global shield → save teammates', 'E dash taunt → lockdown seguro', 'Split push → pressure sin estar'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/shen/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/shen"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/shen"}],
    builds: [{ name: 'Build Tank', items: 'Hidra Titánica → Fuerza de la Trinidad → Resistencia Divina → Medallón de los Solari → Botas de Placas', winRate: 48.0 }],
  },
  { name: 'Syndra', title: 'la Soberana Oscura', role: 'Mid', tier: 'A', winRate: 47.8, pickRate: 4.1, banRate: 0.9, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R balls delete → one-shot carries', 'E pushback → self peel', 'Scaling → late game AP'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/syndra/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/syndra"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/syndra"}],
    builds: [{ name: 'Build AP', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 48.2 }],
  },
  { name: 'Nidalee', title: 'la Cazadora Bestial', role: 'Jungle', tier: 'A', winRate: 46.5, pickRate: 2.3, banRate: 0.4, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['Spear → one-shot carries', 'Cougar mobility → impossible catch', 'Counter jungle → starves enemy'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/nidalee/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/nidalee"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/nidalee"}],
    builds: [{ name: 'Build AP', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 47.0 }],
  },
  { name: 'Braum', title: 'el Corazón de los Freljord', role: 'Support', tier: 'A', winRate: 46.8, pickRate: 2.5, banRate: 0.1, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['E wall → blocks projectiles', 'R knockup → best defensive ult', 'Peel god support'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/braum/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/braum"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/braum"}],
    builds: [{ name: 'Build Tank', items: 'Redención → Medallón de los Solari → Convergencia de Zeke → Mikael → Botas de Movilidad', winRate: 47.5 }],
  },
  { name: "Vel'Koz", title: 'el Ojo del Vacío', role: 'Mid', tier: 'A', winRate: 46.0, pickRate: 1.9, banRate: 0.3, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/velkoz/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/velkoz"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/velkoz"}],
    builds: [{ name: 'Build Mage', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 46.5 }],
  },
  { name: 'Taliyah', title: 'la Tejedora de Piedras', role: 'Mid', tier: 'A', winRate: 46.3, pickRate: 2.0, banRate: 0.2, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R isolation → 1v1 garantizado', 'Q AoE → teamfight monster', 'Passive shield → sustain sin items'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/taliyah/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/taliyah"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/taliyah"}],
    builds: [{ name: 'Build AP', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 46.5 }],
  },

  // Tier B — Jugables
  { name: 'Yorick', title: 'el Pastor de Almas', role: 'Top', tier: 'B', winRate: 46.2, pickRate: 2.1, banRate: 0.3, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['Maiden → 2v1 lane sin esfuerzo', 'Wall → zona muerte fights', 'Split monster → necesita 2+ para parar'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/yorick/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/yorick"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/yorick"}],
    builds: [{ name: 'Build Split Push', items: 'Fuerza de la Trinidad → Eclipse → Hidra Titánica → Resistencia Divina → Botas de Placas', winRate: 46.8 }],
  },
  { name: 'Ivern', title: 'el Padre Verde', role: 'Jungle', tier: 'B', winRate: 45.8, pickRate: 1.5, banRate: 0.1, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['Counter jungle → steal sin riesgo', 'Shield + speed → peel top tier', 'Daisy → CC objetive fights'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/ivern/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/ivern"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/ivern"}],
    builds: [{ name: 'Build Enchanter', items: 'Redención → Convergencia de Zeke → Mikael → Medallón de los Solari → Botas de CD', winRate: 46.2 }],
  },
  { name: 'Kalista', title: 'la Lanza de la Venganza', role: 'ADC', tier: 'B', winRate: 45.5, pickRate: 1.8, banRate: 0.2, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R save → unkillable ally', 'E execute → finish secured', 'Atk speed → highest DPS'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/kalista/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/kalista"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/kalista"}],
    builds: [{ name: 'Build On-Hit', items: 'Guja Botadora → Frenesí de Runaan → Bailarín Espectral → Sed de Sangre → Botas de Berserker', winRate: 46.0 }],
  },
  { name: 'Mordekaiser', title: 'el Reveniente de Hierro', role: 'Top', tier: 'B', winRate: 45.2, pickRate: 2.7, banRate: 0.6, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/mordekaiser/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/mordekaiser"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/mordekaiser"}],
    builds: [{ name: 'Build AP Bruiser', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 45.8 }],
  },
  { name: 'Bard', title: 'el Cuidador Errante', role: 'Support', tier: 'B', winRate: 43.5, pickRate: 1.2, banRate: 0.1, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R stasis → save y freeze', 'E journey → rotation unique', 'Chime stacking → late AP'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/bard/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/bard"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/bard"}],
    builds: [{ name: 'Build Enchanter', items: 'Redención → Mikael → Convergencia de Zeke → Medallón de los Solari → Botas de CD', winRate: 44.0 }],
  },
  { name: 'Skarner', title: 'el Vanguardia de Cristal', role: 'Jungle', tier: 'B', winRate: 44.1, pickRate: 0.8, banRate: 0.1, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R suppression → no escape', 'E speed → engage rápido', 'Crystal zone → domination'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/skarner/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/skarner"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/skarner"}],
    builds: [{ name: 'Build Tank', items: 'Hidra Titánica → Fuerza de la Trinidad → Resistencia Divina → Medallón de los Solari → Botas de Placas', winRate: 44.8 }],
  },
  { name: 'Azir', title: 'el Emperador de las Arenas', role: 'Mid', tier: 'B', winRate: 43.8, pickRate: 1.0, banRate: 0.2, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R shuffle → reposiciona enemigos', 'Soldier DPS → damage safe', 'Shurima shuffle → fight turn'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/azir/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/azir"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/azir"}],
    builds: [{ name: 'Build Control Mage', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 44.5 }],
  },
  { name: 'Urgot', title: 'el Acorazado', role: 'Top', tier: 'B', winRate: 44.5, pickRate: 1.4, banRate: 0.3, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/urgot/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/urgot"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/urgot"}],
    builds: [{ name: 'Build Bruiser', items: 'Fuerza de la Trinidad → Eclipse → Hidra Titánica → Resistencia Divina → Botas de Placas', winRate: 45.2 }],
  },
  { name: 'Malphite', title: 'el Monolito de Piedra', role: 'Top', tier: 'B', winRate: 48.5, pickRate: 3.5, banRate: 0.4, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R AoE knockup → mejor engage Teamfight', 'E armor scaling → imposible de lastimar en lane'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/malphite/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/malphite"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/malphite"}],
    builds: [{ name: 'Build Tank', items: 'Fuerza de la Trinidad → Resistencia Divina → Hidra Titánica → Medallón de los Solari → Botas de Placas', winRate: 48.2 }],
  },
  { name: 'Senna', title: 'la Redentora', role: 'Support', tier: 'B', winRate: 49.0, pickRate: 4.8, banRate: 0.5, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R global heal → teamwide sustain', 'Q infinite scaling → late game ADC'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/senna/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/senna"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/senna"}],
    builds: [{ name: 'Build ADC', items: 'Filo Infinito → Huracán de Runaan → Bailarín Espectral → Sed de Sangre → Botas de Berserker', winRate: 49.5 }],
  },
  { name: 'Draven', title: 'el Gladiador', role: 'ADC', tier: 'B', winRate: 49.8, pickRate: 5.2, banRate: 1.8, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['Q axe catch → más daño base del juego', 'Passive gold → snowball económico'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/draven/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/draven"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/draven"}],
    builds: [{ name: 'Build Lethality', items: 'Filo de la Noche → Eclipse → El Colector → Sed de Sangre → Botas de Movilidad', winRate: 50.1 }],
  },
  { name: 'Elise', title: 'la Araña de la Spin', role: 'Jungle', tier: 'B', winRate: 48.1, pickRate: 3.1, banRate: 0.6, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['Spider form burst → invade y mata', 'Cocoon stun → ganks garantizados'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/elise/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/elise"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/elise"}],
    builds: [{ name: 'Build AP', items: 'Sombrero de Rabadon → Morellonomicon → Reloj de Zhonya → Llamasomo → Botas de CD', winRate: 47.8 }],
  },
  { name: 'Nautilus', title: 'el Titán de las Profundidades', role: 'Support', tier: 'B', winRate: 49.5, pickRate: 5.7, banRate: 0.8, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R point-click → imposible fallar', 'CC machine → 4 formas de stun'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/nautilus/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/nautilus"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/nautilus"}],
    builds: [{ name: 'Build Tank', items: 'Redención → Medallón de los Solari → Convergencia de Zeke → Mikael → Botas de Movilidad', winRate: 50.0 }],
  },
  { name: 'Ekko', title: 'el Niño Prodigio', role: 'Jungle', tier: 'B', winRate: 47.8, pickRate: 4.2, banRate: 1.2, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R rewind → juega agresivo sin riesgo', 'E gap close → ganks lvl 2'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/ekko/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/ekko"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/ekko"}],
    builds: [{ name: 'Build AP Assassin', items: 'Sombrero de Rabadon → Llamasomo → Morellonomicon → Reloj de Zhonya → Botas del Vacío', winRate: 47.5 }],
  },
  { name: 'Kennen', title: 'el Corazón de la Tormenta', role: 'Top', tier: 'B', winRate: 47.2, pickRate: 2.8, banRate: 0.9, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '14.8', game: 'LoL',
    brokenThings: ['R AoE stun → teamfight devastador', 'Energy → sin mana problemas'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/kennen/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/kennen"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/kennen"}],
    builds: [{ name: 'Build AP', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 47.0 }],
  },

  // ============ WILD RIFT CHAMPIONS ============
  // Tier S — Dioses del Meta (Wild Rift)
  {
    name: 'Master Yi', title: 'el Buscador de Wuju', role: 'Jungle', tier: 'S', winRate: 56.8, pickRate: 16.3, banRate: 15.2, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    brokenThings: ['Q resetea en kills → snowball infinito', 'Combo Yi+Taric invulnerable → sin interacción', 'Alpha Strike dodgea habilidades intargetable'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/masteryi/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/masteryi"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/masteryi"}],
    builds: [
      { name: 'Build Oneshot', items: 'Filo de la Noche → Eclipse → Roca del Eclipse → Última Piedad → Botas de Mercurio', winRate: 56.1 },
      { name: 'Build Sustained', items: 'Eclipse → Roca del Eclipse → Guardián Angel → Botas de CD', winRate: 53.4 },
    ],
    counterPick: 'Rammus, Malzahar, Teemo',
    synergy: 'Taric, Yuumi — Composición invencible en bot lane',
    aiAnalysis: 'Master Yi es el jungler más dominante de Wild Rift. Su Alpha Strike con los ajustes de móvil lo convierten en una máquina de snowball. El rango reducido del mapa y los tiempos de respawn más cortos amplifican su capacidad de reseteo.\n\nEl build de Eclipse maximiza burst en ganks tempranos. En Wild Rift, los juegos son más cortos, lo que favorece enormemente su estilo de carry agresivo.\n\nConsejo: Prioriza Dragon y Herald. Los objetivos aparecen más rápido en WR, y Master Yi puede controlarlos fácilmente.',
    proPickRate: 8.2,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Brujería — Colección de Ojos', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  {
    name: 'Jinx', title: 'la Cañón Suelto', role: 'ADC', tier: 'S', winRate: 55.1, pickRate: 14.8, banRate: 6.3, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    brokenThings: ['Pasiva 1 kill = limpia teamfight', 'W rango buff → poke sin respuesta', 'Kraken + Runaan = AoE masivo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/jinx/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/jinx"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/jinx"}],
    builds: [
      { name: 'Build Hypercarry', items: 'Filo Infinito → Huracán de Runaan → Bailarín Espectral → Sed de Sangre → Botas de Berserker', winRate: 55.8 },
      { name: 'Build Lethality', items: 'Filo de la Noche → Última Piedad → El Colector → Sed de Sangre → Botas de Movilidad', winRate: 53.2 },
    ],
    counterPick: 'Caitlyn, Draven, Zed',
    synergy: 'Thresh, Nautilus — Engage fuerte para activar pasiva',
    aiAnalysis: 'Jinx domina la bot lane de Wild Rift. Su pasiva se activa con más frecuencia gracias al ritmo más rápido del juego móvil. El buff reciente a su W aumentó el rango, haciéndola aún más segura en lane.\n\nEn Wild Rift, los teamfights son más frecuentes y en espacios más cerrados, lo que maximiza el AoE de su ultimate Zap!. Su scaling es devastador desde minuto 8.\n\nConsejo: Tras level 5, busca robar Herald con tu ultimate. Es game-changing en WR.',
    proPickRate: 25.3,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Brujería — Frailidad', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  {
    name: 'Lee Sin', title: 'el Monje Ciego', role: 'Jungle', tier: 'S', winRate: 53.5, pickRate: 12.1, banRate: 8.5, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    brokenThings: ['Insec Q→R→Flash → pick sin counterplay', 'Pressure level 2-3 inigualable', 'Eclipse burst → mata carries en 1 combo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/leesin/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/leesin"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/leesin"}],
    builds: [
      { name: 'Build Bruiser', items: 'Cosechador Nocturno → Eclipse → Hidra Titánica → Fuerza de la Trinidad → Botas de Mercurio', winRate: 53.2 },
      { name: 'Build Full AD', items: 'Filo de la Noche → Eclipse → Roca del Eclipse → El Coleccionista → Botas de CD', winRate: 51.7 },
    ],
    counterPick: 'Nidalee, Elise, Evelynn',
    synergy: 'Ahri, Yasuo — Buen follow-up para combos',
    aiAnalysis: 'Lee Sin en Wild Rift es aún más fuerte que en PC. El mapa más chico significa que sus ganks llegan más rápido, y el flash con menor cooldown permite más plays con su combo de insec. Su win rate de 53.5% lo pone como top 3 jungler.\n\nEl build bruiser es el más consistente. La transición de ganker temprano a bruiser de teamfight es natural.\n\nConsejo: En WR, practica las combos de Q + Flash + R. El mapa chico hace que cada gank cuente el doble.',
    proPickRate: 18.7,
    runes: { primary: 'Precisión — Conquistador', secondary: 'Dominación — Golpe de Gracia', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  {
    name: 'Ahri', title: 'el Zorro de Nueve Colas', role: 'Mid', tier: 'S', winRate: 54.2, pickRate: 11.5, banRate: 4.2, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    brokenThings: ['Charm range buff → landing fácil', 'R 3 cargas → roaming impredecible', 'One-shot Rabadon → elimina carries'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/ahri/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/ahri"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/ahri"}],
    builds: [
      { name: 'Build Oneshot', items: 'Sombrero de Rabadon → Reloj de Zhonya → Llamasomo → Morellonomicon → Botas del Vacío', winRate: 54.8 },
      { name: 'Build Utility', items: 'Cetro de Rylai → Llamasomo → Morellonomicon → Redención → Botas de CD', winRate: 52.1 },
    ],
    counterPick: 'Galio, Kassadin, Fizz',
    synergy: 'Lee Sin, Jarvan IV — Engage + follow-up mortal',
    aiAnalysis: 'Ahri es la mid laner más versátil de Wild Rift. Su Charm (E) con el rango ajustado para móvil es más fácil de landing, y su ultimate con 3 cargas le da roaming excepcional. Con el mapa más chico, puede impactar todas las lanes rápidamente.\n\nEl build de Rabadon maximiza burst para one-shot carries. Es especialmente fuerte en el meta actual de partidas rápidas.\n\nConsejo: Roam constantemente tras level 5. En WR, la distancia entre mid y bot/top es menor, aprovecha eso.',
    proPickRate: 20.1,
    runes: { primary: 'Brujería — Cometa Arcano', secondary: 'Precisión — Golpe de Gracia', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  {
    name: 'Darius', title: 'la Mano de Noxus', role: 'Top', tier: 'S', winRate: 54.5, pickRate: 9.8, banRate: 10.1, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    brokenThings: ['Q heal + hemorragia → gana todos los trades', 'E anchor bajo torre → dive gratis', 'Ban rate 10%+ → nadie quiere facing'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/darius/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/darius"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/darius"}],
    builds: [
      { name: 'Build Bruiser', items: 'Fuerza de Trinidad → Eclipse → Hidra Titánica → Mandato Imperial → Botas de Mercurio', winRate: 55.1 },
      { name: 'Build Anti-Tank', items: 'Pozo de la Noche → Filo Divino → Hidra → Mandato Imperial → Botas de Placas', winRate: 53.3 },
    ],
    counterPick: 'Teemo, Vayne, Gwen',
    synergy: 'Jarvan IV, Orianna — Comps con engage masivo',
    aiAnalysis: 'Darius en Wild Rift es un terror en top lane. Su Q con el heal ajustado y el pasiva de hemorragía lo convierten en el mejor trader del meta. Con un ban rate del 10.1%, es el campeón más evitado en draft.\n\nEl meta de bruisers en WR es aún más fuerte que en PC porque los juegos son más cortos y los teamfights más frecuentes.\n\nConsejo: Abusa de tu E para anchor bajo torre. En WR, las torres son más débiles, así que el dive es más riesgoso para el enemigo.',
    proPickRate: 12.4,
    runes: { primary: 'Precisión — Conquistador', secondary: 'Determinación — Segunda Vida', shards: 'Adaptativo + Velocidad + Resistencia' },
  },
  {
    name: 'Thresh', title: 'el Guardián de Cadenas', role: 'Support', tier: 'S', winRate: 52.8, pickRate: 16.5, banRate: 2.1, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    brokenThings: ['Lantern repositiona ADC sin riesgo', 'Engage + Peel en un kit → nunca mal pick', 'Pick rate 25%+ → siempre funciona'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/thresh/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/thresh"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/thresh"}],
    builds: [
      { name: 'Build Engage', items: 'Redención → Convergencia de Zeke → Medallón de los Solari → Mikael → Botas de Movilidad', winRate: 53.2 },
      { name: 'Build AP', items: 'Reloj de Zhonya → Morellonomicon → Redención → Centro de Gravedad → Botas de CD', winRate: 50.8 },
    ],
    counterPick: 'Morgana, Nautilus, Leona',
    synergy: 'Jinx, Vayne, Caitlyn — Cualquier ADC de hypercarry',
    aiAnalysis: 'Thresh es el soporte más versátil de Wild Rift. Su lantern con el target adjustado para móvil es más fácil de usar, y su capacidad de peel en el mapa más chico es invaluable. Con el pick rate más alto entre supports, es el pick más seguro.\n\nEn WR, los ganks de jungler son más frecuentes, y Thresh es el mejor soporte para jugar contra ganks con su E y lantern.\n\nConsejo: Usa el lantern ofensivamente para lanzar a tu ADC. En el mapa chico de WR, esto es aún más efectivo.',
    proPickRate: 27.8,
    runes: { primary: 'Determinación — Guardian', secondary: 'Brujería — Frailidad', shards: 'Armadura + Fuerza + Resistencia' },
  },

  // Tier A — Fuertes (Wild Rift)
  { name: 'Ezreal', title: 'el Explorador Pródigo', role: 'ADC', tier: 'A', winRate: 50.8, pickRate: 10.2, banRate: 0.8, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    brokenThings: ['Q spam → nunca en peligro en lane', 'E escape → imposible de gankear', 'Blue build → damage sin riesgo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/ezreal/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/ezreal"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/ezreal"}],
    builds: [{ name: 'Build Blue', items: 'Filo de la Noche → Muramana → Hielo Eterno → Colmillo Infinito → Botas de CD', winRate: 51.2 }],
    counterPick: 'Samira, Draven, Sivir',
    synergy: 'Lux, Morgana — Root y poke para maximizar Q',
    aiAnalysis: 'Ezreal en Wild Rift es uno de los ADC más seguros del meta móvil. Su Q (Mystic Shot) con el auto-aim asistido para controles táctiles es mucho más fácil de landing que en PC, y su E (Arcane Shift) le da escape instantáneo contra ganks. En el mapa compacto de WR, puede pokear desde distancia de forma constante sin arriesgarse.\n\nEl Blue Build con Muramana maximiza su daño sostenido en teamfights. La sinergia con supports de poke como Lux y Morgana es estadísticamente la mejor combinación para WR.\n\nConsejo: En WR, spam Q constantemente en lane para harass. Los cooldowns en móvil son más manejables, y el mapa chico permite que tu poke alcance más zonas del mapa.',
    proPickRate: 8.5,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Brujería — Colección de Ojos', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Zed', title: 'el Maestro de Sombras', role: 'Mid', tier: 'A', winRate: 50.3, pickRate: 9.1, banRate: 4.5, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/zed/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/zed"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/zed"}],
    builds: [{ name: 'Build Oneshot', items: 'Filo de la Noche → Eclipse → El Coleccionista → Última Piedad → Botas de Movilidad', winRate: 50.9 }],
    brokenThings: ['R shadow → assassinar sin riesgo en móvil', 'Energy → sin mana, spam abilities', 'W+Q combo → burst mobile instantáneo'],
    counterPick: 'Galio, Morgana, Garen',
    synergy: 'Lee Sin, Vi — Engage para crear ventajas en map chico',
    aiAnalysis: 'Zed en Wild Rift es el asesino más popular de mid lane. Su R (Death Mark) con los controles simplificados de móvil es más fácil de ejecutar, y su sombra le da movilidad excepcional en el mapa compacto. La distancia reducida entre mid y las otras lanes amplifica su capacidad de roam y eliminar carries.\n\nEl build lethality maximiza su burst temprano. En WR, los juegos cortos favorecen enormemente su estilo de snowball agresivo, ya que no necesita escalar tanto.\n\nConsejo: Practica el combo R → auto → Q → E, que en controles táctiles es más sencillo que en PC. Usa tu W para posicionarte antes de combo y escapar tras el asesinato.',
    proPickRate: 6.2,
    runes: { primary: 'Dominación — Golpe de Gracia', secondary: 'Precisión — Presencia de Campeón', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Garen', title: 'el Poder de Demacia', role: 'Top', tier: 'A', winRate: 52.1, pickRate: 8.3, banRate: 1.5, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    brokenThings: ['E CD reducido → más spins más daño', 'Passive sustain → nunca backea', 'Villain → punish carries sin esfuerzo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/garen/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/garen"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/garen"}],
    builds: [{ name: 'Build Bruiser', items: 'Fuerza de Trinidad → Eclipse → Hidra → Resistencia Divina → Botas de Placas', winRate: 52.8 }],
    counterPick: 'Teemo, Vayne, Camille',
    synergy: 'Jarvan IV, Morgana — Engage + CC para spin en teamfight',
    aiAnalysis: 'Garen en Wild Rift es un top laner extremadamente sólido. Su pasiva de regeneración brilla en WR porque los juegos son más cortos y los back más infrecuentes. Su E (Judgment) con CD reducido le da presión constante en lane, y el sistema de Villain lo hace más letal contra carries.\n\nEl build bruiser con Fuerza de Trinidad maximiza daño y sustain. En WR, el meta de partidas rápidas con teamfights frecuentes le favorece enormemente porque su Q decimatadora escala con HP.\n\nConsejo: Abusa de tu pasiva entre trades para mantener vida full. En WR, las distancias son más cortas, así que usa tu Q para chasear enemigos que se retiran tras exchanges.',
    proPickRate: 3.8,
    runes: { primary: 'Precisión — Conquistador', secondary: 'Determinación — Segunda Vida', shards: 'Adaptativo + Velocidad + Resistencia' },
  },
  { name: 'Katarina', title: 'la Hoja Siniestra', role: 'Mid', tier: 'A', winRate: 50.6, pickRate: 7.8, banRate: 2.8, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/katarina/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/katarina"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/katarina"}],
    builds: [{ name: 'Build Oneshot', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 51.1 }],
    brokenThings: ['R dagas AoE → teamwipe instantáneo en espacios cerrados', 'Shunpo mobility → imposible de atrapar en mapa chico', '1 kill = snowball teamfight'],
    counterPick: 'Malzahar, Diana, Ahri',
    synergy: 'Vi, Lee Sin — Engage para preparar dagas en fights',
    aiAnalysis: 'Katarina en Wild Rift es devastadora. Su R (Death Lotus) con los controles táctiles simplificados es más fácil de posicionar en teamfights cerrados, y su shunpo le da movilidad infinita en el mapa compacto. La distancia reducida entre lanes amplifica su capacidad de limpiar teamfights tras un solo kill.\n\nEl build AP oneshot maximiza su burst. En WR, los teamfights más frecuentes y en espacios reducidos del mapa son perfectos para las dagas de su ultimate.\n\nConsejo: Espera a que el enemigo use su CC antes de entrar con R. En WR, los combos son más simples con controles táctiles, así que enfócate en posicionarte bien.',
    proPickRate: 5.1,
    runes: { primary: 'Brujería — Cometa Arcano', secondary: 'Precisión — Golpe de Gracia', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Vi', title: 'el Ejecutor de Piltover', role: 'Jungle', tier: 'A', winRate: 51.5, pickRate: 6.8, banRate: 1.8, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    brokenThings: ['R point-click → no se puede dodge', 'Eclipse bruiser → tanque y daño', 'Q gap closer → ganks lvl 2 garantizados'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/vi/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/vi"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/vi"}],
    builds: [{ name: 'Build Bruiser', items: 'Cosechador Nocturno → Eclipse → Hidra Titánica → Fuerza de la Trinidad → Botas de Mercurio', winRate: 51.2 }],
    counterPick: 'Elise, Nidalee, Shaco',
    synergy: 'Ahri, Zed — Burst para eliminar carries rápidamente',
    aiAnalysis: 'Vi en Wild Rift es el jungler más confiable para ranked. Su R (Cease and Desist) es point-and-click, lo que en controles táctiles es una ventaja enorme: no necesitas precisión para enganchar al carry enemigo. En el mapa chico de WR, la distancia entre la jungla y las lanes es menor, haciendo sus ganks mucho más efectivos.\n\nEl build bruiser con Eclipse maximiza daño y supervivencia. Es especialmente fuerte en el meta de WR donde los juegos son rápidos y los ganks tempranos definien el ritmo.\n\nConsejo: En WR, gank nivel 3 con Q+E es casi garantizado. Prioriza bot lane donde el mapa compacto te da ventaja de distancia.',
    proPickRate: 7.3,
    runes: { primary: 'Precisión — Conquistador', secondary: 'Dominación — Golpe de Gracia', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Lulu', title: 'la Hechicera Fada', role: 'Support', tier: 'A', winRate: 50.9, pickRate: 8.1, banRate: 0.5, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    brokenThings: ['R peeling → protege carry completamente', 'W polymorph → shutdown carries', 'Meta estable → siempre relevante'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/lulu/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/lulu"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/lulu"}],
    builds: [{ name: 'Build Enchanter', items: 'Redención → Convergencia de Zeke → Mikael → Medallón → Botas de CD', winRate: 51.4 }],
    counterPick: 'Leona, Nautilus, Blitzcrank',
    synergy: 'Jinx, Vayne — Peel para hypercarries en WR',
    aiAnalysis: 'Lulu en Wild Rift es el soporte enchanter por excelencia. Su R (Wild Growth) con el target asistido para móvil es más fácil de usar, y su W (Whimsy) shutdown carries enemigos instantáneamente. En los teamfights cerrados del mapa compacto, su utilidad se multiplica enormemente.\n\nEl build enchanter maximiza peel y utilidad. En WR, donde los teamfights son más frecuentes y en espacios reducidos, Lulu brilla más que en PC.\n\nConsejo: Guarda tu R para salvar a tu carry en momentos críticos. En WR los fights son rápidos, así que la timing del R de Lulu es game-changing.',
    proPickRate: 6.8,
    runes: { primary: 'Determinación — Guardian', secondary: 'Brujería — Frailidad', shards: 'Armadura + Fuerza + Resistencia' },
  },
  { name: 'Vayne', title: 'la Cazadora Nocturna', role: 'ADC', tier: 'A', winRate: 51.2, pickRate: 5.5, banRate: 0.6, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    brokenThings: ['W % true damage → mata tanks', 'Q tumble → impossible hit skillshots', 'R burst desde stealth'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/vayne/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/vayne"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/vayne"}],
    builds: [{ name: 'Build On-Hit', items: 'Guja Botadora → Frenesí de Runaan → Bailarín Espectral → Última Piedad → Botas de Berserker', winRate: 51.8 }],
    counterPick: 'Draven, Caitlyn, Jhin',
    synergy: 'Lulu, Thresh — Protección máxima para 1v9',
    aiAnalysis: 'Vayne en Wild Rift es una máquina de true damage. Su W (Silver Bolts) con 3 stacks hace daño verdadero masivo a tanks, crucial en el meta actual de bruisers. Su Q (Tumble) en el mapa chico es más efectivo para esquivar habilidades gracias a los controles táctiles.\n\nEl build on-hit maximiza su daño por stack. En WR, los juegos cortos significan que necesita snowballar temprano y aprovechar su poder de 1v1.\n\nConsejo: En WR, practica el tumble-condemn (Q→E) contra las paredes del mapa. El mapa chico tiene más muros cerca de las lanes, facilitando el stun.',
    proPickRate: 4.5,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Determinación — Sobrecrecimiento', shards: 'Adaptativo + Velocidad + Resistencia' },
  },
  { name: 'Camille', title: 'la Sombra de Acero', role: 'Top', tier: 'A', winRate: 50.4, pickRate: 6.2, banRate: 2.5, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/camille/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/camille"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/camille"}],
    builds: [{ name: 'Build Bruiser', items: 'Cosechador Nocturno → Hidra Titánica → Fuerza de la Trinidad → Resistencia Divina → Botas de Mercurio', winRate: 50.5 }],
    brokenThings: ['Q true damage → trade ganado siempre', 'E wall jump → engage + escape en mapa chico', 'R lock → elimina target en 1v1 sin counterplay'],
    counterPick: 'Teemo, Gwen, Fiora',
    synergy: 'Jarvan IV, Orianna — Engage con follow-up devastador',
    aiAnalysis: 'Camille en Wild Rift es la top laner más versátil del meta. Su R (The Hextech Ultimatum) con target simplificado para móvil es más fácil de ejecutar, y su E (Hookshot) le da movilidad excepcional. En el mapa compacto, puede dividir y unirse al equipo con split push muy efectivo.\n\nEl build bruiser maximiza sustain y daño mixto. En WR, su capacidad de 1v1 es una de las mejores del juego, ideal para el meta de partidas cortas.\n\nConsejo: Usa tu E para escalar muros del mapa chico rápidamente. El tiempo de viaje entre lanes es menor en WR, aprovecha para roam tras empujar.',
    proPickRate: 5.9,
    runes: { primary: 'Precisión — Conquistador', secondary: 'Determinación — Segunda Vida', shards: 'Adaptativo + Velocidad + Resistencia' },
  },
  { name: 'Graves', title: 'el Proscrito', role: 'Jungle', tier: 'A', winRate: 49.8, pickRate: 5.1, banRate: 0.8, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    brokenThings: ['R lockdown → elimina target de fight', 'E wall jump → escape ganks', 'Q2 true damage → shredding tanks'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/graves/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/graves"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/graves"}],
    builds: [{ name: 'Build ADC', items: 'Filo Infinito → Huracán de Runaan → El Colector → Sed de Sangre → Botas de Berserker', winRate: 50.2 }],
    counterPick: 'Nidalee, Elise, Kindred',
    synergy: 'Ahri, Morgana — CC para landing fácil de R',
    aiAnalysis: 'Graves en Wild Rift es un jungler híbrido devastador. Su Q con el cono ajustado para móvil es más fácil de apuntar, y su E (Quickdraw) le da movilidad en la jungla compacta. El mapa chico amplifica su daño AoE en teamfights cerrados.\n\nEl build ADC crit maximiza su burst en objetivos y teamfights. En WR, su clear speed es una de las mejores, permitiéndole controlar dragones y heralds con facilidad.\n\nConsejo: En WR, gank desde los arbustos con Q+R. El mapa compacto significa que siempre estás cerca de una lane para presionar.',
    proPickRate: 4.2,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Dominación — Colección de Ojos', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Morgana', title: 'la Caída', role: 'Support', tier: 'A', winRate: 51.0, pickRate: 9.5, banRate: 1.5, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/morgana/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/morgana"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/morgana"}],
    builds: [{ name: 'Build AP', items: 'Morellonomicon → Sombrero de Rabadon → Reloj de Zhonya → Cetro de Rylai → Botas del Vacío', winRate: 50.8 }],
    brokenThings: ['Q root 2 seg → CC garantizado en móvil', 'E Black Shield → bloquea todo CC enemigo', 'R AoE stun → teamfight breaker en espacios cerrados'],
    counterPick: 'Thresh, Blitzcrank, Leona',
    synergy: 'Jhin, Varus — Poke y CC para maximizar Q root',
    aiAnalysis: 'Morgana en Wild Rift es el soporte anti-engage por excelencia. Su E (Black Shield) bloquea CC entrante, vital en el meta de WR con tantos champions de engage. Su Q (Dark Binding) con el auto-aim asistido es más fácil de landing en controles táctiles.\n\nEl build AP maximiza su daño de soporte. En WR, donde los teamfights son cerrados por el mapa chico, su R (Soul Shackles) es devastador para iniciar o desengagements.\n\nConsejo: Usa tu E para contrarrestar ganks de jungler. En WR los ganks son más frecuentes y tu escudo negro es la mejor defensa de bot lane.',
    proPickRate: 5.5,
    runes: { primary: 'Brujería — Cometa Arcano', secondary: 'Determinación — Frailidad', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Jhin', title: 'el Virtuoso', role: 'ADC', tier: 'A', winRate: 52.0, pickRate: 7.8, banRate: 1.2, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    brokenThings: ['R snipe teamwide → damage a distancia', 'Crit passive → burst 4to shot', 'W root + trampa = pick seguro'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/jhin/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/jhin"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/jhin"}],
    builds: [{ name: 'Build Crit', items: 'Filo de la Noche → Colmillo Infinito → Huracán de Runaan → Llamasomo → Botas de Berserker', winRate: 52.3 }],
    counterPick: 'Samira, Draven, Vayne',
    synergy: 'Morgana, Lux — Root para landing de W y R',
    aiAnalysis: 'Jhin en Wild Rift es el ADC más explosivo del meta. Su pasiva de criticar cada 4to disparo crea momentos de burst devastadores, perfectos para el ritmo rápido de WR. Su R (Curtain Call) es más efectivo en el mapa compacto donde los enemigos no pueden escapar fácilmente del alcance.\n\nEl build crit maximiza su daño burst por disparo. En WR, el mapa chico amplifica el rango de su R y W, haciéndolos más amenazadores.\n\nConsejo: Guarda tu 4to disparo cargado para teamfights. En WR los teamfights son más rápidos, así que cada shot de Jhin cuenta el doble.',
    proPickRate: 7.1,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Brujería — Frailidad', shards: 'Adaptativo + Fuerza + Resistencia' },
  },

  // Tier B — Jugables (Wild Rift)
  { name: 'Caitlyn', title: 'el Sheriff de Piltover', role: 'ADC', tier: 'B', winRate: 48.2, pickRate: 6.1, banRate: 0.9, image: '', aiInsight: '', build: '', runes: '', counters: '', synergies: '', patch: '6.4', game: 'WR',
    brokenThings: ['Rango 650 → domina lane vs todo ADC', 'Trampa + headshot lvl 2 → kill al lvl 2'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/caitlyn/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/caitlyn"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/caitlyn"}],
    builds: [{ name: 'Build Poke', items: 'Poder de Kraken Slayer → La Séptima → Filo Infinito → Huracán de Runaan → Botas de Berserker', winRate: 48.8 }],
    counterPick: 'Draven, Samira, Jhin',
    synergy: 'Morgana, Lux — Root + trampa = lock total en lane',
    aiAnalysis: 'Caitlyn en Wild Rift es una ADC de control de zona muy sólida. Su rango de 650 es la ventaja más grande en bot lane móvil, y sus trampas (W) son más útiles en el mapa chico donde el espacio es limitado. Su combo headshot lvl 2 sigue siendo una amenaza letal.\n\nEl build poke con Kraken maximiza su harass en lane. En WR, donde las partidas son rápidas, dominar la fase de líneas es crucial para snowballea al equipo.\n\nConsejo: Coloca trampas en los arbustos de bot lane para controlar la zona. En WR, los arbustos son más accesibles y las trampas más efectivas por el espacio reducido.',
    proPickRate: 2.8,
    runes: { primary: 'Brujería — Cometa Arcano', secondary: 'Precisión — Presencia de Campeón', shards: 'Adaptativo + Fuerza + Resistencia' },
  },

];

const PATCHES_DATA: Omit<PatchNote, 'id' | 'date'>[] = [
  {
    version: '14.8',
    title: 'Patch 14.8 — Ajustes de Mid Season',
    summary: 'Ajustes de champions para preparación de mid-season invicta.',
    digest: 'Esta patch trae cambios significativos al meta de mid-season. Se buffean campeones de jungla como Master Yi y Lee Sin, mientras se ajustan ADCs de alta movilidad. Jinx recibe un ligero nerf en su rango de W pero compensa con más daño en su pasiva. Thresh mantiene su dominio en la bot lane con pequeñas mejoras de calidad de vida.',
    sourceGame: 'LoL',
  },
  {
    version: '6.4',
    title: 'Patch 6.4 — Wild Rift Mid Season',
    summary: 'Ajustes de balance para Wild Rift mid-season 2026.',
    digest: 'Patch 6.4 de Wild Rift trae ajustes significativos al meta móvil. Master Yi recibe buffs en su Alpha Strike, Lee Sin tiene mejor scaling con items bruiser. Ahri y Darius se consolidan como los dominadores de mid y top respectivamente. Se ajustan tiempos de objetivos para hacer los juegos más dinámicos.',
    sourceGame: 'WR',
  },
];

const INSIGHTS_DATA: Omit<AiInsight, 'id' | 'date'>[] = [
  { champion: 'Master Yi', category: 'buff', content: 'Master Yi ha recibido un buff significativo en su Q que le permite resetear más rápido tras eliminaciones. Esto lo convierte en un jungler extremadamente peligroso en partidas de snowball.', confidence: 0.92 },
  { champion: 'Jinx', category: 'buff', content: 'Jinx mantiene su status de ADC dominante gracias a la sinergia con la nueva runa de cosecha. Su win rate subió un 2.3% esta patch.', confidence: 0.88 },
  { champion: 'Ahri', category: 'tier-change', content: 'Ahri asciende a Tier S tras los cambios en su E. Ahora charm tiene mayor rango base, permitiéndole atrapar objetivos desde posiciones más seguras.', confidence: 0.85 },
  { champion: 'Darius', category: 'meta', content: 'El meta actual de bruisers favorece a Darius enormemente. Con la reducción de defensas mágicas en varios items, su Q sigue siendo devastador en teamfights.', confidence: 0.90 },
  { champion: 'Lee Sin', category: 'counter', content: 'Lee Sin es un counter directo de Diana en la jungla. Su presión temprana supera a Diana, y puede invadir su jungle sin riesgo gracias a sus escapes.', confidence: 0.87 },
  { champion: 'Thresh', category: 'synergy', content: 'La sinergia Thresh + Jinx es una de las más fuertes del meta. Thresh puede enganchar y lanzar a Jinx para que active su pasiva de forma casi garantizada.', confidence: 0.93 },
  { champion: 'Yasuo', category: 'nerf', content: 'Yasuo recibió un nerf en su muro de viento (W), que ahora dura 0.75 segundos menos. Aún así, su kit de reseteo lo mantiene en Tier S.', confidence: 0.91 },
  { champion: 'Caitlyn', category: 'meta', content: 'Caitlyn domina el early game en la bot lane. Su combo de trampa + headshot puede eliminar a ADCs frágiles en el level 2, especialmente contra Jhin.', confidence: 0.86 },
  { champion: 'Katarina', category: 'buff', content: 'Katarina gana velocidad de movimiento al usar dagas, lo que mejora su supervivencia en teamfights. Este cambio la posiciona como pick sólido en mid.', confidence: 0.82 },
  { champion: 'Master Yi', category: 'meta', content: 'El combo Master Yi + Taric sigue siendo uno de los más tóxicos para jugar en contra. La incapacidad del rival de interactuar durante la invulnerabilidad de Taric es frustrante.', confidence: 0.94 },
  { champion: 'Morgana', category: 'counter', content: 'Morgana counters efectivamente a Leona. Su escudo negro (E) anula el enganche de Leona, neutralizando su principal herramienta de iniciación.', confidence: 0.89 },
  { champion: 'Zed', category: 'nerf', content: 'Zed recibe reducción de daño en sus sombras (W). El daño de las sombras now escala con un 15% menos de AD bonus.', confidence: 0.88 },
  { champion: 'Orianna', category: 'tier-change', content: 'Orianna se mantiene en Tier A pero podría ascender pronto. Su ultimate en teamfights sigue siendo uno de los mejores engages del juego.', confidence: 0.80 },
  { champion: 'Garen', category: 'buff', content: 'Garen recibe reducción de cooldown en su E, lo que le permite girar más seguido. Esto mejora su clear de jungle en el meta de bruiser jungler.', confidence: 0.83 },
  { champion: 'Vayne', category: 'counter', content: 'Vayne es el counter perfecto para tanks como Ornn y Malphite. Su porcentaje de daño verdadero con W se vuelve más relevante en teamfights largos.', confidence: 0.85 },
  { champion: 'Jinx', category: 'synergy', content: 'Jinx + Thresh es la sinergia ADC-Support más fuerte del parche actual. El porcentaje de victoria combinado supera el 55%.', confidence: 0.95 },
  { champion: 'Amumu', category: 'tier-change', content: 'Amumu sube a Tier A gracias a los cambios en items de control. Su engage con R es devastador con el nuevo build de cooldown reduction.', confidence: 0.81 },
  { champion: 'Darius', category: 'counter', content: 'Darius counterpick a Renekton en top lane. Su pasiva de hemorragia supera la sustain de Renekton en trades extendidos.', confidence: 0.84 },
  { champion: 'Lulu', category: 'synergy', content: 'Lulu + Jhin forman una potente sinergia de poke y protección. La W de Lulu permite a Jhin posicionarse mejor para sus trampas.', confidence: 0.79 },
  { champion: 'Camille', category: 'nerf', content: 'Camille pierde velocidad de movimiento en su Q2. Esto reduce significativamente su capacidad de chase en el late game.', confidence: 0.86 },
  { champion: 'Master Yi', category: 'tier-change', content: 'Master Yi asciende a Tier S por primera vez en varias patches. Su win rate del 55.2% lo convierte en el jungler más consistente.', confidence: 0.96 },
];

const TASKS_DATA: Omit<TaskItem, 'id'>[] = [
  { title: 'Verificar nuevas patches', description: 'Revisar servidores Riot cada 30 min para detectar nuevas patches disponibles.', status: 'done', pointer: 0, interval: 30 },
  { title: 'Actualizar tier list', description: 'Recalcular tiers basado en win rate, pick rate y ban rate actualizados.', status: 'running', pointer: 1, interval: 60 },
  { title: 'Generar insights de IA', description: 'Analizar cambios de patch y generar insights automáticos con IA.', status: 'pending', pointer: 2, interval: 45 },
  { title: 'Detectar cosas rotas', description: 'Identificar campeones con win rate anormalmente alto o bajo.', status: 'pending', pointer: 3, interval: 30 },
  { title: 'Actualizar badges de frescura', description: 'Marcar datos que tengan más de 24h como potentially stale.', status: 'done', pointer: 4, interval: 120 },
  { title: 'Analizar sinergias de meta', description: 'Detectar combinaciones OP de champions basadas en datos reales.', status: 'pending', pointer: 5, interval: 90 },
  { title: 'Actualizar counters', description: 'Recalcular matchups basados en datos de partidas recientes.', status: 'running', pointer: 6, interval: 60 },
  { title: 'Sincronizar datos de Wild Rift', description: 'Importar datos de champions de Wild Rift si hay cambios.', status: 'pending', pointer: 7, interval: 180 },
  { title: 'Generar resumen semanal', description: 'Crear un resumen semanal de cambios en el meta para el dashboard.', status: 'pending', pointer: 8, interval: 1440 },
  { title: 'Verificar builds recomendados', description: 'Validar que los builds recomendados sigan siendo óptimos.', status: 'done', pointer: 9, interval: 120 },
  { title: 'Monitorear tier changes', description: 'Detectar cambios drásticos en tiers de champions overnight.', status: 'running', pointer: 10, interval: 30 },
  { title: 'Actualizar runas sugeridas', description: 'Sincronizar runas óptimas basadas en el meta actual.', status: 'pending', pointer: 11, interval: 240 },
  { title: 'Procesar feedback de usuarios', description: 'Analizar reportes de usuarios sobre datos incorrectos.', status: 'pending', pointer: 12, interval: 60 },
  { title: 'Backup de base de datos', description: 'Realizar backup automático de la base de datos.', status: 'done', pointer: 13, interval: 360 },
];

const PRO_PICKS_DATA: ProPick[] = [
  { champion: 'Ahri', role: 'Mid', tournament: 'LCK', region: 'KR', pickRate: 18.5, banRate: 12.3, winRate: 56.2, patch: '14.8' },
  { champion: 'Jinx', role: 'ADC', tournament: 'LCK', region: 'KR', pickRate: 22.1, banRate: 8.5, winRate: 54.8, patch: '14.8' },
  { champion: 'Lee Sin', role: 'Jungle', tournament: 'LPL', region: 'CN', pickRate: 15.3, banRate: 18.2, winRate: 51.1, patch: '14.8' },
  { champion: 'Thresh', role: 'Support', tournament: 'LCK', region: 'KR', pickRate: 25.6, banRate: 3.1, winRate: 53.5, patch: '14.8' },
  { champion: 'Azir', role: 'Mid', tournament: 'LCK', region: 'KR', pickRate: 14.2, banRate: 22.5, winRate: 57.3, patch: '14.8' },
  { champion: 'Rakan', role: 'Support', tournament: 'LEC', region: 'EU', pickRate: 18.3, banRate: 5.2, winRate: 52.8, patch: '14.8' },
  { champion: 'Jhin', role: 'ADC', tournament: 'LEC', region: 'EU', pickRate: 16.8, banRate: 6.1, winRate: 51.9, patch: '14.8' },
  { champion: 'Camille', role: 'Top', tournament: 'LCK', region: 'KR', pickRate: 13.5, banRate: 20.1, winRate: 48.7, patch: '14.8' },
  { champion: 'Xin Zhao', role: 'Jungle', tournament: 'LCS', region: 'NA', pickRate: 11.2, banRate: 4.5, winRate: 49.3, patch: '14.8' },
  { champion: 'Orianna', role: 'Mid', tournament: 'LPL', region: 'CN', pickRate: 19.8, banRate: 15.3, winRate: 55.1, patch: '14.8' },
  { champion: 'Vayne', role: 'ADC', tournament: 'LCK', region: 'KR', pickRate: 8.5, banRate: 3.2, winRate: 58.9, patch: '14.8' },
  { champion: 'Maokai', role: 'Support', tournament: 'LCS', region: 'NA', pickRate: 14.1, banRate: 2.8, winRate: 53.2, patch: '14.8' },
  { champion: 'Darius', role: 'Top', tournament: 'LPL', region: 'CN', pickRate: 10.3, banRate: 12.8, winRate: 52.5, patch: '14.8' },
  { champion: 'Master Yi', role: 'Jungle', tournament: 'LCS', region: 'NA', pickRate: 5.2, banRate: 8.1, winRate: 45.3, patch: '14.8' },
  { champion: 'Caitlyn', role: 'ADC', tournament: 'LPL', region: 'CN', pickRate: 20.5, banRate: 9.3, winRate: 54.6, patch: '14.8' },
  { champion: 'Gwen', role: 'Top', tournament: 'LEC', region: 'EU', pickRate: 12.7, banRate: 16.5, winRate: 50.8, patch: '14.8' },
];

// Add IDs
const championsWithIds: Champion[] = CHAMPIONS_DATA.map((c, i) => ({
  ...c,
  id: i + 1,
  createdAt: '2026-04-18T00:00:00.000Z',
  updatedAt: '2026-04-18T00:00:00.000Z',
}));

const patchesWithIds: PatchNote[] = PATCHES_DATA.map((p, i) => ({
  ...p,
  id: i + 1,
  date: '2026-04-15T00:00:00.000Z',
}));

const insightsWithIds: AiInsight[] = INSIGHTS_DATA.map((ins, i) => ({
  ...ins,
  id: i + 1,
  date: '2026-04-18T00:00:00.000Z',
}));

const tasksWithIds: TaskItem[] = TASKS_DATA.map((t, i) => ({
  ...t,
  id: i + 1,
}));

const proPicksWithIds: ProPick[] = PRO_PICKS_DATA.map((p, i) => ({
  ...p,
  id: i + 1,
}));

// ============================================================
// PUBLIC API — always returns data (embedded fallback)
// ============================================================

export function getChampions(filters?: { role?: string; tier?: string; game?: string; search?: string }): Champion[] {
  let data = championsWithIds;
  if (filters?.role && filters.role !== 'Todos' && filters.role !== 'All') data = data.filter(c => c.role === filters.role);
  if (filters?.tier) data = data.filter(c => c.tier === filters.tier);
  if (filters?.game) data = data.filter(c => c.game === filters.game);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    data = data.filter(c => c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));
  }
  return data.sort((a, b) => {
    const tierOrder = { S: 0, A: 1, B: 2, C: 3, D: 4 };
    if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier];
    return b.winRate - a.winRate;
  });
}

export function getPatches(game?: string): PatchNote[] {
  let data = patchesWithIds;
  if (game) data = data.filter(p => p.sourceGame === game);
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getInsights(champion?: string, category?: string): AiInsight[] {
  let data = insightsWithIds;
  if (champion) data = data.filter(i => i.champion === champion);
  if (category) data = data.filter(i => i.category === category);
  return data.sort((a, b) => b.confidence - a.confidence);
}

export function getTasks(): TaskItem[] {
  return tasksWithIds.sort((a, b) => a.id - b.id);
}

export function updateTaskStatus(id: number, status: string): TaskItem | null {
  const task = tasksWithIds.find(t => t.id === id);
  if (task) {
    task.status = status;
    return task;
  }
  return null;
}

export function getProPicks(region?: string): ProPick[] {
  let data = proPicksWithIds;
  if (region) data = data.filter(p => p.region === region);
  return data.sort((a, b) => b.pickRate - a.pickRate);
}

// ============================================================
// COMBOS DATA
// ============================================================

const COMBOS_DATA: BrokenCombo[] = [
  // Duos (2 champs) - LoL
  { id: 1, name: 'Invulnerabilidad Infinita', champions: ['Master Yi', 'Taric'], description: 'Taric R + Yi Q = invulnerabilidad durante teamfights completas. Sin counterplay.', winRate: 58.2, game: 'LoL', difficulty: 'facil' },
  { id: 2, name: 'Enganche + Hypercarry', champions: ['Jinx', 'Thresh'], description: 'Thresh engancha, Jinx elimina. La bot lane más tóxica del parche.', winRate: 56.8, game: 'LoL', difficulty: 'facil' },
  { id: 3, name: 'Wall Combo', champions: ['Yasuo', 'Taliyah'], description: 'Taliyah E + Yasuo R = knockup teamwide garantizado.', winRate: 55.1, game: 'LoL', difficulty: 'media' },
  { id: 4, name: 'Ball Delivery', champions: ['Darius', 'Orianna'], description: 'Orianna ball en Darius → R entrega daño masivo + engage.', winRate: 54.3, game: 'LoL', difficulty: 'media' },

  // Trios (3 champs) - LoL
  { id: 5, name: 'Triple Protect', champions: ['Master Yi', 'Taric', 'Lulu'], description: 'Taric R + Lulu R + Yi Q = triple inmunidad. Yi es literalmente inmortal.', winRate: 60.1, game: 'LoL', difficulty: 'facil' },
  { id: 6, name: 'Protect the Queen', champions: ['Jinx', 'Thresh', 'Lulu'], description: 'Peel triple para Jinx. Enganchar, polymorph, ult protect. Jinx limpia.', winRate: 57.5, game: 'LoL', difficulty: 'media' },
  { id: 7, name: 'Chain Engage', champions: ['Lee Sin', 'Ahri', 'Orianna'], description: 'Lee Sin insec → Ahri charm follow-up → Orianna R shockwave. Chain engage letal.', winRate: 55.8, game: 'LoL', difficulty: 'dificil' },
  { id: 8, name: 'Dunk Squad', champions: ['Darius', 'Jarvan IV', 'Orianna'], description: 'Jarvan cataclysm atrapa → Darius dunk → Orianna ball delivery. Sin escape.', winRate: 54.9, game: 'LoL', difficulty: 'media' },

  // Quad (4 champs) - LoL
  { id: 9, name: 'Deathball Protect', champions: ['Jinx', 'Thresh', 'Lulu', 'Orianna'], description: '4 protectores para 1 hypercarry. Peel infinito + engage seguro.', winRate: 56.2, game: 'LoL', difficulty: 'media' },
  { id: 10, name: 'Knockup Chain', champions: ['Yasuo', 'Taliyah', 'Lee Sin', 'Ahri'], description: '4 knockups/CC chain. Yasuo R se activa cada teamfight sin esfuerzo.', winRate: 53.7, game: 'LoL', difficulty: 'dificil' },

  // Full Team (5 champs) - LoL
  { id: 11, name: 'Inmortal Carry', champions: ['Master Yi', 'Taric', 'Jinx', 'Thresh', 'Darius'], description: 'Top bruiser + Jungle inmortal + Bot hypercarry con peel completo.', winRate: 58.5, game: 'LoL', difficulty: 'facil' },
  { id: 12, name: 'Knockup Machine', champions: ['Yasuo', 'Taliyah', 'Ahri', 'Lee Sin', 'Braum'], description: '5 campeones con knockup/CC. Yasuo R en CD = teamwipe.', winRate: 54.1, game: 'LoL', difficulty: 'dificil' },

  // WR Duos
  { id: 13, name: 'Invulnerabilidad Móvil', champions: ['Master Yi', 'Taric'], description: 'En Wild Rift el mapa chico amplifica la sinergia Yi+Taric. Aún más tóxico.', winRate: 61.2, game: 'WR', difficulty: 'facil' },
  { id: 14, name: 'Hook & Spray', champions: ['Jinx', 'Thresh'], description: 'Enganchar + eliminar en el mapa compacto de Wild Rift.', winRate: 57.8, game: 'WR', difficulty: 'facil' },

  // WR Trios
  { id: 15, name: 'Triple Inmune', champions: ['Master Yi', 'Taric', 'Yuumi'], description: 'Yuumi + Taric + Yi = 3 capas de protección. Yi no puede morir.', winRate: 63.5, game: 'WR', difficulty: 'facil' },

  // WR Full Team
  { id: 16, name: 'WR Meta Comp', champions: ['Master Yi', 'Ahri', 'Darius', 'Thresh', 'Jinx'], description: 'La composición definitiva de Wild Rift. Engage + peel + hypercarry.', winRate: 57.2, game: 'WR', difficulty: 'media' },
];

export function getCombos(game?: string): BrokenCombo[] {
  let combos = COMBOS_DATA;
  if (game) {
    combos = combos.filter(c => c.game === game);
  }
  return combos.sort((a, b) => b.winRate - a.winRate);
}
