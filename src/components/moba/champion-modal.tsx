'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink, Info, Sparkles, Crosshair, Users, Wrench, AlertTriangle, Eye, RefreshCw, ShieldCheck } from 'lucide-react';
import { TIER_CONFIG } from './constants';
import { getChampionImageUrl, getBuildExternalUrl, getItemIconUrl, parseBuildItems, getChampionSplashUrl } from './helpers';
import { RuneIcon } from './rune-icon';
import { ChampionIcon, SplashArtIcon, TinyChampionIcon } from './champion-icon';
import { RoleBadge } from './badges';
import { CollapsibleSection } from './collapsible-section';
import { CopyBuildButton } from './copy-build-button';
import { AbilityBar } from './skill-icon';
import { VisionMap } from './vision-map';
import type { Champion } from './types';

const SKIN_VARIANTS = [0, 1, 2, 3, 4];

function timeAgoMeta(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function ChampionModal({ champion, onClose }: { champion: Champion; onClose: () => void }) {
  const cfg = TIER_CONFIG[champion.tier];
  const extUrls = getBuildExternalUrl(champion.name);
  const [imgError, setImgError] = useState(false);
  const [activeSkin, setActiveSkin] = useState(0);
  const [failedSkins, setFailedSkins] = useState<Set<number>>(new Set());
  const [metaBuild, setMetaBuild] = useState<any>(null);
  const [buildLoading, setBuildLoading] = useState(false);

  // Fetch live meta builds for S-tier champions
  useEffect(() => {
    if (champion.tier !== 'S') return;
    setBuildLoading(true);
    fetch('/api/meta-builds?refresh=false')
      .then(res => res.json())
      .then(data => {
        if (data.builds && data.builds[champion.name]) {
          setMetaBuild(data.builds[champion.name]);
        }
      })
      .catch(() => {})
      .finally(() => setBuildLoading(false));
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
                    aria-label={`Skin ${skinNum === 0 ? 'Clásica' : skinNum}`}
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
                    <span className="absolute bottom-1 left-1.5 text-[8px] text-[#a09b8c] font-medium">
                      {skinNum === 0 ? 'Clásica' : `Skin ${skinNum}`}
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
          {/* Ability Bar */}
          <div className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg, rgba(10,203,230,0.06), rgba(10,203,230,0.02))', border: '1px solid rgba(10,203,230,0.15)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0acbe6]" />
                <span className="text-[10px] font-semibold text-[#0acbe6] uppercase tracking-wider">Habilidades</span>
              </div>
            </div>
            <div className="mt-2">
              <AbilityBar championName={champion.name} />
            </div>
          </div>

          {/* Build Section — Shows live scraped data for S-tier */}
          {champion.tier === 'S' && (
            <div className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg, rgba(15,186,129,0.08), rgba(15,186,129,0.02))', border: '1px solid rgba(15,186,129,0.2)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0fba81]" />
                  <span className="text-[10px] font-semibold text-[#0fba81] uppercase tracking-wider">Build Meta Live</span>
                </div>
                {metaBuild ? (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0fba81] animate-pulse" />
                    <span className="text-[9px] text-[#0fba81] font-medium">
                      {metaBuild.scrapedAt ? timeAgoMeta(metaBuild.scrapedAt) : 'Live'}
                    </span>
                  </div>
                ) : buildLoading ? (
                  <span className="text-[9px] text-[#5b5a56]">Cargando...</span>
                ) : (
                  <span className="text-[9px] text-[#5b5a56]">No disponible</span>
                )}
              </div>
              {metaBuild && metaBuild.coreItems && metaBuild.coreItems.length > 0 ? (
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
              ) : (
                <p className="text-[10px] text-[#5b5a56]">Scrapeando builds del meta actual...</p>
              )}
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
            <p className="text-[10px] text-[#785a28] mb-2.5">Fuentes externas con builds siempre actualizadas:</p>
            <div className="flex items-center gap-2 flex-wrap">
              <a href={extUrls.ugg} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105" style={{ background: 'rgba(0,203,230,0.1)', border: '1px solid rgba(0,203,230,0.3)', color: '#0acbe6' }}>
                <ExternalLink className="w-3 h-3" /> U.GG
              </a>
              <a href={extUrls.opgg} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105" style={{ background: 'rgba(200,170,110,0.1)', border: '1px solid rgba(200,170,110,0.3)', color: '#c8aa6e' }}>
                <ExternalLink className="w-3 h-3" /> OP.GG
              </a>
              <a href={extUrls.mobalytics} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105" style={{ background: 'rgba(232,64,87,0.1)', border: '1px solid rgba(232,64,87,0.3)', color: '#e84057' }}>
                <ExternalLink className="w-3 h-3" /> Mobalytics
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
                        <a href={extUrls.ugg} target="_blank" rel="noopener" className="text-[9px] text-[#5b5a56] hover:text-[#0acbe6] flex items-center gap-0.5 transition-colors">
                          <ExternalLink className="w-2.5 h-2.5" /> U.GG
                        </a>
                        <a href={extUrls.mobalytics} target="_blank" rel="noopener" className="text-[9px] text-[#5b5a56] hover:text-[#0acbe6] flex items-center gap-0.5 transition-colors">
                          <ExternalLink className="w-2.5 h-2.5" /> Mobalytics
                        </a>
                        <a href={extUrls.opgg} target="_blank" rel="noopener" className="text-[9px] text-[#5b5a56] hover:text-[#0acbe6] flex items-center gap-0.5 transition-colors">
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
