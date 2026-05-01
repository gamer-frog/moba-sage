// ============================================================
// MOBA SAGE — Helper Functions
// ============================================================

let _ddVersion = '16.9.1'; // Auto-synced with Data Dragon API — v1.9.2 stable
export function updateDdVersion(v: string) { _ddVersion = v; }
export function getDdVersion() { return _ddVersion; }

export const CHAMPION_NAME_MAP: Record<string, string> = {
  'Wukong': 'MonkeyKing',
  'Nunu': 'Nunu',
  'Nunu & Willump': 'Nunu',
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
  'Zaahen': 'Zaahen',
  'Ambessa': 'Ambessa',
  'Smolder': 'Smolder',
  'Vex': 'Vex',
  'Aurora': 'Aurora',
  'Hwei': 'Hwei',
  'Naafiri': 'Naafiri',
  'Ksante': 'KSante',
  'Renata': 'Renata',
  'Rell': 'Rell',
  'Yuumi': 'Yuumi',
  'Senna': 'Senna',
  'Gwen': 'Gwen',
  'Nilah': 'Nilah',
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
  'Filo de la Noche': '6672', 'Eclipse': '6692',
  'Pozo de la Noche': '6695', 'Roca del Eclipse': '6693', 'Poder de Kraken Slayer': '6673',
  'La Séptima': '6671', 'El Colector': '6676',
  'Filo Divino': '6696', 'Mandato Imperial': '6632',
  'Stridebreaker': '6631', 'Pisotón Brutal': '6631', 'Experimental Hexplate': '6664', 'Placa Hexagonal Experimental': '6664',
  "Jak'Sho": '6665', "Jak'Sho, el Proteico": '6665', 'JakSho': '6665',
  // Luchador / Tanque
  'Hidra Titánica': '3748', 'Hidra': '3748', 'Fuerza de la Trinidad': '3078',
  'Fuerza de Trinidad': '3078', 'Guja Botadora': '3153',
  'Sed de Sangre': '6333', 'Resistencia Divina': '3065',
  // ADC / Crit
  'Filo Infinito': '3031', 'Infinito': '3031', 'Colmillo Infinito': '3031',
  'Huracán de Runaan': '3085', 'Frenesí de Runaan': '3085',
  'Bailarín Espectral': '3124', 'Botas de Berserker': '3006',
  // AP / Mago
  'Sombrero de Rabadón': '3089', 'Reloj de Zhonya': '3157', 'Reloj de Arena de Zhonya': '3157',
  'Llamarada Sombría': '6653', 'Llamasomo': '6653',
  'Morellonomicon': '3165', 'Cetro de Rylai': '3116',
  'Cetro de Cristal de Rylai': '3116',
  'Botas del Vacío': '3020', 'Hielo Eterno': '6662',
  // Support
  'Redención': '3107', 'Convergencia de Zeke': '3194',
  'Medallón de los Solari de Hierro': '3190', 'Medallón de los Solari': '3190', 'Medallón': '3190',
  'Mikael': '3222',
  // Botas
  'Botas de Mercurio': '3111', 'Botas de Movilidad': '3009',
  'Botas de Celeridad': '3158', 'Botas de CD': '3158', 'Botas de Placas': '3047',
  // Otros
  'Centro de Gravedad': '3163',
  'Última Piedad': '3036', 'Muramana': '3004',
  'Ángel Guardián': '3026',
  'El Protegido': '3193', 'Llamarada de Pecado': '6698',
  // Season 2 — Pandemonium (26.9)
  "Doran's Bow": '1086', "Doran's Helm": '1120',
  'Gluttonous Greaves': '3008',
  'Trailblazer': '3002',
  'Opportunity': '6701',
  'Dusk and Dawn': '2510',
  'Statikk Shiv': '3087',
  'Dawnstone': '4011',
  'Duskblade of Draktharr': '6691',
  'Immortal Shieldbow': '6673',
  'Immortal Path': '6673',
  // Additional Season 2 items
  'Eclipse (Mythic)': '6692',
  'Black Cleaver': '3071',
  'Frozen Heart': '3110',
  'Randuin Omen': '3143',
  'Force of Nature': '4401',
  'Dead Man Plate': '3742',
  'Spirit Visage': '3065',
  'Abyssal Mask': '3001',
  'Cosmic Drive': '4629',
  'Rabadon Deathcap': '3089',
  'Void Staff': '3135',
  'Luden Companion': '3475',
  'Malignance': '4645',
  'Stormsurge': '4646',
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
  'Lethal Tempo': '7201_Precision/LethalTempo/LethalTempo.png',
  'Sabor a Sangre': '8100_Domination/TasteOfBlood/TasteOfBlood.png',
  // Sorcery Keystones
  'Cometa Arcano': '8200_Sorcery/ArcaneComet/ArcaneComet.png',
  'Invocar Aery': '8200_Sorcery/SummonAery/SummonAery.png',
  'Phase Rush': '8200_Sorcery/PhaseRush/PhaseRush.png',
  // Domination Keystones
  'Electrocutar': '8100_Domination/Electrocute/Electrocute.png',
  'Cosecha Oscura': '8100_Domination/DarkHarvest/DarkHarvest.png',
  // Resolve Keystones
  'Guardián': '8400_Resolve/Guardian/Guardian.png',
  'Demolir': '8400_Resolve/Demolish/Demolish.png',
  'Fuente de Vida': '8400_Resolve/FontofLife/FontofLife.png',
  // Inspiration Keystones
  'Calzado Mágico': '8300_Inspiration/MagicalFootwear/MagicalFootwear.png',
  'Viento Favorable': '8300_Inspiration/GlacialAugment/GlacialAugment.png',
  // Runas secundarias comunes
  'Segunda Vida': '8400_Resolve/SecondWind/SecondWind.png',
  'Presencia de Campeón': '7201_Precision/PresenceOfMind/PresenceOfMind.png',
  'Sobrecrecimiento': '8400_Resolve/Overgrowth/Overgrowth.png',
  'Revitalizar': '8400_Resolve/Revitalize/Revitalize.png',
  'Debilidad': '8200_Sorcery/Weakness/Weakness.png',
  'Golpe de Gracia': '8100_Domination/CoupDeGrace/CoupDeGrace.png',
  // Nombres Spanish usados en coaching-tab y data.ts
  'Tempo Letal': '7201_Precision/LethalTempo/LethalTempo.png',
  'Impulso de Fase': '8200_Sorcery/PhaseRush/PhaseRush.png',
  'Agarre del No Muerto': '7201_Precision/Conqueror/Conqueror.png',
  'Conmoción': '8400_Resolve/Aftershock/Aftershock.png',
  'Aumento Glacial': '8300_Inspiration/GlacialAugment/GlacialAugment.png',
  'Blindaje Óseo': '8400_Resolve/BonePlating/BonePlating.png',
  'Inquebrantable': '8400_Resolve/Unflinching/Unflinching.png',
  'Golpe Bajo': '8100_Domination/CheapShot/CheapShot.png',
  'Colección de Ojos': '8100_Domination/EyeballCollection/EyeballCollection.png',
  'Cazador Definitivo': '8100_Domination/UltimateHunter/UltimateHunter.png',
  'Banda de Maná': '8200_Sorcery/ManaflowBand/ManaflowBand.png',
  'Quemadura': '8200_Sorcery/Scorch/Scorch.png',
  'Triunfo': '7201_Precision/Triumph/Triumph.png',
  'Leyenda: Diligencia': '7201_Precision/LegendAlacrity/LegendAlacrity.png',
  'Leyenda: Linaje': '7201_Precision/LegendBloodline/LegendBloodline.png',
  // Season 2 Sorcery Keystones
  'Deathfire Touch': '8200_Sorcery/DeathfireTouch/DeathfireTouch.png',
  'Toque de Fuego Mortal': '8200_Sorcery/DeathfireTouch/DeathfireTouch.png',
  'Stormraider': '8200_Sorcery/StormraidersSurge/StormraidersSurge.png',
  'Invocador de la Tormenta': '8200_Sorcery/StormraidersSurge/StormraidersSurge.png',
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
