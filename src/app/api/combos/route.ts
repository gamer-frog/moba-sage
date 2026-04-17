import { NextResponse } from 'next/server';
import { getCombos } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const game = searchParams.get('game') || undefined;
  const combos = getCombos(game);
  return NextResponse.json(combos);
}
