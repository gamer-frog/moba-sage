import { NextRequest, NextResponse } from 'next/server';

interface PatchEntry {
  id: number;
  version: string;
  title: string;
  date: string;
  summary: string;
  digest: string;
  url: string;
  sourceGame: string;
}

const FALLBACK_PATCHES: PatchEntry[] = [
  {
    id: 1,
    version: '14.8',
    title: 'Patch 14.8 — Ajustes de Mid Season',
    date: '2024-04-17',
    summary: 'Ajustes de champions para preparación de mid-season invicta. Buffs a junglers como Master Yi y Lee Sin, ajustes a ADCs de alta movilidad.',
    digest: 'Esta patch trae cambios significativos al meta de mid-season. Se buffean campeones de jungla como Master Yi y Lee Sin, mientras se ajustan ADCs de alta movilidad. Jinx recibe un ligero nerf en su rango de W pero compensa con más daño en su pasiva. Thresh mantiene su dominio en la bot lane con pequeñas mejoras de calidad de vida.',
    url: 'https://www.leagueoflegends.com/en-us/news/game-updates/patch-14-8-notes/',
    sourceGame: 'LoL',
  },
  {
    id: 2,
    version: '6.4',
    title: 'Patch 6.4 — Wild Rift Mid Season',
    date: '2024-04-15',
    summary: 'Ajustes de balance para Wild Rift mid-season. Buffs a Master Yi, Lee Sin. Ahri y Darius se consolidan.',
    digest: 'Patch 6.4 de Wild Rift trae ajustes significativos al meta móvil. Master Yi recibe buffs en su Alpha Strike, Lee Sin tiene mejor scaling con items bruiser. Ahri y Darius se consolidan como los dominadores de mid y top respectivamente.',
    url: 'https://www.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-6-4-notes/',
    sourceGame: 'WR',
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameFilter = searchParams.get('game') || undefined;

  try {
    // Try fetching from CommunityDragon
    const cdResponse = await fetch(
      'https://raw.communitydragon.org/latest/cdragon/patches.json',
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (cdResponse.ok) {
      const cdData = await cdResponse.json();
      const patches: PatchEntry[] = [];

      if (Array.isArray(cdData.patches)) {
        // Take the latest 10 patches
        const latestPatches = cdData.patches.slice(0, 10);
        latestPatches.forEach((patch: { id?: string; name?: string; patch?: string; title?: string; date?: string; banner?: string; notes?: string }, index: number) => {
          const version = patch.id || patch.name || patch.patch || `14.${8 - index}`;
          const title = patch.title || `Patch ${version}`;
          const date = patch.date || new Date(Date.now() - index * 14 * 86400000).toISOString().split('T')[0];
          const url = patch.banner
            ? `https://www.leagueoflegends.com/en-us/news/game-updates/patch-${version.replace(/\./g, '-')}-notes/`
            : `https://www.leagueoflegends.com/en-us/news/game-updates/`;

          patches.push({
            id: index + 1,
            version,
            title,
            date,
            summary: patch.notes || `Notas del parche ${version} con ajustes de balance y mejoras de calidad de vida.`,
            digest: patch.notes || `Cambios en el parche ${version}. Visita las notas oficiales para más detalles.`,
            url,
            sourceGame: 'LoL',
          });
        });
      }

      // Add WR fallback
      patches.push({
        id: patches.length + 1,
        version: '6.4',
        title: 'Patch 6.4 — Wild Rift Mid Season',
        date: '2024-04-15',
        summary: 'Ajustes de balance para Wild Rift mid-season. Buffs a Master Yi, Lee Sin.',
        digest: 'Patch 6.4 de Wild Rift trae ajustes significativos al meta móvil. Master Yi recibe buffs en su Alpha Strike, Lee Sin tiene mejor scaling con items bruiser. Ahri y Darius se consolidan como los dominadores de mid y top respectivamente.',
        url: 'https://www.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-6-4-notes/',
        sourceGame: 'WR',
      });

      let filtered = patches;
      if (gameFilter === 'lol') filtered = patches.filter(p => p.sourceGame === 'LoL');
      else if (gameFilter === 'wildrift') filtered = patches.filter(p => p.sourceGame === 'WR');

      return NextResponse.json(filtered);
    }
  } catch {
    // Fallback if CommunityDragon fails
  }

  // Fallback to hardcoded data
  let filtered = FALLBACK_PATCHES;
  if (gameFilter === 'lol') filtered = FALLBACK_PATCHES.filter(p => p.sourceGame === 'LoL');
  else if (gameFilter === 'wildrift') filtered = FALLBACK_PATCHES.filter(p => p.sourceGame === 'WR');

  return NextResponse.json(filtered);
}
