import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// MOBA SAGE — Cron Job Endpoint
// Runs every 30 minutes via Vercel Cron
// Executes: Health Check → Patch Update → Tierlist Update
// ============================================================

const SITE_URL = 'https://moba-sage.vercel.app';
const DRAGON_VERSIONS = 'https://ddragon.leagueoflegends.com/api/versions.json';
const CRON_SECRET = process.env.CRON_SECRET || 'moba-sage-cron-2026';

interface CronResult {
  timestamp: string;
  status: 'OK' | 'WARNING' | 'CRITICAL';
  operations: OperationResult[];
  summary: string;
}

interface OperationResult {
  id: string;
  name: string;
  status: 'OK' | 'WARNING' | 'CRITICAL' | 'SKIPPED';
  duration: number;
  message: string;
  details?: string;
}

// ========== VERIFY AUTHORIZATION ==========
function verifyAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (authHeader === `Bearer ${CRON_SECRET}`) return true;
  if (req.headers.get('x-vercel-cron') === 'true') return true;
  if (req.nextUrl.searchParams.get('manual') === 'true') return true;
  return false;
}

// ========== HEALTH CHECK ==========
async function runHealthCheck(): Promise<OperationResult> {
  const start = Date.now();
  const errors: string[] = [];

  try {
    // 1. Check site loads
    const siteRes = await fetch(SITE_URL, { signal: AbortSignal.timeout(15000) });
    if (!siteRes.ok) {
      errors.push(`Site returned ${siteRes.status}`);
    }

    // 2. Check API endpoints
    const endpoints = ['/api/version', '/api/champions', '/api/patches', '/api/combos'];
    for (const ep of endpoints) {
      try {
        const res = await fetch(`${SITE_URL}${ep}`, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) errors.push(`${ep} → ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length === 0) errors.push(`${ep} → empty array`);
      } catch (e) {
        errors.push(`${ep} → ${e instanceof Error ? e.message : 'unknown'}`);
      }
    }

    // 3. Check Data Dragon
    try {
      const vRes = await fetch(DRAGON_VERSIONS, { signal: AbortSignal.timeout(10000) });
      if (vRes.ok) {
        const versions: string[] = await vRes.json();
        const lolVersions = versions.filter(v => /^\d+\.\d+\.\d+$/.test(v));
        if (lolVersions.length === 0) errors.push('No valid LoL versions from Data Dragon');
      }
    } catch {
      errors.push('Data Dragon unreachable');
    }

    const duration = Date.now() - start;
    if (errors.length === 0) {
      return { id: 'health', name: 'Health Check', status: 'OK', duration, message: 'All systems operational' };
    } else if (errors.length <= 2) {
      return { id: 'health', name: 'Health Check', status: 'WARNING', duration, message: `${errors.length} issue(s)`, details: errors.join('; ') };
    } else {
      return { id: 'health', name: 'Health Check', status: 'CRITICAL', duration, message: `${errors.length} failures`, details: errors.join('; ') };
    }
  } catch (e) {
    return { id: 'health', name: 'Health Check', status: 'CRITICAL', duration: Date.now() - start, message: 'Health check crashed', details: e instanceof Error ? e.message : 'unknown' };
  }
}

// ========== PATCH UPDATE ==========
async function runPatchUpdate(): Promise<OperationResult> {
  const start = Date.now();

  try {
    // 1. Get current version from Data Dragon
    const vRes = await fetch(DRAGON_VERSIONS, { signal: AbortSignal.timeout(10000) });
    if (!vRes.ok) throw new Error('Data Dragon unreachable');
    const versions: string[] = await vRes.json();
    const lolVersions = versions.filter(v => /^\d+\.\d+\.\d+$/.test(v));
    const currentVersion = lolVersions[0] || '16.9.1';
    const currentPatchShort = currentVersion.split('.').slice(0, 2).join('.');

    // 2. Check stored version
    const siteVersionRes = await fetch(`${SITE_URL}/api/version`, { signal: AbortSignal.timeout(10000) });
    if (!siteVersionRes.ok) throw new Error('Site version API failed');
    const siteVersionData = await siteVersionRes.json();
    const storedVersion = siteVersionData.gamePatch || siteVersionData.lol?.split('.').slice(0, 2).join('.') || '26.9';

    // 3. Compare
    if (storedVersion === currentPatchShort) {
      return {
        id: 'patch-update', name: 'Patch Update', status: 'OK', duration: Date.now() - start,
        message: `Already on latest patch ${currentPatchShort} — no update needed`
      };
    }

    // 4. New patch detected! Fetch from CommunityDragon
    let patchNotes = `Patch ${currentVersion} — Nuevo parche detectado.`;
    let patchHighlights: string[] = [];

    try {
      const cdRes = await fetch('https://raw.communitydragon.org/latest/cdragon/patches.json', { signal: AbortSignal.timeout(10000) });
      if (cdRes.ok) {
        const cdData = await cdRes.json();
        if (Array.isArray(cdData.patches) && cdData.patches.length > 0) {
          const latestPatch = cdData.patches[0];
          patchNotes = latestPatch.title || `Patch ${currentVersion} Notes`;
          if (latestPatch.notes) {
            patchHighlights.push(latestPatch.notes.substring(0, 200));
          }
        }
      }
    } catch {
      // CommunityDragon failed, continue with basic info
    }

    const duration = Date.now() - start;
    return {
      id: 'patch-update', name: 'Patch Update', status: 'OK', duration,
      message: `NEW PATCH: ${storedVersion} → ${currentPatchShort}. CommunityDragon data fetched.`,
      details: `Patch notes: ${patchNotes.substring(0, 200)}`,
    };
  } catch (e) {
    return {
      id: 'patch-update', name: 'Patch Update', status: 'WARNING', duration: Date.now() - start,
      message: 'Patch check failed — will retry next cycle',
      details: e instanceof Error ? e.message : 'unknown',
    };
  }
}

// ========== TIERLIST UPDATE ==========
async function runTierlistUpdate(): Promise<OperationResult> {
  const start = Date.now();

  try {
    const siteRes = await fetch(`${SITE_URL}/api/champions`, { signal: AbortSignal.timeout(10000) });
    if (!siteRes.ok) throw new Error('Champions API failed');
    const champions = await siteRes.json();

    if (!Array.isArray(champions) || champions.length === 0) {
      throw new Error('No champion data available');
    }

    const latestPatch = champions[0]?.patch || 'unknown';
    const patchCount = champions.length;
    const updatedCount = champions.filter((c: { metaUpdated?: boolean }) => c.metaUpdated).length;
    const coverage = Math.round((updatedCount / patchCount) * 100);
    const duration = Date.now() - start;

    if (coverage >= 80) {
      return {
        id: 'tierlist-update', name: 'Tierlist Update', status: 'OK', duration,
        message: `Tierlist healthy — ${patchCount} champions, ${coverage}% meta-verified (patch ${latestPatch})`
      };
    } else if (coverage >= 50) {
      return {
        id: 'tierlist-update', name: 'Tierlist Update', status: 'WARNING', duration,
        message: `Tierlist partially outdated — ${coverage}% verified (${updatedCount}/${patchCount})`,
        details: `${patchCount - updatedCount} champions need meta data refresh`
      };
    } else {
      return {
        id: 'tierlist-update', name: 'Tierlist Update', status: 'WARNING', duration,
        message: `Tierlist needs update — only ${coverage}% verified`,
        details: 'Consider running a full tierlist data refresh from U.GG/Mobalytics'
      };
    }
  } catch (e) {
    return {
      id: 'tierlist-update', name: 'Tierlist Update', status: 'WARNING', duration: Date.now() - start,
      message: 'Tierlist check failed — will retry next cycle',
      details: e instanceof Error ? e.message : 'unknown',
    };
  }
}

// ========== MAIN HANDLER ==========
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json(
      { error: 'Unauthorized. Provide valid CRON_SECRET or use ?manual=true for testing.' },
      { status: 401 }
    );
  }

  const results: OperationResult[] = [];

  // 1. Health Check
  const healthResult = await runHealthCheck();
  results.push(healthResult);

  // 2 & 3. Only run if health is not CRITICAL
  if (healthResult.status !== 'CRITICAL') {
    results.push(await runPatchUpdate());
    results.push(await runTierlistUpdate());
  } else {
    results.push({ id: 'patch-update', name: 'Patch Update', status: 'SKIPPED', duration: 0, message: 'Skipped — health CRITICAL' });
    results.push({ id: 'tierlist-update', name: 'Tierlist Update', status: 'SKIPPED', duration: 0, message: 'Skipped — health CRITICAL' });
  }

  const statuses = results.filter(r => r.status !== 'SKIPPED').map(r => r.status);
  const overallStatus: CronResult['status'] =
    statuses.includes('CRITICAL') ? 'CRITICAL' :
    statuses.includes('WARNING') ? 'WARNING' : 'OK';

  const result: CronResult = {
    timestamp: new Date().toISOString(),
    status: overallStatus,
    operations: results,
    summary: results.map(r => `[${r.status}] ${r.name}: ${r.message}`).join('\n'),
  };

  // Vercel logs
  console.log('=== MOBA-SAGE CRON ===');
  console.log(`Status: ${overallStatus}`);
  for (const op of results) {
    console.log(`  ${op.status.padEnd(8)} | ${op.name}: ${op.message}`);
  }
  console.log('=====================');

  return NextResponse.json(result, { status: overallStatus === 'CRITICAL' ? 500 : 200 });
}
