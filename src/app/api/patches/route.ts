import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const game = searchParams.get('game');

  const where: Record<string, unknown> = {};
  if (game) where.sourceGame = game;

  const patches = await db.patchNote.findMany({
    where,
    orderBy: { date: 'desc' },
  });

  return NextResponse.json(patches);
}
