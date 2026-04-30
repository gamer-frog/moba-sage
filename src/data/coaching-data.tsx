'use client';

import {
  Target, Eye, Swords, Shield, Zap, AlertOctagon, Map,
  RotateCcw, Skull, TrendingUp, Crosshair,
} from 'lucide-react';

// ============ DATA TYPES ============
export interface TipCard {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface CategorySection {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  tips: TipCard[];
}

// ============ MECÁNICAS POR CATEGORÍAS ============
export const mecanicasCategories: CategorySection[] = [
  {
    id: 'fase-de-linea',
    label: 'Fase de Linea',
    icon: <Swords className="w-4 h-4" />,
    color: '#e84057',
    tips: [
      { title: 'Último Golpe (Last Hit)', description: 'Practica el último golpe a minions en Practice Tool. El oro de last hits es tu fuente principal de income. Apunta a 7+ CS por minuto. En lane fase, prioriza CS sobre trades si tu campeón no tiene ventaja.', icon: <Target className="w-4 h-4 text-lol-gold" /> },
      { title: 'Manejo de Oleadas', description: 'Slow Push: deja 2-3 caster minions vivos para crear una ola grande. Fast Push: empuja rápido con habilidades para recallar o roam. Freeze: mantén la ola cerca de tu torre para negar CS al rival y ser vulnerable a ganks.', icon: <Shield className="w-4 h-4 text-lol-success" /> },
      { title: 'Postura de Trading', description: 'Cuando el rival last hittea un minion, es tu ventana para hacer daño (auto + habilidad + retroceder). No trades cuando tu ola está empujando — te vas a recibir daño de minions. Posiciónate entre minions aliados para protección.', icon: <Swords className="w-4 h-4 text-lol-danger" /> },
      { title: 'Bloqueo de Minions', description: 'Usa tu cuerpo para bloquear minions enemigos y que la ola empuje hacia tu torre. Esto te permite freeze cerca de torre y negar al rival. Cuidado: algunos campeones (Darius, Nasus) benefician mucho de esto.', icon: <Target className="w-4 h-4 text-lol-green" /> },
    ],
  },
  {
    id: 'teamfight',
    label: 'Teamfight',
    icon: <Zap className="w-4 h-4" />,
    color: '#f0c646',
    tips: [
      { title: 'Picos de Poder', description: 'Conoce tus power spikes: niveles (2, 3, 6, 11, 16) y completar items clave. Si vas por debajo, busca una power spike para intentar un play. Si vas por arriba, presiona tu ventaja ANTES de que el rival alcance su spike.', icon: <Zap className="w-4 h-4 text-lol-gold" /> },
      { title: 'Posicionamiento en Pelea', description: 'Los carries (ADC, Mage) deben estar SIEMPRE detrás del frontline. Esperá a que se gaste el CC antes de entrar. En pelea de equipos, el posicionamiento vale más que la mecánica individual.', icon: <Crosshair className="w-4 h-4 text-lol-warning" /> },
      { title: 'Focus en Objetivos', description: 'Después de ganar una teamfight, NO vayas a base enemiga sin objetivo. Toma Dragon, Baron, torres o inhibidor. Muchas partidas se pierden por "irse a buscar kills" después de ganar una pelea.', icon: <Target className="w-4 h-4 text-lol-green" /> },
    ],
  },
  {
    id: 'macro-juego',
    label: 'Macro Juego',
    icon: <Map className="w-4 h-4" />,
    color: '#0acbe6',
    tips: [
      { title: 'Conciencia del Mapa', description: 'Mira el minimap cada 3-5 segundos. Si tu jungler no está en mapa visible, asume que te van a gankear. Si el rival mid falta, avisa a tus lanes. El minimap te da información gratuita — úsala.', icon: <Eye className="w-4 h-4 text-lol-warning" /> },
      { title: 'Control de Visión', description: 'Comprá Control Wards cada recall. No pongas wards aleatoriamente — pensá dónde necesitás ver. Antes de objetivar (Dragon/Baron), asegurar visión 30-45 segundos antes. La visión gana partidas.', icon: <Eye className="w-4 h-4 text-lol-success" /> },
      { title: 'Split Push', description: 'Si tu campeón es bueno 1v1 (Fiora, Yorick, Trundle), split push para crear presión. Tu team debe evitar pelear 4v5 mientras tanto. Comunica cuando te ganken para que tu team tome objetivos en el otro lado.', icon: <Map className="w-4 h-4 text-lol-gold" /> },
    ],
  },
  {
    id: 'mentalidad',
    label: 'Mentalidad',
    icon: <TrendingUp className="w-4 h-4" />,
    color: '#0fba81',
    tips: [
      { title: 'Gestión de Tilt', description: 'Si perdiste 2 partidas seguidas, tomá un break de 15 minutos. El tilt te hace tomar malas decisiones: overextenderte, forzar plays, flamear. Tu mentalidad es tan importante como tu mecánica.', icon: <RotateCcw className="w-4 h-4 text-lol-green" /> },
      { title: 'Análisis de Muertes', description: 'Después de morir, preguntate: "¿Podría haber evitado esto?" Si la respuesta es sí, fue un error tuyo. Si no (full health 1-shot por un campero), es parte del juego. Enfocate en mejorar lo que podés controlar.', icon: <Skull className="w-4 h-4 text-lol-danger" /> },
    ],
  },
];

// ============ WARDING POR ROL ============
export interface WardingTip extends TipCard {
  color: string;
}

export const wardingTips: WardingTip[] = [
  { title: 'Top Lane', color: '#c8aa6e', description: 'Ward de tríbush (bush superior) para ver ganks del jungler. Controla el río con tu support y jungler. En mid game, wardia la jungle rival para split push seguro. Pink ward en tríbush es staple.', icon: <Eye className="w-4 h-4 text-lol-gold" /> },
  { title: 'Jungle', color: '#0fba81', description: 'Wardia los buffs rivales para trackear al jungler. Deep wards en su jungle te dan timers de spawn. Vision de río para objetivar Dragon/Baron. Siempre carries control wards.', icon: <Eye className="w-4 h-4 text-lol-green" /> },
  { title: 'Mid Lane', color: '#5b8af5', description: 'Ward de río (ambos lados) y parte de jungle. Cuando tu warden se cae, reemplazalo inmediatamente. Pink ward en una de las brush del río es esencial para mid game teamfights.', icon: <Eye className="w-4 h-4 text-[#5b8af5]" /> },
  { title: 'ADC', color: '#e84057', description: 'Tu support debería wardar, pero si vas solo: ward de tríbush y el lane bush. En teamfights, mantén vision del flank. En late game, wardia antes de cada objetivo con tu team.', icon: <Eye className="w-4 h-4 text-lol-danger" /> },
  { title: 'Support', color: '#f0c646', description: 'Eres el principal warder del equipo. Control ward en río early, oracle lens en mid/late. Wardia jungle rival para enable plays de tu jungler. En late game, prioriza vision de Baron y bases rivales.', icon: <Eye className="w-4 h-4 text-lol-warning" /> },
];

// ============ ERRORES A EVITAR — ORDENADOS POR ELO ============
export interface ErrorEntry {
  title: string;
  description: string;
  severity: 'critical' | 'common' | 'subtle';
  elo: string;
}

export const ERROLO_COLORS: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  'Hierro/Plata': { bg: 'rgba(120,120,120,0.08)', border: 'rgba(120,120,120,0.25)', text: '#8c8c8c', gradient: 'linear-gradient(135deg, #5c5c5c, #8c8c8c)' },
  'Oro': { bg: 'rgba(200,170,110,0.08)', border: 'rgba(200,170,110,0.25)', text: '#c8aa6e', gradient: 'linear-gradient(135deg, #785a28, #c8aa6e)' },
  'Platino': { bg: 'rgba(120,180,220,0.08)', border: 'rgba(120,180,220,0.25)', text: '#78b4dc', gradient: 'linear-gradient(135deg, #4a7a9b, #78b4dc)' },
  'Esmeralda/Diamante': { bg: 'rgba(15,186,129,0.08)', border: 'rgba(15,186,129,0.25)', text: '#0fba81', gradient: 'linear-gradient(135deg, #0a7a52, #0fba81)' },
  'Maestro': { bg: 'rgba(232,64,87,0.08)', border: 'rgba(232,64,87,0.25)', text: '#e84057', gradient: 'linear-gradient(135deg, #a82e3e, #e84057)' },
};

export const erroresData: ErrorEntry[] = [
  // Hierro / Plata
  { elo: 'Hierro/Plata', severity: 'critical', title: 'Chasear kills por el mapa', description: 'Si un enemigo esta con 5% HP y se retira a base, NO lo persigas. Es una trampa. Vas a perder tiempo de farm, objetivar, y probablemente te ganken. La kill no vale tanto como cres.' },
  { elo: 'Hierro/Plata', severity: 'critical', title: 'Ignorar el minimap', description: 'Mirar el minimap cada 3-5 segundos es habito #1 de los jugadores que suben de rank. Si el rival mid no esta en tu mapa, no empujes tu ola. Si ves al jungler rival bot, podes empujar top libremente.' },
  { elo: 'Hierro/Plata', severity: 'critical', title: 'Forzar teamfights sin ventaja', description: 'No inicies peleas si estas detras en niveles, oro o items. Espera a que tu equipo alcance sus power spikes. Forzar pelea en desventaja es la forma mas rapida de perder una partida que podias ganar.' },
  // Oro
  { elo: 'Oro', severity: 'common', title: 'No comprar Control Wards', description: 'Cada recall deberias comprar al menos 1 Control Ward (hasta el limite de 3 en el mapa). La vision es el recurso mas subestimado del juego. Un ward bien colocado puede prevenir una muerte o enable una kill.' },
  { elo: 'Oro', severity: 'common', title: 'No adaptar tu build', description: 'Si el rival ADC tiene 3 kills a los 10 minutos, compra Armadura. Si su mid lane AP te esta oneshoteando, compra MR. Seguir el mismo build siempre es un error. Adapta tu build al partido.' },
  { elo: 'Oro', severity: 'common', title: 'Usar flash innecesariamente', description: 'Flash tiene 5 minutos de cooldown. No lo uses para asegurar una kill que ya esta garantizada. Guardalo para escapes criticos o para iniciar teamfights. Un flash malgastado es una desventaja enorme.' },
  // Platino
  { elo: 'Platino', severity: 'common', title: 'Recall sin cobertura', description: 'Antes de recallar, preguntate: esta mi jungler cerca? El rival mid puede roamear? Tengo wards que me avisen si viene alguien? Recalear en mala posicion puede costar un dragon o una torre.' },
  { elo: 'Platino', severity: 'critical', title: 'Ignorar el tiempo de objetivos', description: 'Dragon spawnea a los 5:00, Baron a los 20:00, Herald a los 14:00. Saber los timers te permite prepararte con antelacion. Muchos equipos pierden objetivos porque no estaban preparados cuando spawnearon.' },
  // Esmeralda / Diamante
  { elo: 'Esmeralda/Diamante', severity: 'subtle', title: 'No resetear oleadas', description: 'Despues de matar al rival o forzarlo a recall, pushea la ola hasta la torre para que se resetee. Si no lo haces, el rival pierde menos CS y puede freezearte cerca de su torre, negandote oro y experiencia.' },
  { elo: 'Esmeralda/Diamante', severity: 'subtle', title: 'Flamear a tu equipo', description: 'El flame no mejora nada. Solo baja la moral del equipo y hace que tus companeros jueguen peor. Usa senales y pings constructivos. Si alguien esta jugando mal, ayudalo en lugar de insultarlo.' },
  // Maestro
  { elo: 'Maestro', severity: 'critical', title: 'Sobrestimar el power spike individual', description: 'En Maestro, los rivales saben configurar tu power spike y evitarte. Saltear spikes o enganchar mal significa perder la partida. Tus picks y posicionamiento necesitan ser perfectos, no basta con solo saber que tenes ventaja.' },
  { elo: 'Maestro', severity: 'subtle', title: 'No identificar la win condition rival', description: 'En alto elo, cada team tiene una win condition clara (split push, teamfight, poke). Si no identificas la del rival y no la counteras, pierdes. Analiza el team comp rival en champion select y planifica tu respuesta.' },
];


// ============ TIPS POR ROL ============
export interface RoleTipSection {
  role: string;
  icon: React.ReactNode;
  color: string;
  tips: TipCard[];
}

export const roleTipsData: RoleTipSection[] = [
  {
    role: 'Top Lane',
    icon: <Shield className="w-4 h-4" />,
    color: '#c8aa6e',
    tips: [
      { title: 'Teleport Timing', description: 'No uses TP para volver a lane temprano — guardalo para plays con tu equipo. El mejor uso de TP es para: join a una dragon fight, flankear en mid/late game, o counter-split push. Si gastas tu TP para volver a lane, perdes tu herramienta mas importante de macro.', icon: <Target className="w-4 h-4 text-lol-gold" /> },
      { title: 'Island Management', description: 'Top lane es una isla — necesitas aprender a jugar solo. Si tu jungler no ganka, no te quejes. Enfocate en CS y xp. Si el rival te gana, juega pasivo y espera a que tu equipo haga plays. El top laner que mejor maneja la paciencia suele ganar mas partidas que el que intenta forzar.', icon: <Shield className="w-4 h-4 text-lol-success" /> },
      { title: 'Side Lane Pressure', description: 'En mid/late game, tu trabajo es presionar side lanes. Esto forza al rival a enviarte alguien, creando numerosos en el otro lado del mapa. Comunica cuando te ganken para que tu equipo tome objetivos. Un split pusher efectivo gana mas juegos que un teamfighter promedio.', icon: <Map className="w-4 h-4 text-lol-green" /> },
    ],
  },
  {
    role: 'Jungle',
    icon: <Swords className="w-4 h-4" />,
    color: '#0fba81',
    tips: [
      { title: 'Pathing Inteligente', description: 'No hagas el mismo pathing cada partida. Si tu top lane esta perdiendo, ganka mid/bot. Si el rival jungler empezo bot, contesta top. Lee el minimap para decidir donde ir. Un buen jungler adapta su ruta al estado de las 3 lanes, no sigue un script fijo.', icon: <Map className="w-4 h-4 text-lol-green" /> },
      { title: 'Smite Control', description: 'Track the enemy jungler timers. Dragon: 6 min respawn, Herald: 5 min, Baron: 6 min. Llega 30 seg antes de que spawnee. Ten smite SIEMPRE up para objetivar. Un smite steal puede ganar o perder la partida. Practica el timing en Practice Tool.', icon: <Crosshair className="w-4 h-4 text-lol-warning" /> },
      { title: 'Gank Setup', description: 'Antes de gankear, pregunta: esta la ola empujando hacia tu torre? Tiene el rival flash? Tiene escape? Si la ola esta empujando hacia su torre, es mala idea gankear. Busca lanes donde tu aliado tiene control de la ola. Communication con pings es clave.', icon: <Target className="w-4 h-4 text-lol-danger" /> },
    ],
  },
  {
    role: 'Mid Lane',
    icon: <Zap className="w-4 h-4" />,
    color: '#5b8af5',
    tips: [
      { title: 'Roaming Windows', description: 'Despues de pushear tu ola a la torre rival, tienes 15-20 segundos para roam. Roama bot para dragon setup o top para herald. Si no puedes roam, farmia jungle camps cercanos. El mid laner que mas impacto tiene en las side lanes gana partidas.', icon: <Map className="w-4 h-4 text-[#5b8af5]" /> },
      { title: 'Wave Management Avanzado', description: 'Si vas ganando, freeze cerca de tu torre para negar al rival xp y oro. Si vas perdiendo, slow push para crear una ola grande y buscar roam. Reset la ola antes de recall para no perder CS. El control de oleadas en mid es mas impactante que en cualquier otra lane.', icon: <Shield className="w-4 h-4 text-lol-gold" /> },
      { title: 'Burst vs DPS Positioning', description: 'Si sos burst mage (LeBlanc, Syndra, Ahri), posicionate para oneshot carries. Si sos DPS (Orianna, Azir, Viktor), quedate detras del frontline y output constante. Conoce tu rol en teamfight — no todos los mid laners juegan igual.', icon: <Crosshair className="w-4 h-4 text-lol-warning" /> },
    ],
  },
  {
    role: 'ADC',
    icon: <Crosshair className="w-4 h-4" />,
    color: '#e84057',
    tips: [
      { title: 'Kiting is Everything', description: 'El ADC que mejor kitea gana teamfights. Practica attack-move (A-click) en Practice Tool. Nunca te quedes quieto en una pelea — move between autos. Si usas Right Click, practica moverte entre cada auto-attack. El posicionamiento vale mas que tu build.', icon: <Crosshair className="w-4 h-4 text-lol-danger" /> },
      { title: 'Farm is Non-Negotiable', description: 'Apunta a 10+ CS/min en lane phase. Si llegas a 20 min con 180+ CS, estas en buen camino. El ADC sin items es inutil — cada CS cuenta. En late game, side wave + jungle = mas income. No skips CS para ir a una teamfight que no vas a ganar.', icon: <Target className="w-4 h-4 text-lol-gold" /> },
      { title: 'Peeling vs Carrying', description: 'Si tu equipo tiene peel (Nautilus, Lulu, Yuumi), podes carry more aggressively. Si no hay peel, jugá mas seguro y usá tus defensivos (GA, QSS, Stopwarch). Adapta tu playstyle a tu team comp, no siempre podes ser el heroe.', icon: <Shield className="w-4 h-4 text-lol-success" /> },
    ],
  },
  {
    role: 'Support',
    icon: <Eye className="w-4 h-4" />,
    color: '#0acbe6',
    tips: [
      { title: 'Engage vs Peel', description: 'Si tu ADC es Jinx/Kog/Vayne con 3 items, tu trabajo es PEEL, no engage. Si tu ADC es early game (Draven, Lucian), busca engage para snowball. Adapta tu playstyle al poder del ADC y al state de la partida. Un support que no adapta pierde.', icon: <Swords className="w-4 h-4 text-lol-success" /> },
      { title: 'Vision Economy', description: 'Oracle Lens en mid game (cuando el soporte rival tiene vision). Pink wards en objectives clave. NO pongas wards en la misma bush que tu ADC — cubri diferentes angulos. La vision es tu recurso mas valioso, usala inteligentemente.', icon: <Eye className="w-4 h-4 text-lol-warning" /> },
      { title: 'Roaming Support', description: 'Despues de pushear bot, roam con tu jungler o mid. Ward enemy jungle, help contest scuttle, or set up ganks. En late game, STAY with your team — no split push. El support que roams bien en early game gana la partida antes de que empiece.', icon: <Map className="w-4 h-4 text-lol-green" /> },
    ],
  },
];

export const severityConfig = {
  critical: { color: '#e84057', bg: 'rgba(232,64,87,0.08)', border: 'rgba(232,64,87,0.25)', label: 'Critico', icon: <AlertOctagon className="w-3.5 h-3.5" /> },
  common: { color: '#f0c646', bg: 'rgba(240,198,70,0.08)', border: 'rgba(240,198,70,0.25)', label: 'Comun', icon: <AlertOctagon className="w-3.5 h-3.5" /> },
  subtle: { color: '#5b8af5', bg: 'rgba(91,138,245,0.08)', border: 'rgba(91,138,245,0.25)', label: 'Sutil', icon: <AlertOctagon className="w-3.5 h-3.5" /> },
};
