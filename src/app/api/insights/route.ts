import { getInsights } from '@/lib/data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const insights = getInsights(
      searchParams.get('champion') || undefined,
      searchParams.get('category') || undefined,
    );
    return NextResponse.json(insights);
  } catch (error) {
    console.error('[API /insights] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}
