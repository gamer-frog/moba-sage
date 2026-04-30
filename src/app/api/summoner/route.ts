import { NextRequest, NextResponse } from 'next/server';
import { getDdVersion } from '@/components/moba/helpers';

const REGION_TO_PLATFORM: Record<string, string> = {
  NA: 'na1',
  EUW: 'euw1',
  EUNE: 'eun1',
  KR: 'kr',
  JP: 'jp1',
  BR: 'br1',
  LAN: 'la1',
  LAS: 'la2',
  OCE: 'oc1',
  TR: 'tr1',
  RU: 'ru',
  PH: 'ph2',
  SG: 'sg2',
  TH: 'th2',
  TW: 'tw2',
  VN: 'vn2',
};

interface RankedEntry {
  queueType: string;
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
}

interface MostPlayedEntry {
  champion: string;
  games: number;
  winRate: number;
}

interface SummonerResponse {
  name: string;
  level: number;
  profileIconId: number;
  ranked: RankedEntry[];
  mostPlayed: MostPlayedEntry[];
}

function getDemoData(summonerName: string): SummonerResponse {
  return {
    name: summonerName || 'SageDemon',
    level: 150,
    profileIconId: 29,
    ranked: [
      {
        queueType: 'RANKED_SOLO_5x5',
        tier: 'Gold',
        rank: 'II',
        lp: 55,
        wins: 120,
        losses: 98,
      },
      {
        queueType: 'RANKED_FLEX_SR',
        tier: 'Silver',
        rank: 'I',
        lp: 72,
        wins: 45,
        losses: 38,
      },
    ],
    mostPlayed: [
      { champion: 'Ahri', games: 45, winRate: 54.2 },
      { champion: 'Jinx', games: 32, winRate: 51.8 },
      { champion: 'Lee Sin', games: 28, winRate: 48.5 },
      { champion: 'Thresh', games: 22, winRate: 56.1 },
      { champion: 'Yasuo', games: 18, winRate: 44.3 },
    ],
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || '';
  const region = searchParams.get('region') || 'NA';

  if (!name.trim()) {
    return NextResponse.json(
      { error: 'Se requiere un nombre de invocador' },
      { status: 400 }
    );
  }

  const apiKey = process.env.RIOT_API_KEY;
  const platformId = REGION_TO_PLATFORM[region.toUpperCase()] || REGION_TO_PLATFORM['NA'];

  // If API key is available, try real Riot API
  if (apiKey) {
    try {
      const summonerRes = await fetch(
        `https://${platformId}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}`,
        {
          headers: { 'X-Riot-Token': apiKey },
        }
      );

      if (!summonerRes.ok) {
        if (summonerRes.status === 404) {
          return NextResponse.json(
            { error: 'Invocador no encontrado' },
            { status: 404 }
          );
        }
        // Fall back to demo on other errors
        return NextResponse.json(getDemoData(name));
      }

      const summonerData = await summonerRes.json();

      // Fetch ranked data
      const rankedRes = await fetch(
        `https://${platformId}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}`,
        {
          headers: { 'X-Riot-Token': apiKey },
        }
      );

      let ranked: RankedEntry[] = [];
      if (rankedRes.ok) {
        const rankedData = await rankedRes.json();
        ranked = rankedData
          .filter((e: { queueType: string }) =>
            e.queueType === 'RANKED_SOLO_5x5' || e.queueType === 'RANKED_FLEX_SR'
          )
          .map((e: { queueType: string; tier: string; rank: string; leaguePoints: number; wins: number; losses: number }) => ({
            queueType: e.queueType,
            tier: e.tier,
            rank: e.rank,
            lp: e.leaguePoints,
            wins: e.wins,
            losses: e.losses,
          }));
      }

      return NextResponse.json({
        name: summonerData.name,
        level: summonerData.summonerLevel,
        profileIconId: summonerData.profileIconId,
        ranked,
        mostPlayed: getDemoData(name).mostPlayed, // Real match history needs a separate endpoint
      });
    } catch (error) {
      console.error('Riot API error:', error);
      return NextResponse.json(getDemoData(name));
    }
  }

  // No API key — return demo data
  return NextResponse.json(getDemoData(name));
}
