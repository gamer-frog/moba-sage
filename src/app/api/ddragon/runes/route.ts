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
    const verRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    if (!verRes.ok) throw new Error(`DDragon versions failed: ${verRes.status}`);
    const versions: string[] = await verRes.json();
    const version = versions.find(v => /^\d+\.\d+\.\d+$/.test(v)) || versions[0];

    const runeRes = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`
    );
    if (!runeRes.ok) throw new Error(`DDragon runes failed: ${runeRes.status}`);
    const runeData = await runeRes.json();

    // Flatten rune trees into usable format
    const trees = runeData.map((tree: any) => ({
      id: tree.id,
      name: tree.name,
      icon: tree.icon,
      slots: tree.slots.map((slot: any) => ({
        type: slot.type, // 'keystone', 'normal', 'sub'
        runes: slot.runes.map((r: any) => ({
          id: r.id,
          name: r.name,
          icon: r.icon,
          shortDesc: r.shortDesc,
          longDesc: r.longDesc,
        })),
      })),
    }));

    cached = {
      data: trees,
      version,
      fetchedAt: new Date().toISOString(),
    };
    cacheTime = now;

    return NextResponse.json({
      ...cached,
      treeCount: trees.length,
      source: 'Riot Games Data Dragon',
    });
  } catch (error) {
    if (cached) return NextResponse.json(cached);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
