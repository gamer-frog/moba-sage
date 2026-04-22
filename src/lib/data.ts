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
  metaUpdated?: boolean; // true = datos verificados con fuentes reales del parche actual
  metaSources?: string[]; // fuentes: ['U.GG', 'Mobalytics', 'Blitz', ...]
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
    name: 'Master Yi', title: 'el Buscador de Wuju', role: 'Jungle', tier: 'A', winRate: 50.8, pickRate: 8.2, banRate: 6.1, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
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
    name: 'Jinx', title: 'la Cañón Suelto', role: 'ADC', tier: 'S', winRate: 52.2, pickRate: 10.8, banRate: 3.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Blitz.gg', 'U.GG'],
    brokenThings: ['Pasiva 1 kill = limpia teamfight', 'W rango buff → poke sin respuesta', 'Kraken + Runaan = AoE masivo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/jinx/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/jinx"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/jinx"}],
    builds: [
      { name: 'Build Hypercarry', items: 'Filo Infinito → Huracán de Runaan → Bailarín Espectral → Sed de Sangre → Guardián Angel', winRate: 55.3 },
      { name: 'Build Early Power', items: 'Poder de Kraken Slayer → La Séptima → Infinito → Bailarín Espectral → Botas de Berserker', winRate: 53.1 },
    ],
    counterPick: 'Caitlyn, Varus, Kassadin (gap close)',
    synergy: 'Thresh, Lulu — Thresh para enganchar y lanzar, Lulu para protege',
    aiAnalysis: 'Jinx mantiene su dominio absoluto como ADC en el meta actual. Su pasiva "¡Prepárense!" le permite snowballar teamfights tras una sola eliminación. El buff reciente en su W aumentó su rango de seguridad, haciendo que su fase de lanes sea más fuerte.\n\nEl build de Kraken Slayer maximiza su daño sostenido en teamfights. La sinergia con Thresh es estadísticamente la mejor del parche con un 55%+ de win rate combinado.\n\nConsejo principal: Mantén posicionamiento agresivo en la fase de líneas para abusar de tu rango. En teamfights, busca la primera eliminación para activar tu pasiva y limpiar.',
    proPickRate: 22.1,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Inspiración — Calzado Mágico', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  {
    name: 'Lee Sin', title: 'el Monje Ciego', role: 'Jungle', tier: 'A', winRate: 49.5, pickRate: 7.8, banRate: 4.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['Insec Q→R→Flash → pick sin counterplay', 'Pressure level 2-3 inigualable', 'Eclipse burst → mata carries en 1 combo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/leesin/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/leesin"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/leesin"}],
    builds: [
      { name: 'Build Bruiser', items: 'Cosechador Nocturno → Eclipse → Hidra Titánica → Fuerza de la Trinidad → Botas de Mercurio', winRate: 52.5 },
      { name: 'Build Full CD', items: 'Sed de Sangre → Eclipse → Hidra → Fuerza de la Trinidad → Botas de CD', winRate: 51.8 },
    ],
    counterPick: 'Nidalee, Elise, Kindred',
    synergy: 'Ahri, Orianna — Buen follow-up para engages y roam',
    aiAnalysis: 'Lee Sin sigue siendo el jungler más popular en ranked alto y competitivo. Su presión temprana con Q + W es inigualable, permitiéndole controlar ambos lados del mapa desde minuto 3. Aunque su win rate de 52.8% parece modesto, su impacto en el juego es masivo.\n\nEl build de Eclipse maximiza su burst en ganks tempranos. La transición a bruiser con Hidra Titánica le permite escalar correctamente.\n\nConsejo principal: Practica las combo de insec (Q → R → Flash) para ser un factor diferenciante. Controla vision en la jungla enemiga constantemente.',
    proPickRate: 15.3,
    runes: { primary: 'Precisión — Conquistador', secondary: 'Dominación — Golpe de Gracia', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  {
    name: 'Thresh', title: 'el Guardián de Cadenas', role: 'Support', tier: 'A', winRate: 51.3, pickRate: 12.5, banRate: 1.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Blitz.gg'],
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
    name: 'Darius', title: 'la Mano de Noxus', role: 'Top', tier: 'A', winRate: 50.5, pickRate: 6.1, banRate: 5.8, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Blitz.gg'],
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
    name: 'Ahri', title: 'el Zorro de Nueve Colas', role: 'Mid', tier: 'S', winRate: 51.1, pickRate: 7.3, banRate: 1.9, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Blitz.gg', 'Mobalytics'],
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
    name: 'Yasuo', title: 'el Imperdonable', role: 'Mid', tier: 'A', winRate: 49.8, pickRate: 8.5, banRate: 3.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
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
    name: 'Caitlyn', title: 'el Sheriff de Piltover', role: 'ADC', tier: 'A', winRate: 50.2, pickRate: 7.1, banRate: 1.3, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Blitz.gg'],
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
  // Nuevos S-Tier (Patch 26.8 — datos reales de Mobalytics/U.GG/PropelRC)
  { name: 'Nocturne', title: 'el Pesadilla Eterna', role: 'Jungle', tier: 'S', winRate: 52.0, pickRate: 4.5, banRate: 2.8, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Blitz.gg', 'Mobalytics', 'Metabot'],
    brokenThings: ['R global → apaga visión del mapa', 'E fear point-click → sin counterplay', 'W spellshield → immune a CC'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/nocturne/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/nocturne"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/nocturne"}],
    builds: [{ name: 'Build Bruiser', items: 'Stridebreaker → Experimental Hexplate → Fuerza de Trinidad → Sed de Sangre → Botas de Mercurio', winRate: 53.0 }],
    counterPick: 'Nidalee, Elise, Lee Sin',
    synergy: 'Ahri, Morgana — Follow-up para R engages',
    aiAnalysis: 'Nocturne es el jungler #1 del meta actual (Mobalytics 26.8). Su R (Paranoia) apaga la visión del mapa enemigo y permite engages globales devastadores. Con 52.8% de win rate, es la pick de jungle más consistente en ranked.\n\nEl build de Stridebreaker + Experimental Hexplate maximiza su daño sostenido y movilidad. Su W (Shroud of Darkness) le da spellshield para immune CC en ganks.\n\nConsejo principal: Usa tu R para apagar la visión del mapa y crear caos. Ganks post-6 son casi garantizados con R + Q combo.',
    proPickRate: 6.1,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Dominación — Golpe de Gracia', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Blitzcrank', title: 'el Gran Golem de Vapor', role: 'Support', tier: 'A', winRate: 51.7, pickRate: 2.6, banRate: 1.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Blitz.gg', 'Metabot'],
    brokenThings: ['Q grab → pick instantáneo', 'R AoE silence → interrumpe todo', 'Passive mana barrier → tanque gratis'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/blitzcrank/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/blitzcrank"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/blitzcrank"}],
    builds: [{ name: 'Build Tank', items: 'Redención → Medallón de los Solari → Convergencia de Zeke → Mikael → Botas de Movilidad', winRate: 51.5 }],
    counterPick: 'Morgana, Thresh, Alistar',
    synergy: 'Jinx, Ashe, Caitlyn — Cualquier ADC que siga el engage',
    aiAnalysis: 'Blitzcrank asciende a S-tier como soporte engage (51.8% WR). Su Q (Rocket Grab) es el pick más temido de la bot lane. Un solo grab puede cambiar el rumbo de la partida.\n\nEl build tank maximiza su supervivencia. Su pasiva de mana barrier lo hace sorprendentemente difícil de eliminar en trades.\n\nConsejo principal: Esconde tu Q en los arbustos y wait por errores de posicionamiento. Un Q landing en lane phase puede garantizar kills.',
    proPickRate: 5.3,
    runes: { primary: 'Determinación — Guardian', secondary: 'Brujería — Frailidad', shards: 'Armadura + Fuerza + Resistencia' },
  },
  { name: 'Brand', title: 'el Llamas Vengativo', role: 'Support', tier: 'A', winRate: 50.8, pickRate: 4.9, banRate: 0.8, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Blitz.gg', 'U.GG'],
    brokenThings: ['R bounce → teamwipe en teamfight agrupado', 'Passive % HP burn → true damage sostenido', 'W+Q stun combo → pick garantizado'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/brand/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/brand"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/brand"}],
    builds: [{ name: 'Build AP Support', items: 'Morellonomicon → Sombrero de Rabadon → Reloj de Zhonya → Cetro de Rylai → Botas del Vacío', winRate: 53.0 }],
    counterPick: 'Thresh, Morgana, Nautilus',
    synergy: 'Jinx, KogMaw, Ashe — ADCs que siguen el engage',
    aiAnalysis: 'Brand es el soporte damage más letal del meta (52.5% WR, S-tier U.GG/MetaBot). Su R (Pyroclasm) rebota entre enemigos agrupados causando daño masivo. Su pasiva de % HP burn hace true damage sostenido.\n\nEl build AP Support maximiza su daño sin sacrificar utilidad. Morellonomicon + Rabadon lo convierte en un carry secundario real.\n\nConsejo principal: Busca teamfights donde los enemigos estén agrupados para maximizar el R bounce. En lane, usa E → W → Q para stun combo.',
    proPickRate: 3.8,
    runes: { primary: 'Brujería — Cometa Arcano', secondary: 'Dominación — Gusto por Sangre', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: "K'Sante", title: 'el Orgullo de Nazumah', role: 'Top', tier: 'A', winRate: 49.8, pickRate: 5.1, banRate: 2.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Blitz.gg'],
    brokenThings: ['R transform → bruiser con resistencias masivas', 'W CC multi-target → peel + engage', 'All-in lvl 6 → kill garantizado'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/ksante/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/ksante"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/ksante"}],
    builds: [{ name: 'Build Tank', items: 'Hidra Titánica → Fuerza de Trinidad → Resistencia Divina → JakSho → Botas de Placas', winRate: 51.8 }],
    counterPick: 'Teemo, Vayne, Gwen',
    synergy: 'Ornn, Orianna — Comps con follow-up y CC',
    aiAnalysis: "K'Sante asciende a S-tier en Top Lane (Mobalytics 26.8). Su R (All Out) lo transforma en un bruiser con resistencias masivas. Es el top laner más versátil del meta actual.\n\nEl build tank maximiza su supervivencia en teamfights. Jak'Sho + Resistencia Divina le da scaling infinito.\n\nConsejo principal: Abusa de tu all-in lvl 6 con R transform para kills garantizados.",
    proPickRate: 7.5,
    runes: { primary: 'Determinación — Guardian', secondary: 'Precisión — Segunda Vida', shards: 'Armadura + Velocidad + Resistencia' },
  },
  { name: 'Viego', title: 'el Rey Ruinado', role: 'Jungle', tier: 'B', winRate: 48.1, pickRate: 4.8, banRate: 2.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Riot Notes (pulled from 26.8)'],
    brokenThings: ['R posess → reset completo en teamfight', 'W invisibilidad → ganks invisibles', 'E reset system → snowball infinito'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/viego/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/viego"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/viego"}],
    builds: [{ name: 'Build Bruiser', items: 'Cosechador Nocturno → Eclipse → Hidra Titánica → Fuerza de Trinidad → Botas de Mercurio', winRate: 51.5 }],
    counterPick: 'Lee Sin, Nidalee, Elise',
    synergy: 'Katarina, Ahri — Comps que garantizan kills para R resets',
    aiAnalysis: 'Viego se mantiene S-tier en jungle (Tapin 26.8). Su R (Heartbreaker) le permite poseer campeones enemigos eliminados, obteniendo un reset completo de habilidades. En teamfights prolongados puede chain 3-4 eliminaciones.\n\nEl build bruiser maximiza su supervivencia para chain resets. Eclipse le da el burst necesario para carries.\n\nConsejo principal: Busca eliminar carries enemigos en teamfights para activar tu R. Evita iniciar — espera bajas para entrar.',
    proPickRate: 6.8,
    runes: { primary: 'Precisión — Conquistador', secondary: 'Dominación — Golpe de Gracia', shards: 'Adaptativo + Velocidad + Resistencia' },
  },

  // Tier S — Nuevos del Meta 26.8 (datos verificados Blitz.gg / Mobalytics / U.GG / Metabot)
  { name: 'Ornn', title: 'el Fuego del Monte', role: 'Top', tier: 'S', winRate: 52.1, pickRate: 2.4, banRate: 0.9, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Metabot', 'Blitz.gg', 'U.GG'],
    brokenThings: ['R knockup global → engage desde cualquier lado', 'Upgrades de items → team power spike gratis', 'W brittle → true damage en autoattacks'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/ornn/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/ornn"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/ornn"}],
    builds: [{ name: 'Build Tank', items: 'Hidra Titánica → JakSho, Proteico → Resistencia Divina → Medallón de los Solari → Botas de Placas', winRate: 52.5 }],
    counterPick: 'Vayne, Teemo, Quinn',
    synergy: 'Orianna, Wukong, Kennen — Comps con engage AoE',
    aiAnalysis: 'Ornn es el top laner más valioso del meta 26.8 (Tier 1 en 3 fuentes). Su R (Call of the Forge God) es un knockup global devastador, y su capacidad de mejorar items de aliados le da valor económico masivo al equipo entero. Con 52%+ WR, es la pick de top más consistente en ranked alto.\n\nEl build tank maximiza su CC y supervivencia. Jak\'Sho + Resistencia Divina le da scaling infinito en teamfights prolongados.\n\nConsejo principal: Coordina tu R con tu jungler para engages dobles. No olvides mejorar los items de tus carries — el upgrade gratis puede ser la diferencia en late game.',
    proPickRate: 4.2,
    runes: { primary: 'Determinación — Guardián', secondary: 'Brujería — Frailidad', shards: 'Armadura + Velocidad + Resistencia' },
  },
  { name: 'Briar', title: 'la Cache Excéntrica', role: 'Jungle', tier: 'S', winRate: 52.4, pickRate: 4.2, banRate: 2.8, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Metabot', 'Blitz.gg', 'Mobalytics'],
    brokenThings: ['R chase → sin escape para carries', 'W bite → execute + heal masivo', 'Passive CC immunity → unstoppable dive'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/briar/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/briar"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/briar"}],
    builds: [{ name: 'Build Bruiser', items: 'Cosechador Nocturno → Eclipse → Hidra Titánica → Fuerza de Trinidad → Botas de Mercurio', winRate: 52.8 }],
    counterPick: 'Nidalee, Elise, Lee Sin',
    synergy: 'Ahri, Orianna — Follow-up para R chases',
    aiAnalysis: 'Briar es el jungler más dominante del meta 26.8 (Tier 1 en 3 fuentes). Su R (Certain Asunder) es un chase unavoidable que elimina carries sin escape. Su W (Fatal Velocity) le da execute + heal masivo, y su pasiva de CC immunity la hace unstoppable en dives.\n\nEl build bruiser maximiza su sustain y burst. Eclipse + Hidra Titánica le da suficiente daño para eliminar carries mientras sobrevive.\n\nConsejo principal: Usa tu R para chase carries en teamfights — una vez activado, no hay escape. Tu pasiva te hace inmune a CC durante el engage.',
    proPickRate: 3.1,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Dominación — Golpe de Gracia', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Aurelion Sol', title: 'el Forjador de Estrellas', role: 'Mid', tier: 'S', winRate: 52.6, pickRate: 2.6, banRate: 1.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Metabot', 'Blitz.gg', 'U.GG'],
    brokenThings: ['R global → rota/teamfight desde cualquier lado', 'Q stars → AoE damage masivo', 'Scaling infinito → late game god'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/aurelionsol/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/aurelionsol"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/aurelionsol"}],
    builds: [{ name: 'Build AP Mage', items: 'Sombrero de Rabadon → Llamasomo → Morellonomicon → Reloj de Zhonya → Botas del Vacío', winRate: 53.4 }],
    counterPick: 'Zed, Talon, Katarina',
    synergy: 'Ornn, Wukong — Comps con engage para R follow-up',
    aiAnalysis: 'Aurelion Sol asciende al Tier 1 del meta 26.8 (confirmado por 3 fuentes). Su R (The Super Massive) es un AoE masivo que puede teamwipe instantáneamente desde cualquier posición. Su scaling es uno de los más altos del juego, y en late game se convierte en un dios.\n\nEl build AP maximiza su burst. Rabadon + Llamasomo + Morellonomicon convierte su R en un arma de destrucción masiva.\n\nConsejo principal: Farm hasta level 6 antes de roam. Tu R cambia teamfights — busca posiciones amplias para máximo impacto. Es difícil de gankear con tu E.',
    proPickRate: 5.8,
    runes: { primary: 'Brujería — Cometa Arcano', secondary: 'Precisión — Presencia de Campeón', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Veigar', title: 'el Pequeño Maestro del Mal', role: 'Mid', tier: 'S', winRate: 52.5, pickRate: 4.9, banRate: 0.6, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Metabot', 'Blitz.gg'],
    brokenThings: ['R cage → prison sin escape', 'Passive stacking → AP infinito', 'E+Q combo → one-shot carries'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/veigar/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/veigar"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/veigar"}],
    builds: [{ name: 'Build One-Shot', items: 'Sombrero de Rabadon → Llamasomo → Morellonomicon → Reloj de Zhonya → Botas del Vacío', winRate: 52.8 }],
    counterPick: 'Zed, Talon, Katarina',
    synergy: 'Nautilus, Leona, Braum — CC para E + R combo',
    aiAnalysis: 'Veigar es el mid laner con el scaling AP más alto del juego (Tier 1 Metabot + Blitz). Su R (Primordial Burst) es un execute que escala con el AP del target, y su pasiva le da AP infinito con el tiempo. Su E (Event Horizon) es la jaula más broken del juego.\n\nEl build one-shot maximiza su burst para eliminar carries con un solo combo. Rabadon amplifica su AP pasivo masivamente.\n\nConsejo principal: Acumula stacks de pasiva con Q en la jungle. En teamfights, usa E para aislar carries y R para execute.',
    proPickRate: 2.2,
    runes: { primary: 'Brujería — Cometa Arcano', secondary: 'Precisión — Golpe de Gracia', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Nilah', title: 'la Alegría Desenfrenada', role: 'ADC', tier: 'S', winRate: 53.0, pickRate: 1.8, banRate: 1.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Metabot', 'Blitz.gg'],
    brokenThings: ['W shield AoE → protege al team entero', 'R pull → teamfight monster', 'E dash + water → imposible de catchear'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/nilah/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/nilah"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/nilah"}],
    builds: [{ name: 'Build Crit', items: 'Filo Infinito → Huracán de Runaan → Bailarín Espectral → Sed de Sangre → Botas de Berserker', winRate: 53.2 }],
    counterPick: 'Caitlyn, Varus, Ashe',
    synergy: 'Soraka, Milio — Enchanters para maximize W shield',
    aiAnalysis: 'Nilah es la ADC con el win rate más alto del meta 26.8 (53%+, Tier 1 Metabot + Blitz). Su W (Jubilant Veil) da shield AoE al team, su R (Apotheosis) es un pull masivo que cambia teamfights, y su E dash + water form la hace impossible de catchear.\n\nEl build crit maximiza su DPS. Es la ADC más fuerte cuando se combina con enchanters que amplifican su W.\n\nConsejo principal: Usa tu W para proteger a tu equipo en engages. Tu R es devastador en teamfights cerrados — busca posiciones amplias.',
    proPickRate: 1.8,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Determinación — Revitalizar', shards: 'Adaptativo + Velocidad + Resistencia' },
  },
  { name: 'Soraka', title: 'la Hija del Cruce Estelar', role: 'Support', tier: 'S', winRate: 52.0, pickRate: 3.0, banRate: 0.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Metabot', 'Blitz.gg'],
    brokenThings: ['R global heal → save desde cualquier lugar', 'E silence zone → anti-engage perfecto', 'Heal spam → sustain infinito'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/soraka/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/soraka"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/soraka"}],
    builds: [{ name: 'Build Enchanter', items: 'Redención → Convergencia de Zeke → Mikael → Medallón de los Solari → Botas de CD', winRate: 51.8 }],
    counterPick: 'Blitzcrank, Pyke, Nautilus',
    synergy: 'Nilah, Jinx, KogMaw — Hypercarries que necesitan proteccion',
    aiAnalysis: 'Soraka asciende a S-tier como la enchanter más consistente del meta 26.8 (52% WR, Tier 1 Metabot + Blitz). Su R (Wish) es un heal global que puede salvar teamfights desde cualquier parte del mapa, y su E (Equinox) es una silence zone anti-engage perfecta.\n\nEl build enchanter maximiza su heal y utilidad. Redención + Mikael le da herramientas masivas de save.\n\nConsejo principal: Tu R tiene cooldown largo — úsalo solo cuando el equipo esté en peligro. Tu E puede interrumpir engages completos si se posiciona bien.',
    proPickRate: 4.5,
    runes: { primary: 'Determinación — Guardian', secondary: 'Brujería — Frailidad', shards: 'Armadura + Fuerza + Resistencia' },
  },
  { name: 'Zyra', title: 'la Ascendiente de las Zarzas', role: 'Support', tier: 'S', winRate: 51.8, pickRate: 2.8, banRate: 0.4, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Metabot', 'Blitz.gg'],
    brokenThings: ['R knockup AoE → teamfight devastador', 'Plants → damage sin risk', 'E root → poke lane dominante'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/zyra/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/zyra"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/zyra"}],
    builds: [{ name: 'Build AP Support', items: 'Morellonomicon → Sombrero de Rabadon → Reloj de Zhonya → Cetro de Rylai → Botas del Vacío', winRate: 51.5 }],
    counterPick: 'Leona, Nautilus, Blitzcrank',
    synergy: 'Nilah, KogMaw, Jinx — ADCs que aprovechan el peel de plantas',
    aiAnalysis: 'Zyra es el soporte damage con más control de zona del meta 26.8 (Tier 1 Metabot + Blitz). Su R (Stranglethorns) es un knockup AoE masivo, sus plantas generan damage sin riesgo, y su E (Grasping Roots) es un root que domina la poke lane.\n\nEl build AP maximiza su daño de plants. Morellonomicon + Rabadon la convierte en un carry secundario real.\n\nConsejo principal: Coloca plantas en los arbustos para damage invisible. En teamfights, busca R sobre 3+ enemigos para knockup masivo.',
    proPickRate: 2.8,
    runes: { primary: 'Brujería — Cometa Arcano', secondary: 'Dominación — Colección de Ojos', shards: 'Adaptativo + Fuerza + Resistencia' },
  },

  // Tier A — Fuertes (ex-S: Master Yi, Lee Sin, Yasuo demoted en 26.8; Thresh, Darius, Caitlyn, K'Sante, Graves, Blitzcrank demoted en update de datos reales)
  { name: 'Orianna', title: 'la Dama de Relojería', role: 'Mid', tier: 'A', winRate: 51.2, pickRate: 6.3, banRate: 0.8, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R teamwide → mejor initiate', 'Ball = harass y peel simultáneo', 'Scaling ilimitado → late monster'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/orianna/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/orianna"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/orianna"}],
    builds: [
      { name: 'Build Control Mage', items: 'Sombrero de Rabadon → Reloj de Zhonya → Llamasomo → Morellonomicon → Botas del Vacío', winRate: 51.8 },
    ],
    counterPick: 'Zed, Talon, Kassadin',
    synergy: 'Jarvan IV, Wukong, Malphite',
    aiAnalysis: "Orianna es una de las control mages más consistentes del meta. Su bola (Q) le da harassment seguro en lane y su R (Command: Shockwave) es uno de los mejores engages de teamfight del juego. Con un win rate del 51.2%, es una pick confiable en ranked alto.\n\nSu escalado con items AP es devastador en el late game. El build de Rabadon → Zhonya maximiza su daño y supervivencia en teamfights.\n\nConsejo principal: Practica posicionar la bola sobre aliados antes de usar R para engages sorpresa. En lane, usa Q + W para harass y empujar cuando el enemigo intente lastimar.",
    proPickRate: 6.8,
    runes: {"primary":"Brujería — Invocar Aery","secondary":"Precisión — Presencia de Campeón","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Vi', title: 'el Ejecutor de Piltover', role: 'Jungle', tier: 'A', winRate: 50.8, pickRate: 5.2, banRate: 1.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R point-click → no se puede dodge', 'Eclipse bruiser → tanque y daño', 'Q gap closer → ganks lvl 2 garantizados'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/vi/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/vi"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/vi"}],
    builds: [
      { name: 'Build Bruiser', items: 'Cosechador Nocturno → Eclipse → Hidra Titánica → Fuerza de la Trinidad → Botas de Mercurio', winRate: 50.5 },
    ],
    counterPick: 'Elise, Nidalee, Kindred',
    synergy: 'Ahri, Orianna, Lux',
    aiAnalysis: "Vi es el jungler bruiser más confiable para soloQ. Su R (Cease and Desist) es point-and-click, garantizando la eliminación del carry enemigo en cada gank. Con un win rate del 50.8%, su consistencia la convierte en una de las mejores picks para subir de rank.\n\nEl build de Eclipse maximiza su burst temprano. La transición a bruiser con Hidra Titánica le da sustain en teamfights.\n\nConsejo principal: Gank nivel 3 con Q+E es casi garantizado. Prioriza lanes que tengan CC para asegurar tu R en carries enemigos.",
    proPickRate: 4.5,
    runes: {"primary":"Precisión — Conquistador","secondary":"Dominación — Golpe de Gracia","shards":"Adaptativo + Velocidad + Resistencia"},
  },
  { name: 'Ezreal', title: 'el Explorador Pródigo', role: 'ADC', tier: 'A', winRate: 49.5, pickRate: 8.9, banRate: 0.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['Q spam → nunca en peligro en lane', 'E escape → imposible de gankear', 'Blue build → damage sin riesgo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/ezreal/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/ezreal"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/ezreal"}],
    builds: [
      { name: 'Build Blue Build', items: 'Filo de la Noche → Muramana → Hielo Eterno → Colmillo Infinito → Botas de CD', winRate: 49.8 },
    ],
    counterPick: 'Draven, Sivir, Varus',
    synergy: 'Lux, Morgana, Yuumi',
    aiAnalysis: "Ezreal es el ADC más seguro del meta. Su E (Arcane Shift) le da escape instantáneo contra ganks y engages, y su Q (Mystic Shot) le permite damage desde distancia sin riesgo. Aunque su win rate de 49.5% parece bajo, su impacto en partidas prolongadas es enorme.\n\nEl Blue Build con Muramana maximiza su daño sostenido. La sinergia con supports de poke como Lux y Morgana es estadísticamente la mejor combinación.\n\nConsejo principal: Practica el combo Q → auto → W → auto para maximizar daño en trades. En teamfights, mantén la distancia y spam Q constantemente.",
    proPickRate: 3.2,
    runes: {"primary":"Precisión — Pies Veloces","secondary":"Brujería — Colección de Ojos","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Lulu', title: 'la Hechicera Fada', role: 'Support', tier: 'A', winRate: 50.1, pickRate: 7.4, banRate: 0.3, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R peeling → protege carry completamente', 'W polymorph → shutdown carries', 'Meta estable → siempre relevante'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/lulu/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/lulu"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/lulu"}],
    builds: [
      { name: 'Build Enchanter', items: 'Redención → Convergencia de Zeke → Mikael → Medallón → Botas de CD', winRate: 50.5 },
    ],
    counterPick: 'Leona, Nautilus, Blitzcrank',
    synergy: 'Jinx, Vayne, KogMaw',
    aiAnalysis: "Lulu es la soporte enchanter más confiable del meta. Su R (Wild Growth) pelea completamente al carry aliado, su W (Whimsy) shutdown carries enemigos instantáneamente, y su E (Help, Pix!) proporciona escudo y harass. Con el pick rate más estable entre enchanters, es la pick más segura para proteger hypercarries.\n\nEl build enchanter maximiza peel y utilidad. En el meta actual de teamfights prolongados, Lulu brilla más que nunca.\n\nConsejo principal: Guarda tu R para los momentos críticos del teamfight. Tu W puede usarse ofensivamente para shutdown al carry enemigo en engages.",
    proPickRate: 5.8,
    runes: {"primary":"Determinación — Guardian","secondary":"Brujería — Frailidad","shards":"Armadura + Fuerza + Resistencia"},
  },
  { name: 'Garen', title: 'el Poder de Demacia', role: 'Top', tier: 'S', winRate: 51.3, pickRate: 7.2, banRate: 2.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Blitz.gg', 'Mobalytics'],
    brokenThings: ['E CD reducido → más spins más daño', 'Passive sustain → nunca backea', 'Villain → punish carries sin esfuerzo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/garen/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/garen"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/garen"}],
    builds: [
      { name: 'Build Bruiser', items: 'Fuerza de Trinidad → Eclipse → Hidra Titánica → Resistencia Divina → Botas de Placas', winRate: 52.0 },
    ],
    counterPick: 'Teemo, Vayne, Darius',
    synergy: 'Jarvan IV, Orianna, Morgana',
    aiAnalysis: "Garen es un top laner extremadamente sólido que domina la lanes fase con su sustain de pasiva. Su E (Judgment) con CD reducido le da presión constante, y el sistema de Villain lo hace más letal contra carries. Es una de las mejores picks anti-mage en top lane.\n\nEl build bruiser con Fuerza de Trinidad maximiza daño y sustain. Su Q decimatadora escala con HP, haciéndolo más fuerte cuanto más items completa.\n\nConsejo principal: Abusa de tu pasiva entre trades para mantener vida full. Contra el Villain, usa R para ejecutar carries sin mercy.",
    proPickRate: 2.1,
    runes: {"primary":"Precisión — Conquistador","secondary":"Determinación — Segunda Vida","shards":"Adaptativo + Velocidad + Resistencia"},
  },
  { name: 'Katarina', title: 'la Hoja Siniestra', role: 'Mid', tier: 'S', winRate: 53.4, pickRate: 5.5, banRate: 3.1, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['U.GG', 'Metabot'],
    brokenThings: ['R dagas AoE → teamwipe instantáneo', 'Mobility → imposible de atrapar', '1 kill = snowball teamfight'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/katarina/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/katarina"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/katarina"}],
    builds: [
      { name: 'Build Oneshot', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 50.8 },
    ],
    counterPick: 'Malzahar, Diana, Ahri',
    synergy: 'Vi, Lee Sin, Wukong',
    aiAnalysis: "Katarina es la mid laner asesina más popular en soloQ. Su R (Death Lotus) con dagas AoE puede teamwipe instantáneamente tras una sola eliminación. Su movilidad con Shunpo la hace imposible de atrapar, y su capacidad de snowball es una de las mejores del juego.\n\nEl build AP oneshot maximiza su burst. Con Rabadon + Morellonomicon, puede eliminar carries en un solo combo de dagas.\n\nConsejo principal: Espera a que el enemigo use su CC antes de entrar con R. En teamfights, flankea desde los lados para maximizar el AoE de tus dagas.",
    proPickRate: 3.5,
    runes: {"primary":"Dominación — Electrocutar","secondary":"Precisión — Presencia de Campeón","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Graves', title: 'el Proscrito', role: 'Jungle', tier: 'A', winRate: 50.3, pickRate: 4.8, banRate: 1.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Blitz.gg'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/graves/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/graves"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/graves"}],
    builds: [{ name: 'Build ADC', items: 'Filo Infinito → Huracán de Runaan → El Colector → Sed de Sangre → Botas de Berserker', winRate: 50.2 }],
    counterPick: 'Nidalee, Elise, Kindred',
    synergy: 'Ahri, Morgana, Lux',
    aiAnalysis: "Graves es un jungler híbrido devastador que combina la seguridad de un ADC con la presión de un jungler. Su clear speed es una de las mejores del juego, y su E (Quickdraw) le da movilidad excepcional en la jungla. El daño AoE de su Q lo convierte en una máquina de teamfight.\n\nEl build ADC crit maximiza su burst en objetivos y teamfights. Es especialmente fuerte contra composiciones sin enganche.\n\nConsejo principal: Gank desde los arbustos con Q+R. Tu E te da escape si las cosas salen mal, así que puedes presionar agresivamente.",
    proPickRate: 2.8,
    runes: {"primary":"Precisión — Pies Veloces","secondary":"Dominación — Colección de Ojos","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Vayne', title: 'la Cazadora Nocturna', role: 'ADC', tier: 'A', winRate: 50.6, pickRate: 5.8, banRate: 0.4, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['W % true damage → mata tanks', 'Q tumble → impossible hit skillshots', 'R burst desde stealth'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/vayne/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/vayne"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/vayne"}],
    builds: [
      { name: 'Build On-Hit', items: 'Guja Botadora → Frenesí de Runaan → Bailarín Espectral → Última Piedad → Botas de Berserker', winRate: 51.2 },
    ],
    counterPick: 'Draven, Caitlyn, Jhin',
    synergy: 'Lulu, Thresh, Braum',
    aiAnalysis: "Vayne es la ADC con mayor potencial de carry individual del juego. Su W (Silver Bolts) con 3 stacks hace daño verdadero masivo a tanks, y su Q (Tumble) le permite esquivar cualquier habilidad. En 1v1, Vayne puede ganar contra cualquier otro ADC en el late game.\n\nEl build on-hit maximiza su daño por stack. Guja Botadora + Runaan + Bailarín Espectral le da DPS masivo contra cualquier composición.\n\nConsejo principal: Practica el tumble-condemn (Q→E) contra las paredes. En teamfights, posicionate detrás de tu frontline y focus al carry enemigo más peligroso.",
    proPickRate: 2.5,
    runes: {"primary":"Precisión — Pies Veloces","secondary":"Determinación — Sobrecrecimiento","shards":"Adaptativo + Velocidad + Resistencia"},
  },
  { name: 'Leona', title: 'el Amanecer Radiante', role: 'Support', tier: 'A', winRate: 51.0, pickRate: 4.9, banRate: 0.7, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['E+Q lockdown → CC chain infinito', 'Tankiness base → no necesita items', 'Solar flare → engage desde screen'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/leona/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/leona"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/leona"}],
    builds: [{ name: 'Build Tank', items: 'Redención → Medallón de los Solari → Convergencia de Zeke → Mikael → Botas de Movilidad', winRate: 50.5 }],
    counterPick: 'Morgana, Lux, Zyra',
    synergy: 'Jinx, Lucian, Draven',
    aiAnalysis: "Leona es el soporte engage más consistente del meta. Su combo E+Q genera CC chain infinito, su tankiness base es tan alta que no necesita items defensivos, y su R (Solar Flare) es uno de los mejores engages a distancia del juego. Con un win rate del 51.0%, es la pick más fuerte para lanes agresivas.\n\nEl build tank maximiza su supervivencia para absorber daño. Redención + Medallón de los Solari le dan utilidad masiva en teamfights.\n\nConsejo principal: En nivel 2, engage con E+Q+W+Ignite para kills garantizados. En teamfights, busca engagements con R sobre 3+ enemigos.",
    proPickRate: 3.1,
    runes: {"primary":"Determinación — Guardian","secondary":"Brujería — Frailidad","shards":"Armadura + Fuerza + Resistencia"},
  },
  { name: 'Renekton', title: 'el Carnicero de las Arenas', role: 'Top', tier: 'A', winRate: 50.4, pickRate: 5.6, banRate: 1.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['E double dash → mobility sin igual', 'W empowered stun → trades ganados', 'Early dominance → gana todo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/renekton/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/renekton"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/renekton"}],
    builds: [{ name: 'Build Bruiser', items: 'Fuerza de la Trinidad → Eclipse → Hidra Titánica → Resistencia Divina → Botas de Placas', winRate: 50.2 }],
    counterPick: 'Teemo, Fiora, Kennen',
    synergy: 'Jarvan IV, Orianna, Wukong',
    aiAnalysis: "Renekton es el rey del early game en top lane. Su E double dash le da movilidad sin igual, su W empowered stun gana todos los trades, y su sustain con Q lo hace imposible de expulsar de lane. Dominar la fase de líneas es su especialidad.\n\nEl build bruiser maximiza su daño de trading temprano. Con Fuerza de Trinidad + Eclipse, puede ganar cualquier 1v1 hasta nivel 6.\n\nConsejo principal: Abusa de tu dominio early para presionar la torre y generar ventaja de nivel. Tras nivel 11, tu escala es más débil, así que aprovecha la ventaja antes.",
    proPickRate: 4.2,
    runes: {"primary":"Precisión — Conquistador","secondary":"Determinación — Segunda Vida","shards":"Adaptativo + Velocidad + Resistencia"},
  },
  { name: 'Zed', title: 'el Maestro de Sombras', role: 'Mid', tier: 'A', winRate: 49.2, pickRate: 8.3, banRate: 3.8, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R shadow → assassinar sin riesgo', 'Energy → sin mana, spam abilities', 'Wave clear → nunca pierde CS'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/zed/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/zed"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/zed"}],
    builds: [{ name: 'Build Lethality', items: 'Filo de la Noche → Eclipse → El Colector → Última Piedad → Botas de Movilidad', winRate: 49.5 }],
    counterPick: 'Malzahar, Lissandra, Galio',
    synergy: 'Lee Sin, Vi, Elise',
    aiAnalysis: "Zed es el asesino más popular de mid lane. Su R (Death Mark) le permite assassinar carries sin counterplay, su sistema de energía le da spam infinito de habilidades, y su wave clear es excepcional. Aunque su win rate de 49.2% es modesto, su ban rate del 3.8% muestra su potencial en las manos correctas.\n\nEl build lethality maximiza su burst. Filo de la Noche + Eclipse + Colector = eliminate carries en un solo combo.\n\nConsejo principal: Practica el combo R → auto → Q → E → auto → W. Usa tu sombra para jukear después del assassinar y escapar.",
    proPickRate: 5.1,
    runes: {"primary":"Dominación — Oscuro Colhar","secondary":"Precisión — Presencia de Campeón","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Amumu', title: 'la Momia Triste', role: 'Jungle', tier: 'A', winRate: 51.3, pickRate: 6.1, banRate: 0.9, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R AoE stun → mejor engage low elo', 'Clear speed → full clear sin problema', 'Tanky CC bot durable'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/amumu/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/amumu"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/amumu"}],
    builds: [{ name: 'Build Tank', items: 'Hidra Titánica → Fuerza de la Trinidad → Resistencia Divina → Medallón de los Solari → Botas de Placas', winRate: 51.0 }],
    counterPick: 'Nidalee, Elise, Shaco',
    synergy: 'Malphite, Kennen, Orianna',
    aiAnalysis: "Amumu es el jungler de engage más accesible del meta. Su R (Curse of the Sad Mummy) es un stun AoE masivo que puede teamwipe por sí solo. Su clear speed es rápida, y su tankiness natural lo hace efectivo incluso sin una ventaja de gold significativa.\n\nEl build tank maximiza su CC y supervivencia. Con Hidra Titánica + Fuerza de la Trinidad, tiene suficiente daño para no ser ignorado.\n\nConsejo principal: En teamfights, busca R sobre el mayor número de enemigos posible. Tu Q (Bandage Toss) es un engage sorprendente desde arbustos.",
    proPickRate: 1.5,
    runes: {"primary":"Precisión — Conquistador","secondary":"Determinación — Revitalizar","shards":"Adaptativo + Velocidad + Resistencia"},
  },
  { name: 'Jhin', title: 'el Virtuoso', role: 'ADC', tier: 'A', winRate: 51.7, pickRate: 7.2, banRate: 1.0, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R snipe teamwide → damage a distancia', 'Crit passive → burst 4to shot', 'W root + trampa = pick seguro'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/jhin/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/jhin"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/jhin"}],
    builds: [
      { name: 'Build Crit', items: 'Filo de la Noche → Colmillo Infinito → Huracán de Runaan → Llamasomo → Botas de Berserker', winRate: 52.0 },
    ],
    counterPick: 'Samira, Draven, Vayne',
    synergy: 'Morgana, Lux, Nami',
    aiAnalysis: "Jhin es el ADC más explosivo del meta. Su pasiva de criticar cada 4to disparo crea momentos de burst devastadores. Su R (Curtain Call) le da snipe a distancia, y su W (Deadly Flourish) + root es una herramienta de pick excelente. Con un win rate del 51.7%, es una pick muy sólida.\n\nEl build crit maximiza su daño burst por disparo. Colmillo Infinito + Runaan + Llamasomo crea un combo explosivo de 4to shot.\n\nConsejo principal: Guarda tu 4to disparo cargado para teamfights. En engages, usa W para rootear y luego R para ejecutar carries.",
    proPickRate: 4.8,
    runes: {"primary":"Precisión — Pies Veloces","secondary":"Brujería — Frailidad","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Morgana', title: 'la Caída', role: 'Support', tier: 'A', winRate: 50.5, pickRate: 8.8, banRate: 1.3, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/morgana/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/morgana"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/morgana"}],
    builds: [{ name: 'Build AP', items: 'Morellonomicon → Sombrero de Rabadon → Reloj de Zhonya → Cetro de Rylai → Botas del Vacío', winRate: 50.8 }],
    counterPick: 'Thresh, Blitzcrank, Leona',
    synergy: 'Jhin, Varus, Ashe',
    aiAnalysis: "Morgana es el soporte anti-engage por excelencia. Su E (Black Shield) bloquea todo CC entrante, su Q (Dark Binding) es un root de 2 segundos que castiga cualquier error de posicionamiento, y su R (Soul Shackles) puede teamfight breaker. Es la counter pick definitiva contra supports de engage.\n\nEl build AP maximiza su daño de soporte. Morellonomicon + Rabadon la convierte en una amenaza real de daño.\n\nConsejo principal: Usa tu E para contrarrestar ganks y engages enemigos. En teamfights, busca R sobre carries agrupados para stuns chain.",
    proPickRate: 6.2,
    runes: {"primary":"Brujería — Invocar Aery","secondary":"Determinación — Frailidad","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Camille', title: 'la Sombra de Acero', role: 'Top', tier: 'A', winRate: 49.9, pickRate: 5.1, banRate: 2.0, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['Q true damage → trade en 1v1', 'E wall jump → engage + escape', 'R lock → elimina target en teamfight'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/camille/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/camille"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/camille"}],
    builds: [{ name: 'Build Bruiser', items: 'Cosechador Nocturno → Hidra Titánica → Fuerza de la Trinidad → Resistencia Divina → Botas de Mercurio', winRate: 50.5 }],
    counterPick: 'Teemo, Gwen, Fiora',
    synergy: 'Jarvan IV, Orianna, Braum',
    aiAnalysis: "Camille es la top laner más versátil del meta. Su Q (Precision Protocol) con true damage gana cualquier trade 1v1, su E (Hookshot) le da engage y escape a través de muros, y su R (The Hextech Ultimatum) elimina un target del teamfight. Es especialmente fuerte en split push y teamfights selectivos.\n\nEl build bruiser maximiza sustain y daño mixto. Cosechador Nocturno + Hidra Titánica le da power spike massive.\n\nConsejo principal: Practica el combo E → Q + Q para true damage burst. En teamfights, usa R sobre el carry enemigo y aíslalo de su equipo.",
    proPickRate: 5.5,
    runes: {"primary":"Precisión — Conquistador","secondary":"Determinación — Segunda Vida","shards":"Adaptativo + Velocidad + Resistencia"},
  },
  { name: 'Diana', title: 'el Desprecio de la Luna', role: 'Jungle', tier: 'S', winRate: 52.4, pickRate: 5.6, banRate: 2.1, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['PropelRC', 'Blitz.gg'],
    brokenThings: ['R Moonfall → pull AoE teamfight devastador', 'Q+R combo → burst AP instantáneo', 'W shield → tankiness para jungle y dives'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/diana/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/diana"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/diana"}],
    builds: [{ name: 'Build AP Assassin', items: 'Sombrero de Rabadon → Llamasomo → Morellonomicon → Reloj de Zhonya → Botas del Vacío', winRate: 53.1 }],
    counterPick: 'Lee Sin, Nidalee, Elise',
    synergy: 'Orianna, Kennen, Malphite — Comps con follow-up AoE para Moonfall',
    aiAnalysis: 'Diana asciende a S-tier como el jungler AP burst más fuerte del meta 26.8 (PropelRC S+, Blitz.gg 51% WR). Su R (Moonfall) es un pull AoE devastador que puede teamwipe con follow-up correcto. Su Q+R combo es burst AP instantáneo, y su W shield le da tankiness para survives jungle y dives.\n\nEl build AP assassin maximiza su burst. Rabadon + Llamasomo + Morellonomicon convierte su Q+R en un one-shot para carries.\n\nConsejo principal: Busca ganks post-6 con Q+R para burst instantáneo. En teamfights, entra con R para pull masivo y deja que tu equipo follow-up. Especialista en counter-jungle.',
    proPickRate: 5.2,
    runes: { primary: 'Brujería — Cometa Arcano', secondary: 'Dominación — Gusto por Sangre', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Lux', title: 'la Dama de la Luminosidad', role: 'Mid', tier: 'A', winRate: 48.5, pickRate: 9.2, banRate: 0.6, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R execute global → snipe across map', 'E AoE slow → zone control masivo', 'Q root 2 seg → CC seguro'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/lux/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/lux"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/lux"}],
    builds: [{ name: 'Build Mage', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 49.0 }],
    counterPick: 'Zed, Talon, Katarina',
    synergy: 'Morgana, Leona, Nautilus',
    aiAnalysis: "Lux es la mid laner de poke y control de zona más popular. Su R (Final Spark) es un execute global que puede snipe a través del mapa, su E (Light Binding) es un root de 2 segundos, y su pasiva le da burst en autos. Aunque su win rate es bajo, su pick rate alto demuestra que es una pick muy divertida y efectiva en las manos correctas.\n\nEl build mage maximiza su daño de poke. Rabadon + Morellonomicon la convierte en una máquina de damage AoE.\n\nConsejo principal: Usa Q para castigar errores de posicionamiento y R para ejecutar enemigos con poca vida. En teamfights, mantente atrás y spam habilidades.",
    proPickRate: 3.8,
    runes: {"primary":"Brujería — Cometa Arcano","secondary":"Precisión — Golpe de Gracia","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Nami', title: 'la Invocadora de Mareas', role: 'Support', tier: 'A', winRate: 49.1, pickRate: 5.3, banRate: 0.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R AoE knockup → disengage perfecto', 'Heal + damage → utility completa', 'E buff → ADC amplificado'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/nami/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/nami"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/nami"}],
    builds: [{ name: 'Build Enchanter', items: 'Redención → Convergencia de Zeke → Mikael → Medallón de los Solari → Botas de CD', winRate: 49.5 }],
    counterPick: 'Leona, Nautilus, Blitzcrank',
    synergy: 'Jinx, Vayne, Caitlyn',
    aiAnalysis: "Nami es la soporte enchanter más versátil del meta. Su R (Tidal Wave) es un knockup AoE masivo perfecto para disengage, su heal + damage la hacen útil en cualquier situación, y su E (Ebb and Flow) amplifica el daño del ADC aliado. Es la pick más completa para protección de carries.\n\nEl build enchanter maximiza peel y utilidad. Redención + Convergencia de Zeke le da todo lo que necesita.\n\nConsejo principal: Tu R puede cambiar teamfights enteros. Úsalo reactívamente para contraatacar engages enemigos o iniciando con sorpresa.",
    proPickRate: 4.1,
    runes: {"primary":"Brujería — Invocar Aery","secondary":"Determinación — Revitalizar","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Wukong', title: 'el Rey Mono', role: 'Top', tier: 'A', winRate: 48.8, pickRate: 4.2, banRate: 0.8, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R knockup teamwide → engage gratis', 'Clone jukes → engaña en fights', 'E+W → gap closer instantáneo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/wukong/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/wukong"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/wukong"}],
    builds: [{ name: 'Build Bruiser', items: 'Fuerza de la Trinidad → Eclipse → Hidra Titánica → Mandato Imperial → Botas de Mercurio', winRate: 49.2 }],
    counterPick: 'Teemo, Darius, Garen',
    synergy: 'Orianna, Kennen, Malphite',
    aiAnalysis: "Wukong es un top laner de engage masivo. Su R (Cyclone) es un knockup teamwide que puede teamwipe instantáneamente, su clone le da jukeo en fights, y su E+W es un gap closer instantáneo. Es especialmente fuerte en composiciones con engage de teamfight.\n\nEl build bruiser maximiza daño y tankiness. Fuerza de Trinidad + Eclipse + Mandato Imperial le da sustain masivo.\n\nConsejo principal: En teamfights, espera el momento perfecto para R sobre 3+ enemigos. Tu clone puede usarse para engañar habilidades defensivas enemigas.",
    proPickRate: 3.5,
    runes: {"primary":"Precisión — Conquistador","secondary":"Determinación — Segunda Vida","shards":"Adaptativo + Velocidad + Resistencia"},
  },
  { name: 'Volibear', title: 'la Tormenta Implacable', role: 'Top', tier: 'A', winRate: 47.9, pickRate: 3.8, banRate: 0.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['E+Q flip → toss carry a tu team', 'W execute → finishing blow', 'Passive shield → impossible dive early'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/volibear/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/volibear"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/volibear"}],
    builds: [{ name: 'Build Tank', items: 'Hidra Titánica → Fuerza de la Trinidad → Resistencia Divina → Medallón de los Solari → Botas de Placas', winRate: 48.5 }],
    counterPick: 'Teemo, Vayne, Darius',
    synergy: 'Orianna, Kennen, Wukong',
    aiAnalysis: "Volibear es un top laner tank con engage devastador. Su E+Q flip lanza carries enemigos directamente a su equipo, su W (Frenzy) ejecuta objetivos con poca vida, y su passive shield lo hace impossible de diver early. Su capacity de engage es una de las más fuertes del juego.\n\nEl build tank maximiza supervivencia y CC. Hidra Titánica + Fuerza de la Trinidad le da suficiente daño para no ser ignorado.\n\nConsejo principal: Usa Q+E para lanzar carries enemigos hacia tu equipo. Tu passive te da sustain en trades, así que abusa de él en lane.",
    proPickRate: 1.2,
    runes: {"primary":"Precisión — Conquistador","secondary":"Determinación — Revitalizar","shards":"Adaptativo + Velocidad + Resistencia"},
  },
  { name: 'Twisted Fate', title: 'el Maestro de Cartas', role: 'Mid', tier: 'A', winRate: 48.2, pickRate: 4.5, banRate: 1.1, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R global → presión todas lanes', 'Gold card stun → pick garantizado', 'Wave clear → nunca pierde lane'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/twistedfate/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/twistedfate"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/twistedfate"}],
    builds: [{ name: 'Build AP', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 48.8 }],
    counterPick: 'Zed, Talon, Kassadin',
    synergy: 'Shen, Nocturne, Pantheon',
    aiAnalysis: "Twisted Fate es el mid laner con mayor presión de mapa del juego. Su R (Destiny) le da presión global instantánea, su gold card stun es un pick garantizado, y su wave clear le permite controlar la lane perfectamente. Es especialista en crear ventajas en otras lanes.\n\nEl build AP maximiza su burst. Rabadon + Morellonomicon + Lich Bane le da one-shot potential con gold card.\n\nConsejo principal: Roam constantemente con R. Un TF que roam correctamente puede ganar el juego solo con map pressure. Gold card → auto → Q → blue card → W es su combo principal.",
    proPickRate: 4,
    runes: {"primary":"Brujería — Cometa Arcano","secondary":"Precisión — Presencia de Campeón","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Ashe', title: 'la Arquera de Escarcha', role: 'ADC', tier: 'S', winRate: 51.9, pickRate: 8.2, banRate: 1.1, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Blitz.gg'],
    brokenThings: ['R global stun → engage desde lejos', 'W slow spam → kite infinito', 'Passive crit → burst inesperado'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/ashe/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/ashe"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/ashe"}],
    builds: [{ name: 'Build Crit', items: 'Filo Infinito → Huracán de Runaan → Bailarín Espectral → Sed de Sangre → Botas de Berserker', winRate: 49.8 }],
    counterPick: 'Draven, Sivir, Caitlyn',
    synergy: 'Morgana, Lux, Braum',
    aiAnalysis: "Ashe es la ADC con mayor utilidad del meta. Su R (Enchanted Crystal Arrow) es un stun global que puede iniciar teamfights desde cualquier parte del mapa, su W (Volley) spam da kite infinito, y su passive de crit garantizado crea burst inesperado en trades.\n\nEl build crit maximiza su daño sostenido. Filo Infinito + Runaan + Bailarín Espectral le da DPS constante.\n\nConsejo principal: Usa tu R para iniciar teamfights o para salvar aliados en otras lanes. Tu W spam en teamfights kitea a cualquier bruiser.",
    proPickRate: 3.6,
    runes: {"primary":"Precisión — Pies Veloces","secondary":"Brujería — Colección de Ojos","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Rakan', title: 'el Encantador', role: 'Support', tier: 'A', winRate: 48.1, pickRate: 4.7, banRate: 0.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['W engage → pelea por ADC seguro', 'R AoE knockup → combo CC', 'Mobility → impossible to catch'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/rakan/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/rakan"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/rakan"}],
    builds: [{ name: 'Build Enchanter', items: 'Redención → Convergencia de Zeke → Mikael → Medallón de los Solari → Botas de Movilidad', winRate: 48.5 }],
    counterPick: 'Morgana, Lux, Zyra',
    synergy: 'Xayah, Jinx, Vayne',
    aiAnalysis: "Rakan es el soporte más móvil del meta. Su W (Grand Entrance) es un engage AoE, su R (The Quickness) da knockup masivo, y su mobility le hace imposible de atrapar. Es la pick perfecta para proteger ADCs con engages rápidos.\n\nEl build enchanter maximiza peel y utilidad. Redención + Convergencia de Zeke + Mikael le da todo lo que necesita.\n\nConsejo principal: Combina E → W → R para engages chain devastadores. Tu mobility te permite repositionar rapidamente en teamfights.",
    proPickRate: 2.8,
    runes: {"primary":"Determinación — Guardian","secondary":"Brujería — Frailidad","shards":"Armadura + Fuerza + Resistencia"},
  },
  { name: 'Xin Zhao', title: 'el Senescal de Demacia', role: 'Jungle', tier: 'A', winRate: 48.7, pickRate: 3.9, banRate: 0.4, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/xinzhao/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/xinzhao"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/xinzhao"}],
    builds: [{ name: 'Build Bruiser', items: 'Cosechador Nocturno → Eclipse → Hidra Titánica → Fuerza de la Trinidad → Botas de Mercurio', winRate: 49.0 }],
    counterPick: 'Elise, Nidalee, Lee Sin',
    synergy: 'Orianna, Wukong, Malphite',
    aiAnalysis: "Xin Zhao es el jungler de early pressure por excelencia. Su Q+R combo es un lock sin escape, su sustain en la jungla es excepcional, y su capacidad de 1v1 temprano es una de las mejores. Aunque cae en el late game, su capacidad de snowball es masiva.\n\nEl build bruiser maximiza daño temprano y sustain. Eclipse + Hidra Titánica le da enough para dominar el early game.\n\nConsejo principal: Gank constantemente desde nivel 3. Tu objetivo es snowballar antes del minute 15. Si no logras ventaja temprana, tu impacto disminuye significativamente.",
    proPickRate: 1.8,
    runes: {"primary":"Precisión — Pies Veloces","secondary":"Dominación — Golpe de Gracia","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Tristana', title: 'la Pistolera Yordle', role: 'ADC', tier: 'A', winRate: 48.9, pickRate: 5.1, banRate: 0.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['E+Q knockup → lock sin escape', 'R knockback → separation fights', 'Dueling → 1v1 monster'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/tristana/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/tristana"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/tristana"}],
    builds: [{ name: 'Build Crit', items: 'Filo Infinito → Huracán de Runaan → Bailarín Espectral → Sed de Sangre → Botas de Berserker', winRate: 49.5 }],
    counterPick: 'Draven, Caitlyn, Jhin',
    synergy: 'Nami, Morgana, Lulu',
    aiAnalysis: "Tristana es una ADC con scaling excepcional. Su rango aumenta con nivel, su E+Q lockea sin escape, y su R (Buster Shot) separa fights. En el late game, tiene el rango más alto del juego junto a la capacidad de duelos masiva.\n\nEl build crit maximiza su scaling. Filo Infinito + Runaan + Bailarín Espectral la convierte en una máquina de DPS.\n\nConsejo principal: Abusa de tu rango creciente en el late game. En teamfights, usa R defensivamente para separar bruisers que intenten alcanzarte.",
    proPickRate: 2.2,
    runes: {"primary":"Precisión — Pies Veloces","secondary":"Brujería — Colección de Ojos","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Shen', title: 'el Ojo del Crepúsculo', role: 'Top', tier: 'A', winRate: 47.5, pickRate: 3.2, banRate: 0.7, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R global shield → save teammates', 'E dash taunt → lockdown seguro', 'Split push → pressure sin estar'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/shen/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/shen"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/shen"}],
    builds: [{ name: 'Build Tank', items: 'Hidra Titánica → Fuerza de la Trinidad → Resistencia Divina → Medallón de los Solari → Botas de Placas', winRate: 48.0 }],
    counterPick: 'Teemo, Darius, Garen',
    synergy: 'Nocturne, Twisted Fate, Master Yi',
    aiAnalysis: "Shen es el top laner con la mejor utilidad global del juego. Su R (Stand United) da shield global para salvar aliados en cualquier parte del mapa, su E (Shadow Dash) con taunt es un lockdown seguro, y su split push es pressure constante. Es el pick definitivo para proteger carriers.\n\nEl build tank maximiza su utilidad. Hidra Titánica + Fuerza de la Trinidad le da suficiente daño para split push.\n\nConsejo principal: Tu R es la herramienta más poderosa del juego. Úsalo para salvar a tu carry en teamfights mientras split pushas. Tu E taunt es devastador en engages.",
    proPickRate: 2.5,
    runes: {"primary":"Determinación — Guardián","secondary":"Brujería — Frailidad","shards":"Armadura + Velocidad + Resistencia"},
  },
  { name: 'Syndra', title: 'la Soberana Oscura', role: 'Mid', tier: 'A', winRate: 47.8, pickRate: 4.1, banRate: 0.9, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R balls delete → one-shot carries', 'E pushback → self peel', 'Scaling → late game AP'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/syndra/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/syndra"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/syndra"}],
    builds: [{ name: 'Build AP', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 48.2 }],
    counterPick: 'Zed, Talon, Katarina',
    synergy: 'Nautilus, Leona, Braum',
    aiAnalysis: "Syndra es la mid laner con el burst más alto del juego. Su R (Unleashed Power) con bolas acumuladas puede one-shot carries instantáneamente, su E (Scatter the Weak) da pushback para self peel, y su scaling en el late game es devastador.\n\nEl build AP maximiza su burst. Rabadon + Morellonomicon + Zhonya le da one-shot potential con R a 7 bolas.\n\nConsejo principal: Acumula bolas antes de teamfights para maximizar el daño de tu R. Tu E es una herramienta de peel excelente contra assassinos.",
    proPickRate: 3,
    runes: {"primary":"Brujería — Cometa Arcano","secondary":"Precisión — Golpe de Gracia","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Nidalee', title: 'la Cazadora Bestial', role: 'Jungle', tier: 'A', winRate: 46.5, pickRate: 2.3, banRate: 0.4, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['Spear → one-shot carries', 'Cougar mobility → impossible catch', 'Counter jungle → starves enemy'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/nidalee/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/nidalee"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/nidalee"}],
    builds: [{ name: 'Build AP', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 47.0 }],
    counterPick: 'Lee Sin, Elise, RekSai',
    synergy: 'Syndra, Orianna, Lux',
    aiAnalysis: "Nidalee es la junglera con el mayor skill ceiling del juego. Su lanza (Q) en forma humana puede one-shot carries, su mobility en forma cougar es impossible de catchear, y su capacity de counter jungle es devastadora. Es una pick de alto riesgo y alta recompensa.\n\nEl build AP maximiza su burst. Rabadon + Morellonomicon convierte su lanza en un proyectil letal.\n\nConsejo principal: Practica la landing de lanzas constantemente. Una lanza bien lanzada en mid game puede cambiar el curso del juego. Tras level 6, roam con cougar form para maximizar presión.",
    proPickRate: 2,
    runes: {"primary":"Brujería — Cometa Arcano","secondary":"Dominación — Colección de Ojos","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Braum', title: 'el Corazón de los Freljord', role: 'Support', tier: 'A', winRate: 46.8, pickRate: 2.5, banRate: 0.1, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['E wall → blocks projectiles', 'R knockup → best defensive ult', 'Peel god support'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/braum/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/braum"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/braum"}],
    builds: [{ name: 'Build Tank', items: 'Redención → Medallón de los Solari → Convergencia de Zeke → Mikael → Botas de Movilidad', winRate: 47.5 }],
    counterPick: 'Morgana, Lux, Zyra',
    synergy: 'Jinx, Ashe, Caitlyn',
    aiAnalysis: "Braum es el soporte peel por excelencia. Su E (Unbreakable) bloquea todos los proyectiles entrantes, su R (Glacial Fissure) es el mejor ultimate defensivo del juego, y su capacity de peel es insuperable. Es la pick definitiva para proteger ADCs de poke y assassinos.\n\nEl build tank maximiza su supervivencia. Redención + Medallón de los Solari le da utilidad masiva.\n\nConsejo principal: Tu E puede bloquear habilidades devastadoras como el R de Jinx, el W de Caitlyn, y el R de Ezreal. Timing perfecto del E es game-changing.",
    proPickRate: 1.5,
    runes: {"primary":"Determinación — Guardián","secondary":"Brujería — Frailidad","shards":"Armadura + Fuerza + Resistencia"},
  },
  { name: "Vel'Koz", title: 'el Ojo del Vacío', role: 'Mid', tier: 'A', winRate: 46.0, pickRate: 1.9, banRate: 0.3, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/velkoz/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/velkoz"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/velkoz"}],
    builds: [{ name: 'Build Mage', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 46.5 }],
    counterPick: 'Zed, Talon, Katarina',
    synergy: 'Nautilus, Leona, Braum',
    aiAnalysis: 'Vel\'Koz es la mid laner de true damage más consistente del juego. Su R es un beam masivo de true damage que atraviesa todo el equipo enemigo, y su pasiva con 3 stacks explota para daño porcentual.\n\nEl build mage maximiza su daño AoE. Rabadon + Morellonomicon + Zhonya le da sustain y burst.\n\nConsejo principal: Acumula 3 stacks de pasiva antes de usar R para daño masivo. En teamfights, posicionate para que tu R atraviese al mayor número de enemigos.',
    proPickRate: 0.8,
    runes: { primary: 'Brujería — Cometa Arcano', secondary: 'Precisión — Golpe de Gracia', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Taliyah', title: 'la Tejedora de Piedras', role: 'Mid', tier: 'A', winRate: 46.3, pickRate: 2.0, banRate: 0.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R isolation → 1v1 garantizado', 'Q AoE → teamfight monster', 'Passive shield → sustain sin items'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/taliyah/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/taliyah"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/taliyah"}],
    builds: [{ name: 'Build AP', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 46.5 }],
    counterPick: 'Zed, Katarina, Ahri',
    synergy: 'Yasuo, Gragas, Wukong',
    aiAnalysis: "Taliyah es la mid laner con el mejor control de mapa del juego. Su R (Weaver's Wall) puede aislar carries del teamfight, su Q (Threaded Volley) es daño AoE masivo, y su passive de escudo le da sustain sin items. Es especialista en crear ventajas con map control.\n\nEl build AP maximiza su burst y control. Rabadon + Morellonomicon la convierte en una máquina de daño AoE.\n\nConsejo principal: Usa tu R para dividir teamfights y aislar carries. La sinergia con Yasuo (wall combo) es devastadora para team wipes.",
    proPickRate: 1.2,
    runes: {"primary":"Brujería — Cometa Arcano","secondary":"Precisión — Presencia de Campeón","shards":"Adaptativo + Fuerza + Resistencia"},
  },

  // Tier B — Jugables
  { name: 'Yorick', title: 'el Pastor de Almas', role: 'Top', tier: 'B', winRate: 46.2, pickRate: 2.1, banRate: 0.3, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['Maiden → 2v1 lane sin esfuerzo', 'Wall → zona muerte fights', 'Split monster → necesita 2+ para parar'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/yorick/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/yorick"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/yorick"}],
    builds: [{ name: 'Build Split Push', items: 'Fuerza de la Trinidad → Eclipse → Hidra Titánica → Resistencia Divina → Botas de Placas', winRate: 46.8 }],
    counterPick: 'Teemo, Vayne, Quinn',
    synergy: 'Singed, Shen, Trundle',
    aiAnalysis: "Yorick es el rey indiscutible del split push. Su Maiden of the Mist le da 2v1 lane sin esfuerzo, su wall crea zonas de muerte en fights, y su capacité de split push es tan fuerte que necesita 2+ enemigos para detenerlo. Es la pick perfecta para estrategias de presión lateral.\n\nEl build split push maximiza su daño a torres y 1v1. Fuerza de Trinidad + Eclipse le da suficiente daño para ganar duelos.\n\nConsejo principal: Split push constantemente y usa Maiden para crear presión insostenible. Solo únete a teamfights si tu equipo está perdiendo objetivamente.",
    proPickRate: 0.5,
    runes: {"primary":"Precisión — Conquistador","secondary":"Determinación — Segunda Vida","shards":"Adaptativo + Velocidad + Resistencia"},
  },
  { name: 'Ivern', title: 'el Padre Verde', role: 'Jungle', tier: 'B', winRate: 45.8, pickRate: 1.5, banRate: 0.1, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['Counter jungle → steal sin riesgo', 'Shield + speed → peel top tier', 'Daisy → CC objetive fights'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/ivern/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/ivern"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/ivern"}],
    builds: [{ name: 'Build Enchanter', items: 'Redención → Convergencia de Zeke → Mikael → Medallón de los Solari → Botas de CD', winRate: 46.2 }],
    counterPick: 'Lee Sin, Nidalee, Shaco',
    synergy: 'Garen, Darius, Wukong',
    aiAnalysis: "Ivern es el jungler más único del juego. Su capacidad de counter jungle le permite robar camps sin riesgo, su shield + speed boost da peel top tier, y Daisy (su bush pet) aporta CC en objective fights. Es un campeón de alto skill ceiling con un kit completamente distinto.\n\nEl build enchanter maximiza su utilidad de soporte. Redención + Convergencia de Zeke + Mikael le da todo lo que necesita.\n\nConsejo principal: Usa tu passive para compartir jungle camps con tu carry. Daisy es game-changing en Baron y Dragon fights. Counter jungle agresivamente para crear desventaja de gold.",
    proPickRate: 0.3,
    runes: {"primary":"Brujería — Invocar Aery","secondary":"Determinación — Revitalizar","shards":"Adaptativo + Velocidad + Resistencia"},
  },
  { name: 'Kalista', title: 'la Lanza de la Venganza', role: 'ADC', tier: 'B', winRate: 45.5, pickRate: 1.8, banRate: 0.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R save → unkillable ally', 'E execute → finish secured', 'Atk speed → highest DPS'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/kalista/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/kalista"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/kalista"}],
    builds: [{ name: 'Build On-Hit', items: 'Guja Botadora → Frenesí de Runaan → Bailarín Espectral → Sed de Sangre → Botas de Berserker', winRate: 46.0 }],
    counterPick: 'Draven, Caitlyn, Varus',
    synergy: 'Thresh, Tahm Kench, Braum',
    aiAnalysis: "Kalista es la ADC con la mayor attack speed del juego. Su R (Fate's Call) puede salvar a un aliado en situación crítica, su E (Rend) es un execute masivo, y su capacity de kiting es insuperable. Es una pick de alto skill ceiling que requiere un support coordinado.\n\nEl build on-hit maximiza su DPS. Guja Botadora + Runaan + Bailarín Espectral la convierte en una máquina de stacks.\n\nConsejo principal: Tu E execute es más fuerte con más stacks. En teamfights, busca acumular stacks en carries antes de activar E. La sinergia con Thresh es la más fuerte del juego.",
    proPickRate: 0.8,
    runes: {"primary":"Precisión — Pies Veloces","secondary":"Dominación — Sabor a Sangre","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Mordekaiser', title: 'el Reveniente de Hierro', role: 'Top', tier: 'B', winRate: 45.2, pickRate: 2.7, banRate: 0.6, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/mordekaiser/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/mordekaiser"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/mordekaiser"}],
    builds: [{ name: 'Build AP Bruiser', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 45.8 }],
    counterPick: 'Teemo, Vayne, Gnar',
    synergy: 'Orianna, Kennen, Morgana',
    aiAnalysis: "Mordekaiser es el top laner AP bruiser más amenazante en duelos selectivos. Su R (Realm of Death) aísla a un enemigo en una dimensión separada para un 1v1 donde Morde tiene ventaja masiva. Su Q (Obliterate) en 3 targets hace daño masivo, y su sustain con passive es excepcional.\n\nEl build AP bruiser maximiza daño y tankiness. Rabadon + Morellonomicon le da suficiente burst para eliminar carries atrapados en su R.\n\nConsejo principal: Usa tu R sobre el carry enemigo más peligroso para un 1v1 garantizado. En la zona de la R, tu passive de shield te da ventaja masiva.",
    proPickRate: 1.8,
    runes: {"primary":"Brujería — Cometa Arcano","secondary":"Precisión — Presencia de Campeón","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Bard', title: 'el Cuidador Errante', role: 'Support', tier: 'B', winRate: 43.5, pickRate: 1.2, banRate: 0.1, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R stasis → save y freeze', 'E journey → rotation unique', 'Chime stacking → late AP'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/bard/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/bard"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/bard"}],
    builds: [{ name: 'Build Enchanter', items: 'Redención → Mikael → Convergencia de Zeke → Medallón de los Solari → Botas de CD', winRate: 44.0 }],
    counterPick: 'Leona, Nautilus, Pyke',
    synergy: 'Jinx, Lucian, Ezreal',
    aiAnalysis: "Bard es el soporte más creativo y único del juego. Su R (Tempered Fate) puede congelar todo el teamfight para saves y engages perfectos, su E (Magical Journey) permite rotaciones únicas, y su escalado de chimes le da AP masivo en el late game. Es una pick de alto skill ceiling.\n\nEl build enchanter maximiza utilidad y peel. Mikael + Redención + Convergencia de Zeke le da herramientas masivas.\n\nConsejo principal: Tu R es la herramienta más versátil del juego. Úsalo para congelar carries enemigos o para salvar aliados de executes. Recolecta chimes constantemente para escalar.",
    proPickRate: 1.5,
    runes: {"primary":"Determinación — Guardián","secondary":"Brujería — Frailidad","shards":"Armadura + Velocidad + Resistencia"},
  },
  { name: 'Skarner', title: 'el Vanguardia de Cristal', role: 'Jungle', tier: 'B', winRate: 44.1, pickRate: 0.8, banRate: 0.1, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R suppression → no escape', 'E speed → engage rápido', 'Crystal zone → domination'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/skarner/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/skarner"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/skarner"}],
    builds: [{ name: 'Build Tank', items: 'Hidra Titánica → Fuerza de la Trinidad → Resistencia Divina → Medallón de los Solari → Botas de Placas', winRate: 44.8 }],
    counterPick: 'Elise, Nidalee, Shaco',
    synergy: 'Orianna, Wukong, Kennen',
    aiAnalysis: "Skarner es el jungler tank con la mayor capacidad de control de objetivos del juego. Su R (Impale) es una supresión point-and-click que no tiene escape, su E da speed para engages rápidos, y su zone de cristales domina áreas clave del mapa. Es especialista en Dragon y Baron control.\n\nEl build tank maximiza su tankiness y CC. Hidra Titánica + Fuerza de la Trinidad le da suficiente daño para ser relevante.\n\nConsejo principal: Usa tu R para asegurar objetivos o para atrapar carries en teamfights. Controla las zonas de cristal cerca de Dragon y Baron para dominar el mapa.",
    proPickRate: 0.2,
    runes: {"primary":"Precisión — Pies Veloces","secondary":"Determinación — Demolir","shards":"Adaptativo + Velocidad + Resistencia"},
  },
  { name: 'Azir', title: 'el Emperador de las Arenas', role: 'Mid', tier: 'B', winRate: 43.8, pickRate: 1.0, banRate: 0.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R shuffle → reposiciona enemigos', 'Soldier DPS → damage safe', 'Shurima shuffle → fight turn'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/azir/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/azir"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/azir"}],
    builds: [{ name: 'Build Control Mage', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 44.5 }],
    counterPick: 'Zed, Katarina, Talon',
    synergy: 'Nautilus, Braum, Leona',
    aiAnalysis: "Azir es el mid laner con el mayor DPS sostenido del juego. Su R (Emperor's Divide) reposiciona enemigos en teamfights, sus soldiers proporcionan daño safe a distancia, y su combo de Shurima Shuffle puede cambiar fights instantáneamente. Es uno de los campeones con mayor skill ceiling del juego.\n\nEl build control mage maximiza su DPS y utilidad. Rabadon + Morellonomicon + Zhonya le da sustain y daño masivo.\n\nConsejo principal: Practica el Shurima Shuffle (E → R → Q) para separar carries del teamfight. Tus soldiers te dan harass seguro en lane sin exponerte.",
    proPickRate: 1.5,
    runes: {"primary":"Brujería — Cometa Arcano","secondary":"Precisión — Presencia de Campeón","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Urgot', title: 'el Acorazado', role: 'Top', tier: 'B', winRate: 44.5, pickRate: 1.4, banRate: 0.3, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/urgot/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/urgot"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/urgot"}],
    builds: [{ name: 'Build Bruiser', items: 'Fuerza de la Trinidad → Eclipse → Hidra Titánica → Resistencia Divina → Botas de Placas', winRate: 45.2 }],
    counterPick: 'Teemo, Vayne, Quinn',
    synergy: 'Orianna, Wukong, Malphite',
    aiAnalysis: "Urgot es el top laner más intimidante del juego. Su R (Fear Beyond Death) ejecuta enemigos por debajo de un umbral de vida, su shotgun knees hacen daño masivo en melee, y su tankiness natural lo hace difícil de matar. Es especialista en anti-Dive y ejecutar carries.\n\nEl build bruiser maximiza sustain y daño. Fuerza de Trinidad + Eclipse le da trading power en lane.\n\nConsejo principal: Tu R es un execute que no se puede prevenir. En teamfights, bajas la vida de carries y usa R para ejecutarlos públicamente. Tu passive de legs es devastador contra melee.",
    proPickRate: 0.6,
    runes: {"primary":"Precisión — Conquistador","secondary":"Determinación — Segunda Vida","shards":"Adaptativo + Velocidad + Resistencia"},
  },
  { name: 'Malphite', title: 'el Monolito de Piedra', role: 'Top', tier: 'S', winRate: 52.8, pickRate: 4.2, banRate: 1.8, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Buildzcrank', 'PropelRC', 'Blitz.gg'],
    brokenThings: ['R AoE knockup → mejor engage Teamfight del juego', 'E armor scaling → imposible de lastimar en lane vs AD', 'W steroid → thunderclap instantáneo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/malphite/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/malphite"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/malphite"}],
    builds: [{ name: 'Build Tank AP', items: 'Hidra Titánica → Jak\'Sho, Proteico → Fuerza de la Trinidad → Reloj de Zhonya → Botas de Placas', winRate: 53.2 }],
    counterPick: 'Teemo, Kennen, Vayne',
    synergy: 'Orianna, Kennen, Wukong — Comps con engage AoE doble',
    aiAnalysis: 'Malphite asciende a S-tier como el anti-AD dominante del meta 26.8 (Buildzcrank S, PropelRC A→S, Blitz.gg 52.5% WR). Su R (Unstoppable Force) es el mejor engage AoE del juego, y con el meta lleno de ADCs y bruisers AD, su E scaling con armadura lo hace imparable en lane. Con 52.8% WR, es la pick de top más consistente contra composiciones AD.\n\nEl build Tank AP maximiza su daño de R mientras mantiene su tankiness. Jak\'Sho + Zhonya le da todo lo que necesita para teamfights.\n\nConsejo principal: Pick contra 3+ AD enemigos para dominar. Tu R con 3+ enemigos agrupados es team wipe garantizado. Coordina con Orianna/Kennen para doble engage AoE.',
    proPickRate: 3.2,
    runes: { primary: 'Determinación — Guardián', secondary: 'Brujería — Frailidad', shards: 'Armadura + Velocidad + Resistencia' },
  },
  { name: 'Senna', title: 'la Redentora', role: 'Support', tier: 'B', winRate: 49.0, pickRate: 4.8, banRate: 0.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R global heal → teamwide sustain', 'Q infinite scaling → late game ADC'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/senna/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/senna"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/senna"}],
    builds: [{ name: 'Build ADC', items: 'Filo Infinito → Huracán de Runaan → Bailarín Espectral → Sed de Sangre → Botas de Berserker', winRate: 49.5 }],
    counterPick: 'Leona, Nautilus, Blitzcrank',
    synergy: 'Lucian, Jhin, Ashe',
    aiAnalysis: "Senna es el soporte más versátil del meta. Su R (Dawning Shadow) es un heal global que da sustain masivo a todo el equipo, su Q scaling infinito la convierte en una ADC en el late game, y su capacity de utility es una de las más completas del juego.\n\nEl build ADC maximiza su scaling. Filo Infinito + Runaan la convierte en una machine de DPS en el late game.\n\nConsejo principal: Recolecta almas constantemente para escalar. Tu R puede salvar teamfights enteros con el heal global. En el late game, transiciona a ADC.",
    proPickRate: 2.5,
    runes: {"primary":"Determinación — Guardian","secondary":"Precisión — Presencia de Campeón","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Draven', title: 'el Gladiador', role: 'ADC', tier: 'B', winRate: 49.8, pickRate: 5.2, banRate: 1.8, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['Q axe catch → más daño base del juego', 'Passive gold → snowball económico'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/draven/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/draven"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/draven"}],
    builds: [{ name: 'Build Lethality', items: 'Filo de la Noche → Eclipse → El Colector → Sed de Sangre → Botas de Movilidad', winRate: 50.1 }],
    counterPick: 'Caitlyn, Vayne, Ashe',
    synergy: 'Thresh, Leona, Nautilus',
    aiAnalysis: "Draven es el ADC con el mayor daño base del juego. Su Q (Spinning Axe) con el catch correcto le da más daño que cualquier otro ADC en el early game, y su passive de gold premium snowbolla económicamente como ningún otro. Es la pick más agresiva de la bot lane.\n\nEl build lethality maximiza su burst temprano. Filo de la Noche + Eclipse le da suficiente damage para kills en el primer back.\n\nConsejo principal: NUNCA pierdas un axe. El snowball de Draven depende completamente de mantener el catch streak. En teamfights, posicionate agresivamente para maximizar tu DPS.",
    proPickRate: 2.8,
    runes: {"primary":"Precisión — Pies Veloces","secondary":"Dominación — Sabor a Sangre","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Elise', title: 'la Araña de la Spin', role: 'Jungle', tier: 'B', winRate: 48.1, pickRate: 3.1, banRate: 0.6, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['Spider form burst → invade y mata', 'Cocoon stun → ganks garantizados'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/elise/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/elise"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/elise"}],
    builds: [{ name: 'Build AP', items: 'Sombrero de Rabadon → Morellonomicon → Reloj de Zhonya → Llamasomo → Botas de CD', winRate: 47.8 }],
    counterPick: 'Lee Sin, Nidalee, Shaco',
    synergy: 'Syndra, Orianna, Lux',
    aiAnalysis: "Elise es la junglera assassina más técnica del juego. Su spider form burst es devastador en invasiones y ganks, su Cocoon stun garantiza ganks, y su capacity de counter jungle es excelente. Es una pick de alto skill ceiling que domina en manos experimentadas.\n\nEl build AP maximiza su burst. Rabadon + Morellonomicon + Zhonya le da enough para one-shot carries.\n\nConsejo principal: Inviade temprano con spider form para harass. Tu Cocoon + spider combo en nivel 3 puede conseguir kills en jungle enemigo. En teamfights, assassina carries con combo completo.",
    proPickRate: 1.2,
    runes: {"primary":"Dominación — Electrocutar","secondary":"Precisión — Presencia de Campeón","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Nautilus', title: 'el Titán de las Profundidades', role: 'Support', tier: 'S', winRate: 51.3, pickRate: 6.8, banRate: 1.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['Amber.gg', 'Mobalytics'],
    brokenThings: ['R point-click → imposible fallar engage', 'CC machine → 4 formas de stun/knockup', 'Hook + ult → pick garantizado en cualquier carry'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/nautilus/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/nautilus"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/nautilus"}],
    builds: [{ name: 'Build Tank Engage', items: 'Redención → Medallón de los Solari → Convergencia de Zeke → Jak\'Sho, Proteico → Botas de Movilidad', winRate: 51.5 }],
    counterPick: 'Morgana, Lux, Zyra',
    synergy: 'Jinx, Caitlyn, Ashe — ADCs que follow-up el engage',
    aiAnalysis: 'Nautilus asciende a S-tier como el soporte engage más consistente del meta 26.8 (Amber.gg S, Mobalytics S). Su R (Depth Charge) es point-click con knockup, su Q es un hook masivo, y tiene 4 formas de CC en su kit. Con el meta actual favoreciendo engages fuertes, Nautilus brilla más que nunca.\n\nEl build tank maximiza su supervivencia para absorber daño mientras engancha. Jak\'Sho + Redención le da sustain y utilidad masiva en teamfights.\n\nConsejo principal: Tu R es point-and-click, imposible fallar. Úsalo siempre sobre el carry enemigo más peligroso. Tu Q desde los arbustos es un engage sorprendente.',
    proPickRate: 4.8,
    runes: { primary: 'Determinación — Guardián', secondary: 'Brujería — Frailidad', shards: 'Armadura + Fuerza + Resistencia' },
  },
  { name: 'Ekko', title: 'el Niño Prodigio', role: 'Jungle', tier: 'B', winRate: 47.8, pickRate: 4.2, banRate: 1.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    brokenThings: ['R rewind → juega agresivo sin riesgo', 'E gap close → ganks lvl 2'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/ekko/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/ekko"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/ekko"}],
    builds: [{ name: 'Build AP Assassin', items: 'Sombrero de Rabadon → Llamasomo → Morellonomicon → Reloj de Zhonya → Botas del Vacío', winRate: 47.5 }],
    counterPick: 'Lee Sin, Elise, Nidalee',
    synergy: 'Orianna, Kennen, Malphite',
    aiAnalysis: "Ekko es el jungler assassino con la mejor herramienta de reset del juego. Su R (Chronobreak) le permite jugar agresivamente sin riesgo de morir, su E gap closer da ganks desde nivel 2, y su capacidad de snowball es masiva. Es especialista en carry desde la jungla.\n\nEl build AP assassin maximiza su burst. Rabadon + Llamasomo + Morellonomicon le da one-shot potential.\n\nConsejo principal: Tu R es tu herramienta más fuerte → no tengas miedo de usarlo agresivamente. En ganks, usa E+W+Q para burst masivo. En teamfights, assassina carries y R para reset.",
    proPickRate: 2.5,
    runes: {"primary":"Dominación — Oscuro Colhar","secondary":"Precisión — Presencia de Campeón","shards":"Adaptativo + Fuerza + Resistencia"},
  },
  { name: 'Kennen', title: 'el Corazón de la Tormenta', role: 'Top', tier: 'A', winRate: 50.7, pickRate: 3.2, banRate: 0.9, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '26.8', game: 'LoL',
    metaUpdated: true, metaSources: ['U.GG', 'Blitz.gg'],
    brokenThings: ['R AoE stun → teamfight devastador', 'Energy → sin mana problemas'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/kennen/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/kennen"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/kennen"}],
    builds: [{ name: 'Build AP', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 47.0 }],
    counterPick: 'Teemo, Darius, Garen',
    synergy: 'Orianna, Wukong, Malphite',
    aiAnalysis: "Kennen es el top laner con el mejor engage AoE de energía. Su R (Slicing Maelstrom) es un stun masivo en teamfights, su sistema de energía le da spam infinito de habilidades, y su Q harass en lane es constante. Es especialista en teamfight compositions.\n\nEl build AP maximiza su burst AoE. Rabadon + Morellonomicon + Zhonya le da sustain y daño masivo.\n\nConsejo principal: Acumula 3 stacks de pasiva con autos antes de usar W para stun garantizado. En teamfights, busca R sobre 3+ enemigos agrupados para stuns chain devastadores.",
    proPickRate: 0.5,
    runes: {"primary":"Brujería — Cometa Arcano","secondary":"Determinación — Demolir","shards":"Adaptativo + Fuerza + Resistencia"},
  },

  // ============ WILD RIFT CHAMPIONS ============
  // Tier S — Dioses del Meta (Wild Rift)
  {
    name: 'Master Yi', title: 'el Buscador de Wuju', role: 'Jungle', tier: 'S', winRate: 56.8, pickRate: 16.3, banRate: 15.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
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
    name: 'Jinx', title: 'la Cañón Suelto', role: 'ADC', tier: 'S', winRate: 55.1, pickRate: 14.8, banRate: 6.3, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
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
    name: 'Lee Sin', title: 'el Monje Ciego', role: 'Jungle', tier: 'S', winRate: 53.5, pickRate: 12.1, banRate: 8.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
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
    name: 'Ahri', title: 'el Zorro de Nueve Colas', role: 'Mid', tier: 'S', winRate: 54.2, pickRate: 11.5, banRate: 4.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
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
    name: 'Darius', title: 'la Mano de Noxus', role: 'Top', tier: 'S', winRate: 54.5, pickRate: 9.8, banRate: 10.1, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
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
    name: 'Thresh', title: 'el Guardián de Cadenas', role: 'Support', tier: 'S', winRate: 52.8, pickRate: 16.5, banRate: 2.1, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
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
  { name: 'Ezreal', title: 'el Explorador Pródigo', role: 'ADC', tier: 'A', winRate: 50.8, pickRate: 10.2, banRate: 0.8, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
    brokenThings: ['Q spam → nunca en peligro en lane', 'E escape → imposible de gankear', 'Blue build → damage sin riesgo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/ezreal/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/ezreal"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/ezreal"}],
    builds: [{ name: 'Build Blue', items: 'Filo de la Noche → Muramana → Hielo Eterno → Colmillo Infinito → Botas de CD', winRate: 51.2 }],
    counterPick: 'Samira, Draven, Sivir',
    synergy: 'Lux, Morgana — Root y poke para maximizar Q',
    aiAnalysis: 'Ezreal en Wild Rift es uno de los ADC más seguros del meta móvil. Su Q (Mystic Shot) con el auto-aim asistido para controles táctiles es mucho más fácil de landing que en PC, y su E (Arcane Shift) le da escape instantáneo contra ganks. En el mapa compacto de WR, puede pokear desde distancia de forma constante sin arriesgarse.\n\nEl Blue Build con Muramana maximiza su daño sostenido en teamfights. La sinergia con supports de poke como Lux y Morgana es estadísticamente la mejor combinación para WR.\n\nConsejo: En WR, spam Q constantemente en lane para harass. Los cooldowns en móvil son más manejables, y el mapa chico permite que tu poke alcance más zonas del mapa.',
    proPickRate: 8.5,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Brujería — Colección de Ojos', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Zed', title: 'el Maestro de Sombras', role: 'Mid', tier: 'A', winRate: 50.3, pickRate: 9.1, banRate: 4.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/zed/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/zed"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/zed"}],
    builds: [{ name: 'Build Oneshot', items: 'Filo de la Noche → Eclipse → El Coleccionista → Última Piedad → Botas de Movilidad', winRate: 50.9 }],
    brokenThings: ['R shadow → assassinar sin riesgo en móvil', 'Energy → sin mana, spam abilities', 'W+Q combo → burst mobile instantáneo'],
    counterPick: 'Galio, Morgana, Garen',
    synergy: 'Lee Sin, Vi — Engage para crear ventajas en map chico',
    aiAnalysis: 'Zed en Wild Rift es el asesino más popular de mid lane. Su R (Death Mark) con los controles simplificados de móvil es más fácil de ejecutar, y su sombra le da movilidad excepcional en el mapa compacto. La distancia reducida entre mid y las otras lanes amplifica su capacidad de roam y eliminar carries.\n\nEl build lethality maximiza su burst temprano. En WR, los juegos cortos favorecen enormemente su estilo de snowball agresivo, ya que no necesita escalar tanto.\n\nConsejo: Practica el combo R → auto → Q → E, que en controles táctiles es más sencillo que en PC. Usa tu W para posicionarte antes de combo y escapar tras el asesinato.',
    proPickRate: 6.2,
    runes: { primary: 'Dominación — Golpe de Gracia', secondary: 'Precisión — Presencia de Campeón', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Garen', title: 'el Poder de Demacia', role: 'Top', tier: 'A', winRate: 52.1, pickRate: 8.3, banRate: 1.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
    brokenThings: ['E CD reducido → más spins más daño', 'Passive sustain → nunca backea', 'Villain → punish carries sin esfuerzo'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/garen/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/garen"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/garen"}],
    builds: [{ name: 'Build Bruiser', items: 'Fuerza de Trinidad → Eclipse → Hidra → Resistencia Divina → Botas de Placas', winRate: 52.8 }],
    counterPick: 'Teemo, Vayne, Camille',
    synergy: 'Jarvan IV, Morgana — Engage + CC para spin en teamfight',
    aiAnalysis: 'Garen en Wild Rift es un top laner extremadamente sólido. Su pasiva de regeneración brilla en WR porque los juegos son más cortos y los back más infrecuentes. Su E (Judgment) con CD reducido le da presión constante en lane, y el sistema de Villain lo hace más letal contra carries.\n\nEl build bruiser con Fuerza de Trinidad maximiza daño y sustain. En WR, el meta de partidas rápidas con teamfights frecuentes le favorece enormemente porque su Q decimatadora escala con HP.\n\nConsejo: Abusa de tu pasiva entre trades para mantener vida full. En WR, las distancias son más cortas, así que usa tu Q para chasear enemigos que se retiran tras exchanges.',
    proPickRate: 3.8,
    runes: { primary: 'Precisión — Conquistador', secondary: 'Determinación — Segunda Vida', shards: 'Adaptativo + Velocidad + Resistencia' },
  },
  { name: 'Katarina', title: 'la Hoja Siniestra', role: 'Mid', tier: 'A', winRate: 50.6, pickRate: 7.8, banRate: 2.8, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/katarina/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/katarina"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/katarina"}],
    builds: [{ name: 'Build Oneshot', items: 'Sombrero de Rabadon → Morellonomicon → Llamasomo → Reloj de Zhonya → Botas del Vacío', winRate: 51.1 }],
    brokenThings: ['R dagas AoE → teamwipe instantáneo en espacios cerrados', 'Shunpo mobility → imposible de atrapar en mapa chico', '1 kill = snowball teamfight'],
    counterPick: 'Malzahar, Diana, Ahri',
    synergy: 'Vi, Lee Sin — Engage para preparar dagas en fights',
    aiAnalysis: 'Katarina en Wild Rift es devastadora. Su R (Death Lotus) con los controles táctiles simplificados es más fácil de posicionar en teamfights cerrados, y su shunpo le da movilidad infinita en el mapa compacto. La distancia reducida entre lanes amplifica su capacidad de limpiar teamfights tras un solo kill.\n\nEl build AP oneshot maximiza su burst. En WR, los teamfights más frecuentes y en espacios reducidos del mapa son perfectos para las dagas de su ultimate.\n\nConsejo: Espera a que el enemigo use su CC antes de entrar con R. En WR, los combos son más simples con controles táctiles, así que enfócate en posicionarte bien.',
    proPickRate: 5.1,
    runes: { primary: 'Brujería — Cometa Arcano', secondary: 'Precisión — Golpe de Gracia', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Vi', title: 'el Ejecutor de Piltover', role: 'Jungle', tier: 'A', winRate: 51.5, pickRate: 6.8, banRate: 1.8, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
    brokenThings: ['R point-click → no se puede dodge', 'Eclipse bruiser → tanque y daño', 'Q gap closer → ganks lvl 2 garantizados'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/vi/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/vi"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/vi"}],
    builds: [{ name: 'Build Bruiser', items: 'Cosechador Nocturno → Eclipse → Hidra Titánica → Fuerza de la Trinidad → Botas de Mercurio', winRate: 51.2 }],
    counterPick: 'Elise, Nidalee, Shaco',
    synergy: 'Ahri, Zed — Burst para eliminar carries rápidamente',
    aiAnalysis: 'Vi en Wild Rift es el jungler más confiable para ranked. Su R (Cease and Desist) es point-and-click, lo que en controles táctiles es una ventaja enorme: no necesitas precisión para enganchar al carry enemigo. En el mapa chico de WR, la distancia entre la jungla y las lanes es menor, haciendo sus ganks mucho más efectivos.\n\nEl build bruiser con Eclipse maximiza daño y supervivencia. Es especialmente fuerte en el meta de WR donde los juegos son rápidos y los ganks tempranos definien el ritmo.\n\nConsejo: En WR, gank nivel 3 con Q+E es casi garantizado. Prioriza bot lane donde el mapa compacto te da ventaja de distancia.',
    proPickRate: 7.3,
    runes: { primary: 'Precisión — Conquistador', secondary: 'Dominación — Golpe de Gracia', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Lulu', title: 'la Hechicera Fada', role: 'Support', tier: 'A', winRate: 50.9, pickRate: 8.1, banRate: 0.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
    brokenThings: ['R peeling → protege carry completamente', 'W polymorph → shutdown carries', 'Meta estable → siempre relevante'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/lulu/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/lulu"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/lulu"}],
    builds: [{ name: 'Build Enchanter', items: 'Redención → Convergencia de Zeke → Mikael → Medallón → Botas de CD', winRate: 51.4 }],
    counterPick: 'Leona, Nautilus, Blitzcrank',
    synergy: 'Jinx, Vayne — Peel para hypercarries en WR',
    aiAnalysis: 'Lulu en Wild Rift es el soporte enchanter por excelencia. Su R (Wild Growth) con el target asistido para móvil es más fácil de usar, y su W (Whimsy) shutdown carries enemigos instantáneamente. En los teamfights cerrados del mapa compacto, su utilidad se multiplica enormemente.\n\nEl build enchanter maximiza peel y utilidad. En WR, donde los teamfights son más frecuentes y en espacios reducidos, Lulu brilla más que en PC.\n\nConsejo: Guarda tu R para salvar a tu carry en momentos críticos. En WR los fights son rápidos, así que la timing del R de Lulu es game-changing.',
    proPickRate: 6.8,
    runes: { primary: 'Determinación — Guardian', secondary: 'Brujería — Frailidad', shards: 'Armadura + Fuerza + Resistencia' },
  },
  { name: 'Vayne', title: 'la Cazadora Nocturna', role: 'ADC', tier: 'A', winRate: 51.2, pickRate: 5.5, banRate: 0.6, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
    brokenThings: ['W % true damage → mata tanks', 'Q tumble → impossible hit skillshots', 'R burst desde stealth'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/vayne/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/vayne"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/vayne"}],
    builds: [{ name: 'Build On-Hit', items: 'Guja Botadora → Frenesí de Runaan → Bailarín Espectral → Última Piedad → Botas de Berserker', winRate: 51.8 }],
    counterPick: 'Draven, Caitlyn, Jhin',
    synergy: 'Lulu, Thresh — Protección máxima para 1v9',
    aiAnalysis: 'Vayne en Wild Rift es una máquina de true damage. Su W (Silver Bolts) con 3 stacks hace daño verdadero masivo a tanks, crucial en el meta actual de bruisers. Su Q (Tumble) en el mapa chico es más efectivo para esquivar habilidades gracias a los controles táctiles.\n\nEl build on-hit maximiza su daño por stack. En WR, los juegos cortos significan que necesita snowballar temprano y aprovechar su poder de 1v1.\n\nConsejo: En WR, practica el tumble-condemn (Q→E) contra las paredes del mapa. El mapa chico tiene más muros cerca de las lanes, facilitando el stun.',
    proPickRate: 4.5,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Determinación — Sobrecrecimiento', shards: 'Adaptativo + Velocidad + Resistencia' },
  },
  { name: 'Camille', title: 'la Sombra de Acero', role: 'Top', tier: 'A', winRate: 50.4, pickRate: 6.2, banRate: 2.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/camille/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/camille"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/camille"}],
    builds: [{ name: 'Build Bruiser', items: 'Cosechador Nocturno → Hidra Titánica → Fuerza de la Trinidad → Resistencia Divina → Botas de Mercurio', winRate: 50.5 }],
    brokenThings: ['Q true damage → trade ganado siempre', 'E wall jump → engage + escape en mapa chico', 'R lock → elimina target en 1v1 sin counterplay'],
    counterPick: 'Teemo, Gwen, Fiora',
    synergy: 'Jarvan IV, Orianna — Engage con follow-up devastador',
    aiAnalysis: 'Camille en Wild Rift es la top laner más versátil del meta. Su R (The Hextech Ultimatum) con target simplificado para móvil es más fácil de ejecutar, y su E (Hookshot) le da movilidad excepcional. En el mapa compacto, puede dividir y unirse al equipo con split push muy efectivo.\n\nEl build bruiser maximiza sustain y daño mixto. En WR, su capacidad de 1v1 es una de las mejores del juego, ideal para el meta de partidas cortas.\n\nConsejo: Usa tu E para escalar muros del mapa chico rápidamente. El tiempo de viaje entre lanes es menor en WR, aprovecha para roam tras empujar.',
    proPickRate: 5.9,
    runes: { primary: 'Precisión — Conquistador', secondary: 'Determinación — Segunda Vida', shards: 'Adaptativo + Velocidad + Resistencia' },
  },
  { name: 'Graves', title: 'el Proscrito', role: 'Jungle', tier: 'A', winRate: 49.8, pickRate: 5.1, banRate: 0.8, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
    brokenThings: ['R lockdown → elimina target de fight', 'E wall jump → escape ganks', 'Q2 true damage → shredding tanks'],
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/graves/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/graves"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/graves"}],
    builds: [{ name: 'Build ADC', items: 'Filo Infinito → Huracán de Runaan → El Colector → Sed de Sangre → Botas de Berserker', winRate: 50.2 }],
    counterPick: 'Nidalee, Elise, Kindred',
    synergy: 'Ahri, Morgana — CC para landing fácil de R',
    aiAnalysis: 'Graves en Wild Rift es un jungler híbrido devastador. Su Q con el cono ajustado para móvil es más fácil de apuntar, y su E (Quickdraw) le da movilidad en la jungla compacta. El mapa chico amplifica su daño AoE en teamfights cerrados.\n\nEl build ADC crit maximiza su burst en objetivos y teamfights. En WR, su clear speed es una de las mejores, permitiéndole controlar dragones y heralds con facilidad.\n\nConsejo: En WR, gank desde los arbustos con Q+R. El mapa compacto significa que siempre estás cerca de una lane para presionar.',
    proPickRate: 4.2,
    runes: { primary: 'Precisión — Pies Veloces', secondary: 'Dominación — Colección de Ojos', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Morgana', title: 'la Caída', role: 'Support', tier: 'A', winRate: 51.0, pickRate: 9.5, banRate: 1.5, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
    buildLinks: [{"label": "U.GG", "url": "https://u.gg/lol/champions/morgana/build"}, {"label": "Mobalytics", "url": "https://www.mobalytics.com/lol/champions/morgana"}, {"label": "OP.GG", "url": "https://www.op.gg/champions/morgana"}],
    builds: [{ name: 'Build AP', items: 'Morellonomicon → Sombrero de Rabadon → Reloj de Zhonya → Cetro de Rylai → Botas del Vacío', winRate: 50.8 }],
    brokenThings: ['Q root 2 seg → CC garantizado en móvil', 'E Black Shield → bloquea todo CC enemigo', 'R AoE stun → teamfight breaker en espacios cerrados'],
    counterPick: 'Thresh, Blitzcrank, Leona',
    synergy: 'Jhin, Varus — Poke y CC para maximizar Q root',
    aiAnalysis: 'Morgana en Wild Rift es el soporte anti-engage por excelencia. Su E (Black Shield) bloquea CC entrante, vital en el meta de WR con tantos champions de engage. Su Q (Dark Binding) con el auto-aim asistido es más fácil de landing en controles táctiles.\n\nEl build AP maximiza su daño de soporte. En WR, donde los teamfights son cerrados por el mapa chico, su R (Soul Shackles) es devastador para iniciar o desengagements.\n\nConsejo: Usa tu E para contrarrestar ganks de jungler. En WR los ganks son más frecuentes y tu escudo negro es la mejor defensa de bot lane.',
    proPickRate: 5.5,
    runes: { primary: 'Brujería — Cometa Arcano', secondary: 'Determinación — Frailidad', shards: 'Adaptativo + Fuerza + Resistencia' },
  },
  { name: 'Jhin', title: 'el Virtuoso', role: 'ADC', tier: 'A', winRate: 52.0, pickRate: 7.8, banRate: 1.2, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
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
  { name: 'Caitlyn', title: 'el Sheriff de Piltover', role: 'ADC', tier: 'B', winRate: 48.2, pickRate: 6.1, banRate: 0.9, image: '', aiInsight: '', build: '', counters: '', synergies: '', patch: '6.8', game: 'WR',
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
    version: '26.8',
    title: 'Patch 26.8 — Ajustes de Temporada',
    summary: 'Ajustes de balance para la temporada 2026. Meta estable pre-Season 2. Cambios a Ornn, Garen, Nocturne y varios bruisers.',
    digest: 'Patch 26.8 trae cambios significativos al meta actual. Garen asciende a #1 en Top, Nocturne domina jungle, Katarina y Ahri lideran mid. Graves post-nerf mantiene S-tier. Brand y Blitzcrank entran al tier S en soporte. El meta se mantiene estable con Season 2 próxima.',
    sourceGame: 'LoL',
  },
  {
    version: '6.8',
    title: 'Patch 6.8 — Wild Rift Mid Season',
    summary: 'Ajustes de balance para Wild Rift mid-season 2026.',
    digest: 'Patch 6.8 de Wild Rift trae ajustes significativos al meta móvil. Master Yi recibe buffs en su Alpha Strike, Lee Sin tiene mejor scaling con items bruiser. Ahri y Darius se consolidan como los dominadores de mid y top respectivamente. Se ajustan tiempos de objetivos para hacer los juegos más dinámicos.',
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

const PRO_PICKS_DATA: Omit<ProPick, 'id'>[] = [
  { champion: 'Ahri', role: 'Mid', tournament: 'LCK', region: 'KR', pickRate: 18.5, banRate: 12.3, winRate: 56.2, patch: '26.8' },
  { champion: 'Jinx', role: 'ADC', tournament: 'LCK', region: 'KR', pickRate: 22.1, banRate: 8.5, winRate: 54.8, patch: '26.8' },
  { champion: 'Lee Sin', role: 'Jungle', tournament: 'LPL', region: 'CN', pickRate: 15.3, banRate: 18.2, winRate: 51.1, patch: '26.8' },
  { champion: 'Thresh', role: 'Support', tournament: 'LCK', region: 'KR', pickRate: 25.6, banRate: 3.1, winRate: 53.5, patch: '26.8' },
  { champion: 'Azir', role: 'Mid', tournament: 'LCK', region: 'KR', pickRate: 14.2, banRate: 22.5, winRate: 57.3, patch: '26.8' },
  { champion: 'Rakan', role: 'Support', tournament: 'LEC', region: 'EU', pickRate: 18.3, banRate: 5.2, winRate: 52.8, patch: '26.8' },
  { champion: 'Jhin', role: 'ADC', tournament: 'LEC', region: 'EU', pickRate: 16.8, banRate: 6.1, winRate: 51.9, patch: '26.8' },
  { champion: 'Camille', role: 'Top', tournament: 'LCK', region: 'KR', pickRate: 13.5, banRate: 20.1, winRate: 48.7, patch: '26.8' },
  { champion: 'Xin Zhao', role: 'Jungle', tournament: 'LCS', region: 'NA', pickRate: 11.2, banRate: 4.5, winRate: 49.3, patch: '26.8' },
  { champion: 'Orianna', role: 'Mid', tournament: 'LPL', region: 'CN', pickRate: 19.8, banRate: 15.3, winRate: 55.1, patch: '26.8' },
  { champion: 'Vayne', role: 'ADC', tournament: 'LCK', region: 'KR', pickRate: 8.5, banRate: 3.2, winRate: 58.9, patch: '26.8' },
  { champion: 'Maokai', role: 'Support', tournament: 'LCS', region: 'NA', pickRate: 14.1, banRate: 2.8, winRate: 53.2, patch: '26.8' },
  { champion: 'Darius', role: 'Top', tournament: 'LPL', region: 'CN', pickRate: 10.3, banRate: 12.8, winRate: 52.5, patch: '26.8' },
  { champion: 'Master Yi', role: 'Jungle', tournament: 'LCS', region: 'NA', pickRate: 5.2, banRate: 8.1, winRate: 45.3, patch: '26.8' },
  { champion: 'Caitlyn', role: 'ADC', tournament: 'LPL', region: 'CN', pickRate: 20.5, banRate: 9.3, winRate: 54.6, patch: '26.8' },
  { champion: 'Gwen', role: 'Top', tournament: 'LEC', region: 'EU', pickRate: 12.7, banRate: 16.5, winRate: 50.8, patch: '26.8' },
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
