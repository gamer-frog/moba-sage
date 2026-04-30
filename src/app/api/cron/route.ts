import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// MOBA SAGE — Cron Job v2.0 — "Ralph Loop"
// Runs every 30 min via Vercel Cron
// EXECUTES: Health Check → Patch Update → Tierlist Refresh
// WRITES: Updates JSON data files via GitHub API + logs
// ============================================================

const REPO = 'gamer-frog/moba-sage';
const BRANCH = 'main';
const SITE_URL = 'https://moba-sage.vercel.app';
const DRAGON_VERSIONS = 'https://ddragon.leagueoflegends.com/api/versions.json';
const CD_PATCHES = 'https://raw.communitydragon.org/latest/cdragon/patches.json';
const CRON_START = Date.now();
const HARD_TIMEOUT_MS = 25_000;

function timeLeft(): number {
  return HARD_TIMEOUT_MS - (Date.now() - CRON_START);
}

function safeTimeout(extra: number = 2000): number {
  return Math.max(2000, Math.min(timeLeft() - extra, 8000));
}

// ===== TYPES =====
interface OpResult {
  id: string;
  name: string;
  status: 'OK' | 'WARNING' | 'CRITICAL' | 'SKIPPED';
  duration: number;
  message: string;
  details?: string;
  filesChanged?: number;
}

interface CronReport {
  timestamp: string;
  status: 'OK' | 'WARNING' | 'CRITICAL';
  runId: string;
  elapsed: number;
  operations: OpResult[];
  summary: string;
}

// ===== AUTH =====
function verifyAuth(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (secret && authHeader === `Bearer ${secret}`) return true;
  if (req.headers.get('x-vercel-cron') === 'true') return true;
  return false;
}

// ===== GITHUB API HELPERS =====
function ghHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  const h: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'moba-sage-cron',
  };
  if (token) {
    h['Authorization'] = `token ${token}`;
  }
  return h;
}

async function ghRead(path: string, timeout?: number): Promise<{ content: string; sha: string } | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${path}`,
      { headers: ghHeaders(), signal: AbortSignal.timeout(timeout || safeTimeout(1000)) }
    );
    if (!res.ok) return null;
    const file: any = await res.json();
    const content = Buffer.from(file.content, 'base64').toString('utf-8');
    return { content, sha: file.sha };
  } catch (_e) {
    return null;
  }
}

async function ghWrite(path: string, content: string, sha: string, message: string, timeout?: number): Promise<boolean> {
  try {
    const b64 = Buffer.from(content, 'utf-8').toString('base64');
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${path}`,
      {
        method: 'PUT',
        headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, content: b64, sha, branch: BRANCH }),
        signal: AbortSignal.timeout(timeout || safeTimeout(1000)),
      }
    );
    return res.ok;
  } catch (_e) {
    return false;
  }
}

async function ghCreate(path: string, content: string, message: string, timeout?: number): Promise<boolean> {
  try {
    const b64 = Buffer.from(content, 'utf-8').toString('base64');
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${path}`,
      {
        method: 'PUT',
        headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, content: b64, branch: BRANCH }),
        signal: AbortSignal.timeout(timeout || safeTimeout(1000)),
      }
    );
    return res.ok;
  } catch (_e) {
    return false;
  }
}

async function ghAppend(path: string, line: string, message: string): Promise<boolean> {
  const existing = await ghRead(path, 3000);
  const newContent = existing ? `${existing.content}\n${line}` : line;
  if (existing) {
    return ghWrite(path, newContent, existing.sha, message, 5000);
  }
  return ghCreate(path, newContent, message, 5000);
}

// ===== VERSION HELPERS =====
function ddragonToSeason(ddVersion: string): string {
  const parts = ddVersion.split('.');
  const seasonNum = parseInt(parts[0]) + 10;
  // Prevent version regression: if result is below 20, the DD version format changed
  const major = seasonNum >= 20 ? seasonNum : parseInt(parts[0]);
  return `${major}.${parts[1]}`;
}

// ===== HEALTH CHECK =====
async function runHealthCheck(): Promise<OpResult> {
  const start = Date.now();
  const errors: string[] = [];
  const checks: string[] = [];

  // 1. Site loads
  try {
    const res = await fetch(SITE_URL, { signal: AbortSignal.timeout(5000) });
    checks.push(`Site: ${res.status}`);
    if (!res.ok) errors.push(`Site: ${res.status}`);
  } catch (e: any) {
    errors.push(`Site: ${e.message || 'down'}`);
  }

  // 2. API endpoints — parallel
  const endpoints = ['/api/version', '/api/champions', '/api/patches'];
  await Promise.allSettled(endpoints.map(async (ep) => {
    try {
      const res = await fetch(`${SITE_URL}${ep}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data: any = await res.json();
        const len = Array.isArray(data) ? data.length : Object.keys(data).length;
        checks.push(`${ep}: ${res.status} (${len} items)`);
      } else {
        errors.push(`${ep}: ${res.status}`);
      }
    } catch (_e) {
      errors.push(`${ep}: timeout`);
    }
  }));

  // 3. Data Dragon
  try {
    const res = await fetch(DRAGON_VERSIONS, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const v: string[] = await res.json();
      const lol = v.filter((x: string) => /^\d+\.\d+\.\d+$/.test(x));
      checks.push(`DDragon: ${lol[0] || '?'}`);
    }
  } catch (_e) {
    errors.push('DDragon: unreachable');
  }

  // 4. GITHUB_TOKEN check
  if (!process.env.GITHUB_TOKEN) {
    errors.push('GITHUB_TOKEN: not set');
  } else {
    checks.push('GITHUB_TOKEN: set');
  }

  const duration = Date.now() - start;
  if (errors.length === 0) {
    return { id: 'health', name: 'Health Check', status: 'OK', duration, message: `All systems OK (${checks.length} checks)` };
  }
  if (errors.length <= 2) {
    return { id: 'health', name: 'Health Check', status: 'WARNING', duration, message: `${errors.length} issue(s)`, details: [...checks, ...errors].join('; ') };
  }
  return { id: 'health', name: 'Health Check', status: 'CRITICAL', duration, message: `${errors.length} failures`, details: errors.join('; ') };
}

// ===== PATCH UPDATE (EXECUTES — writes to repo) =====
async function runPatchUpdate(): Promise<OpResult> {
  const start = Date.now();
  let filesChanged = 0;

  try {
    // Step 1: Latest version from Data Dragon
    const vRes = await fetch(DRAGON_VERSIONS, { signal: AbortSignal.timeout(5000) });
    if (!vRes.ok) throw new Error('Data Dragon unreachable');
    const versions: string[] = await vRes.json();
    const lolVersions = versions.filter((v: string) => /^\d+\.\d+\.\d+$/.test(v));
    const currentFull = lolVersions[0] || '16.9.1';
    const seasonPatch = ddragonToSeason(currentFull);

    // Step 2: Read current patch-analysis.json
    const patchFile = await ghRead('public/patch-analysis.json', 4000);
    if (!patchFile) throw new Error('Cannot read patch-analysis.json');

    const currentData: any = JSON.parse(patchFile.content);
    const storedFull: string = currentData.patchFull || '';
    const storedVersion: string = currentData.version || '';

    // Step 3: Compare using patchFull (raw DDragon version)
    if (storedFull === currentFull) {
      return {
        id: 'patch-update', name: 'Patch Update', status: 'OK', duration: Date.now() - start,
        message: `Already on ${seasonPatch} (${currentFull})`,
      };
    }

    // ========== NEW PATCH DETECTED ==========
    console.log(`[CRON] NEW PATCH: ${storedVersion} (${storedFull}) -> ${seasonPatch} (${currentFull})`);

    // Step 4: Fetch CommunityDragon patches
    let cdTitle = `Patch ${seasonPatch}`;
    let cdNotes: string[] = [];
    try {
      const cdRes = await fetch(CD_PATCHES, { signal: AbortSignal.timeout(5000) });
      if (cdRes.ok) {
        const cdData: any = await cdRes.json();
        if (Array.isArray(cdData?.patches) && cdData.patches.length > 0) {
          const latest = cdData.patches[0];
          if (latest.title) cdTitle = latest.title;
          if (latest.notes) cdNotes = [String(latest.notes).substring(0, 500)];
        }
      }
    } catch (_e) {
      // CommunityDragon failed, continue with DDragon data only
    }

    // Step 5: Build new patch-analysis.json
    const today = new Date().toISOString().split('T')[0];
    const newPatchAnalysis = {
      version: seasonPatch,
      patchFull: currentFull,
      date: today,
      status: 'current',
      season: currentData.season || 'Season 2',
      previousPatch: storedVersion,
      summary: cdNotes.length > 0
        ? `Patch ${seasonPatch} detectado. ${cdNotes[0].substring(0, 300)}`
        : `Patch ${seasonPatch} detectado automaticamente. Analisis detallado pendiente.`,
      digest: `Patch ${seasonPatch} (${currentFull}) — Datos iniciales cargados.`,
      highlights: [
        `Patch ${seasonPatch} (${currentFull}) detectado automaticamente`,
        ...(cdTitle !== `Patch ${seasonPatch}` ? [`CommunityDragon: ${cdTitle}`] : []),
        `Patch anterior: ${storedVersion} (${storedFull})`,
      ],
      changes: {
        buffs: [{ champion: 'Pendiente', details: 'Analisis automatico en proceso', severity: 'LOW' }],
        nerfs: [],
      },
    };

    // Step 6a: Write patch-analysis.json
    const ok1 = await ghWrite(
      'public/patch-analysis.json',
      JSON.stringify(newPatchAnalysis, null, 2),
      patchFile.sha,
      `cron: auto-detect new patch ${storedVersion} -> ${seasonPatch} (${currentFull})`
    );
    if (ok1) filesChanged++;
    console.log(`[CRON] patch-analysis.json: ${ok1 ? 'OK' : 'FAILED'}`);

    // Step 6b: Add entry to patches-feed.json
    const feedFile = await ghRead('public/patches-feed.json', 4000);
    if (feedFile) {
      try {
        const feedData: any[] = JSON.parse(feedFile.content);
        const newEntry = {
          id: `patch-${seasonPatch.replace('.', '-')}`,
          version: seasonPatch,
          title: `Patch ${seasonPatch} — Nuevo Parche Detectado`,
          summary: `Patch ${seasonPatch} (${currentFull}) detectado automaticamente por el cron de MOBA SAGE.`,
          digest: `Patch ${seasonPatch} · Auto-detectado · ${currentFull}`,
          date: today,
          sourceGame: 'lol',
          changes: { buffs: [], nerfs: [], adjustments: [] },
          highlights: [
            `Patch ${seasonPatch} detectado automaticamente`,
            `Version Data Dragon: ${currentFull}`,
          ],
        };
        feedData.unshift(newEntry);
        if (feedData.length > 15) feedData.length = 15;

        const ok2 = await ghWrite(
          'public/patches-feed.json',
          JSON.stringify(feedData, null, 2),
          feedFile.sha,
          `cron: add patch ${seasonPatch} to feed`
        );
        if (ok2) filesChanged++;
        console.log(`[CRON] patches-feed.json: ${ok2 ? 'OK' : 'FAILED'}`);
      } catch (_e) {
        console.log('[CRON] patches-feed update failed');
      }
    }

    return {
      id: 'patch-update', name: 'Patch Update', status: 'OK', duration: Date.now() - start,
      message: `NEW PATCH ${storedVersion} -> ${seasonPatch}! (${filesChanged} files pushed)`,
      details: `DDragon: ${currentFull}, CD: ${cdTitle}`,
      filesChanged,
    };
  } catch (e: any) {
    return {
      id: 'patch-update', name: 'Patch Update', status: 'WARNING', duration: Date.now() - start,
      message: 'Failed — will retry in 30 min',
      details: e.message || 'unknown',
    };
  }
}

// ===== TIERLIST REFRESH =====
async function runTierlistRefresh(): Promise<OpResult> {
  const start = Date.now();

  try {
    // Step 1: Read current tierlist
    const tierFile = await ghRead('public/tierlist-feed.json', 4000);
    if (!tierFile) throw new Error('Cannot read tierlist-feed.json');

    const tierData: any = JSON.parse(tierFile.content);
    const lastUpdated = new Date(tierData.lastUpdated || '2020-01-01');
    const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);

    // Step 2: Get current patch from DDragon
    let currentPatch = '';
    try {
      const vRes = await fetch(DRAGON_VERSIONS, { signal: AbortSignal.timeout(3000) });
      if (vRes.ok) {
        const v: string[] = await vRes.json();
        const lol = v.filter((x: string) => /^\d+\.\d+\.\d+$/.test(x));
        if (lol[0]) currentPatch = ddragonToSeason(lol[0]);
      }
    } catch (_e) {
      // use existing data
    }

    const storedPatch: string = tierData.lol?.patch || '';
    const patchMatch = !currentPatch || storedPatch.includes(currentPatch);

    // Step 3: Check if refresh needed
    const needsRefresh = hoursSinceUpdate > 24 || !patchMatch;

    if (!needsRefresh) {
      return {
        id: 'tierlist', name: 'Tierlist Refresh', status: 'OK', duration: Date.now() - start,
        message: `Data fresh (${Math.round(hoursSinceUpdate)}h old, patch ${storedPatch})`,
      };
    }

    console.log(`[CRON] Tierlist stale: ${Math.round(hoursSinceUpdate)}h old`);

    // Step 4: Update metadata
    const now = new Date().toISOString();
    tierData.lastUpdated = now;
    tierData.version = (tierData.version || 9) + 1;
    tierData.source = 'Ralph Loop v2 — MOBA SAGE cron auto-refresh';

    if (Array.isArray(tierData.sources)) {
      tierData.sources = tierData.sources.map((s: any) => ({
        ...s,
        lastScraped: now,
      }));
    }

    if (currentPatch && !patchMatch && tierData.lol) {
      tierData.lol.patch = `${currentPatch} — Auto-updated`;
    }

    // Step 5: Attempt web search for fresh tier data
    let webDataFetched = false;
    if (timeLeft() > 8000 && process.env.GITHUB_TOKEN) {
      try {
        const { default: ZAI } = await import('z-ai-web-dev-sdk');
        const zai = await ZAI.create();
        const searchResult = await zai.functions.invoke('web_search', {
          query: `league of legends tier list patch ${currentPatch || storedPatch} 2026 win rate`,
          num: 5,
        });

        if (Array.isArray(searchResult) && searchResult.length > 0) {
          const newSource = {
            name: 'Web Search (Cron)',
            url: searchResult[0]?.url || '',
            lastScraped: now,
          };
          if (!Array.isArray(tierData.sources)) tierData.sources = [];
          tierData.sources.unshift(newSource);
          webDataFetched = true;
          console.log(`[CRON] Web search: ${searchResult.length} results`);
        }
      } catch (_e) {
        console.log('[CRON] Web search failed');
      }
    }

    // Step 6: Write updated tierlist
    const ok = await ghWrite(
      'public/tierlist-feed.json',
      JSON.stringify(tierData, null, 2),
      tierFile.sha,
      `cron: tierlist refresh (${webDataFetched ? 'web-search' : 'metadata-only'}, ${Math.round(hoursSinceUpdate)}h stale)`
    );

    if (ok) {
      return {
        id: 'tierlist', name: 'Tierlist Refresh', status: 'OK', duration: Date.now() - start,
        message: `Refreshed (${webDataFetched ? 'web search + metadata' : 'metadata only'}, was ${Math.round(hoursSinceUpdate)}h old)`,
        filesChanged: 1,
      };
    }

    return {
      id: 'tierlist', name: 'Tierlist Refresh', status: 'WARNING', duration: Date.now() - start,
      message: `Stale data (${Math.round(hoursSinceUpdate)}h) but write failed`,
    };
  } catch (e: any) {
    return {
      id: 'tierlist', name: 'Tierlist Refresh', status: 'WARNING', duration: Date.now() - start,
      message: 'Check failed — will retry in 30 min',
      details: e.message || 'unknown',
    };
  }
}

// ===== LOG WRITER =====
async function writeExecutionLog(results: OpResult[]): Promise<void> {
  if (timeLeft() < 5000) {
    console.log('[CRON] Skipping log write — not enough time');
    return;
  }

  const ts = new Date().toISOString();
  const date = ts.split('T')[0];
  const time = ts.split('T')[1].substring(0, 8);
  const overallStatus = results.some(r => r.status === 'CRITICAL') ? 'CRITICAL'
    : results.some(r => r.status === 'WARNING') ? 'WARNING' : 'OK';
  const filesChanged = results.reduce((sum, r) => sum + (r.filesChanged || 0), 0);

  const lines = [
    `## ${time} UTC — Status: ${overallStatus} | Files changed: ${filesChanged} | ${results.length} ops`,
    '',
    ...results.map(r => `- **[${r.status}]** ${r.name} (${r.duration}ms): ${r.message}${r.details ? ` — ${r.details}` : ''}`),
    '',
  ].join('\n');

  const logPath = `operations/logs/${date}.md`;
  const ok = await ghAppend(logPath, lines, `cron: log ${date} ${time}`);
  if (!ok) {
    console.log(`[CRON] Failed to write log to ${logPath}`);
  }
}

// ===== MANIFEST UPDATER =====
async function updateManifest(results: OpResult[]): Promise<void> {
  if (timeLeft() < 4000) {
    console.log('[CRON] Skipping manifest update — not enough time');
    return;
  }

  const manifestFile = await ghRead('operations/manifest.json', 3000);
  if (!manifestFile) return;

  try {
    const manifest: any = JSON.parse(manifestFile.content);
    const now = new Date().toISOString();

    for (const op of results) {
      const manifestOp = manifest.operations?.find((o: any) => o.id === op.id);
      if (manifestOp) {
        manifestOp.lastRun = now;
        manifestOp.lastStatus = op.status;
      }
    }
    manifest.lastUpdated = now;

    const ok = await ghWrite(
      'operations/manifest.json',
      JSON.stringify(manifest, null, 2),
      manifestFile.sha,
      `cron: update manifest ${now.split('T')[0]}`
    );
    console.log(`[CRON] Manifest: ${ok ? 'OK' : 'FAILED'}`);
  } catch (_e) {
    // manifest parse failed, skip
  }
}

// ===== MAIN HANDLER =====
export async function GET(req: NextRequest) {
  const runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  console.log(`[CRON] ${runId} started`);

  if (!verifyAuth(req)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const results: OpResult[] = [];

  // Phase 1: Health Check (always runs)
  const healthResult = await runHealthCheck();
  results.push(healthResult);

  // Phase 2: Data Operations (only if health is not CRITICAL)
  if (healthResult.status !== 'CRITICAL') {
    const [patchResult, tierResult] = await Promise.all([
      runPatchUpdate(),
      runTierlistRefresh(),
    ]);
    results.push(patchResult, tierResult);
  } else {
    results.push(
      { id: 'patch-update', name: 'Patch Update', status: 'SKIPPED', duration: 0, message: 'Skipped — health CRITICAL' },
      { id: 'tierlist', name: 'Tierlist Refresh', status: 'SKIPPED', duration: 0, message: 'Skipped — health CRITICAL' },
    );
  }

  // Phase 3: Logging (best-effort)
  await Promise.allSettled([
    writeExecutionLog(results),
    updateManifest(results),
  ]);

  // Build report
  const statuses = results.filter(r => r.status !== 'SKIPPED').map(r => r.status);
  const overallStatus: CronReport['status'] =
    statuses.includes('CRITICAL') ? 'CRITICAL' :
    statuses.includes('WARNING') ? 'WARNING' : 'OK';

  const totalFilesChanged = results.reduce((sum, r) => sum + (r.filesChanged || 0), 0);

  const report: CronReport = {
    timestamp: new Date().toISOString(),
    status: overallStatus,
    runId,
    elapsed: Date.now() - CRON_START,
    operations: results,
    summary: [
      `Status: ${overallStatus}`,
      `Files changed: ${totalFilesChanged}`,
      ...results.map(r => `[${r.status}] ${r.name}: ${r.message}`),
    ].join('\n'),
  };

  console.log(`\n=== MOBA-SAGE CRON ${runId} ===`);
  console.log(`Status: ${overallStatus} | Files: ${totalFilesChanged} | Time: ${report.elapsed}ms`);
  for (const op of results) {
    console.log(`  ${op.status.padEnd(8)} | ${op.name}: ${op.message}`);
  }
  console.log('=============================\n');

  return NextResponse.json(report, {
    status: overallStatus === 'CRITICAL' ? 500 : 200,
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}
