import { NextRequest, NextResponse } from 'next/server';
import { getProPicks } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || undefined;
  const picks = getProPicks(region);
  return NextResponse.json(picks);
}
