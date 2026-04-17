import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const tasks = await db.taskQueue.findMany({
    orderBy: { id: 'asc' },
  });

  return NextResponse.json(tasks);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: 'Se requiere id y status' }, { status: 400 });
  }

  const validStatuses = ['pending', 'running', 'done'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
  }

  const task = await db.taskQueue.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(task);
}
