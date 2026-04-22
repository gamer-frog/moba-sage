// ============================================================
// MOBA SAGE — Helper Functions
// ============================================================

let _ddVersion = '26.8.1';
export function updateDdVersion(v: string) { _ddVersion = v; }
export function getDdVersion() { return _ddVersion; }

export const CHAMPION_NAME_MAP: Record<string, string> = {
  'Wukong': 'MonkeyKing',
  'Nunu': 'Nunu',
  'Fiddlesticks': 'FiddleSticks',
  "Bel'Veth": 'Belveth',
  "K'Sante": 'KSante',
  'Aurelion Sol': 'AurelionSol',
  'Cho\'Gath': 'Chogath',
  'Kha\'Zix': 'Khazix',
  'Rek\'Sai': 'RekSai',
  'Vel\'Koz': 'Velkoz',
  'LeBlanc': 'Leblanc',
  'Miss Fortune': 'MissFortune',
  'Twitch': 'Twitch',
  'Twisted Fate': 'TwistedFate',
  'Lee Sin': 'LeeSin',
  'Master Yi': 'MasterYi',
  'Xin Zhao': 'XinZhao',
  'Jarvan IV': 'JarvanIV',
  'Aatrox': 'Aatrox',
};

export function getChampionImageUrl(name: string): string {
  const mapped = CHAMPION_NAME_MAP[name];
  if (mapped) {
    return `https://ddragon.leagueoflegends.com/cdn/${_ddVersion}/img/champion/${mapped}.png`;
  }
  const normalized = name
    .replace(/'/g, '')
    .replace(/ /g, '')
    .replace(/\./g, '')
    .replace(/&/g, '');
  return `https://ddragon.leagueoflegends.com/cdn/${_ddVersion}/img/champion/${normalized}.png`;
}

export function getChampionSplashUrl(name: string, skinNum = 0): string {
  const mapped = CHAMPION_NAME_MAP[name];
  const key = mapped || name.replace(/['\s.]/g, '');
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${key}_${skinNum}.jpg`;
}

export const ITEM_NAME_MAP: Record<string, string> = {
  // Miticas
  'Filo de la Noche': '6672', 'Eclipse': '6692', 'Cosechador Nocturno': '6676',
  'Pozo de la Noche': '6695', 'Roca del Eclipse': '6693', 'Poder de Kraken Slayer': '6673',
  'La Séptima': '6671', 'El Coleccionista': '6676', 'El Colector': '6676',
  'Filo Divino': '6696', 'Mandato Imperial': '6632', 'Hydratación Letal': '3074',
  'Stridebreaker': '6631', 'Experimental Hexplate': '6664',
  "Jak'Sho": '6665', "Jak'Sho, el Proteico": '6665', 'JakSho': '6665',
  // Luchador / Tanque
  'Hidra Titánica': '3748', 'Hidra': '3748', 'Fuerza de la Trinidad': '3078',
  'Fuerza de Trinidad': '3078', 'Filo de la Trinidad': '3071', 'Guja Botadora': '3153',
  'Sed de Sangre': '6333', 'Resistencia Divina': '3065',
  // ADC / Crit
  'Filo Infinito': '3031', 'Infinito': '3031', 'Colmillo Infinito': '3031',
  'Huracán de Runaan': '3085', 'Frenesí de Runaan': '3085',
  'Bailarín Espectral': '3124', 'Botas de Berserker': '3006',
  // AP / Mago
  'Sombrero de Rabadon': '3089', 'Reloj de Zhonya': '3157', 'Reloj de Arena de Zhonya': '3157',
  'Llamarada Sombría': '6653', 'Llamarada SombrÃ­a': '6653', 'Llamasomo': '6653',
  'Morellonomicon': '3165', 'Cetro de Rylai': '3116',
  'Cetro de Cristal de Rylai': '3116',
  'Botas del Vacío': '3020', 'Hielo Eterno': '6662',
  // Support
  'Redención': '3107', 'Convergencia de Zeke': '3190',
  'Medallón de los Solari de Hierro': '3190', 'Medallón de los Solari': '3190', 'Medallón': '3190',
  'Mikael': '3222',
  // Botas
  'Botas de Mercurio': '3111', 'Botas de Movilidad': '3009',
  'Botas de Celeridad': '3158', 'Botas de CD': '3158', 'Botas de Placas': '3047',
  // Otros
  'Última Piedad': '3036', 'Muramana': '3004',
  'Guardián Angel': '3026', 'Guardián de Angel': '3026',
  'El Protegido': '3193', 'Llamarada de Pecado': '6698',
};

export function getItemIconUrl(itemName: string): string | null {
  const id = ITEM_NAME_MAP[itemName];
  if (id) return `https://ddragon.leagueoflegends.com/cdn/${_ddVersion}/img/item/${id}.png`;
  return null;
}

export function parseBuildItems(itemsStr: string): string[] {
  return itemsStr.split(/[→\n]/).map(s => s.replace(/[→,]/g, '').trim()).filter(Boolean);
}

// ============================================================
// Rune Icon Helper
// ============================================================

const RUNE_ICON_MAP: Record<string, string> = {
  // Precision Keystones
  'Pies Veloces': '7201_Precision/FleetFootwork/FleetFootwork.png',
  'Conquistador': '7201_Precision/Conqueror/Conqueror.png',
  'Lethal Tempo': '7201_Precision/LethalTempo/LethalTempoTemp.png',
  'Sabor a Sangre': '8100_Domination/HailOfBlades/HailOfBlades.png',
  // Sorcery Keystones
  'Cometa Arcano': '8200_Sorcery/ArcaneComet/ArcaneComet.png',
  'Invocar Aery': '8200_Sorcery/SummonAery/SummonAery.png',
  'Phase Rush': '8200_Sorcery/PhaseRush/PhaseRush.png',
  // Domination Keystones
  'Electrocutar': '8100_Domination/Electrocute/Electrocute.png',
  'Oscuro Colhar': '8100_Domination/DarkHarvest/DarkHarvest.png',
  // Resolve Keystones
  'Guardián': '8400_Resolve/Guardian/Guardian.png',
  'Demolir': '8400_Resolve/Demolish/Demolish.png',
  'Fuente de Vida': '8400_Resolve/Revitalize/Revitalize.png',
  // Inspiration Keystones
  'Viento Favorable': '8300_Inspiration/GlacialAugment/GlacialAugment.png',
};

const RUNE_COLOR_MAP: Record<string, string> = {
  'Precisión': '#c8aa6e',
  'Brujería': '#1b998b',
  'Dominación': '#d44444',
  'Valor': '#f9c74f',
  'Inspiración': '#e8e8e8',
};

export function getRuneIconUrl(runeName: string): { url: string; color: string } | null {
  for (const [key, path] of Object.entries(RUNE_ICON_MAP)) {
    if (runeName.includes(key)) {
      return {
        url: `https://ddragon.leagueoflegends.com/cdn/${_ddVersion}/img/perk-images/Styles/${path}`,
        color: RUNE_COLOR_MAP[Object.keys(RUNE_COLOR_MAP).find(k => runeName.includes(k)) || 'Precisión'] || '#c8aa6e',
      };
    }
  }
  // Check for path name in rune
  for (const [path, color] of Object.entries(RUNE_COLOR_MAP)) {
    if (runeName.includes(path)) {
      return { url: '', color };
    }
  }
  return null;
}

export function getBuildExternalUrl(champName: string): { ugg: string; mobalytics: string; opgg: string } {
  const safe = champName.toLowerCase().replace(/ /g, '').replace(/'/g, '');
  return {
    ugg: `https://u.gg/lol/champions/${safe}/build`,
    mobalytics: `https://www.mobalytics.com/lol/champions/${safe}`,
    opgg: `https://www.op.gg/champions/${safe}`,
  };
}
