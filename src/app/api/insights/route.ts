import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const champion = searchParams.get('champion');
  const category = searchParams.get('category');

  const where: Record<string, unknown> = {};
  if (champion) where.champion = champion;
  if (category) where.category = category;

  const insights = await db.aiInsight.findMany({
    where,
    orderBy: { confidence: 'desc' },
  });

  return NextResponse.json(insights);
}
