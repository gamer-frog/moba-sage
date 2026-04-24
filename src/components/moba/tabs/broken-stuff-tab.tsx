'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Sparkles, Wrench, ChevronRight, Newspaper, TrendingUp, TrendingDown, Shield, Zap, Clock, ArrowUpCircle, ArrowDownCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { SplashArtIcon, TinyChampionIcon } from '../champion-icon';
import { RoleBadge, CategoryBadge } from '../badges';
import { ItemIcon } from '../item-icon';
import { parseBuildItems } from '../helpers';
import type { Champion, AiInsight, GameSelection } from '../types';

// ---- Patch Analysis types ----
interface PatchAnalysis {
  lastUpdated: string;
  currentPatch: string;
  nextPatch: string;
  patchDate: string;
  keyChanges: string[];
  systemChanges: string[];
  brokenChampions: { name: string; reason: string; tier: string }[];
  fallenChampions: { name: string; reason: string; tier: string }[];
  itemImpact: { winners: string[]; losers: string[] };
  summary: string;
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    'S': { bg: 'rgba(200,170,110,0.15)', color: '#c8aa6e', border: 'rgba(200,170,110,0.4)' },
    'A+': { bg: 'rgba(200,170,110,0.1)', color: '#c8aa6e', border: 'rgba(200,170,110,0.3)' },
    'A': { bg: 'rgba(10,203,230,0.1)', color: '#0acbe6', border: 'rgba(10,203,230,0.3)' },
    'B': { bg: 'rgba(232,64,87,0.1)', color: '#e84057', border: 'rgba(232,64,87,0.3)' },
  };
  const c = colors[tier] || colors['A'];
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black"
      style={{ backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {tier}
    </span>
  );
}

function PatchAnalysisSection({ analysis }: { analysis: PatchAnalysis }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mb-2"
    >
      {/* Summary Card */}
      <div className="glass-card rounded-xl p-4 relative overflow-hidden" style={{ border: '1px solid rgba(200,170,110,0.25)' }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #c8aa6e, transparent)' }} />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(200,170,110,0.15)', border: '1px solid rgba(200,170,110,0.25)' }}>
            <Newspaper className="w-4 h-4 text-[#c8aa6e]" />
          </div>
          <div className="flex-1">
            <h3 className="lol-title text-sm text-[#f0e6d2]">ANÁLISIS DE PARCHE</h3>
            <p className="text-[10px] text-[#5b5a56]">
              Parche actual: <span className="font-mono text-[#c8aa6e]">{analysis.currentPatch}</span>
              {' · '}
              Próximo: <span className="font-mono text-[#0acbe6]">{analysis.nextPatch}</span>
              {analysis.patchDate && (
                <span className="text-[#5b5a56]"> · {analysis.patchDate}</span>
              )}
            </p>
          </div>
        </div>
        <p className="text-xs text-[#a09b8c] leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Two columns: Broken + Fallen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Broken Champions */}
        <div className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(15,186,129,0.15)' }}>
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpCircle className="w-4 h-4 text-[#0fba81]" />
            <span className="lol-label text-xs font-semibold text-[#0fba81]">¿Quién Queda Roto?</span>
          </div>
          <div className="space-y-2.5">
            {analysis.brokenChampions.map((champ, i) => (
              <motion.div
                key={champ.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0" style={{ border: '1.5px solid #0fba8180' }}>
                  <TinyChampionIcon name={champ.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#f0e6d2]">{champ.name}</span>
                    <TierBadge tier={champ.tier} />
                  </div>
                  <p className="text-[10px] text-[#a09b8c] leading-snug mt-0.5">{champ.reason}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Fallen Champions */}
        <div className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(232,64,87,0.15)' }}>
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownCircle className="w-4 h-4 text-[#e84057]" />
            <span className="lol-label text-xs font-semibold text-[#e84057]">¿Quién Cayó?</span>
          </div>
          <div className="space-y-2.5">
            {analysis.fallenChampions.map((champ, i) => (
              <motion.div
                key={champ.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.15 }}
                className="flex items-start gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0" style={{ border: '1.5px solid #e8405780' }}>
                  <TinyChampionIcon name={champ.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#f0e6d2]">{champ.name}</span>
                    <TierBadge tier={champ.tier} />
                  </div>
                  <p className="text-[10px] text-[#a09b8c] leading-snug mt-0.5">{champ.reason}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Changes */}
      <div className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(120,90,40,0.15)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-[#f0c646]" />
          <span className="lol-label text-xs font-semibold text-[#f0c646]">Cambios Clave del Parche</span>
        </div>
        <div className="space-y-2">
          {analysis.keyChanges.map((change, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-2"
            >
              <div className="w-1 h-1 rounded-full bg-[#f0c646]/60 shrink-0 mt-1.5" />
              <span className="text-[11px] text-[#a09b8c] leading-snug">{change}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* System Changes */}
      <div className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(120,90,40,0.1)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-[#5b8af5]" />
          <span className="lol-label text-xs font-semibold text-[#5b8af5]">Cambios de Sistemas</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {analysis.systemChanges.map((change, i) => (
            <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-[10px] text-[#a09b8c]" style={{ background: 'rgba(91,138,245,0.06)', border: '1px solid rgba(91,138,245,0.12)' }}>
              {change}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function BrokenStuffTab({
  champions, insights, loading, selectedGame,
}: { champions: Champion[]; insights: AiInsight[]; loading: boolean; selectedGame: GameSelection }) {
  const [patchAnalysis, setPatchAnalysis] = useState<PatchAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const res = await fetch('/patch-analysis.json');
        if (res.ok) {
          const data: PatchAnalysis = await res.json();
          setPatchAnalysis(data);
        }
      } catch (err) {
        console.error('Error loading patch analysis:', err);
      } finally {
        setAnalysisLoading(false);
      }
    }
    fetchAnalysis();
  }, []);

  const gameChampions = champions.filter(c => {
    if (selectedGame === 'lol') return c.game === 'LoL';
    if (selectedGame === 'wildrift') return c.game === 'WR';
    return true;
  });
  const metaInsights = insights.filter(i => {
    const champInGame = gameChampions.some(c => c.name === i.champion);
    return (i.category === 'meta' || i.category === 'buff') && champInGame;
  });
  const sTierChamps = gameChampions.filter(c => c.tier === 'S');
  const aTierChamps = gameChampions.filter(c => c.tier === 'A').slice(0, 12);
  const bTierChamps = gameChampions.filter(c => c.tier === 'B');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-[#e84057]" />
        <div>
          <h2 className="lol-title text-lg text-[#f0e6d2]">Cosas Rotas & Combos OP</h2>
          <p className="text-xs text-[#5b5a56]">Campeones y combinaciones que están dominando el meta</p>
        </div>
      </div>

      {/* PATCH ANALYSIS SECTION */}
      {analysisLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      ) : patchAnalysis ? (
        <PatchAnalysisSection analysis={patchAnalysis} />
      ) : null}

      {!loading && sTierChamps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="lol-title text-sm" style={{ color: '#c8aa6e', textShadow: '0 0 10px rgba(200,170,110,0.3)' }}>S TIER</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(200,170,110,0.3), transparent)' }} />
            <Badge className="bg-[#e84057]/20 text-[#e84057] border border-[#e84057]/30 text-[10px]">
              <AlertTriangle className="w-3 h-3 mr-1" />
              ROTO OP
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sTierChamps.map((champ, idx) => {
              const mainBuild = champ.builds?.[0];
              const buildItems = mainBuild ? parseBuildItems(mainBuild.items) : [];
              return (
                <motion.div
                  key={champ.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card rounded-xl overflow-hidden group"
                  style={{ border: '1px solid rgba(200,170,110,0.2)' }}
                >
                  <div className="flex items-start gap-3 p-4">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden" style={{ border: '2.5px solid #c8aa6e', boxShadow: '0 0 20px rgba(200,170,110,0.2), 0 0 40px rgba(200,170,110,0.05)' }}>
                        <SplashArtIcon name={champ.name} />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black" style={{ backgroundColor: '#c8aa6e', color: '#0a0e1a' }}>S</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-[#f0e6d2] text-sm truncate">{champ.name}</h3>
                        <RoleBadge role={champ.role} />
                      </div>
                      <div className="flex items-center gap-3 text-[11px] mb-1">
                        <span className="font-mono font-bold" style={{ color: champ.winRate >= 53 ? '#0acbe6' : '#c8aa6e' }}>{champ.winRate}% WR</span>
                        <span className="text-[#5b5a56]">|</span>
                        <span className="font-mono text-[#a09b8c]">{champ.pickRate}% Pick</span>
                        {champ.banRate > 5 && (<><span className="text-[#5b5a56]">|</span><span className="font-mono text-[#e84057]">{champ.banRate}% Ban</span></>)}
                      </div>
                    </div>
                  </div>
                  {mainBuild && (
                    <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(200,170,110,0.1)', background: 'rgba(200,170,110,0.03)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Wrench className="w-3 h-3 text-[#c8aa6e]" />
                        <span className="lol-label text-[10px] text-[#c8aa6e]">Build Roto</span>
                        <span className="text-[9px] font-mono text-[#0acbe6] ml-auto">{mainBuild.winRate}% WR</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap overflow-hidden max-h-[52px]">
                        {buildItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <ItemIcon name={item} />
                            <span className="text-[9px] text-[#a09b8c] whitespace-nowrap">{item}</span>
                            {i < buildItems.length - 1 && (
                              <svg className="w-3 h-3 text-[#785a28]/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(champ.counterPick || champ.synergy) && (
                    <div className="grid grid-cols-2 gap-2 px-4 py-2" style={{ borderTop: '1px solid rgba(120,90,40,0.1)' }}>
                      {champ.counterPick && (
                        <div className="min-w-0">
                          <span className="lol-label text-[9px] text-[#e84057]">Counters</span>
                          <p className="text-[10px] text-[#a09b8c] mt-0.5 truncate" title={champ.counterPick}>{champ.counterPick}</p>
                        </div>
                      )}
                      {champ.synergy && (
                        <div className="min-w-0">
                          <span className="lol-label text-[9px] text-[#0acbe6]">Sinergia</span>
                          <p className="text-[10px] text-[#a09b8c] mt-0.5 truncate" title={champ.synergy}>{champ.synergy}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && aTierChamps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="lol-title text-sm" style={{ color: '#0acbe6', textShadow: '0 0 10px rgba(10,203,230,0.3)' }}>A TIER</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(10,203,230,0.3), transparent)' }} />
            <span className="text-[10px] text-[#5b5a56]">También fuertes</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {aTierChamps.map((champ, idx) => (
              <motion.div
                key={champ.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-start gap-3 p-3 rounded-xl group cursor-pointer transition-all duration-300"
                style={{
                  background: 'rgba(10,203,230,0.04)',
                  border: '1px solid rgba(10,203,230,0.12)',
                }}
                whileHover={{
                  borderColor: 'rgba(200,170,110,0.5)',
                  boxShadow: '0 0 20px rgba(200,170,110,0.15), 0 0 40px rgba(200,170,110,0.05)',
                }}
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(200,170,110,0.3)]"
                    style={{ border: '2px solid #0acbe680' }}>
                    <SplashArtIcon name={champ.name} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black" style={{ backgroundColor: '#0acbe6', color: '#0a0e1a' }}>A</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#f0e6d2] truncate group-hover:text-[#c8aa6e] transition-colors">{champ.name}</p>
                  <p className="text-[9px] text-[#5b5a56] mb-0.5">{champ.role}</p>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-mono font-semibold" style={{ color: champ.winRate >= 51 ? '#0acbe6' : '#a09b8c' }}>{champ.winRate}% WR</span>
                    <span className="text-[#5b5a56]">·</span>
                    <span className="font-mono text-[#a09b8c]">{champ.pickRate}% Pick</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!loading && bTierChamps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="lol-title text-sm" style={{ color: '#0fba81', textShadow: '0 0 10px rgba(15,186,129,0.3)' }}>B TIER</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(15,186,129,0.3), transparent)' }} />
            <span className="text-[10px] text-[#5b5a56]">Jugables</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {bTierChamps.map(champ => (
              <motion.div key={champ.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 p-2 rounded-lg" style={{ background: 'rgba(15,186,129,0.03)', border: '1px solid rgba(15,186,129,0.1)' }}>
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0" style={{ border: '1.5px solid #0fba8150' }}>
                  <TinyChampionIcon name={champ.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-[#f0e6d2] truncate">{champ.name}</p>
                  <p className="text-[9px] text-[#5b5a56] font-mono">{champ.winRate}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#f0c646]" />
          <span className="lol-label text-xs font-semibold text-[#a09b8c]">Insights de IA</span>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(240,198,70,0.2), transparent)' }} />
          <span className="text-[10px] text-[#5b5a56]">{metaInsights.length} insights</span>
        </div>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-5 space-y-3 mb-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-2 w-32 rounded-full" />
            </div>
          ))
        ) : (
          <div className="space-y-3">
            {metaInsights.map(insight => (
              <motion.div key={insight.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="glass-card rounded-xl p-4 border-l-4 hover:border-[#c8aa6e]/30 transition-colors" style={{ borderLeftColor: insight.category === 'meta' ? '#f0c646' : '#0acbe6' }}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <TinyChampionIcon name={insight.champion} />
                      <span className="font-semibold text-[#f0e6d2] text-sm">{insight.champion}</span>
                      <CategoryBadge category={insight.category} />
                      {insight.category === 'meta' && (
                        <Badge className="bg-[#e84057]/20 text-[#e84057] border border-[#e84057]/30 text-[10px]">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          ROTO OP
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#a09b8c] leading-relaxed mb-3">{insight.content}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-[10px] text-[#5b5a56] shrink-0">Confianza</span>
                        <Progress value={insight.confidence * 100} className="h-1.5 flex-1" />
                        <span className="text-[10px] font-mono text-[#c8aa6e] shrink-0">{(insight.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#785a28] shrink-0 mt-1" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
