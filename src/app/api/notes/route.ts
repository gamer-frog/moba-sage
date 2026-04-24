import { NextRequest, NextResponse } from 'next/server';

interface CommunityNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  status: string;
}

interface NotesStore {
  lastUpdated: string;
  notes: CommunityNote[];
}

const REPO_OWNER = 'gamer-frog';
const REPO_NAME = 'moba-sage';
const NOTES_PATH = 'data/community-notes.json';

// In-memory fallback when GITHUB_TOKEN is not set
let memoryStore: NotesStore = { lastUpdated: '', notes: [] };
let hasToken: boolean | null = null;

function getToken(): string | null {
  const token = process.env.GITHUB_TOKEN || '';
  if (token) return token;
  return null;
}

async function githubRead(token: string): Promise<{ data: NotesStore; sha: string } | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${NOTES_PATH}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return null;
    const file = await res.json();
    const content = Buffer.from(file.content, 'base64').toString('utf-8');
    return { data: JSON.parse(content), sha: file.sha };
  } catch {
    return null;
  }
}

async function githubWrite(token: string, data: NotesStore, sha: string): Promise<boolean> {
  try {
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${NOTES_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          message: `notes: update community notes (${data.notes.length} total)`,
          content,
          sha,
          branch: 'main',
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

async function getStore(): Promise<{ data: NotesStore; sha: string; source: 'github' | 'memory' }> {
  const token = getToken();
  if (token) {
    const result = await githubRead(token);
    if (result) return { ...result, source: 'github' };
  }
  return { data: memoryStore, sha: '', source: 'memory' };
}

// GET /api/notes
export async function GET() {
  try {
    const { data, source } = await getStore();
    return NextResponse.json({
      notes: data.notes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      lastUpdated: data.lastUpdated,
      count: data.notes.length,
      storage: source,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST /api/notes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { author, content: noteContent } = body;

    if (!author || !noteContent) {
      return NextResponse.json({ error: 'Autor y contenido son requeridos' }, { status: 400 });
    }
    if (String(noteContent).length > 500) {
      return NextResponse.json({ error: 'Maximo 500 caracteres' }, { status: 400 });
    }

    const store = await getStore();
    const newNote: CommunityNote = {
      id: 'n' + Date.now() + Math.random().toString(36).slice(2, 6),
      author: String(author).slice(0, 30),
      content: String(noteContent).slice(0, 500),
      timestamp: new Date().toISOString(),
      status: 'idea',
    };

    store.data.notes.push(newNote);
    store.data.lastUpdated = new Date().toISOString();

    const token = getToken();
    if (token && store.sha) {
      await githubWrite(token, store.data, store.sha);
    } else {
      // Fallback to memory
      memoryStore = store.data;
    }

    return NextResponse.json({ note: newNote, count: store.data.notes.length, storage: token ? 'github' : 'memory' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE /api/notes
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const store = await getStore();
    const before = store.data.notes.length;
    store.data.notes = store.data.notes.filter(n => n.id !== id);
    if (store.data.notes.length === before) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }
    store.data.lastUpdated = new Date().toISOString();

    const token = getToken();
    if (token && store.sha) {
      await githubWrite(token, store.data, store.sha);
    } else {
      memoryStore = store.data;
    }

    return NextResponse.json({ deleted: id, count: store.data.notes.length, storage: token ? 'github' : 'memory' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
