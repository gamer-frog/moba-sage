import { NextResponse } from 'next/server';

// ============================================================
// Data Dragon API — Centralized version from Riot CDN
// ============================================================

interface DDragonVersion {
  version: string;
  fetchedAt: string;
}

let cachedVersion: DDragonVersion | null = null;
let versionCacheTime = 0;
const VERSION_TTL = 1000 * 60 * 30; // 30 minutes

async function getLatestVersion(): Promise<string> {
  const now = Date.now();
  if (cachedVersion && now - versionCacheTime < VERSION_TTL) {
    return cachedVersion.version;
  }
  
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json', {
      next: { revalidate: 1800 }
    });
    if (!res.ok) throw new Error(`DDragon versions failed: ${res.status}`);
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
