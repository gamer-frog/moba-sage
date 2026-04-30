'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink, Info, Sparkles, Crosshair, Users, Wrench, AlertTriangle, Eye, ShieldCheck, TrendingUp, X, Star, Wind } from 'lucide-react';
import { TIER_CONFIG } from './constants';
import { getChampionImageUrl, getBuildExternalUrl, getItemIconUrl, parseBuildItems, getChampionSplashUrl } from './helpers';
import { RuneIcon } from './rune-icon';
import { ChampionIcon, SplashArtIcon, TinyChampionIcon } from './champion-icon';
import { RoleBadge } from './badges';
import { CollapsibleSection } from './collapsible-section';
import { CopyBuildButton } from './copy-build-button';
import { SkillIcon } from './skill-icon';
import { VisionMap } from './vision-map';
import { WeeklyWRChart as SharedWeeklyWRChart } from './weekly-wr-chart';
import type { Champion } from './types';
import {
  RUNE_TREE_CONFIG,
  getRuneTreeColor,
  getRuneTreeEsLabel,
  getAbilityName,
  GENERIC_ABILITY_DESCRIPTIONS,
  SKIN_VARIANTS,
  SKIN_NAMES,
  getSkinLabel,
  RUNE_TREE_ICON_MAP,
} from '@/data/champion-data';

// ============================================================
// Counter Strategies per Role (generic)
// ============================================================
function getCounterStrategies(champ: Champion): Array<{ title: string; desc: string; severity: 'strong' | 'moderate' }> {
  const strats: Array<{ title: string; desc: string; severity: 'strong' | 'moderate' }> = [];
  
  // Positioning counters (universal)
  if (champ.winRate >= 53) {
    strats.push({ title: 'Evitar 1v1 temprano', desc: `${champ.name} es muy fuerte early. Pida ayuda de su jungler antes de level 3. No fuerce trades hasta tener su power spike.`, severity: 'strong' });
  }
  if (champ.banRate >= 5) {
    strats.push({ title: 'Considerar banear', desc: `${champ.name} tiene ${champ.banRate}% de ban rate — probablemente merece un ban si nadie en su equipo lo juega.`, severity: 'strong' });
  }
  if (champ.pickRate >= 15) {
    strats.push({ title: 'Preparar counters', desc: `Alta pick rate (${champ.pickRate}%) — es probable que lo enfrenten. Tenga un campeón con CC o gap-close listo.`, severity: 'moderate' });
  }
  
  // Role-specific tips
  if (champ.role === 'Top' || champ.role === 'Jungle') {
    strats.push({ title: 'Control de oleada', desc: 'Mantenga la ola empujando hacia su torre. No permita que forme una slow push — eso le da control del lane y evita ganks.', severity: 'moderate' });
  }
  if (champ.role === 'Mid') {
    strats.push({ title: 'Vision de robo', desc: 'Roam cuando empuje — no se quede mid. Ward de río para evitar ser flankeado.', severity: 'moderate' });
  }
  if (champ.role === 'ADC') {
    strats.push({ title: 'Posicionarse detrás', desc: 'Nunca esté primero en una teamfight. Quedese detrás del frontline y kitee. GA o QSS son items defensivos recomendados.', severity: 'strong' });
  }
  if (champ.role === 'Support') {
    strats.push({ title: 'Peel priority', desc: 'Si enfrenta un carry fuerte, enfoquese en peelar a su ADC. Use CC y exhaust a tiempo.', severity: 'moderate' });
  }
  
  // High ban rate + high WR = broken
  if (champ.winRate >= 52 && champ.banRate >= 4) {
    strats.push({ title: 'Campeón roto', desc: `${champ.name} es considerado roto este patch (${champ.winRate}% WR, ${champ.banRate}% ban). Evite enfrentarlo en lanes donde es fuerte.`, severity: 'strong' });
  }
  
  return strats;
}



// ============================================================
// Rune Tree Icon Component
// ============================================================

// RUNE_TREE_CONFIG, getRuneTreeColor, getRuneTreeEsLabel imported from @/data/champion-data

// Rune Tree Icon Component
function RuneTreeIcon({ tree, size = 16 }: { tree: string; size?: number }) {
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
// Meta Rune Data Parser
// ============================================================

interface ParsedRunePage {
  primaryTree: string;
  keystone: string;
  primaryRunes: string[];
  secondaryTree: string;
  secondaryRunes: string[];
  shards: string[];
  rawRunes: string[];
}

function parseMetaRunes(runesArray: string[]): ParsedRunePage | null {
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
// Ability tooltip helpers (getAbilityName, GENERIC_ABILITY_DESCRIPTIONS imported from @/data/champion-data)
// ============================================================

function getAbilityDescription(champion: Champion, skill: 'Q'|'W'|'E'|'R'): string {
  if (champion.brokenThings && champion.brokenThings.length > 0) {
    const skillMention = champion.brokenThings.find(t => t.toLowerCase().includes(skill.toLowerCase()));
    if (skillMention) return skillMention;
  }
  if (champion.aiAnalysis) {
    const lines = champion.aiAnalysis.split(/[.\n]/);
    const relevant = lines.find(l => l.toLowerCase().includes(skill.toLowerCase()));
    if (relevant && relevant.length > 10) return relevant.trim();
  }
  return GENERIC_ABILITY_DESCRIPTIONS[skill];
}

// ============================================================
// AbilityBar wrapper with hover callbacks
// ============================================================

function AbilityBarWithTooltips({
  championName,
  hoveredAbility,
  onHoverAbility,
}: {
  championName: string;
  hoveredAbility: 'Q' | 'W' | 'E' | 'R' | null;
  onHoverAbility: (skill: 'Q' | 'W' | 'E' | 'R' | null) => void;
  brokenThings?: string[];
  aiAnalysis?: string;
}) {
  const skills: Array<'Q' | 'W' | 'E' | 'R'> = ['Q', 'W', 'E', 'R'];
  return (
    <div className="flex items-center gap-2">
      {skills.map(skill => (
        <div
          key={skill}
          className="relative"
          onMouseEnter={() => onHoverAbility(skill)}
          onMouseLeave={() => onHoverAbility(null)}
          onTouchStart={() => onHoverAbility(hoveredAbility === skill ? null : skill)}
        >
          <div
            className="rounded-xl transition-all duration-200 cursor-pointer"
            style={{
              outline: hoveredAbility === skill ? '2.5px solid' : '1.5px solid rgba(120,90,40,0.3)',
              outlineColor: hoveredAbility === skill
                ? (skill === 'Q' ? '#0acbe6' : skill === 'W' ? '#0fba81' : skill === 'E' ? '#f0c646' : '#e84057')
                : 'transparent',
              outlineOffset: '3px',
              boxShadow: hoveredAbility === skill
                ? `0 0 16px ${(skill === 'Q' ? '#0acbe6' : skill === 'W' ? '#0fba81' : skill === 'E' ? '#f0c646' : '#e84057')}50`
                : '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            <SkillIcon championName={championName} skill={skill} size={36} />
          </div>
        </div>
      ))}
    </div>
  );
}

// SKIN_VARIANTS, SKIN_NAMES, getSkinLabel imported from @/data/champion-data

function timeAgoMeta(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins <= 0) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

function wrStatColor(wr: number, label: string): string {
  if (label === 'WR') return wr >= 53 ? '#0fba81' : wr >= 51 ? '#0acbe6' : wr >= 49 ? '#f0c646' : '#e84057';
  if (label === 'Ban') return wr > 5 ? '#e84057' : '#a09b8c';
  return '#f0c646';
}

// ============================================================
// Runes Display Component
// ============================================================

function EnhancedRunesDisplay({ champion, metaBuild }: { champion: Champion; metaBuild?: any }) {
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

// ============================================================
// Champion Modal — Enhanced LoL Card Design
// ============================================================

export function ChampionModal({ champion, onClose }: { champion: Champion; onClose: () => void }) {
  const cfg = TIER_CONFIG[champion.tier];
  const extUrls = getBuildExternalUrl(champion.name);
  const [imgError, setImgError] = useState(false);
  const [activeSkin, setActiveSkin] = useState(0);
  const [failedSkins, setFailedSkins] = useState<Set<number>>(new Set());
  const [metaBuild, setMetaBuild] = useState<any>(null);
  const [hoveredAbility, setHoveredAbility] = useState<'Q' | 'W' | 'E' | 'R' | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap + Escape to close
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    // Focus the first focusable element
    const focusable = modal.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && modal) {
        const focusableEls = Array.from(modal.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
        if (focusableEls.length === 0) return;
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    if (champion.tier !== 'S') return;
    fetch('/api/meta-builds?refresh=false')
      .then(res => res.json())
      .then(data => {
        if (data.builds && data.builds[champion.name]) {
          setMetaBuild(data.builds[champion.name]);
        }
      })
      .catch(() => {});
  }, [champion.name, champion.tier]);

  const handleSkinError = (skinNum: number) => {
    setFailedSkins(prev => new Set(prev).add(skinNum));
  };

  const handleSelectSkin = (skinNum: number) => {
    if (!failedSkins.has(skinNum)) {
      setActiveSkin(skinNum);
      setImgError(false);
    }
  };

  const currentSplashUrl = getChampionSplashUrl(champion.name, activeSkin);
  const championTileUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${champion.name.replace(/['\s.]/g, '')}_${activeSkin}.jpg`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalles de ${champion.name}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        ref={modalRef}
        className="w-full max-w-[480px] sm:max-w-[520px] max-h-[92vh] overflow-hidden rounded-2xl flex flex-col"
        style={{
          background: 'linear-gradient(180deg, rgba(20,24,30,0.99), rgba(10,14,26,0.99))',
          border: `2px solid ${cfg.color}50`,
          boxShadow: `0 0 80px ${cfg.color}12, 0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 ${cfg.color}20`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Scrollable content */}
        <div className="overflow-y-auto overflow-x-hidden flex-1 scrollbar-thin">

          {/* ===== HERO SECTION — Full Splash Art Card ===== */}
          <div className="relative" style={{ minHeight: '280px' }}>
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-white/15 hover:scale-110"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
              aria-label={`Cerrar detalles de ${champion.name}`}
            >
              <X className="w-4 h-4 text-[#a09b8c]" />
            </button>

            {/* Splash art — full width, prominent */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSkin}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {!imgError && !failedSkins.has(activeSkin) ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${currentSplashUrl})`,
                      filter: 'brightness(0.55) contrast(1.15) saturate(1.3)',
                    }}
                  >
                    <img src={currentSplashUrl} alt="" className="hidden" onError={() => setImgError(true)} />
                  </div>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${cfg.color}20, rgba(10,14,26,0.8))`,
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Gradient overlays */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to bottom, rgba(10,14,26,0.2) 0%, rgba(10,14,26,0.1) 30%, rgba(10,14,26,0.5) 60%, rgba(10,14,26,0.95) 85%, rgba(10,14,26,0.99) 100%)',
            }} />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to right, rgba(10,14,26,0.3) 0%, transparent 30%, transparent 70%, rgba(10,14,26,0.3) 100%)',
            }} />

            {/* Gold corner accents */}
            <div className="absolute top-0 left-0 w-10 h-10" style={{
              borderTop: `2px solid ${cfg.color}60`,
              borderLeft: `2px solid ${cfg.color}60`,
              borderTopLeftRadius: '14px',
            }} />
            <div className="absolute top-0 right-0 w-10 h-10" style={{
              borderTop: `2px solid ${cfg.color}60`,
              borderRight: `2px solid ${cfg.color}60`,
              borderTopRightRadius: '14px',
            }} />

            {/* Champion info OVER splash art */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
              <div className="flex items-end gap-4">
                <motion.div
                  className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative"
                  style={{
                    border: `3px solid ${cfg.color}`,
                    boxShadow: `0 0 24px ${cfg.color}40, 0 4px 16px rgba(0,0,0,0.5)`,
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', damping: 20 }}
                >
                  {!imgError ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${championTileUrl})` }}
                    >
                      <img src={championTileUrl} alt="" className="hidden" onError={() => setImgError(true)} />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: `${cfg.color}30` }}>
                      <span className="text-2xl font-black" style={{ color: cfg.color }}>{champion.name[0]}</span>
                    </div>
                  )}
                </motion.div>

                <div className="flex-1 min-w-0 pb-0.5">
                  <div className="flex items-center gap-2.5 mb-1">
                    <motion.div
                      className="px-2.5 py-1 relative"
                      style={{
                        background: `linear-gradient(135deg, ${cfg.color}50, ${cfg.color}25)`,
                        border: `1.5px solid ${cfg.color}70`,
                        borderRadius: '3px',
                        clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)',
                        backdropFilter: 'blur(6px)',
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                    >
                      <span className="text-[11px] font-black tracking-widest" style={{ color: '#0a0e1a', textShadow: 'none' }}>
                        {champion.tier}
                      </span>
                    </motion.div>
                    <motion.h2
                      className="text-2xl font-black text-[#f0e6d2] tracking-wide"
                      style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.5)' }}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {champion.name}
                    </motion.h2>
                  </div>
                  <motion.div
                    className="flex items-center gap-2 flex-wrap"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-xs text-[#a09b8c] italic">{champion.title}</span>
                    <div className="w-px h-3 bg-[#785a28]/40" />
                    <RoleBadge role={champion.role} />
                    <span className="text-[10px] text-[#5b5a56] font-mono">P{champion.patch}</span>
                  </motion.div>
                </div>
              </div>

              {/* Stats row */}
              <motion.div
                className="flex items-stretch gap-2 mt-4 rounded-xl overflow-hidden"
                style={{
                  background: 'rgba(10,14,26,0.6)',
                  border: `1px solid ${cfg.color}20`,
                  backdropFilter: 'blur(16px)',
                }}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                {[
                  { label: 'Win Rate', value: champion.winRate, suffix: '%' },
                  { label: 'Pick Rate', value: champion.pickRate, suffix: '%' },
                  { label: 'Ban Rate', value: champion.banRate, suffix: '%' },
                  ...(champion.proPickRate ? [{ label: 'Pro Pick', value: champion.proPickRate, suffix: '%' }] : []),
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className="flex-1 text-center px-2 py-2.5"
                    style={{ borderRight: i < 3 ? '1px solid rgba(120,90,40,0.15)' : 'none' }}
                  >
                    <p
                      className="text-lg font-mono font-bold leading-tight"
                      style={{
                        color: wrStatColor(stat.value, stat.label),
                        textShadow: `0 0 12px ${wrStatColor(stat.value, stat.label)}30`,
                      }}
                    >
                      {stat.value}{stat.suffix}
                    </p>
                    <p className="text-[8px] text-[#5b5a56] uppercase tracking-widest mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* ===== BODY ===== */}
          <div className="p-5 space-y-4">

            {/* Skin Gallery */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(20,24,30,0.5)', border: '1px solid rgba(120,90,40,0.12)' }}>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-2">
                {SKIN_VARIANTS.map((skinNum) => {
                  const splashUrl = getChampionSplashUrl(champion.name, skinNum);
                  const isFailed = failedSkins.has(skinNum);
                  const isActive = activeSkin === skinNum;

                  return (
                    <motion.button
                      key={skinNum}
                      onClick={() => handleSelectSkin(skinNum)}
                      className="relative shrink-0 rounded-lg overflow-hidden cursor-pointer"
                      style={{
                        width: 100,
                        height: 56,
                        border: isActive
                          ? `2px solid ${cfg.color}`
                          : '2px solid rgba(120,90,40,0.15)',
                        boxShadow: isActive
                          ? `0 0 14px ${cfg.color}50`
                          : 'none',
                        opacity: isFailed ? 0.3 : 1,
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isFailed}
                      aria-label={getSkinLabel(champion.name, skinNum)}
                    >
                      {!isFailed ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${splashUrl})`, filter: 'brightness(0.6) saturate(1.2)' }}
                        >
                          <img src={splashUrl} alt="" className="hidden" onError={() => handleSkinError(skinNum)} />
                        </div>
                      ) : (
                        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${cfg.color}10, rgba(10,14,26,0.5))` }} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className="absolute bottom-0.5 left-1.5 text-[7px] text-[#a09b8c] font-medium truncate max-w-[90px]">
                        {getSkinLabel(champion.name, skinNum)}
                      </span>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-lg pointer-events-none"
                          style={{ border: `2px solid ${cfg.color}`, boxShadow: `inset 0 0 12px ${cfg.color}20` }}
                          layoutId="modal-active-skin"
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Abilities */}
            <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(10,203,230,0.06), rgba(10,203,230,0.02))', border: '1px solid rgba(10,203,230,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#0acbe6]" />
                <span className="text-[10px] font-semibold text-[#0acbe6] uppercase tracking-wider">Habilidades</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(['Q', 'W', 'E', 'R'] as const).map(skill => {
                  const skillColor = skill === 'Q' ? '#0acbe6' : skill === 'W' ? '#0fba81' : skill === 'E' ? '#f0c646' : '#e84057';
                  return (
                    <motion.div
                      key={skill}
                      className="flex gap-3 p-3 rounded-lg transition-colors"
                      style={{
                        background: 'rgba(20,25,32,0.6)',
                        borderLeft: `3px solid ${skillColor}`,
                      }}
                      whileHover={{ background: 'rgba(30,35,40,0.8)' }}
                    >
                      <SkillIcon championName={champion.name} skill={skill} size={48} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-black" style={{ color: skillColor }}>{skill}</span>
                          <span className="text-xs font-semibold text-[#f0e6d2]">{getAbilityName(champion.name, skill)}</span>
                        </div>
                        <p className="text-xs text-[#a09b8c] leading-relaxed">
                          {getAbilityDescription(champion, skill)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Weekly WR History */}
            <CollapsibleSection title="Historial de Win Rate" icon={TrendingUp} color="#0acbe6" defaultOpen={true}>
              <SharedWeeklyWRChart championName={champion.name} currentWR={champion.winRate} />
            </CollapsibleSection>

            {/* S-tier Live Build */}
            {champion.tier === 'S' && metaBuild && metaBuild.coreItems && metaBuild.coreItems.length > 0 && (
              <div className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg, rgba(15,186,129,0.08), rgba(15,186,129,0.02))', border: '1px solid rgba(15,186,129,0.2)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0fba81]" />
                    <span className="text-[10px] font-semibold text-[#0fba81] uppercase tracking-wider">Build Meta en Vivo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0fba81] animate-pulse" />
                    <span className="text-[9px] text-[#0fba81] font-medium">
                      {metaBuild.scrapedAt ? timeAgoMeta(metaBuild.scrapedAt) : 'En Vivo'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {metaBuild.boots && (
                      <span className="text-[10px] px-2 py-1 rounded-md font-medium" style={{ background: 'rgba(15,186,129,0.1)', border: '1px solid rgba(15,186,129,0.2)', color: '#0fba81' }}>
                        {metaBuild.boots}
                      </span>
                    )}
                    {metaBuild.coreItems.map((item: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-1 rounded-md font-medium" style={{ background: 'rgba(200,170,110,0.1)', border: '1px solid rgba(200,170,110,0.2)', color: '#c8aa6e' }}>
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="text-[8px] text-[#5b5a56]">Fuente: {metaBuild.source} | Patch {metaBuild.patch}</p>
                </div>
              </div>
            )}

            {/* External Build Links */}
            <div className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg, rgba(200,170,110,0.08), rgba(200,170,110,0.03))', border: '1px solid rgba(200,170,110,0.2)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#c8aa6e]" />
                  <span className="text-[10px] font-semibold text-[#c8aa6e] uppercase tracking-wider">
                    Fuentes Externas
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[#785a28] mb-3">Links a builds siempre actualizados:</p>
              <div className="grid grid-cols-2 gap-2">
                <a href={extUrls.ugg} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105 hover:shadow-lg" style={{ background: 'rgba(0,203,230,0.12)', border: '1.5px solid rgba(0,203,230,0.35)', color: '#0acbe6', boxShadow: '0 0 12px rgba(0,203,230,0.08)' }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black" style={{ background: 'rgba(0,203,230,0.2)', border: '1px solid rgba(0,203,230,0.3)' }}>UG</div>
                  U.GG
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
                <a href={extUrls.opgg} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105 hover:shadow-lg" style={{ background: 'rgba(79,140,255,0.12)', border: '1.5px solid rgba(79,140,255,0.35)', color: '#4f8cff', boxShadow: '0 0 12px rgba(79,140,255,0.08)' }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black" style={{ background: 'rgba(79,140,255,0.2)', border: '1px solid rgba(79,140,255,0.3)' }}>OP</div>
                  OP.GG
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
                <a href={extUrls.mobalytics} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105 hover:shadow-lg" style={{ background: 'rgba(157,72,224,0.12)', border: '1.5px solid rgba(157,72,224,0.35)', color: '#9d48e0', boxShadow: '0 0 12px rgba(157,72,224,0.08)' }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black" style={{ background: 'rgba(157,72,224,0.2)', border: '1px solid rgba(157,72,224,0.3)' }}>MA</div>
                  Mobalytics
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
                <a href={`https://www.probuilds.net/champions/details/${champion.name.toLowerCase().replace(/ /g, '').replace(/'/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105 hover:shadow-lg" style={{ background: 'rgba(200,170,110,0.1)', border: '1.5px solid rgba(200,170,110,0.3)', color: '#c8aa6e', boxShadow: '0 0 12px rgba(200,170,110,0.06)' }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black" style={{ background: 'rgba(200,170,110,0.2)', border: '1px solid rgba(200,170,110,0.3)' }}>PB</div>
                  ProBuilds
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
            </div>

            {/* Broken Things */}
            {champion.brokenThings && champion.brokenThings.length > 0 && (
              <CollapsibleSection title="Cosas Rotas" icon={AlertTriangle} color="#e84057">
                <div className="space-y-1.5">
                  {champion.brokenThings.map((thing, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="text-[#e84057] mt-0.5">▸</span>
                      <span className="text-[#a09b8c]">{thing}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Reference Builds */}
            {champion.builds && champion.builds.length > 0 && (
              <CollapsibleSection title="Builds de Referencia" icon={Wrench} color="#c8aa6e" defaultOpen={false}>
                <div className="space-y-2">
                  {champion.builds.map((build, i) => {
                    const items = parseBuildItems(build.items);
                    return (
                      <div key={i} className="rounded-lg p-3" style={{ background: 'rgba(30,35,40,0.5)', border: '1px solid rgba(120,90,40,0.1)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-[#f0e6d2]">{build.name}</span>
                          <div className="flex items-center gap-2">
                            <CopyBuildButton buildName={build.name} itemsStr={build.items} />
                            <span className="text-[10px] font-mono" style={{ color: build.winRate >= 53 ? '#0acbe6' : '#a09b8c' }}>
                              {build.winRate}% WR
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {items.map((item, j) => {
                            const iconUrl = getItemIconUrl(item);
                            return (
                              <div key={j} className="relative group/item flex flex-col items-center gap-0.5">
                                {iconUrl ? (
                                  <Image src={iconUrl} alt={item} width={28} height={28} className="w-7 h-7 rounded" style={{ border: '1px solid rgba(200,170,110,0.2)' }} loading="lazy" />
                                ) : (
                                  <div className="w-7 h-7 rounded bg-[#1e2328] flex items-center justify-center text-[8px] text-[#5b5a56] border border-[#785a28]/20">
                                    {item[0]}
                                  </div>
                                )}
                                <span className="text-[7px] text-[#785a28] leading-none text-center max-w-[56px] truncate">{item}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={extUrls.ugg} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#5b5a56] hover:text-[#0acbe6] flex items-center gap-0.5 transition-colors">
                            <ExternalLink className="w-2.5 h-2.5" /> U.GG
                          </a>
                          <a href={extUrls.mobalytics} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#5b5a56] hover:text-[#0acbe6] flex items-center gap-0.5 transition-colors">
                            <ExternalLink className="w-2.5 h-2.5" /> Mobalytics
                          </a>
                          <a href={extUrls.opgg} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#5b5a56] hover:text-[#0acbe6] flex items-center gap-0.5 transition-colors">
                            <ExternalLink className="w-2.5 h-2.5" /> OP.GG
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleSection>
            )}

            {/* Enhanced Runes Display */}
            {champion.runes && (
              <CollapsibleSection title="Runas" icon={Sparkles} color="#f0c646" defaultOpen={false}>
                <EnhancedRunesDisplay champion={champion} metaBuild={metaBuild} />
              </CollapsibleSection>
            )}

            {/* Vision Map */}
            <CollapsibleSection title="Mapa de Visión" icon={Eye} color="#0fba81" defaultOpen={false}>
              <VisionMap role={champion.role} />
            </CollapsibleSection>

            {/* Counters + Synergy */}
            {(() => {
              const NON_CHAMP_WORDS = ['para', 'con', 'que', 'follow', 'peel', 'comp', 'root', 'poke', 'engage', 'chase', 'hyper', 'maxim', 'protecc', 'lock', 'total', 'crea', 'prep', 'burst', 'elim', 'devasta', 'buena', 'buen', 'fuerte', 'activar', 'rapida', 'invenc', 'trampa', 'mortal', 'masivo', 'fights', 'carry', 'mejor', 'detect', 'perder', 'sino', 'util', 'cuando'];
            return (
            <div className="grid grid-cols-2 gap-3">
              {champion.counterPick && (() => {
                const counterNames = champion.counterPick.split(/[,;\—]/).map(s => s.replace(/\(.*?\)/g, '').trim()).filter(n => n.length > 0 && n !== champion.name && !NON_CHAMP_WORDS.some(w => n.toLowerCase().includes(w)));
                return (
                  <div className="rounded-lg p-3" style={{ background: 'rgba(232,64,87,0.06)', border: '1px solid rgba(232,64,87,0.15)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Crosshair className="w-3.5 h-3.5 text-[#e84057]" />
                      <h4 className="text-[10px] font-semibold text-[#e84057] uppercase tracking-wider">Counters</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {counterNames.slice(0, 3).map((name) => (
                        <div key={name} className="flex flex-col items-center gap-1">
                          <TinyChampionIcon name={name} />
                          <span className="text-[8px] text-[#a09b8c] leading-none truncate max-w-[40px] text-center">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {champion.synergy && (() => {
                const synNames = champion.synergy.split(/[,;—]/).map(s => s.replace(/—.*/g, '').replace(/\(.*?\)/g, '').trim()).filter(n => n.length > 0 && n !== champion.name && !NON_CHAMP_WORDS.some(w => n.toLowerCase().includes(w)));
                return (
                  <div className="rounded-lg p-3" style={{ background: 'rgba(10,203,230,0.06)', border: '1px solid rgba(10,203,230,0.15)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Users className="w-3.5 h-3.5 text-[#0acbe6]" />
                      <h4 className="text-[10px] font-semibold text-[#0acbe6] uppercase tracking-wider">Sinergia</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {synNames.slice(0, 3).map((name) => (
                        <div key={name} className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{ background: 'rgba(10,203,230,0.06)', border: '1px solid rgba(10,203,230,0.12)' }}>
                          <ChampionIcon name={name} tier={champion.tier} />
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-[#f0e6d2] leading-tight">{name}</span>
                            <span className="text-[8px] text-[#0acbe6]">Sinergia</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
            );
            })()}

            {/* Counter Strategies */}
            {(() => {
              const counterStrats = getCounterStrategies(champion);
              if (counterStrats.length === 0) return null;
              return (
                <CollapsibleSection title="Estrategias Contra" icon={Swords} color="#e84057" defaultOpen={champion.winRate >= 53}>
                  <div className="space-y-2 mt-2">
                    {counterStrats.map((strat, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg" style={{
                        background: strat.severity === 'strong' ? 'rgba(232,64,87,0.06)' : 'rgba(240,198,70,0.06)',
                        border: `1px solid ${strat.severity === 'strong' ? 'rgba(232,64,87,0.15)' : 'rgba(240,198,70,0.15)'}`,
                        borderLeft: `2px solid ${strat.severity === 'strong' ? '#e84057' : '#f0c646'}`,
                      }}>
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: strat.severity === 'strong' ? '#e84057' : '#f0c646' }} />
                        <div>
                          <p className="text-[11px] font-semibold text-[#f0e6d2]">{strat.title}</p>
                          <p className="text-[10px] text-[#a09b8c] leading-relaxed mt-0.5">{strat.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              );
            })()}

            {/* AI Analysis */}
            {champion.aiAnalysis && (
              <CollapsibleSection title="Análisis" icon={Sparkles} color="#c8aa6e" defaultOpen={false}>
                <div className="rounded-lg p-4" style={{ background: 'rgba(200,170,110,0.05)', border: '1px solid rgba(200,170,110,0.15)' }}>
                  <p className="text-[11px] text-[#a09b8c] leading-relaxed whitespace-pre-wrap">{champion.aiAnalysis}</p>
                </div>
              </CollapsibleSection>
            )}
          </div>
        </div>

        {/* Bottom gold accent line */}
        <div className="h-1 w-full" style={{
          background: `linear-gradient(90deg, transparent, ${cfg.color}60, transparent)`,
        }} />
      </motion.div>
    </motion.div>
  );
}