import { NextRequest, NextResponse } from 'next/server';
import { GITHUB_CONFIG } from '@/lib/github-config';

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

const REPO_OWNER = GITHUB_CONFIG.owner;
const REPO_NAME = GITHUB_CONFIG.repo;
const NOTES_PATH = GITHUB_CONFIG.notesPath;

// Rate limiting: max 5 notes per IP per hour
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  // Evict stale entries when map grows too large (serverless safety)
  if (rateLimitMap.size > 10000) {
    for (const [key, entry] of rateLimitMap) {
      if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.delete(key);
      }
    }
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Sanitize input: strip HTML, markdown links, URLs, normalize whitespace
function sanitizeInput(str: string, maxLength: number): string {
  return str
    .replace(/<[^>]*>/g, '')         // strip HTML tags
    .replace(/&[^;]+;/g, '')          // strip HTML entities
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')  // strip markdown links [text](url)
    .replace(/https?:\/\/[^\s]+/g, '')          // strip bare URLs
    .replace(/javascript:/gi, '')                   // strip javascript: protocol
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLength);
}

// Clean up stale rate limit entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

// In-memory fallback when GITHUB_TOKEN is not set
let memoryStore: NotesStore = { lastUpdated: '', notes: [] };

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
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/notes
export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Demasiadas notas. Intentá de nuevo en una hora.' }, { status: 429 });
    }

    const body = await request.json();
    const { author, content: noteContent } = body;

    if (!author || !noteContent) {
      return NextResponse.json({ error: 'Autor y contenido son requeridos' }, { status: 400 });
    }

    const sanitizedAuthor = sanitizeInput(String(author), 30);
    const sanitizedContent = sanitizeInput(String(noteContent), 500);

    if (!sanitizedAuthor || !sanitizedContent) {
      return NextResponse.json({ error: 'Autor y contenido no pueden estar vacíos' }, { status: 400 });
    }
    if (sanitizedContent.length < 3) {
      return NextResponse.json({ error: 'El contenido debe tener al menos 3 caracteres' }, { status: 400 });
    }

    const store = await getStore();

    // Duplicate detection: reject if the same author posted the same content in the last 5 minutes
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    const isDuplicate = store.data.notes.some(
      n => n.author === sanitizedAuthor && n.content === sanitizedContent && new Date(n.timestamp).getTime() > fiveMinAgo
    );
    if (isDuplicate) {
      return NextResponse.json({ error: 'Nota duplicada. Ya publicaste algo similar hace poco.' }, { status: 429 });
    }
    const newNote: CommunityNote = {
      id: 'n' + Date.now() + Math.random().toString(36).slice(2, 6),
      author: sanitizedAuthor,
      content: sanitizedContent,
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
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE /api/notes — requires admin secret to prevent unauthorized deletion
export async function DELETE(request: NextRequest) {
  try {
    // Auth check: require NOTES_ADMIN_SECRET header or query param
    const adminSecret = process.env.NOTES_ADMIN_SECRET;
    if (!adminSecret) {
      return NextResponse.json({ error: 'Función no disponible' }, { status: 503 });
    }
    const providedSecret = request.headers.get('x-admin-secret') || '';
    if (providedSecret !== adminSecret) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

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
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
