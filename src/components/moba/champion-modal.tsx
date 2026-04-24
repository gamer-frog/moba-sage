'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink, Info, Sparkles, Crosshair, Users, Wrench, AlertTriangle, Eye, ShieldCheck, TrendingUp, X, Star } from 'lucide-react';
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
    'Ornn':         { Q: 'Volcanic Rite', W: 'Bellows Breath', E: 'Searing Charge', R: 'Call of the Forge God' },
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

const SKIN_VARIANTS = [0, 1, 2, 3, 4];

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

function wrStatColor(wr: number, label: string): string {
  if (label === 'WR') return wr >= 53 ? '#0fba81' : wr >= 51 ? '#0acbe6' : wr >= 49 ? '#f0c646' : '#e84057';
  if (label === 'Ban') return wr > 5 ? '#e84057' : '#a09b8c';
  return '#f0c646';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3"
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
        className="w-full max-w-[480px] max-h-[92vh] overflow-hidden rounded-2xl flex flex-col"
        style={{
          background: 'linear-gradient(180deg, rgba(20,24,30,0.99), rgba(10,14,26,0.99))',
          border: `2px solid ${cfg.color}50`,
          boxShadow: `0 0 80px ${cfg.color}12, 0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 ${cfg.color}20`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 scrollbar-thin">

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
                    onError={() => setImgError(true)}
                  />
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

            {/* Gradient overlays — LoL card style */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to bottom, rgba(10,14,26,0.2) 0%, rgba(10,14,26,0.1) 30%, rgba(10,14,26,0.5) 60%, rgba(10,14,26,0.95) 85%, rgba(10,14,26,0.99) 100%)',
            }} />
            {/* Side vignette */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to right, rgba(10,14,26,0.3) 0%, transparent 30%, transparent 70%, rgba(10,14,26,0.3) 100%)',
            }} />

            {/* Gold corner accents — LoL card style */}
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
              {/* Champion tile icon */}
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
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: `${cfg.color}30` }}>
                      <span className="text-2xl font-black" style={{ color: cfg.color }}>{champion.name[0]}</span>
                    </div>
                  )}
                </motion.div>

                <div className="flex-1 min-w-0 pb-0.5">
                  {/* Tier diamond badge + Name */}
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
                  {/* Title + Role + Patch */}
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

              {/* Stats row — card-like overlay */}
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
                    style={{
                      borderRight: i < 3 ? '1px solid rgba(120,90,40,0.15)' : 'none',
                    }}
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
                          onError={() => handleSkinError(skinNum)}
                        />
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
                <span className="text-[9px] text-[#5b5a56] ml-auto">Hover para info</span>
              </div>
              <AbilityBarWithTooltips championName={champion.name} hoveredAbility={hoveredAbility} onHoverAbility={setHoveredAbility} />
              <AnimatePresence>
                {hoveredAbility && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="mt-3 rounded-lg p-3 overflow-hidden"
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
              <SharedWeeklyWRChart championName={champion.name} currentWR={champion.winRate} />
            </CollapsibleSection>

            {/* S-tier Live Build */}
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

            {/* External Build Links */}
            <div className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg, rgba(200,170,110,0.08), rgba(200,170,110,0.03))', border: '1px solid rgba(200,170,110,0.2)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#c8aa6e]" />
                  <span className="text-[10px] font-semibold text-[#c8aa6e] uppercase tracking-wider">
                    Builds de Referencia
                  </span>
                </div>
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

            {/* Runes */}
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

            {/* Vision Map */}
            <CollapsibleSection title="Mapa de Visión" icon={Eye} color="#0fba81" defaultOpen={false}>
              <VisionMap role={champion.role} />
            </CollapsibleSection>

            {/* Counters + Synergy */}
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
