import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  const tier = searchParams.get('tier');
  const game = searchParams.get('game');
  const search = searchParams.get('search');

  const where: Record<string, unknown> = {};

  if (role && role !== 'All') where.role = role;
  if (tier) where.tier = tier;
  if (game) where.game = game;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { title: { contains: search } },
    ];
  }

  const champions = await db.champion.findMany({
    where,
    orderBy: [{ tier: 'asc' }, { winRate: 'desc' }],
  });

  return NextResponse.json(champions);
}
