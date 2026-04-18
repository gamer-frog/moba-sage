// ============================================================
// MOBA SAGE — Helper Functions
// ============================================================

let _ddVersion = '14.8.1';
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
  'Filo de la Noche': '6672', 'Eclipse': '6692', 'Hidra Titánica': '3748',
  'Fuerza de la Trinidad': '3071', 'Filo Infinito': '3031', 'Colmillo Infinito': '3031',
  'Huracán de Runaan': '3085', 'Frenesí de Runaan': '3085',
  'Bailarín Espectral': '3124', 'Sed de Sangre': '6333', 'Botas de Berserker': '3006',
  'Sombrero de Rabadon': '3089', 'Reloj de Zhonya': '3157', 'Llamasomo': '3166',
  'Morellonomicon': '3165', 'Botas del Vacío': '3020', 'El Colector': '6676',
  'Última Piedad': '3036', 'Cosechador Nocturno': '6694', 'Poder de Kraken Slayer': '6673',
  'La Séptima': '6671', 'Muramana': '3004', 'Hielo Eterno': '6662',
  'Redención': '3107', 'Convergencia de Zeke': '3190', 'Medallón de los Solari de Hierro': '3194',
  'Mikael': '3222', 'Botas de Mercurio': '3111', 'Botas de Movilidad': '3009',
  'Botas de CD': '3158', 'Roca del Eclipse': '6693', 'Guardián Angel': '3026',
  'El Protegido': '3193', 'Pozo de la Noche': '6695', 'Filo Divino': '6696',
  'Resistencia Divina': '3065', 'Mandato Imperial': '6632', 'Cetro de Rylai': '3116',
  'Guja Botadora': '3153', 'Centro de Gravedad': '6664', 'Hydratación Letal': '3074',
};

export function getItemIconUrl(itemName: string): string | null {
  const id = ITEM_NAME_MAP[itemName];
  if (id) return `https://ddragon.leagueoflegends.com/cdn/${_ddVersion}/img/item/${id}.png`;
  return null;
}

export function parseBuildItems(itemsStr: string): string[] {
  return itemsStr.split(/[→,\n]/).map(s => s.replace(/[→]/g, '').trim()).filter(Boolean);
}

export function getBuildExternalUrl(champName: string): { ugg: string; mobalytics: string; opgg: string } {
  const safe = champName.toLowerCase().replace(/ /g, '').replace(/'/g, '');
  return {
    ugg: `https://u.gg/lol/champions/${safe}/build`,
    mobalytics: `https://www.mobalytics.com/lol/champions/${safe}`,
    opgg: `https://www.op.gg/champions/${safe}`,
  };
}
