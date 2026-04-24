import { NextResponse } from 'next/server';

const CACHE_TTL = 1000 * 60 * 30;
let cached: { data: any; version: string; fetchedAt: string } | null = null;
let cacheTime = 0;

export async function GET() {
  const now = Date.now();
  if (cached && now - cacheTime < CACHE_TTL) {
    return NextResponse.json(cached);
  }

  try {
    // Get latest version
    const verRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions: string[] = await verRes.json();
    const version = versions.find(v => /^\d+\.\d+\.\d+$/.test(v)) || versions[0];

    // Fetch champion data
    const champRes = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
    );
    const champData = await champRes.json();

    // Transform to lightweight format
    const champions = Object.values(champData.data).map((c: any) => ({
      id: c.id,
      name: c.name,
      title: c.title,
      key: c.key,
      tags: c.tags,
      info: c.info,
      image: c.image.full,
      skins: c.skins.map((s: any) => ({ id: s.id, name: s.name, num: s.num })),
      spells: c.spells.map((s: any) => ({ id: s.id, name: s.name })),
    }));

    cached = {
      data: champions,
      version,
      fetchedAt: new Date().toISOString(),
    };
    cacheTime = now;

    return NextResponse.json({
      ...cached,
      count: champions.length,
      source: 'Riot Games Data Dragon',
    });
  } catch (error) {
    if (cached) return NextResponse.json(cached);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
