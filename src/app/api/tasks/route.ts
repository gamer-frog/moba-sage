import { getTasks, updateTaskStatus } from '@/lib/data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const tasks = getTasks();
    return NextResponse.json(tasks, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (error) {
    console.error('[API /tasks] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('[API /tasks] PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
