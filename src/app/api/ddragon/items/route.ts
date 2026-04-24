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
    const versions: string[] = await verRes.json();
    const version = versions.find(v => /^\d+\.\d+\.\d+$/.test(v)) || versions[0];

    const itemRes = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`
    );
    const itemData = await itemRes.json();

    // Only return real purchasable items (gold > 0, has name, not invisible)
    const items = Object.values(itemData.data)
      .filter((item: any) => item.gold?.total > 0 && item.name && !item.inStore?.toString().includes('false'))
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        gold: { total: item.gold.total, base: item.gold.base, sell: item.gold.sell },
        image: item.image.full,
        tags: item.tags || [],
        stats: item.stats || {},
      }));

    cached = {
      data: items,
      version,
      fetchedAt: new Date().toISOString(),
    };
    cacheTime = now;

    return NextResponse.json({
      ...cached,
      count: items.length,
      source: 'Riot Games Data Dragon',
    });
  } catch (error) {
    if (cached) return NextResponse.json(cached);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
