import { NextResponse } from 'next/server';

interface VersionInfo {
  lol: string;
  lolFull: string;
  wr: string;
  gamePatch: string;
  cdnVersion: string;
  metaLastUpdated: string;
  fetchedAt: string;
  ddragonStatus: string;
  attribution: string;
}

const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

let GAME_PATCH = '26.9';
let META_LAST_UPDATED = '2026-05-01T12:00:00Z';

let cachedVersions: VersionInfo | null = null;
let cacheTimestamp = 0;

export async function GET() {
  const now = Date.now();
  if (cachedVersions && now - cacheTimestamp < CACHE_DURATION) {
    return NextResponse.json(cachedVersions);
  }

  try {
    const versionRes = await fetch(
      'https://ddragon.leagueoflegends.com/api/versions.json',
      { next: { revalidate: 1800 } }
    );
    if (!versionRes.ok) throw new Error('Failed to fetch versions');
    const versions: string[] = await versionRes.json();

    const lolVersions = versions.filter(v => /^\d+\.\d+\.\d+$/.test(v));
    const latestLol = lolVersions[0] || '16.9.1';
    const latestLolShort = latestLol.split('.').slice(0, 2).join('.');

    const displayPatch = GAME_PATCH || latestLolShort;
    const lolMinor = parseInt(latestLol.split('.')[1]);
    const wrVersion = `6.${Math.min(lolMinor, 9)}`;

    cachedVersions = {
      lol: latestLol,
      lolFull: latestLol,
      wr: wrVersion,
      gamePatch: displayPatch,
      cdnVersion: latestLol,
      metaLastUpdated: META_LAST_UPDATED,
      fetchedAt: new Date().toISOString(),
      ddragonStatus: 'live',
      attribution: '© Riot Games, Inc.',
    };
    cacheTimestamp = now;
    return NextResponse.json(cachedVersions);
  } catch (error) {
    return NextResponse.json({
      lol: '16.9.1', lolFull: '16.9.1', wr: '6.9',
      gamePatch: GAME_PATCH || '26.9', cdnVersion: '16.9.1',
      metaLastUpdated: META_LAST_UPDATED,
      fetchedAt: new Date().toISOString(),
      ddragonStatus: 'fallback',
      attribution: '© Riot Games, Inc.',
    });
  }
}
