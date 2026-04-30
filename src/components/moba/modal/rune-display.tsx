'use client';

import { RuneIcon } from '../rune-icon';
import type { Champion } from '../types';
import {
  RUNE_TREE_CONFIG,
  getRuneTreeColor,
  getRuneTreeEsLabel,
  RUNE_TREE_ICON_MAP,
} from '@/data/champion-data';

// ============================================================
// Parsed Rune Page Type
// ============================================================

export interface ParsedRunePage {
  primaryTree: string;
  keystone: string;
  primaryRunes: string[];
  secondaryTree: string;
  secondaryRunes: string[];
  shards: string[];
  rawRunes: string[];
}

// ============================================================
// Meta Rune Data Parser
// ============================================================

export function parseMetaRunes(runesArray: string[]): ParsedRunePage | null {
  if (!runesArray || runesArray.length < 6) return null;

  // Try to detect trees from rune names
  const precisionRunes = ['Pies Veloces', 'Conquistador', 'Lethal Tempo', 'Fleet Footwork', 'Triumph', 'Presencia de Campeón', 'Leyenda: Imparabilidad', 'Leyenda: Tenacidad', 'Leyenda: Linaje', 'Golpe de Gracia', 'Coup de Grace', 'Precision'];
  const sorceryRunes = ['Cometa Arcano', 'Invocar Aery', 'Phase Rush', 'Arcane Comet', 'Summon Aery', 'Nullifying Orb', 'Manaflow Band', 'Transcendence', 'Celeridad', 'Scorch', 'Waterwalking', 'Sorcery'];
  const dominationRunes = ['Electrocutar', 'Cosecha Oscura', 'Dark Harvest', 'Sabor a Sangre', 'Cheap Shot', 'Taste of Blood', 'Zombie Ward', 'Ghost Poro', 'Eyeball Collection', 'Ultimate Hunter', 'Relentless Hunter', 'Ravenous Hunter', 'Ingenious Hunter', 'Domination'];
  const resolveRunes = ['Guardián', 'Demolir', 'Fuente de Vida', 'Revitalizar', 'Segunda Vida', 'Bone Plating', 'Unflinching', 'Conditioning', 'Overgrowth', 'Font of Life', 'Second Wind', 'Revitalize', 'Resolve'];
  const inspirationRunes = ['Viento Favorable', 'Glacial Augment', 'Unsealed Spellbook', 'Magical Footwear', 'Perfect Timing', 'Biscuit Delivery', 'Cosmic Insight', 'Approach Velocity', 'Legend of the Empty Queue', 'Hextech Flashtraption', 'First Strike', 'Inspiration'];

  function detectTree(rune: string): string | null {
    const r = rune.toLowerCase();
    if (precisionRunes.some(p => r.includes(p.toLowerCase()) || p.toLowerCase().includes(r.replace(/\s/g, '')))) return 'Precisión';
    if (sorceryRunes.some(p => r.includes(p.toLowerCase()) || p.toLowerCase().includes(r.replace(/\s/g, '')))) return 'Brujería';
    if (dominationRunes.some(p => r.includes(p.toLowerCase()) || p.toLowerCase().includes(r.replace(/\s/g, '')))) return 'Dominación';
    if (resolveRunes.some(p => r.includes(p.toLowerCase()) || p.toLowerCase().includes(r.replace(/\s/g, '')))) return 'Valor';
    if (inspirationRunes.some(p => r.includes(p.toLowerCase()) || p.toLowerCase().includes(r.replace(/\s/g, '')))) return 'Inspiración';
    return null;
  }

  // Detect keystones (first 4 are usually primary tree runes with keystone first)
  const keystone = runesArray[0];
  const primaryTree = detectTree(keystone) || 'Precisión';

  // Find the tree switch point (when a different tree is detected)
  let switchIdx = runesArray.length;
  for (let i = 1; i < runesArray.length; i++) {
    const tree = detectTree(runesArray[i]);
    if (tree && tree !== primaryTree) {
      switchIdx = i;
      break;
    }
  }

  const primaryRunes = runesArray.slice(1, switchIdx);
  const remaining = runesArray.slice(switchIdx);

  // Separate secondary tree and shards
  let secondaryTree = 'Inspiración';
  const secondaryRunes: string[] = [];
  const shards: string[] = [];

  for (const rune of remaining) {
    const tree = detectTree(rune);
    if (tree && tree !== primaryTree) {
      secondaryTree = tree;
      secondaryRunes.push(rune);
    } else {
      shards.push(rune);
    }
  }

  return {
    primaryTree,
    keystone,
    primaryRunes: primaryRunes.slice(0, 3),
    secondaryTree,
    secondaryRunes: secondaryRunes.slice(0, 2),
    shards: shards.slice(0, 3),
    rawRunes: runesArray,
  };
}

function parseStringRunes(runes: { primary: string; secondary: string; shards: string }): ParsedRunePage | null {
  const allNames = [runes.primary, runes.secondary, runes.shards]
    .join(' — ')
    .split(/[—,\n]/)
    .map(s => s.trim())
    .filter(Boolean);

  if (allNames.length < 2) return null;

  return parseMetaRunes(allNames.length >= 4 ? allNames : [allNames[0], allNames[0], allNames[0], allNames[1], allNames[1], ...allNames.slice(2)]);
}

// ============================================================
// Rune Tree Icon Component
// ============================================================

export function RuneTreeIcon({ tree, size = 16 }: { tree: string; size?: number }) {
  const config = Object.values(RUNE_TREE_CONFIG).find(c => tree.toLowerCase().includes(c.label.toLowerCase()) || tree.toLowerCase().includes(c.esLabel.toLowerCase()));
  const color = config?.color || '#c8aa6e';
  const iconType = config?.icon || 'sword';
  const IconComponent = RUNE_TREE_ICON_MAP[iconType];

  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}20`,
        border: `1px solid ${color}40`,
      }}
      title={tree}
    >
      {IconComponent && <IconComponent className="w-[60%] h-[60%]" style={{ color }} strokeWidth={2.5} />}
    </div>
  );
}

// ============================================================
// Enhanced Runes Display Component
// ============================================================

export function EnhancedRunesDisplay({ champion, metaBuild }: { champion: Champion; metaBuild?: any }) {
  let runePage: ParsedRunePage | null = null;

  // Priority: meta-build runes array > champion.runes string data
  if (metaBuild?.runes && Array.isArray(metaBuild.runes) && metaBuild.runes.length >= 4) {
    runePage = parseMetaRunes(metaBuild.runes);
  } else if (champion.runes) {
    runePage = parseStringRunes(champion.runes);
  }

  if (!runePage) {
    // Fallback to simple display
    return (
      <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(240,198,70,0.04)', border: '1px solid rgba(240,198,70,0.12)' }}>
        {champion.runes && (
          <>
            <div className="flex items-center gap-2.5">
              <RuneIcon runeName={champion.runes.primary} size={20} />
              <span className="text-[11px] text-[#a09b8c]">{champion.runes.primary}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RuneIcon runeName={champion.runes.secondary} size={20} />
              <span className="text-[11px] text-[#a09b8c]">{champion.runes.secondary}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded shrink-0 flex items-center justify-center" style={{ background: 'rgba(240,198,70,0.15)', border: '1px solid rgba(240,198,70,0.3)' }}>
                <span className="text-[8px] text-[#f0c646] font-bold">F</span>
              </div>
              <span className="text-[11px] text-[#a09b8c]">{champion.runes.shards}</span>
            </div>
          </>
        )}
      </div>
    );
  }

  const primaryColor = getRuneTreeColor(runePage.primaryTree);
  const secondaryColor = getRuneTreeColor(runePage.secondaryTree);
  const primaryEs = getRuneTreeEsLabel(runePage.primaryTree);
  const secondaryEs = getRuneTreeEsLabel(runePage.secondaryTree);

  return (
    <div className="space-y-3">
      {/* Primary Tree */}
      <div className="rounded-lg p-3" style={{ background: `${primaryColor}08`, border: `1px solid ${primaryColor}25` }}>
        <div className="flex items-center gap-2 mb-2.5">
          <RuneTreeIcon tree={runePage.primaryTree} size={18} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
            {primaryEs}
          </span>
          <div className="h-px flex-1" style={{ background: `${primaryColor}20` }} />
        </div>
        <div className="space-y-1.5">
          {/* Keystone — larger, highlighted */}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md" style={{ background: `${primaryColor}12`, border: `1px solid ${primaryColor}30` }}>
            <RuneIcon runeName={runePage.keystone} size={24} />
            <span className="text-[11px] font-semibold text-[#f0e6d2]">{runePage.keystone}</span>
            <span className="text-[8px] px-1 py-0.5 rounded ml-auto" style={{ background: `${primaryColor}20`, color: primaryColor }}>Keystone</span>
          </div>
          {/* Primary runes */}
          {runePage.primaryRunes.map((rune, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/[0.02] transition-colors">
              <RuneIcon runeName={rune} size={18} />
              <span className="text-[10px] text-[#a09b8c]">{rune}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Tree */}
      <div className="rounded-lg p-3" style={{ background: `${secondaryColor}08`, border: `1px solid ${secondaryColor}25` }}>
        <div className="flex items-center gap-2 mb-2.5">
          <RuneTreeIcon tree={runePage.secondaryTree} size={18} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: secondaryColor }}>
            {secondaryEs}
          </span>
          <div className="h-px flex-1" style={{ background: `${secondaryColor}20` }} />
        </div>
        <div className="space-y-1.5">
          {runePage.secondaryRunes.map((rune, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/[0.02] transition-colors">
              <RuneIcon runeName={rune} size={18} />
              <span className="text-[10px] text-[#a09b8c]">{rune}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shards */}
      {runePage.shards.length > 0 && (
        <div className="rounded-lg p-3" style={{ background: 'rgba(240,198,70,0.04)', border: '1px solid rgba(240,198,70,0.15)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'rgba(240,198,70,0.15)', border: '1px solid rgba(240,198,70,0.3)' }}>
              <span className="text-[7px] text-[#f0c646] font-bold">F</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#f0c646]">Fragmentos</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {runePage.shards.map((shard, i) => (
              <span key={i} className="text-[9px] px-2 py-1 rounded-md text-[#a09b8c]" style={{ background: 'rgba(240,198,70,0.08)', border: '1px solid rgba(240,198,70,0.15)' }}>
                {shard}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
