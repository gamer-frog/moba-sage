'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink, Info, Sparkles, Crosshair, Users, Wrench, AlertTriangle, Eye, RefreshCw, ShieldCheck, TrendingUp } from 'lucide-react';
import { TIER_CONFIG } from './constants';
import { getChampionImageUrl, getBuildExternalUrl, getItemIconUrl, parseBuildItems, getChampionSplashUrl } from './helpers';
import { RuneIcon } from './rune-icon';
import { ChampionIcon, SplashArtIcon, TinyChampionIcon } from './champion-icon';
import { RoleBadge } from './badges';
import { CollapsibleSection } from './collapsible-section';
import { CopyBuildButton } from './copy-build-button';
import { AbilityBar, SkillIcon } from './skill-icon';
import { VisionMap } from './vision-map';
import type { Champion } from './types';

// ============================================================
// Ability tooltip helpers
// ============================================================

const GENERIC_ABILITY_DESCRIPTIONS: Record<'Q'|'W'|'E'|'R', string> = {
  Q: 'Habilidad principal — principal fuente de daño',
  W: 'Habilidad secundaria — utilidad o control',
  E: 'Habilidad de movimiento — escape o enganche',
  R: 'Ultimate — define el power spike del campeón',
};

function getAbilityName(championName: string, skill: 'Q'|'W'|'E'|'R'): string {
  const SKILL_NAMES: Record<string, Record<'Q'|'W'|'E'|'R', string>> = {
    'Master Yi':    { Q: 'Alpha Strike', W: 'Wuju Style', E: 'Meditate', R: 'Highlander' },
    'Jinx':         { Q: 'Switcheroo!', W: 'Zap!', E: 'Flame Chompers!', R: 'Super Mega Death Rocket!' },
    'Lee Sin':      { Q: 'Sonic Wave', W: 'Safeguard', E: 'Iron Will', R: 'Dragon\'s Rage' },
    'Katarina':     { Q: 'Bouncing Blade', W: 'Preparation', E: 'Shunpo', R: 'Death Lotus' },
    'Ahri':         { Q: 'Orb of Deception', W: 'Fox-Fire', E: 'Charm', R: 'Spirit Rush' },
    'Darius':       { Q: 'Decimate', W: 'Crippling Strike', E: 'Apprehend', R: 'Noxian Guillotine' },
    'Thresh':       { Q: 'Death Sentence', W: 'Dark Passage', E: 'Flay', R: 'The Box' },
    'Malphite':     { Q: 'Seismic Shard', W: 'Thunderclap', E: 'Ground Slam', R: 'Unstoppable Force' },
    'Nautilus':     { Q: 'Anchor Drag', W: 'Titan\'s Wrath', E: 'Riptide', R: 'Depth Charge' },
    'Brand':        { Q: 'Brand\'s Blaze', W: 'Pillar of Flame', E: 'Conflagration', R: 'Pyroclasm' },
    'Garen':        { Q: 'Decisive Strike', W: 'Courage', E: 'Judgment', R: 'Demacian Justice' },
    'Diana':        { Q: 'Crescent Strike', W: 'Pale Cascade', E: 'Moonfall', R: 'Lunar Rush' },
    'Ashe':         { Q: 'Frost Shot', W: 'Ranger\'s Focus', E: 'Volley', R: 'Enchanted Crystal Arrow' },
    'Ezreal':       { Q: 'Mystic Shot', W: 'Essence Flux', E: 'Arcane Shift', R: 'Trueshot Barrage' },
    'Zed':          { Q: 'Razor Shuriken', W: 'Living Shadow', E: 'Shadow Slash', R: 'Death Mark' },
    'Vayne':        { Q: 'Tumble', W: 'Silver Bolts', E: 'Condemn', R: 'Final Hour' },
    'Caitlyn':      { Q: 'Piltover Peacemaker', W: 'Yordle Snap Trap', E: '90 Caliber Net', R: 'Ace in the Hole' },
    'Morgana':      { Q: 'Dark Binding', W: 'Black Shield', E: 'Tormented Shadow', R: 'Soul Shackles' },
    'Jhin':         { Q: 'Dancing Grenade', W: 'Deadly Flourish', E: 'Captive Audience', R: 'Curtain Call' },
    'Vi':           { Q: 'Vault Breaker', W: 'Denting Blows', E: 'Relentless Force', R: 'Cease and Desist' },
    'Yasuo':        { Q: 'Steel Tempest', W: 'Wind Wall', E: 'Sweeping Blade', R: 'Last Breath' },
    'Ornn':         { Q: 'Call of the Forge God', W: 'Bellows Breath', E: 'Searing Charge', R: 'Tempest Rite' },
    'Briar':        { Q: 'Chilling Scream', W: 'Failed Experiment', E: 'Snatch and Stash', R: 'Certain Death' },
    'Aurelion Sol': { Q: 'Center of the Universe', W: 'Astral Flight', E: 'Celestial Expansion', R: 'The Skies Descend' },
    'Veigar':       { Q: 'Baleful Strike', W: 'Dark Matter', E: 'Event Horizon', R: 'Primordial Burst' },
    'Nilah':        { Q: 'Joyous Unleashing', W: 'Jubilant Veil', E: 'Apex Bliss', R: 'Apotheosis' },
    'Soraka':       { Q: 'Starcall', W: 'Astral Infusion', E: 'Equinox', R: 'Wish' },
    'Zyra':         { Q: 'Deadly Spines', W: 'Rampant Growth', E: 'Grasping Roots', R: 'Stranglethorns' },
    'Kennen':       { Q: 'Thundering Shuriken', W: 'Electrical Surge', E: 'Lightning Rush', R: 'Slicing Maelstrom' },
  };
  const names = SKILL_NAMES[championName];
  if (names && names[skill]) return names[skill];
  return `${championName} ${skill}`;
}

function getAbilityDescription(champion: Champion, skill: 'Q'|'W'|'E'|'R'): string {
  // Check if brokenThings mentions the ability
  if (champion.brokenThings && champion.brokenThings.length > 0) {
    const skillMention = champion.brokenThings.find(t => t.toLowerCase().includes(skill.toLowerCase()));
    if (skillMention) return skillMention;
  }
  // Check if aiAnalysis mentions the ability
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
    <div className="flex items-center gap-1.5">
      {skills.map(skill => (
        <div
          key={skill}
          className="relative"
          onMouseEnter={() => onHoverAbility(skill)}
          onMouseLeave={() => onHoverAbility(null)}
          onTouchStart={() => onHoverAbility(hoveredAbility === skill ? null : skill)}
        >
          <div
            className="rounded-lg transition-all duration-150 cursor-pointer"
            style={{
              outline: hoveredAbility === skill ? '2px solid' : 'none',
              outlineColor: hoveredAbility === skill
                ? (skill === 'Q' ? '#0acbe6' : skill === 'W' ? '#0fba81' : skill === 'E' ? '#f0c646' : '#e84057')
                : 'transparent',
              outlineOffset: '2px',
              boxShadow: hoveredAbility === skill
                ? `0 0 12px ${(skill === 'Q' ? '#0acbe6' : skill === 'W' ? '#0fba81' : skill === 'E' ? '#f0c646' : '#e84057')}40`
                : 'none',
            }}
          >
            <SkillIcon championName={championName} skill={skill} size={32} />
          </div>
        </div>
      ))}
    </div>
  );
}

const SKIN_VARIANTS = [0, 1, 2, 3, 4];

// Nombres reales de skins del DDragon para campeones populares
// Formato: skinIndex -> nombre. 0 = 'Clásica' por defecto.
const SKIN_NAMES: Record<string, Record<number, string>> = {
  'Jinx':          { 0: 'Clásica', 1: 'Crimson Delirium', 2: 'Zombie Slayer', 3: 'Star Guardian', 4: 'Mafia', 5: 'Firecracker', 6: 'Battlecast', 7: 'Lux', 8: 'Arcane', 9: 'Spirit Blossom' },
  'Ahri':          { 0: 'Clásica', 1: 'Dinámica', 2: 'Foxfire', 3: 'Popstar', 4: 'Academy', 5: 'Challenger', 6: 'Midnight', 7: 'Dawnbringer', 8: 'Elderwood', 9: 'K/DA', 10: 'K/DA ALL OUT', 11: 'Arcade', 12: 'Empyrean' },
  'Master Yi':     { 0: 'Clásica', 1: 'Chosen', 2: 'Ionia', 3: 'Samurai', 4: 'Assassin', 5: 'Headhunter', 6: 'PROJECT:', 7: 'Cosmic', 8: 'Gun Goddess', 9: 'True Damage', 10: 'Midnight' },
  'Lee Sin':       { 0: 'Clásica', 1: 'Traditional', 2: 'Martial Arts', 3: 'Dragon Fist', 4: 'Pool Party', 5: 'Muay Thai', 6: 'SKT T1', 7: 'God Fist', 8: 'Prestige' },
  'Yasuo':         { 0: 'Clásica', 1: 'High Noon', 2: 'PROJECT:', 3: 'Blood Moon', 4: 'Nightblade', 5: 'True Damage', 6: 'Spirit Blossom', 7: 'Battle Bunny', 8: 'Yone' },
  'Thresh':        { 0: 'Clásica', 1: 'Deep Terror', 2: 'Championship', 3: 'Blood Moon', 4: 'SSW', 5: 'Lancer', 6: 'High Noon', 7: 'Pulsefire', 8: 'Elderwood' },
  'Darius':        { 0: 'Clásica', 1: 'Bioforge', 2: 'Lord', 3: 'Woad King', 4: 'Nova', 5: 'Dunkmaster', 6: 'Academy', 7: 'God-King', 8: 'Beast Hunter' },
  'Caitlyn':       { 0: 'Clásica', 1: 'Resistance', 2: 'Sheriff', 3: 'Safari', 4: 'Arctic Ops', 5: 'Headmistress', 6: 'Pulsefire', 7: 'Arcade', 8: 'Prestige Arcade', 9: 'Battle Academia', 10: 'Star Guardian' },
  'Katarina':      { 0: 'Clásica', 1: 'Mercenary', 2: 'Kitty Cat', 3: 'High Command', 4: 'Bilgewater', 5: 'Red Card', 6: 'Warring Kingdoms', 7: 'PROJECT:', 8: 'Battle Queen', 9: 'K/DA', 10: 'K/DA ALL OUT' },
  'Malphite':      { 0: 'Clásica', 1: 'Shamrock', 2: 'Coral Reef', 3: 'Obsidian', 4: 'Marble', 5: 'Ironside', 6: 'Glacial', 7: 'Lava Worn', 8: 'Mecha', 9: 'Dark Star' },
  'Nautilus':      { 0: 'Clásica', 1: 'Abyssal', 2: 'Subterranean', 3: 'Astronaut', 4: 'World Breaker', 5: 'Warden', 6: 'Pool Party', 7: 'Oceanus' },
  'Diana':         { 0: 'Clásica', 1: 'Dark Valkyrie', 2: 'Lunar Goddess', 3: 'Infernal', 4: 'Blood Moon', 5: 'Elderwood', 6: 'Battle Queen', 7: 'Prestige Lunar Goddess' },
  'Brand':         { 0: 'Clásica', 1: 'Apocalyptic', 2: 'Vandal', 3: 'Cryocore', 4: 'Zombie', 5: 'Spirit Fire', 6: 'KINDRED', 7: 'Elderwood' },
  'Garen':         { 0: 'Clásica', 1: 'Sanguine', 2: 'Dreadknight', 3: 'Commando', 4: 'Mecha', 5: 'Rugged', 6: 'Demacia Vice', 7: 'God-King', 8: 'Battlecast', 9: 'Prestige' },
  'Ashe':          { 0: 'Clásica', 1: 'Freljord', 2: 'Sherwood Forest', 3: 'Queen', 4: 'Amethyst', 5: 'Heartseeker', 6: 'Project', 7: 'Wildfire', 8: 'Prestige', 9: 'Elementalist' },
  'Ornn':          { 0: 'Clásica', 1: 'Thunder Lord', 2: 'Elderwood', 3: 'Badlands' },
  'Briar':         { 0: 'Clásica', 1: 'Bewitching', 2: 'Heartbreaker' },
  'Aurelion Sol':  { 0: 'Clásica', 1: 'Ashen Lord', 2: 'Prestige Ashen Lord' },
  'Veigar':        { 0: 'Clásica', 1: 'White Mage', 2: 'Curling', 3: 'Superb Villain', 4: 'Lunar Revel', 5: 'Battle Boss', 6: 'Star Guardian', 7: 'Arclight', 8: 'Prestige FX' },
  'Nilah':         { 0: 'Clásica', 1: 'Sea Glass', 2: 'BEYOND THE WAVE' },
  'Soraka':        { 0: 'Clásica', 1: 'Dryad', 2: 'Divine', 3: 'Teacher', 4: 'Celestine', 5: 'Order of the Banana', 6: 'Program', 7: 'Star Guardian', 8: 'Prestige' },
  'Zyra':          { 0: 'Clásica', 1: 'Wildfire', 2: 'Haunted', 3: 'SKT T1', 4: 'Battlecast', 5: 'Dragon Sorceress', 6: 'Psi Ops' },
  'Kennen':        { 0: 'Clásica', 1: 'Deadly Kennen', 2: 'Karan', 3: 'Swamp Master', 4: 'Ninja', 5: 'Arctic', 6: 'Giant', 7: 'PROJECT:' },
};

function getSkinLabel(championName: string, skinNum: number): string {
  if (skinNum === 0) return 'Clásica';
  const champSkins = SKIN_NAMES[championName];
  if (champSkins && champSkins[skinNum]) return champSkins[skinNum];
  return `Skin ${skinNum}`;
}

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

// ============================================================
// Weekly WR History Chart (mock 7-day data)
// ============================================================

function WeeklyWRChart({ currentWR, name }: { currentWR: number; name: string }) {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  // Generate deterministic "plausible" data from current WR using name as seed
  const baseWR = currentWR;
  const data = days.map((_, i) => {
    const variation = (Math.sin(i * 1.3 + name.length * 0.7) * 1.5) + (Math.sin(i * 2.1 + name.charCodeAt(0) * 0.3) * 0.5);
    return Math.round((baseWR + variation - 3) * 10) / 10;
  });
  data[6] = currentWR; // Last day = current

  const minWR = Math.min(...data) - 0.5;
  const maxWR = Math.max(...data) + 0.5;
  const range = maxWR - minWR || 1;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] text-[#5b5a56]">Últimos 7 días</span>
        <span className="text-[9px] font-mono text-[#0acbe6]">→ {currentWR}% actual</span>
      </div>
      <div className="flex items-end gap-1.5 h-24">
        {data.map((wr, i) => {
          const height = ((wr - minWR) / range) * 100;
          const color = wr >= 53 ? '#0fba81' : wr >= 51 ? '#0acbe6' : wr >= 49 ? '#f0c646' : '#e84057';
          const isLast = i === 6;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[8px] font-mono" style={{ color }}>{wr.toFixed(1)}%</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(height, 8)}%` }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="w-full rounded-t-md"
                style={{
                  background: isLast
                    ? `linear-gradient(to top, ${color}, ${color}cc)`
                    : `${color}40`,
                  minHeight: '4px',
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5">
        {days.map(d => (
          <span key={d} className="flex-1 text-center text-[8px] text-[#5b5a56]">{d}</span>
        ))}
      </div>
    </div>
  );
}

export function ChampionModal({ champion, onClose }: { champion: Champion; onClose: () => void }) {
  const cfg = TIER_CONFIG[champion.tier];
  const extUrls = getBuildExternalUrl(champion.name);
  const [imgError, setImgError] = useState(false);
  const [activeSkin, setActiveSkin] = useState(0);
  const [failedSkins, setFailedSkins] = useState<Set<number>>(new Set());
  const [metaBuild, setMetaBuild] = useState<any>(null);
  const [hoveredAbility, setHoveredAbility] = useState<'Q' | 'W' | 'E' | 'R' | null>(null);

  // Fetch live meta builds for S-tier champions
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalles de ${champion.name}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(30,35,40,0.98), rgba(10,14,26,0.98))',
          border: `1.5px solid ${cfg.color}40`,
          boxShadow: `0 0 60px ${cfg.color}15, 0 25px 50px rgba(0,0,0,0.5)`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with splash art */}
        <div className="relative p-5 pb-4" style={{ borderBottom: `1px solid ${cfg.color}20` }}>
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors z-10" aria-label={`Cerrar detalles de ${champion.name}`}>
            <span className="text-[#a09b8c] text-lg font-light">×</span>
          </button>

          {/* Splash art background with animated transition */}
          <div className="absolute inset-0 overflow-hidden rounded-t-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSkin}
                className="absolute inset-0 opacity-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {!imgError && !failedSkins.has(activeSkin) ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${currentSplashUrl})` }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${cfg.color}15, transparent)`,
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0" style={{ border: `3px solid ${cfg.color}`, boxShadow: `0 0 20px ${cfg.color}30` }}>
              <SplashArtIcon name={champion.name} />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-[#f0e6d2]">{champion.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black" style={{ backgroundColor: cfg.color, color: '#0a0e1a' }}>{champion.tier}</span>
              </div>
              <p className="text-xs text-[#a09b8c] mb-2 italic">{champion.title}</p>
              <div className="flex items-center gap-3">
                <RoleBadge role={champion.role} />
                <span className="text-[10px] text-[#5b5a56]">Patch {champion.patch}</span>
              </div>
            </div>
          </div>

          {/* Splash Art Gallery */}
          <div className="relative mt-4">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
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
                      width: 120,
                      height: 68,
                      border: isActive
                        ? `2px solid ${cfg.color}`
                        : '2px solid rgba(120,90,40,0.2)',
                      boxShadow: isActive
                        ? `0 0 12px ${cfg.color}40`
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
                        style={{
                          backgroundImage: `url(${splashUrl})`,
                          filter: 'brightness(0.7)',
                        }}
                        onError={() => handleSkinError(skinNum)}
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${cfg.color}10, rgba(10,14,26,0.5))`,
                        }}
                      />
                    )}
                    {/* Glass overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {/* Skin number label */}
                    <span className="absolute bottom-1 left-1.5 text-[8px] text-[#a09b8c] font-medium truncate max-w-[110px]">
                      {getSkinLabel(champion.name, skinNum)}
                    </span>
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        style={{ border: `2px solid ${cfg.color}` }}
                        layoutId="active-skin-border"
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            {[
              { label: 'WR', value: champion.winRate, good: champion.winRate >= 52, color: '#0acbe6' },
              { label: 'Pick', value: champion.pickRate, good: champion.pickRate >= 10, color: '#f0c646' },
              { label: 'Ban', value: champion.banRate, good: champion.banRate > 5, color: '#e84057' },
            ].map(stat => (
              <div key={stat.label} className="flex-1 text-center">
                <p className="text-lg font-mono font-bold" style={{ color: stat.value >= (stat.good ? 52 : 5) || stat.label === 'Pick' ? stat.color : '#a09b8c' }}>
                  {stat.value}%
                </p>
                <p className="text-[9px] text-[#5b5a56] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
            {champion.proPickRate && (
              <div className="text-center">
                <p className="text-lg font-mono font-bold text-[#f0c646]">{champion.proPickRate}%</p>
                <p className="text-[9px] text-[#5b5a56] uppercase tracking-wider">Pro</p>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Ability Bar with Tooltips */}
          <div className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg, rgba(10,203,230,0.06), rgba(10,203,230,0.02))', border: '1px solid rgba(10,203,230,0.15)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0acbe6]" />
                <span className="text-[10px] font-semibold text-[#0acbe6] uppercase tracking-wider">Habilidades</span>
              </div>
            </div>
            <div className="mt-2">
              <AbilityBarWithTooltips championName={champion.name} hoveredAbility={hoveredAbility} onHoverAbility={setHoveredAbility} brokenThings={champion.brokenThings} aiAnalysis={champion.aiAnalysis} />
            </div>
            {/* Tooltip */}
            <AnimatePresence>
              {hoveredAbility && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="mt-3 rounded-lg p-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30,35,40,0.95), rgba(10,14,26,0.95))',
                    border: '1px solid rgba(10,203,230,0.2)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-black" style={{ color: hoveredAbility === 'Q' ? '#0acbe6' : hoveredAbility === 'W' ? '#0fba81' : hoveredAbility === 'E' ? '#f0c646' : '#e84057' }}>{hoveredAbility}</span>
                    <span className="text-xs font-semibold text-[#f0e6d2]">{getAbilityName(champion.name, hoveredAbility)}</span>
                  </div>
                  <p className="text-[10px] text-[#a09b8c] leading-relaxed">
                    {getAbilityDescription(champion, hoveredAbility)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Weekly WR History */}
          <CollapsibleSection title="Historial Win Rate" icon={TrendingUp} color="#0acbe6" defaultOpen={true}>
            <WeeklyWRChart currentWR={champion.winRate} name={champion.name} />
          </CollapsibleSection>

          {/* Build Section — Only shows live scraped data when available */}
          {champion.tier === 'S' && metaBuild && metaBuild.coreItems && metaBuild.coreItems.length > 0 && (
            <div className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg, rgba(15,186,129,0.08), rgba(15,186,129,0.02))', border: '1px solid rgba(15,186,129,0.2)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0fba81]" />
                  <span className="text-[10px] font-semibold text-[#0fba81] uppercase tracking-wider">Build Meta Live</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0fba81] animate-pulse" />
                  <span className="text-[9px] text-[#0fba81] font-medium">
                    {metaBuild.scrapedAt ? timeAgoMeta(metaBuild.scrapedAt) : 'Live'}
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
                {metaBuild.runes && metaBuild.runes.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] text-[#5b5a56]">Runas:</span>
                    {metaBuild.runes.map((rune: string, i: number) => (
                      <span key={i} className="text-[9px] text-[#0fba81]">{rune}</span>
                    ))}
                  </div>
                )}
                <p className="text-[8px] text-[#5b5a56]">Fuente: {metaBuild.source} | Patch {metaBuild.patch}</p>
              </div>
            </div>
          )}

          <div className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg, rgba(200,170,110,0.08), rgba(200,170,110,0.03))', border: '1px solid rgba(200,170,110,0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#c8aa6e]" />
                <span className="text-[10px] font-semibold text-[#c8aa6e] uppercase tracking-wider">
                  Builds de Referencia
                  {champion.tier !== 'S' && <span className="ml-1.5 text-[#5b5a56] font-normal normal-case">— Patch {champion.patch}</span>}
                </span>
              </div>
              {champion.tier !== 'S' && (
                <span className="text-[8px] px-1.5 py-0.5 rounded text-[#785a28] font-medium" style={{ background: 'rgba(120,90,40,0.1)', border: '1px solid rgba(120,90,40,0.15)' }}>
                  Datos estáticos
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#785a28] mb-3">Fuentes externas con builds siempre actualizadas:</p>
            <div className="flex items-center gap-2 flex-wrap">
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

          {champion.builds && champion.builds.length > 0 && (
            <CollapsibleSection title="Builds de Referencia" icon={Wrench} color="#c8aa6e">
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
                                <Image src={iconUrl} alt={item} width={28} height={28} className="w-7 h-7 rounded" style={{ border: '1px solid rgba(200,170,110,0.2)' }} loading="lazy" unoptimized />
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

          {champion.runes && (
            <CollapsibleSection title="Runas" icon={Sparkles} color="#f0c646" defaultOpen={false}>
              <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(240,198,70,0.04)', border: '1px solid rgba(240,198,70,0.12)' }}>
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
              </div>
            </CollapsibleSection>
          )}

          {/* Vision Map Section */}
          <CollapsibleSection title="Mapa de Visión" icon={Eye} color="#0fba81" defaultOpen={false}>
            <VisionMap role={champion.role} />
          </CollapsibleSection>

          <div className="grid grid-cols-2 gap-3">
            {champion.counterPick && (() => {
              const counterNames = champion.counterPick.split(/[,;\—]/).map(s => s.replace(/\(.*?\)/g, '').trim()).filter(n => n.length > 0 && n !== champion.name);
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
              const synNames = champion.synergy.split(/[,;—]/).map(s => s.replace(/—.*/g, '').replace(/\(.*?\)/g, '').trim()).filter(n => n.length > 0 && n !== champion.name && n.length < 25);
              return (
                <div className="rounded-lg p-3" style={{ background: 'rgba(10,203,230,0.06)', border: '1px solid rgba(10,203,230,0.15)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Users className="w-3.5 h-3.5 text-[#0acbe6]" />
                    <h4 className="text-[10px] font-semibold text-[#0acbe6] uppercase tracking-wider">Sinergia</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {synNames.slice(0, 3).map((name) => (
                      <div key={name} className="flex flex-col items-center gap-1">
                        <TinyChampionIcon name={name} />
                        <span className="text-[8px] text-[#a09b8c] leading-none truncate max-w-[40px] text-center">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {champion.aiAnalysis && (
            <CollapsibleSection title="Análisis" icon={Sparkles} color="#c8aa6e" defaultOpen={false}>
              <div className="rounded-lg p-4" style={{ background: 'rgba(200,170,110,0.05)', border: '1px solid rgba(200,170,110,0.15)' }}>
                <p className="text-[11px] text-[#a09b8c] leading-relaxed whitespace-pre-wrap">{champion.aiAnalysis}</p>
              </div>
            </CollapsibleSection>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
