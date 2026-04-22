'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Check, X, Clock, Eye, Sparkles, Wrench, BarChart3, Zap } from 'lucide-react';

type IdeaStatus = 'done' | 'cancelled' | 'pending';

interface Idea {
  id: string;
  title: string;
  desc: string;
  status: IdeaStatus;
  category: string;
}

// Based on BRAINSTORM.md — cross-referenced with worklog (tasks 1-10)
const ideas: { category: string; icon: typeof Lightbulb; color: string; items: Idea[] }[] = [
  {
    category: '🔥 Estética & Visual',
    icon: Sparkles,
    color: '#f0c646',
    items: [
      { id: 'E1', title: 'Partículas doradas flotantes', desc: 'Polvo dorado tipo client de LoL. Framer Motion + canvas', status: 'done', category: 'Estética' },
      { id: 'E2', title: 'Font Beaufort para títulos', desc: 'Font oficial de LoL via @font-face para headings', status: 'done', category: 'Estética' },
      { id: 'E3', title: 'Splash Art Gallery en modal', desc: 'Carousel de splashes con parallax y scroll snap', status: 'done', category: 'Estética' },
      { id: 'E4', title: 'Iconos de rol visuales', desc: 'SVG custom: Top/Jungle/Mid/ADC/Support badges', status: 'done', category: 'Estética' },
      { id: 'E5', title: 'Tier List estilo board', desc: 'Grid de avatares clickeables tipo OP.GG', status: 'done', category: 'Estética' },
      { id: 'E6', title: 'Loading screen animada', desc: 'Spinner estilo LoL con logo girando dorado', status: 'done', category: 'Estética' },
      { id: 'E7', title: 'Dark mode variants', desc: 'Blue Essence, Red Essence, Prestige themes', status: 'done', category: 'Estética' },
      { id: 'E8', title: 'Mini-map decorativo', desc: 'Mapa de Summoners Rift como fondo SVG', status: 'done', category: 'Estética' },
      { id: 'E9', title: 'Runas visuales con iconos', desc: 'Iconos reales de Data Dragon en modal', status: 'done', category: 'Estética' },
      { id: 'E10', title: 'Transición entre juegos', desc: 'Flash dorado al cambiar LoL ↔ WR', status: 'done', category: 'Estética' },
      { id: 'E11', title: 'Gold pulse más prominente', desc: 'Animación dorada pulsante en badges S-Tier', status: 'done', category: 'Estética' },
      { id: 'E12', title: 'Skill icons en builds', desc: 'Iconos de habilidades Q/W/E/R en modal', status: 'done', category: 'Estética' },
      { id: 'E13', title: 'Mapa visión interactivo', desc: 'Mini-mapa con ward placement por rol', status: 'done', category: 'Estética' },
      { id: 'E14', title: 'Splash arts en landing', desc: 'Carrusel de splash arts en landing page', status: 'done', category: 'Estética' },
    ],
  },
  {
    category: '🛠️ Mejoras Técnicas',
    icon: Wrench,
    color: '#0acbe6',
    items: [
      { id: 'T1', title: 'Refactor monolito', desc: 'page.tsx (2342 líneas) → 25+ componentes', status: 'done', category: 'Técnico' },
      { id: 'T2', title: 'Limpiar dependencias', desc: '22 paquetes sin uso removidos', status: 'done', category: 'Técnico' },
      { id: 'T3', title: 'Data Dragon version dinámico', desc: 'Sync automático desde Riot CDN', status: 'done', category: 'Técnico' },
      { id: 'T4', title: 'Fix TypeScript', desc: 'ignoreBuildErrors removido, 0 errores', status: 'done', category: 'Técnico' },
      { id: 'T5', title: 'Usar Prisma', desc: 'Migrar data a SQLite para edición via UI', status: 'cancelled', category: 'Técnico' },
      { id: 'T6', title: 'Accessibility (a11y)', desc: 'ARIA labels, keyboard nav, focus trapping', status: 'done', category: 'Técnico' },
      { id: 'T7', title: 'reactStrictMode: true', desc: 'Activado para cachar bugs', status: 'done', category: 'Técnico' },
      { id: 'T8', title: 'Skeleton loaders', desc: 'shadcn Skeleton para loading states', status: 'done', category: 'Técnico' },
      { id: 'T9', title: 'Toast notifications', desc: 'Sonner para feedback (copiar, buscar)', status: 'done', category: 'Técnico' },
      { id: 'T10', title: 'Error boundaries', desc: 'ErrorBoundary component', status: 'done', category: 'Técnico' },
      { id: 'T11', title: 'SEO / Meta tags', desc: 'Open Graph, Twitter Cards, meta description', status: 'done', category: 'Técnico' },
      { id: 'T12', title: 'Imagenes optimizadas', desc: 'next/image para splash arts y champion icons', status: 'done', category: 'Técnico' },
    ],
  },
  {
    category: '📊 Data & Contenido',
    icon: BarChart3,
    color: '#0fba81',
    items: [
      { id: 'D1', title: 'Parches reales', desc: 'Notas desde CommunityDragon API', status: 'done', category: 'Data' },
      { id: 'D2', title: '100% datos completos', desc: 'aiAnalysis + runes + counters para todos los campeones', status: 'done', category: 'Data' },
      { id: 'D3', title: 'Pro Picks reales', desc: 'Scrapear de gol.gg u Oracle Elixir', status: 'pending', category: 'Data' },
      { id: 'D4', title: 'Counters con datos reales', desc: 'WR de matchups (champion.gg)', status: 'pending', category: 'Data' },
      { id: 'D5', title: 'Tier List automático', desc: 'Calcular tier basado en WR + Pick + Ban reales', status: 'pending', category: 'Data' },
      { id: 'D6', title: 'Runas populares', desc: 'Top 3 rune pages desde CommunityDragon', status: 'pending', category: 'Data' },
    ],
  },
  {
    category: '⚡ Funcionalidades',
    icon: Zap,
    color: '#e84057',
    items: [
      { id: 'F1', title: 'Chat IA flotante', desc: 'Botón "Pregúntale al Sage" conectado a IA', status: 'cancelled', category: 'Funcional' },
      { id: 'F2', title: 'Comparador de Campeones', desc: 'Side-by-side stats, WR, counters', status: 'pending', category: 'Funcional' },
      { id: 'F3', title: 'Builder de Comp', desc: '5 campeones → analizar synergies y WR', status: 'cancelled', category: 'Funcional' },
      { id: 'F4', title: 'Draft Assistant', desc: '¿Qué pick contra X? ¿Qué sinergia con Y?', status: 'cancelled', category: 'Funcional' },
      { id: 'F5', title: 'Counter Picker Tool', desc: 'Campeón enemigo → top 3 counters con WR', status: 'cancelled', category: 'Funcional' },
      { id: 'F6', title: 'Alertas de Parche', desc: 'Badge "NUEVO PARCHE" cuando cambia versión', status: 'done', category: 'Funcional' },
      { id: 'F7', title: 'Ranked Distribution', desc: 'Distribución de ranks por región', status: 'pending', category: 'Funcional' },
      { id: 'F8', title: 'Meta Tracker', desc: 'Gráfico WR del campeón parche a parche', status: 'pending', category: 'Funcional' },
      { id: 'F9', title: 'Perfil Real con Riot API', desc: 'Match history, masteries, LP gains', status: 'pending', category: 'Funcional' },
      { id: 'F10', title: 'PWA', desc: 'manifest.json + service worker', status: 'pending', category: 'Funcional' },
      { id: 'F11', title: 'Favoritos (localStorage)', desc: 'Marcar campeones ★, filtro en Tier List', status: 'done', category: 'Funcional' },
      { id: 'F12', title: 'Copy Build to Clipboard', desc: 'Botón que copia items como texto', status: 'done', category: 'Funcional' },
      { id: 'F13', title: 'Share Link', desc: 'URL compartible /champion/yasuo', status: 'pending', category: 'Funcional' },
      { id: 'F14', title: 'Onboarding / Tour', desc: 'Tooltips guiados por las tabs', status: 'pending', category: 'Funcional' },
      { id: 'F15', title: 'Búsqueda predictiva', desc: 'Autocomplete al escribir nombre', status: 'done', category: 'Funcional' },
      { id: 'F16', title: 'Historial de vistas', desc: '"Últimos vistos" en Tier List', status: 'pending', category: 'Funcional' },
      { id: 'F17', title: 'Temporadas por campeón', desc: 'Early/Mid/Late game power curves', status: 'pending', category: 'Funcional' },
      { id: 'F18', title: 'Notas personales', desc: 'Textarea editable en modal (localStorage)', status: 'pending', category: 'Funcional' },
    ],
  },
  {
    category: '🎯 Ideas de Competencia (Research Abril 2026)',
    icon: Eye,
    color: '#c8aa6e',
    items: [
      { id: 'C1', title: 'Build Engine contextual', desc: 'Recomendaciones de items que se adaptan al estado de la partida (composición enemiga, gold, timing). Inspirado por buildzcrank + LoLalytics.', status: 'pending', category: 'Competencia' },
      { id: 'C2', title: 'Draft Coach con scoring', desc: 'Synergy score entre picks del equipo, análisis AP/AD split, counter suggestions con confianza %. Inspirado por iTero + ProComps (300K+ descargas).', status: 'pending', category: 'Competencia' },
      { id: 'C3', title: 'Radar chart de habilidades', desc: '8 skills en radar chart (CS, map awareness, trading, objectives). ML para analizar match history. Inspirado por Mobalytics GPI.', status: 'pending', category: 'Competencia' },
      { id: 'C4', title: 'WR Analytics dedicado', desc: 'Plataforma Wild Rift con tier lists, builds, draft assistant. Mercado masivamente desatendido (solo 2-3 herramientas serias).', status: 'pending', category: 'Competencia' },
      { id: 'C5', title: 'Sample size badges', desc: 'Cada stat muestra el N de partidas debajo (LoLalytics-style). Transparencia metodológica para confianza del usuario.', status: 'pending', category: 'Competencia' },
      { id: 'C6', title: 'Tier lists comunitarios', desc: 'Usuarios crean y publican tier lists propias. Votación y comparación vs tier list data-driven. Inspirado por TierMaker.', status: 'pending', category: 'Competencia' },
      { id: 'C7', title: 'Meta Tracker parche a parche', desc: 'Gráfico de evolución WR del campeón a lo largo de parches (LoLalytics tiene patch history graphs). Trend arrows.', status: 'pending', category: 'Competencia' },
      { id: 'C8', title: 'Matchup stats con significancia', desc: 'WR de matchups con flags de significancia estadística y sample sizes. Distintivo de LoLalytics vs competidores.', status: 'pending', category: 'Competencia' },
    ],
  },
];

const statusConfig: Record<IdeaStatus, { label: string; color: string; bg: string; icon: typeof Check }> = {
  done: { label: 'Listo', color: '#0fba81', bg: 'rgba(15,186,129,0.1)', icon: Check },
  cancelled: { label: 'Cancelado', color: '#5b5a56', bg: 'rgba(91,90,86,0.08)', icon: X },
  pending: { label: 'Pendiente', color: '#f0c646', bg: 'rgba(240,198,70,0.08)', icon: Clock },
};

export function IdeasTab() {
  const totalDone = ideas.reduce((sum, cat) => sum + cat.items.filter(i => i.status === 'done').length, 0);
  const totalCancelled = ideas.reduce((sum, cat) => sum + cat.items.filter(i => i.status === 'cancelled').length, 0);
  const totalPending = ideas.reduce((sum, cat) => sum + cat.items.filter(i => i.status === 'pending').length, 0);
  const total = totalDone + totalCancelled + totalPending;
  const pct = Math.round((totalDone / total) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Lightbulb className="w-5 h-5 text-[#f0c646]" />
        <div>
          <h2 className="text-lg font-bold text-[#f0e6d2]">Lluvia de Ideas</h2>
          <p className="text-xs text-[#5b5a56]">Backlog completo de ideas y mejoras — {totalDone}/{total} completadas ({pct}%)</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(30,35,40,0.5)', border: '1px solid rgba(120,90,40,0.15)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#a09b8c] font-medium">Progreso General</span>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-[#0fba81]" />{totalDone} listas</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#f0c646]" />{totalPending} pendientes</span>
            <span className="flex items-center gap-1"><X className="w-3 h-3 text-[#5b5a56]" />{totalCancelled} canceladas</span>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(120,90,40,0.12)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #0fba81, #0acbe6)' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {ideas.map((cat, catIdx) => {
          const catDone = cat.items.filter(i => i.status === 'done').length;
          const catTotal = cat.items.length;
          return (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.05 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(120,90,40,0.15)' }}>
                <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                <h3 className="text-sm font-semibold text-[#f0e6d2]">{cat.category}</h3>
                <span className="text-[10px] text-[#5b5a56] ml-auto">{catDone}/{catTotal} completadas</span>
              </div>
              <div className="divide-y divide-[#785a28]/10">
                {cat.items.map(idea => {
                  const cfg = statusConfig[idea.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={idea.id}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#1e2328]/30"
                      style={idea.status === 'cancelled' ? { opacity: 0.5 } : {}}
                    >
                      <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                        <StatusIcon className="w-3 h-3" style={{ color: cfg.color }} />
                      </div>
                      <span className="text-[10px] font-mono text-[#5b5a56] shrink-0 w-5">{idea.id}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-medium ${idea.status === 'cancelled' ? 'line-through text-[#5b5a56]' : 'text-[#f0e6d2]'}`}>
                          {idea.title}
                        </h4>
                        <p className="text-[10px] text-[#5b5a56] mt-0.5 truncate">{idea.desc}</p>
                      </div>
                      <span
                        className="text-[9px] font-medium px-1.5 py-0.5 rounded shrink-0"
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
