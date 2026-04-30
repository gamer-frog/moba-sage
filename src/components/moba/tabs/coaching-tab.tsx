'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Swords, Eye, ChevronDown, ChevronUp, AlertOctagon, Target } from 'lucide-react';
import {
  mecanicasCategories,
  wardingTips,
  erroresData,
  roleTipsData,
  severityConfig,
  ERROLO_COLORS,
} from '@/data/coaching-data';

// Group errors by elo
function groupErrorsByElo(errors: { elo: string; severity: string; title: string; description: string }[]): Record<string, typeof errors> {
  const eloOrder = ['Hierro/Plata', 'Oro', 'Platino', 'Esmeralda/Diamante', 'Maestro'];
  const grouped: Record<string, typeof errors> = {};
  eloOrder.forEach(e => grouped[e] = []);
  errors.forEach(err => {
    if (!grouped[err.elo]) grouped[err.elo] = [];
    grouped[err.elo].push(err);
  });
  return grouped;
}

// ============ COMPONENT ============
export function CoachingTab({ selectedGame }: { selectedGame: string | null }) {
  const [openCategory, setOpenCategory] = useState<string | null>('fase-de-linea');
  const [openRoleCategory, setOpenRoleCategory] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>('mecanicas');

  // Static grouping — avoid re-grouping on every render
  const groupedErrores = useMemo(() => groupErrorsByElo(erroresData), []);

  const toggleCategory = (id: string) => setOpenCategory(prev => prev === id ? null : id);
  const toggleRoleCategory = (id: string) => setOpenRoleCategory(prev => prev === id ? null : id);
  const toggleSection = (id: string) => setOpenSection(prev => prev === id ? null : id);

  if (selectedGame === 'wildrift') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <GraduationCap className="w-16 h-16 text-lol-gold-dark mb-4 opacity-30" />
        <h2 className="text-lg font-bold text-lol-text mb-2">Coaching para Wild Rift</h2>
        <p className="text-sm text-lol-dim max-w-md">Proximamente: guías de mecánicas, warding y macro adaptadas a Wild Rift.</p>
      </div>
    );
  }

  const topSections = [
    { id: 'mecanicas', label: 'Mecánicas Fundamentales', icon: <Swords className="w-4 h-4" />, count: 12, color: '#e84057' },
    { id: 'warding', label: 'Warding por Rol', icon: <Eye className="w-4 h-4" />, count: 5, color: '#0acbe6' },
    { id: 'roleTips', label: 'Tips por Rol', icon: <Target className="w-4 h-4" />, count: 15, color: '#c8aa6e' },
    { id: 'errores', label: 'Errores a Evitar', icon: <AlertOctagon className="w-4 h-4" />, count: 10, color: '#f0c646' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(200,170,110,0.2), rgba(200,170,110,0.05))', border: '1.5px solid rgba(200,170,110,0.3)', boxShadow: '0 0 16px rgba(200,170,110,0.15)' }}>
          <GraduationCap className="w-5 h-5 text-lol-gold" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-lol-text lol-title">Entrenador MOBA</h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(200,170,110,0.12)', color: '#c8aa6e', border: '1px solid rgba(200,170,110,0.3)' }}>IA</span>
          </div>
          <p className="text-xs text-lol-dim">Mecánicas, visión, errores comunes y más para mejorar tu juego</p>
        </div>
      </div>

      {/* Top-level sections */}
      {topSections.map(section => {
        const isOpen = openSection === section.id;
        const btnStyle = {
          background: isOpen ? 'rgba(200,170,110,0.08)' : 'rgba(30,35,40,0.5)',
          border: isOpen ? '1px solid rgba(200,170,110,0.25)' : '1px solid rgba(120,90,40,0.15)',
        };

        return (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer"
              style={btnStyle}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: isOpen ? 'rgba(200,170,110,0.15)' : 'rgba(200,170,110,0.06)', border: '1px solid ' + (isOpen ? 'rgba(200,170,110,0.3)' : 'rgba(120,90,40,0.15)') }}>
                {section.icon}
              </div>
              <span className="text-sm font-semibold text-lol-text flex-1 text-left">{section.label}</span>
              {'count' in section && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(120,90,40,0.1)', color: '#785a28' }}>{section.count}</span>}
              {isOpen ? <ChevronUp className="w-4 h-4 text-lol-gold" /> : <ChevronDown className="w-4 h-4 text-lol-dim" />}
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 space-y-2"
                >
                  {/* MECÁNICAS CON SUB-CATEGORÍAS */}
                  {section.id === 'mecanicas' && (
                    <>
                      {mecanicasCategories.map(cat => {
                        const isCatOpen = openCategory === cat.id;
                        return (
                          <div key={cat.id}>
                            <button
                              onClick={() => toggleCategory(cat.id)}
                              className="w-full flex items-center gap-2 p-2.5 rounded-lg transition-all cursor-pointer"
                              style={{
                                background: isCatOpen ? `${cat.color}10` : 'rgba(20,25,32,0.5)',
                                border: `1px solid ${isCatOpen ? `${cat.color}30` : 'rgba(120,90,40,0.1)'}`,
                              }}
                            >
                              <div style={{ color: isCatOpen ? cat.color : '#a09b8c' }}>{cat.icon}</div>
                              <span className="text-xs font-semibold text-lol-text flex-1 text-left">{cat.label}</span>
                              <span className="text-[10px] text-lol-dim">{cat.tips.length} tips</span>
                              {isCatOpen ? <ChevronUp className="w-3 h-3" style={{ color: cat.color }} /> : <ChevronDown className="w-3 h-3 text-lol-dim" />}
                            </button>

                            <AnimatePresence>
                              {isCatOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="mt-1.5 ml-1 space-y-1.5"
                                  style={{ borderLeft: `2px solid ${cat.color}20` }}
                                >
                                  {cat.tips.map((tip, i) => (
                                    <motion.div
                                      key={i}
                                      initial={{ opacity: 0, x: -8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: i * 0.04 }}
                                      className="p-3 rounded-lg"
                                      style={{ background: `${cat.color}04`, border: '1px solid ' + `${cat.color}15`, borderLeft: `2px solid ${cat.color}` }}
                                    >
                                      <div className="flex items-center gap-2 mb-1.5">
                                        {tip.icon}
                                        <h4 className="text-xs font-semibold text-lol-text">{tip.title}</h4>
                                      </div>
                                      <p className="text-[11px] text-lol-muted leading-relaxed">{tip.description}</p>
                                    </motion.div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* WARDING */}
                  {section.id === 'warding' && wardingTips.map((tip, i) => {
                    return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl"
                      style={{ background: `${tip.color}06`, border: `1px solid ${tip.color}20`, borderLeft: `3px solid ${tip.color}` }}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${tip.color}15`, border: '1px solid ' + `${tip.color}25` }}>
                          <div style={{ color: tip.color }}>{tip.icon}</div>
                        </div>
                        <h3 className="text-sm font-semibold text-lol-text">{tip.title}</h3>
                      </div>
                      <p className="text-xs text-lol-muted leading-relaxed">{tip.description}</p>
                    </motion.div>
                    );
                  })}

                  {/* TIPS POR ROL */}
                  {section.id === 'roleTips' && roleTipsData.map((roleSection) => (
                    <div key={roleSection.role}>
                      <button
                        onClick={() => toggleRoleCategory(`role-${roleSection.role}`)}
                        className="w-full flex items-center gap-2 p-2.5 rounded-lg transition-all cursor-pointer"
                        style={{
                          background: openRoleCategory === `role-${roleSection.role}` ? `${roleSection.color}10` : 'rgba(20,25,32,0.5)',
                          border: `1px solid ${openRoleCategory === `role-${roleSection.role}` ? `${roleSection.color}30` : 'rgba(120,90,40,0.1)'}`,
                        }}
                      >
                        <div style={{ color: openRoleCategory === `role-${roleSection.role}` ? roleSection.color : '#a09b8c' }}>{roleSection.icon}</div>
                        <span className="text-xs font-semibold text-lol-text flex-1 text-left">{roleSection.role}</span>
                        <span className="text-[10px] text-lol-dim">{roleSection.tips.length} tips</span>
                        {openRoleCategory === `role-${roleSection.role}` ? <ChevronUp className="w-3 h-3" style={{ color: roleSection.color }} /> : <ChevronDown className="w-3 h-3 text-lol-dim" />}
                      </button>
                      <AnimatePresence>
                        {openRoleCategory === `role-${roleSection.role}` && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="mt-1.5 ml-1 space-y-1.5"
                            style={{ borderLeft: `2px solid ${roleSection.color}20` }}
                          >
                            {roleSection.tips.map((tip, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="p-3 rounded-lg"
                                style={{ background: `${roleSection.color}04`, border: '1px solid ' + `${roleSection.color}15`, borderLeft: `2px solid ${roleSection.color}` }}
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  {tip.icon}
                                  <h4 className="text-xs font-semibold text-lol-text">{tip.title}</h4>
                                </div>
                                <p className="text-[11px] text-lol-muted leading-relaxed">{tip.description}</p>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  {/* ERRORES A EVITAR — POR ELO */}
                  {section.id === 'errores' && (() => {
                    return (
                      <>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap px-1 mb-3">
                          {Object.entries(severityConfig).map(([key, cfg]) => (
                            <div key={key} className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                              <span className="text-[10px] text-lol-dim">{cfg.label}</span>
                            </div>
                          ))}
                        </div>
                        {Object.entries(groupedErrores).map(([elo, errs]) => {
                          const eloCfg = ERROLO_COLORS[elo] || ERROLO_COLORS['Oro'];
                          return (
                            <div key={elo} className="mb-3">
                              <div className="flex items-center gap-2 mb-2 px-1">
                                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: eloCfg.gradient, boxShadow: `0 0 8px ${eloCfg.text}30` }}>
                                  <span className="text-[10px] font-black text-lol-bg">{elo.charAt(0)}</span>
                                </div>
                                <span className="text-xs font-bold" style={{ color: eloCfg.text }}>{elo}</span>
                                <span className="text-[10px] text-lol-dim">{errs.length} error{errs.length > 1 ? 'es' : ''}</span>
                              </div>
                              <div className="space-y-1.5">
                                {errs.map((err, i) => {
                                  const sev = severityConfig[err.severity as keyof typeof severityConfig];
                                  return (
                                    <motion.div
                                      key={i}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: i * 0.04 }}
                                      className="p-3.5 rounded-xl"
                                      style={{ background: sev.bg, border: `1px solid ${sev.border}` }}
                                    >
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <div style={{ color: sev.color }}>{sev.icon}</div>
                                        <h4 className="text-xs font-semibold text-lol-text flex-1">{err.title}</h4>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: `${sev.color}15`, color: sev.color, border: `1px solid ${sev.color}30` }}>
                                          {sev.label}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-lol-muted leading-relaxed">{err.description}</p>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
