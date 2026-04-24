import { NextResponse } from 'next/server';

// ============================================================
// Data Dragon API — Centralized champion/item/rune data from Riot CDN
// Cache strategy: In-memory with 30min TTL, serverless-safe
// ============================================================

interface DDragonVersion {
  version: string;
  fetchedAt: string;
}

interface ChampionData {
  id: string;
  name: string;
  title: string;
  image: { full: string; sprite: string };
  skins: { id: string; name: string; num: number; chromas: boolean }[];
  spells: { id: string; name: string; description: string; image: { full: string } }[];
  tags: string[];
  info: { attack: number; defense: number; magic: number; difficulty: number };
  lore: string;
}

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

let cachedVersion: DDragonVersion | null = null;
let versionCacheTime = 0;

let cachedChampions: Record<string, ChampionData> | null = null;
let championCacheTime = 0;

let cachedItems: Record<string, { name: string; image: { full: string }; gold: { total: number }; description: string }> | null = null;
let itemCacheTime = 0;

let cachedRunes: any[] | null = null;
let runeCacheTime = 0;

async function getLatestVersion(): Promise<string> {
  const now = Date.now();
  if (cachedVersion && now - versionCacheTime < CACHE_TTL) {
    return cachedVersion.version;
  }
  
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json', {
      next: { revalidate: 1800 }
    });
    const versions: string[] = await res.json();
    // Get first version matching X.Y.Z pattern (game patch, not tournament)
    const gameVersion = versions.find(v => /^\d+\.\d+\.\d+$/.test(v)) || versions[0];
    cachedVersion = { version: gameVersion, fetchedAt: new Date().toISOString() };
    versionCacheTime = now;
    return gameVersion;
  } catch {
    return cachedVersion?.version || '16.8.1';
  }
}

async function fetchChampions(version: string): Promise<Record<string, ChampionData>> {
  const now = Date.now();
  if (cachedChampions && now - championCacheTime < CACHE_TTL) {
    return cachedChampions;
  }
  
  try {
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
      { next: { revalidate: 1800 } }
    );
    const data = await res.json();
    cachedChampions = data.data;
    championCacheTime = now;
    return data.data;
  } catch {
    return cachedChampions || {};
  }
}

async function fetchItems(version: string) {
  const now = Date.now();
  if (cachedItems && now - itemCacheTime < CACHE_TTL) {
    return cachedItems;
  }
  
  try {
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`,
      { next: { revalidate: 1800 } }
    );
    const data = await res.json();
    cachedItems = data.data;
    itemCacheTime = now;
    return data.data;
  } catch {
    return cachedItems || {};
  }
}

async function fetchRunes(version: string) {
  const now = Date.now();
  if (cachedRunes && now - runeCacheTime < CACHE_TTL) {
    return cachedRunes;
  }
  
  try {
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`,
      { next: { revalidate: 1800 } }
    );
    cachedRunes = await res.json();
    runeCacheTime = now;
    return cachedRunes;
  } catch {
    return cachedRunes || [];
  }
}

// GET /api/ddragon — Returns version + available endpoints
export async function GET() {
  try {
    const version = await getLatestVersion();
    return NextResponse.json({
      status: 'ok',
      version,
      fetchedAt: new Date().toISOString(),
      endpoints: {
        champions: '/api/ddragon/champions',
        items: '/api/ddragon/items',
        runes: '/api/ddragon/runes',
        version: '/api/ddragon/version',
      },
      source: 'Riot Games Data Dragon CDN',
      attribution: '© Riot Games, Inc. League of Legends and all related content are trademarks of Riot Games, Inc.',
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 });
  }
}
