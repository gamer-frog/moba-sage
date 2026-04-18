import { NextResponse } from 'next/server';

interface VersionInfo {
  lol: string;
  lolFull: string;
  wr: string;
  fetchedAt: string;
}

const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

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
    const latestLol = lolVersions[0] || '25.6.1';
    const latestLolShort = latestLol.split('.').slice(0, 2).join('.');

    // Wild Rift version (approximate - WR doesn't have a public version API)
    // WR patches are usually about 1-2 behind LoL in major version
    const wrVersion = `${parseInt(latestLol.split('.')[0]) - 19}.${parseInt(latestLol.split('.')[1])}`;

    cachedVersions = {
      lol: latestLol,
      lolFull: latestLol,
      wr: wrVersion,
      fetchedAt: new Date().toISOString(),
    };

    cacheTimestamp = now;

    return NextResponse.json(cachedVersions);
  } catch (error) {
    console.error('Version fetch error:', error);

    // Fallback
    return NextResponse.json({
      lol: '25.6.1',
      lolFull: '25.6.1',
      wr: '6.6',
      fetchedAt: new Date().toISOString(),
    });
  }
}
