'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink, Sparkles, Wrench, AlertTriangle, Eye, ShieldCheck, TrendingUp, X } from 'lucide-react';
import { TIER_CONFIG } from './constants';
import { getBuildExternalUrl, getItemIconUrl, parseBuildItems, getChampionSplashUrl } from './helpers';
import { RoleBadge } from './badges';
import { CollapsibleSection } from './collapsible-section';
import { CopyBuildButton } from './copy-build-button';
import { VisionMap } from './vision-map';
import { WeeklyWRChart as SharedWeeklyWRChart } from './weekly-wr-chart';
import { timeAgo } from '@/lib/time';
import type { Champion } from './types';

// Extracted sub-components
import { SkinGallery } from './modal/skin-gallery';
import { AbilitySection } from './modal/ability-section';
import { ChampionStatsRow } from './modal/champion-stats';
import { ExternalLinksSection } from './modal/external-links';
import { CountersSynergyGrid } from './modal/counters-synergy';
import { CounterStrategiesSection } from './modal/counter-strategies-section';
import { EnhancedRunesDisplay } from './modal/rune-display';

interface MetaBuild {
  coreItems: string[];
  boots?: string;
  source: string;
  patch: string;
  scrapedAt?: string;
}

// ============================================================
// Champion Modal — Enhanced LoL Card Design
// ============================================================

export function ChampionModal({ champion, onClose }: { champion: Champion; onClose: () => void }) {
  const cfg = TIER_CONFIG[champion.tier] || TIER_CONFIG['B'];
  const extUrls = getBuildExternalUrl(champion.name);
  const [imgError, setImgError] = useState(false);
  const [activeSkin, setActiveSkin] = useState(0);
  const [failedSkins, setFailedSkins] = useState<Set<number>>(new Set());
  const [metaBuild, setMetaBuild] = useState<MetaBuild | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap + Escape to close
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    // Focus the first focusable element
    const focusable = modal.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { onCloseRef.current(); return; }
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
  }, []);

  useEffect(() => {
    if (champion.tier !== 'S') return;
    const controller = new AbortController();
    fetch('/api/meta-builds?refresh=false', { signal: controller.signal })
      .then(res => { if (!res.ok) throw new Error(`Meta builds fetch failed: ${res.status}`); return res.json(); })
      .then(data => {
        const build = data.builds?.[champion.name];
        if (build && typeof build === 'object' && build !== null) {
          setMetaBuild(build);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.warn('Meta build fetch failed:', err);
      });
    return () => controller.abort();
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
              <X className="w-4 h-4 text-lol-muted" />
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
                      className="text-2xl font-black text-lol-text tracking-wide"
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
                    <span className="text-xs text-lol-muted italic">{champion.title}</span>
                    <div className="w-px h-3 bg-lol-gold-dark/40" />
                    <RoleBadge role={champion.role} />
                    <span className="text-[10px] text-lol-dim font-mono">P{champion.patch}</span>
                  </motion.div>
                </div>
              </div>

              {/* Stats row */}
              <ChampionStatsRow champion={champion} tierColor={cfg.color} />
            </div>
          </div>

          {/* ===== BODY ===== */}
          <div className="p-5 space-y-4">

            {/* Skin Gallery */}
            <SkinGallery
              championName={champion.name}
              activeSkin={activeSkin}
              failedSkins={failedSkins}
              tierColor={cfg.color}
              onSelectSkin={handleSelectSkin}
              onSkinError={handleSkinError}
            />

            {/* Abilities */}
            <AbilitySection champion={champion} />

            {/* Weekly WR History */}
            <CollapsibleSection title="Historial de Win Rate" icon={TrendingUp} color="#0acbe6" defaultOpen={true}>
              <SharedWeeklyWRChart championName={champion.name} currentWR={champion.winRate} />
            </CollapsibleSection>

            {/* S-tier Live Build */}
            {champion.tier === 'S' && metaBuild && metaBuild.coreItems && metaBuild.coreItems.length > 0 && (
              <div className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg, rgba(15,186,129,0.08), rgba(15,186,129,0.02))', border: '1px solid rgba(15,186,129,0.2)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-lol-green" />
                    <span className="text-[10px] font-semibold text-lol-green uppercase tracking-wider">Build Meta en Vivo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-lol-green animate-pulse" />
                    <span className="text-[10px] text-lol-green font-medium">
                      {metaBuild.scrapedAt ? timeAgo(metaBuild.scrapedAt) : 'En Vivo'}
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
                  <p className="text-[10px] text-lol-dim">Fuente: {metaBuild.source} | Patch {metaBuild.patch}</p>
                </div>
              </div>
            )}

            {/* External Build Links */}
            <ExternalLinksSection urls={extUrls} championName={champion.name} />

            {/* Broken Things */}
            {champion.brokenThings && champion.brokenThings.length > 0 && (
              <CollapsibleSection title="Cosas Rotas" icon={AlertTriangle} color="#e84057">
                <div className="space-y-1.5">
                  {champion.brokenThings.map((thing, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="text-lol-danger mt-0.5">▸</span>
                      <span className="text-lol-muted">{thing}</span>
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
                          <span className="text-xs font-semibold text-lol-text">{build.name}</span>
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
                                  <div className="w-7 h-7 rounded bg-lol-card flex items-center justify-center text-[10px] text-lol-dim border border-lol-gold-dark/20">
                                    {item[0]}
                                  </div>
                                )}
                                <span className="text-[10px] text-lol-gold-dark leading-none text-center max-w-[56px] truncate">{item}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={extUrls.ugg} target="_blank" rel="noopener noreferrer" className="text-[10px] text-lol-dim hover:text-lol-success flex items-center gap-0.5 transition-colors">
                            <ExternalLink className="w-2.5 h-2.5" /> U.GG
                          </a>
                          <a href={extUrls.mobalytics} target="_blank" rel="noopener noreferrer" className="text-[10px] text-lol-dim hover:text-lol-success flex items-center gap-0.5 transition-colors">
                            <ExternalLink className="w-2.5 h-2.5" /> Mobalytics
                          </a>
                          <a href={extUrls.opgg} target="_blank" rel="noopener noreferrer" className="text-[10px] text-lol-dim hover:text-lol-success flex items-center gap-0.5 transition-colors">
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
            <CountersSynergyGrid champion={champion} />

            {/* Counter Strategies */}
            <CounterStrategiesSection champion={champion} />

            {/* AI Analysis */}
            {champion.aiAnalysis && (
              <CollapsibleSection title="Análisis" icon={Sparkles} color="#c8aa6e" defaultOpen={false}>
                <div className="rounded-lg p-4" style={{ background: 'rgba(200,170,110,0.05)', border: '1px solid rgba(200,170,110,0.15)' }}>
                  <p className="text-[11px] text-lol-muted leading-relaxed whitespace-pre-wrap">{champion.aiAnalysis}</p>
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
