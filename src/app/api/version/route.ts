import { NextResponse } from 'next/server';

interface VersionInfo {
  lol: string;
  lolFull: string;
  wr: string;
  gamePatch: string;       // Display version (game patch, e.g. "16.8")
  cdnVersion: string;      // CDN version for assets (e.g. "16.8.1")
  metaLastUpdated: string; // When tier list data was last refreshed
  fetchedAt: string;
}

const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// This is updated manually when we refresh tier list data with real meta
let GAME_PATCH = '26.8';
let META_LAST_UPDATED = '2026-04-22T05:35:00Z';

export function setGamePatch(patch: string) { GAME_PATCH = patch; }
export function setMetaLastUpdated(date: string) { META_LAST_UPDATED = date; }

let cachedVersions: VersionInfo | null = null;
let cacheTimestamp = 0;

export async function GET() {
  const now = Date.now();

  // Return cached if still valid
  if (cachedVersions && now - cacheTimestamp < CACHE_DURATION) {
    return NextResponse.json(cachedVersions);
  }

  try {
    // Fetch LoL versions from Data Dragon (free, no auth needed)
    const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json', {
      next: { revalidate: 1800 },
    });

    if (!versionRes.ok) {
      throw new Error('Failed to fetch versions');
    }

    const versions: string[] = await versionRes.json();

    // Filter LoL versions (format: X.Y.Z)
    const lolVersions = versions.filter(v => /^\d+\.\d+\.\d+$/.test(v));
    const latestLol = lolVersions[0] || '16.8.1';
    const latestLolShort = latestLol.split('.').slice(0, 2).join('.');

    // Game patch may differ from CDN version numbering
    // Use CDN-derived patch if game patch hasn't been set manually
    const displayPatch = GAME_PATCH || latestLolShort;

    // Wild Rift version (approximate - WR doesn't have a public version API)
    const lolMinor = parseInt(latestLol.split('.')[1]);
    const wrVersion = `6.${lolMinor <= 8 ? lolMinor : 8}`;

    cachedVersions = {
      lol: latestLol,
      lolFull: latestLol,
      wr: wrVersion,
      gamePatch: displayPatch,
      cdnVersion: latestLol,
      metaLastUpdated: META_LAST_UPDATED,
      fetchedAt: new Date().toISOString(),
    };

    cacheTimestamp = now;

    return NextResponse.json(cachedVersions);
  } catch (error) {
    console.error('Version fetch error:', error);

    // Fallback
    return NextResponse.json({
      lol: '16.8.1',
      lolFull: '16.8.1',
      wr: '6.8',
      gamePatch: GAME_PATCH || '26.8',
      cdnVersion: '16.8.1',
      metaLastUpdated: META_LAST_UPDATED,
      fetchedAt: new Date().toISOString(),
    });
  }
}
