import { getInsights } from '@/lib/data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const insights = getInsights(
    searchParams.get('champion') || undefined,
    searchParams.get('category') || undefined,
  );
  return NextResponse.json(insights);
}
