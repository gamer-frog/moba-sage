import { NextResponse } from 'next/server';

interface ScrapedBuild {
  champion: string;
  source: string;
  patch: string;
  winRate: number;
  coreItems: string[];
  boots: string;
  mythic: string;
  runes: string[];
  skillOrder: string;
  scrapedAt: string;
}

const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 hours

let cachedBuilds: Record<string, ScrapedBuild> = {};
let cacheTimestamp = 0;

const S_TIER_CHAMPIONS = [
  { name: 'Garen', slug: 'garen', role: 'Top' },
  { name: 'Nocturne', slug: 'nocturne', role: 'Jungle' },
  { name: 'Katarina', slug: 'katarina', role: 'Mid' },
  { name: 'Jinx', slug: 'jinx', role: 'ADC' },
  { name: 'Ashe', slug: 'ashe', role: 'ADC' },
  { name: 'Caitlyn', slug: 'caitlyn', role: 'ADC' },
  { name: 'Thresh', slug: 'thresh', role: 'Support' },
  { name: 'Blitzcrank', slug: 'blitzcrank', role: 'Support' },
  { name: 'Darius', slug: 'darius', role: 'Top' },
  { name: 'Ahri', slug: 'ahri', role: 'Mid' },
  { name: 'Graves', slug: 'graves', role: 'Jungle' },
];

interface SearchResultItem { snippet?: string; title?: string; url?: string; }

async function searchBuild(champion: string, _slug: string): Promise<Partial<ScrapedBuild>> {
  try {
    const { default: ZAI } = await import('z-ai-web-dev-sdk');
    const zai = await ZAI.create();

    const result = await zai.functions.invoke('web_search', {
      query: `${champion} best build items runes patch 2026 lol meta`,
      num: 3,
    });

    const results: SearchResultItem[] = Array.isArray(result)
      ? result
      : ((result as { data?: SearchResultItem[] }).data || []);
    const snippets = results.map((r) => r.snippet || '').join(' ');
    const text = snippets.toLowerCase();

    const knownItems = [
      'kraken slayer', 'eclipse', 'hubris', 'guinsoo', 'phantom dancer',
      'infinity edge', 'bloodthirster', 'guardian angel', 'lord dominik',
      'berserker', 'mercury', 'plated steelcaps', 'sorcerer', 'ionian',
      'wit\'s end', 'blade of the ruined king', 'nashor', 'lich bane',
      'death\'s dance', 'sundered sky', 'sterak', 'black cleaver',
      'serylda', 'collector', 'rapid firecannon', 'runaan', 'statikk',
      'youmuu\'s', 'axiom arc', 'malignance', 'shadowflame', 'rabadon',
      'zhonya', 'void staff', 'morellonomicon', 'rylai', 'liandry',
      'crown', 'redemption', 'locket', 'mikael', 'shurelya',
      'frozen heart', 'thornmail', 'force of nature', 'kaenic',
      'hullbreaker', 'sunfire', 'iceborn', 'trinity force',
      'divine sunderer', 'jak\'sho', 'randuin', 'dead man',
      'mortal reminder', 'last whisper', 'giant slayer',
      'hexoptics', 'experimental', 'profane hydra', 'terminus',
      'spectral slayer', 'immortal shieldbow', 'essence reaver',
      'stormsurge', 'overlord', 'bloodsong', 'demonic embrace',
    ];

    const foundItems: string[] = [];
    for (const item of knownItems) {
      if (text.includes(item) && !foundItems.find(f => f.includes(item.split(' ')[0]))) {
        foundItems.push(item);
      }
    }

    const knownRunes = ['conqueror', 'lethal tempo', 'hail of blades', 'electrocute',
      'dark harvest', 'fleet footwork', 'arcane comet', 'aery', 'grasp',
      'aftershock', 'guardian', 'phase rush', 'press the attack',
      'precision', 'domination', 'sorcery', 'resolve', 'inspiration',
      'legend: bloodline', 'legend: alacrity', 'triumph', 'last stand',
      'cut down', 'absolute focus', 'transcendence', 'scorch',
      'overgrowth', 'conditioning', 'bone plating', 'unflinching',
      'second wind', 'revitalize', 'cosmic insight'];

    const foundRunes: string[] = [];
    for (const rune of knownRunes) {
      if (text.includes(rune)) {
        foundRunes.push(rune);
      }
    }

    const wrMatch = text.match(/(\d+(?:\.\d+)?)%\s*win\s*rate/);
    const winRate = wrMatch ? parseFloat(wrMatch[1]) : 0;

    const bootsKeywords = ['greaves', 'treads', 'boots', 'mercury', 'plated', 'sorcerer', 'ionian', 'swift', 'berserker'];
    const boots = foundItems.find(i => bootsKeywords.some(b => i.includes(b))) || '';
    const coreItems = foundItems.filter(i => !bootsKeywords.some(b => i.includes(b))).slice(0, 6);

    return {
      champion,
      source: 'web-search',
      patch: '26.8',
      winRate,
      coreItems: coreItems.map(capitalize),
      boots: capitalize(boots),
      runes: foundRunes.slice(0, 5).map(capitalize),
      skillOrder: '',
    };
  } catch (err) {
    console.error(`Failed to scrape ${champion}:`, err);
    return { champion, source: 'error' };
  }
}

function capitalize(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';
  const now = Date.now();

  if (!forceRefresh && cachedBuilds && Object.keys(cachedBuilds).length > 0 && now - cacheTimestamp < CACHE_DURATION) {
    return NextResponse.json({
      builds: cachedBuilds,
      cached: true,
      lastScraped: new Date(cacheTimestamp).toISOString(),
      cacheExpiresAt: new Date(cacheTimestamp + CACHE_DURATION).toISOString(),
    });
  }

  try {
    const champsToScrape = S_TIER_CHAMPIONS;
    const scrapeResults = await Promise.all(
      champsToScrape.map(c => searchBuild(c.name, c.slug))
    );

    for (const result of scrapeResults) {
      if (result.champion && result.source !== 'error') {
        cachedBuilds[result.champion] = {
          champion: result.champion || '',
          source: result.source || 'unknown',
          patch: result.patch || '26.8',
          winRate: result.winRate || 0,
          coreItems: result.coreItems || [],
          boots: result.boots || '',
          mythic: result.coreItems?.[0] || '',
          runes: result.runes || [],
          skillOrder: result.skillOrder || '',
          scrapedAt: new Date().toISOString(),
        };
      }
    }

    cacheTimestamp = now;

    return NextResponse.json({
      builds: cachedBuilds,
      cached: false,
      lastScraped: new Date(cacheTimestamp).toISOString(),
      cacheExpiresAt: new Date(cacheTimestamp + CACHE_DURATION).toISOString(),
    });
  } catch (err) {
    console.error('Meta builds scrape error:', err);
    return NextResponse.json({
      builds: cachedBuilds,
      cached: true,
      error: 'Scrape failed, returning cached data',
      lastScraped: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null,
    });
  }
}
