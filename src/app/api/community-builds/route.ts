import { NextRequest, NextResponse } from 'next/server';

/**
 * Fetches real build data from CommunityDragon for a specific champion.
 * CommunityDragon is free, no auth needed.
 * Falls back to static data if unavailable.
 */

interface CommunityDragonChampion {
  id: string;
  name: string;
  title: string;
  icon?: { path: string };
  abilities?: { id: string; name: string; description: string; icon?: { path: string } }[];
  skins?: { id: number; name: string; splashPath?: string }[];
}

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const championCache: Record<string, { data: CommunityDragonChampion; timestamp: number }> = {};

// Map champion names to CommunityDragon IDs
const CHAMPION_ID_MAP: Record<string, string> = {
  'Master Yi': 'MasterYi',
  'Wukong': 'MonkeyKing',
  'Fiddlesticks': 'FiddleSticks',
  "Bel'Veth": 'Belveth',
  "K'Sante": 'KSante',
  'Aurelion Sol': 'AurelionSol',
  "Cho'Gath": 'Chogath',
  "Kha'Zix": 'Khazix',
  "Rek'Sai": 'RekSai',
  "Vel'Koz": 'Velkoz',
  'LeBlanc': 'Leblanc',
  'Miss Fortune': 'MissFortune',
  'Lee Sin': 'LeeSin',
  'Xin Zhao': 'XinZhao',
  'Jarvan IV': 'JarvanIV',
  'Twisted Fate': 'TwistedFate',
  'Twitch': 'Twitch',
  'Renata Glasc': 'Renata',
  'Nunu': 'Nunu',
  'Aurelion Sol': 'AurelionSol',
  'Aatrox': 'Aatrox',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const champion = searchParams.get('champion') || '';

  if (!champion) {
    return NextResponse.json({ error: 'Champion name required' }, { status: 400 });
  }

  const cdId = CHAMPION_ID_MAP[champion] || champion.replace(/['\s.]/g, '');
  const now = Date.now();
  const cached = championCache[cdId];

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json({
      source: 'community-dragon-cache',
      champion: cached.data,
    });
  }

  try {
    // Fetch from CommunityDragon
    const res = await fetch(
      `https://raw.communitydragon.org/latest/cdragon/champion/${cdId.toLowerCase()}.json`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error(`CDragon returned ${res.status}`);

    const data = await res.json() as CommunityDragonChampion;

    championCache[cdId] = { data, timestamp: now };

    return NextResponse.json({
      source: 'community-dragon',
      champion: data,
    });
  } catch (error) {
    console.error(`CommunityDragon fetch failed for ${champion}:`, error);
    return NextResponse.json({
      source: 'fallback',
      champion: null,
      message: 'Data from CommunityDragon unavailable. Showing reference data.',
    });
  }
}
