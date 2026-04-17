import { getTasks, updateTaskStatus } from '@/lib/data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const tasks = getTasks();
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

  const task = updateTaskStatus(id, status);
  if (!task) {
    return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
  }

  return NextResponse.json(task);
}
