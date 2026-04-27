'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Target, Eye, Swords, Shield, ChevronDown, ChevronUp, Zap, AlertOctagon, Map, RotateCcw, Skull, TrendingUp, Crosshair } from 'lucide-react';

// ============ DATA TYPES ============
interface TipCard {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface CategorySection {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  tips: TipCard[];
}

// ============ MECÁNICAS POR CATEGORÍAS ============
const mecanicasCategories: CategorySection[] = [
  {
    id: 'fase-de-linea',
    label: 'Fase de Linea',
    icon: <Swords className="w-4 h-4" />,
    color: '#e84057',
    tips: [
      { title: 'Último Golpe (Last Hit)', description: 'Practica el último golpe a minions en Practice Tool. El oro de last hits es tu fuente principal de income. Apunta a 7+ CS por minuto. En lane fase, prioriza CS sobre trades si tu campeón no tiene ventaja.', icon: <Target className="w-4 h-4 text-[#c8aa6e]" /> },
      { title: 'Manejo de Oleadas', description: 'Slow Push: deja 2-3 caster minions vivos para crear una ola grande. Fast Push: empuja rápido con habilidades para recallar o roam. Freeze: mantén la ola cerca de tu torre para negar CS al rival y ser vulnerable a ganks.', icon: <Shield className="w-4 h-4 text-[#0acbe6]" /> },
      { title: 'Postura de Trading', description: 'Cuando el rival last hittea un minion, es tu ventana para hacer daño (auto + habilidad + retroceder). No trades cuando tu ola está empujando — te vas a recibir daño de minions. Posiciónate entre minions aliados para protección.', icon: <Swords className="w-4 h-4 text-[#e84057]" /> },
      { title: 'Bloqueo de Minions', description: 'Usa tu cuerpo para bloquear minions enemigos y que la ola empuje hacia tu torre. Esto te permite freeze cerca de torre y negar al rival. Cuidado: algunos campeones (Darius, Nasus) benefician mucho de esto.', icon: <Target className="w-4 h-4 text-[#0fba81]" /> },
    ],
  },
  {
    id: 'teamfight',
    label: 'Teamfight',
    icon: <Zap className="w-4 h-4" />,
    color: '#f0c646',
    tips: [
      { title: 'Picos de Poder', description: 'Conoce tus power spikes: niveles (2, 3, 6, 11, 16) y completar items clave. Si vas por debajo, busca una power spike para intentar un play. Si vas por arriba, presiona tu ventaja ANTES de que el rival alcance su spike.', icon: <Zap className="w-4 h-4 text-[#c8aa6e]" /> },
      { title: 'Posicionamiento en Pelea', description: 'Los carries (ADC, Mage) deben estar SIEMPRE detrás del frontline. Esperá a que se gaste el CC antes de entrar. En pelea de equipos, el posicionamiento vale más que la mecánica individual.', icon: <Crosshair className="w-4 h-4 text-[#f0c646]" /> },
      { title: 'Focus en Objetivos', description: 'Después de ganar una teamfight, NO vayas a base enemiga sin objetivo. Toma Dragon, Baron, torres o inhibidor. Muchas partidas se pierden por "irse a buscar kills" después de ganar una pelea.', icon: <Target className="w-4 h-4 text-[#0fba81]" /> },
    ],
  },
  {
    id: 'macro-juego',
    label: 'Macro Juego',
    icon: <Map className="w-4 h-4" />,
    color: '#0acbe6',
    tips: [
      { title: 'Conciencia del Mapa', description: 'Mira el minimap cada 3-5 segundos. Si tu jungler no está en mapa visible, asume que te van a gankear. Si el rival mid falta, avisa a tus lanes. El minimap te da información gratuita — úsala.', icon: <Eye className="w-4 h-4 text-[#f0c646]" /> },
      { title: 'Control de Visión', description: 'Comprá Control Wards cada recall. No pongas wards aleatoriamente — pensá dónde necesitás ver. Antes de objetivar (Dragon/Baron), asegurar visión 30-45 segundos antes. La visión gana partidas.', icon: <Eye className="w-4 h-4 text-[#0acbe6]" /> },
      { title: 'Split Push', description: 'Si tu campeón es bueno 1v1 (Fiora, Yorick, Trundle), split push para crear presión. Tu team debe evitar pelear 4v5 mientras tanto. Comunica cuando te ganken para que tu team tome objetivos en el otro lado.', icon: <Map className="w-4 h-4 text-[#c8aa6e]" /> },
    ],
  },
  {
    id: 'mentalidad',
    label: 'Mentalidad',
    icon: <TrendingUp className="w-4 h-4" />,
    color: '#0fba81',
    tips: [
      { title: 'Gestión de Tilt', description: 'Si perdiste 2 partidas seguidas, tomá un break de 15 minutos. El tilt te hace tomar malas decisiones: overextenderte, forzar plays, flamear. Tu mentalidad es tan importante como tu mecánica.', icon: <RotateCcw className="w-4 h-4 text-[#0fba81]" /> },
      { title: 'Análisis de Muertes', description: 'Después de morir, preguntate: "¿Podría haber evitado esto?" Si la respuesta es sí, fue un error tuyo. Si no (full health 1-shot por un campero), es parte del juego. Enfocate en mejorar lo que podés controlar.', icon: <Skull className="w-4 h-4 text-[#e84057]" /> },
    ],
  },
];

// ============ WARDING POR ROL ============
const wardingTips: TipCard[] = [
  { title: 'Top Lane', description: 'Ward de tríbush (bush superior) para ver ganks del jungler. Controla el río con tu support y jungler. En mid game, wardia la jungle rival para split push seguro. Pink ward en tríbush es staple.', icon: <Eye className="w-4 h-4 text-[#c8aa6e]" /> },
  { title: 'Jungle', description: 'Wardia los buffs rivales para trackear al jungler. Deep wards en su jungle te dan timers de spawn. Vision de río para objetivar Dragon/Baron. Siempre carries control wards.', icon: <Eye className="w-4 h-4 text-[#0acbe6]" /> },
  { title: 'Mid Lane', description: 'Ward de río (ambos lados) y parte de jungle. Cuando tu warden se cae, reemplazalo inmediatamente. Pink ward en una de las brush del río es esencial para mid game teamfights.', icon: <Eye className="w-4 h-4 text-[#e84057]" /> },
  { title: 'ADC', description: 'Tu support debería wardar, pero si vas solo: ward de tríbush y el lane bush. En teamfights, mantén vision del flank. En late game, wardia antes de cada objetivo con tu team.', icon: <Eye className="w-4 h-4 text-[#0fba81]" /> },
  { title: 'Support', description: 'Eres el principal warder del equipo. Control ward en río early, oracle lens en mid/late. Wardia jungle rival para enable plays de tu jungler. En late game, prioriza vision de Baron y bases rivales.', icon: <Eye className="w-4 h-4 text-[#f0c646]" /> },
];

// ============ ERRORES A EVITAR ============
interface ErrorEntry {
  title: string;
  description: string;
  severity: 'critical' | 'common' | 'subtle';
}

const erroresData: ErrorEntry[] = [
  { title: 'Chasear kills por el mapa', description: 'Si un enemigo está con 5% HP y se retira a base, NO lo persigas. Es una trampa. Vas a perder tiempo de farm, objetivar, y probablemente te ganken. La kill no vale tanto como creés.', severity: 'critical' },
  { title: 'No comprar Control Wards', description: 'Cada recall deberías comprar al menos 1 Control Ward (hasta el límite de 3 en el mapa). La visión es el recurso más subestimado del juego. Un ward bien colocado puede prevenir una muerte o enable una kill.', severity: 'common' },
  { title: 'Ignorar el minimap', description: 'Mirar el minimap cada 3-5 segundos es hábito #1 de los jugadores que suben de rank. Si el rival mid no está en tu mapa, no empujes tu ola. Si ves al jungler rival bot, podés empujar top libremente.', severity: 'critical' },
  { title: 'Forzar teamfights sin ventaja', description: 'No inicies peleas si estás detrás en niveles, oro o items. Esperá a que tu equipo alcance sus power spikes. Forzar pelea en desventaja es la forma más rápida de perder una partida que podías ganar.', severity: 'critical' },
  { title: 'No adaptar tu build', description: 'Si el rival ADC tiene 3 kills a los 10 minutos, comprá Armadura. Si su mid lane AP te está oneshoteando, comprá MR. Seguir el mismo build siempre es un error. Adapta tu build al partido.', severity: 'common' },
  { title: 'Flamear a tu equipo', description: 'El flame no mejora nada. Solo baja la moral del equipo y hace que tus compañeros jueguen peor. Usa señales y pings constructivos. Si alguien está jugando mal, ayudalo en lugar de insultarlo.', severity: 'subtle' },
  { title: 'Recall sin cobertura', description: 'Antes de recallar, preguntate: ¿está mi jungler cerca? ¿El rival mid puede roamear? ¿Tengo wards que me avisen si viene alguien? Recalear en mala posición puede costar un dragón o una torre.', severity: 'common' },
  { title: 'No resetear oleadas', description: 'Después de matar al rival o forzarlo a recall, pushea la ola hasta la torre para que se resetee. Si no lo hacés, el rival pierde menos CS y puede freezearte cerca de su torre, negándote oro y experiencia.', severity: 'subtle' },
  { title: 'Usar flash innecesariamente', description: 'Flash tiene 5 minutos de cooldown. No lo uses para asegurar una kill que ya está garantizada. Guardalo para escapes criticos o para iniciar teamfights. Un flash malgastado es una desventaja enorme.', severity: 'common' },
  { title: 'Ignorar el tiempo de objetivos', description: 'Dragon spawnea a los 5:00, Baron a los 20:00, Herald a los 14:00. Saber los timers te permite prepararte con antelación. Muchos equipos pierden objetivos porque no estaban preparados cuando spawnearon.', severity: 'critical' },
];

const severityConfig = {
  critical: { color: '#e84057', bg: 'rgba(232,64,87,0.08)', border: 'rgba(232,64,87,0.25)', label: 'Crítico', icon: <AlertOctagon className="w-3.5 h-3.5" /> },
  common: { color: '#f0c646', bg: 'rgba(240,198,70,0.08)', border: 'rgba(240,198,70,0.25)', label: 'Común', icon: <AlertOctagon className="w-3.5 h-3.5" /> },
  subtle: { color: '#5b8af5', bg: 'rgba(91,138,245,0.08)', border: 'rgba(91,138,245,0.25)', label: 'Sutil', icon: <AlertOctagon className="w-3.5 h-3.5" /> },
};

// ============ COMPONENT ============
export function CoachingTab({ selectedGame }: { selectedGame: string }) {
  const [openCategory, setOpenCategory] = useState<string | null>('fase-de-linea');
  const [openSection, setOpenSection] = useState<string | null>('mecanicas');

  const toggleCategory = (id: string) => setOpenCategory(prev => prev === id ? null : id);
  const toggleSection = (id: string) => setOpenSection(prev => prev === id ? null : id);

  if (selectedGame === 'wildrift') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <GraduationCap className="w-16 h-16 text-[#785a28] mb-4 opacity-30" />
        <h2 className="text-lg font-bold text-[#f0e6d2] mb-2">Coaching para Wild Rift</h2>
        <p className="text-sm text-[#5b5a56] max-w-md">Proximamente: guías de mecánicas, warding y macro adaptadas a Wild Rift.</p>
      </div>
    );
  }

  const topSections = [
    { id: 'mecanicas', label: 'Mecánicas Fundamentales', icon: <Swords className="w-4 h-4" />, count: 10, color: '#e84057' },
    { id: 'warding', label: 'Warding por Rol', icon: <Eye className="w-4 h-4" />, count: 5, color: '#0acbe6' },
    { id: 'errores', label: 'Errores a Evitar', icon: <AlertOctagon className="w-4 h-4" />, count: 10, color: '#f0c646' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(200,170,110,0.2), rgba(200,170,110,0.05))', border: '1.5px solid rgba(200,170,110,0.3)', boxShadow: '0 0 16px rgba(200,170,110,0.15)' }}>
          <GraduationCap className="w-5 h-5 text-[#c8aa6e]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#f0e6d2] lol-title">Entrenador MOBA</h2>
            <span className="text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(200,170,110,0.12)', color: '#c8aa6e', border: '1px solid rgba(200,170,110,0.3)' }}>IA</span>
          </div>
          <p className="text-xs text-[#5b5a56]">Mecánicas, visión, errores comunes y más para mejorar tu juego</p>
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
              <span className="text-sm font-semibold text-[#f0e6d2] flex-1 text-left">{section.label}</span>
              {'count' in section && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(120,90,40,0.1)', color: '#785a28' }}>{section.count}</span>}
              {isOpen ? <ChevronUp className="w-4 h-4 text-[#c8aa6e]" /> : <ChevronDown className="w-4 h-4 text-[#5b5a56]" />}
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
                              <span className="text-xs font-semibold text-[#f0e6d2] flex-1 text-left">{cat.label}</span>
                              <span className="text-[10px] text-[#5b5a56]">{cat.tips.length} tips</span>
                              {isCatOpen ? <ChevronUp className="w-3 h-3" style={{ color: cat.color }} /> : <ChevronDown className="w-3 h-3 text-[#5b5a56]" />}
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
                                        <h4 className="text-xs font-semibold text-[#f0e6d2]">{tip.title}</h4>
                                      </div>
                                      <p className="text-[11px] text-[#a09b8c] leading-relaxed">{tip.description}</p>
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
                    const wColor = 'color' in tip ? tip.color : '#c8aa6e';
                    return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl"
                      style={{ background: `${wColor}06`, border: `1px solid ${wColor}20`, borderLeft: `3px solid ${wColor}` }}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${wColor}15`, border: '1px solid ' + `${wColor}25` }}>
                          <div style={{ color: wColor }}>{tip.icon}</div>
                        </div>
                        <h3 className="text-sm font-semibold text-[#f0e6d2]">{tip.title}</h3>
                      </div>
                      <p className="text-xs text-[#a09b8c] leading-relaxed">{tip.description}</p>
                    </motion.div>
                    );
                  })}

                  {/* ERRORES A EVITAR */}
                  {section.id === 'errores' && (
                    <>
                      {/* Severity legend */}
                      <div className="flex items-center gap-3 px-1 mb-2">
                        {Object.entries(severityConfig).map(([key, cfg]) => (
                          <div key={key} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                            <span className="text-[10px] text-[#5b5a56]">{cfg.label}</span>
                          </div>
                        ))}
                      </div>
                      {erroresData.map((err, i) => {
                        const sev = severityConfig[err.severity];
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
                              <h4 className="text-xs font-semibold text-[#f0e6d2] flex-1">{err.title}</h4>
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold" style={{ background: `${sev.color}15`, color: sev.color, border: `1px solid ${sev.color}30` }}>
                                {sev.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#a09b8c] leading-relaxed">{err.description}</p>
                          </motion.div>
                        );
                      })}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
