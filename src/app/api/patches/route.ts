import { getPatches } from '@/lib/data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patches = getPatches(searchParams.get('game') || undefined);
  return NextResponse.json(patches);
}
