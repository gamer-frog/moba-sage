'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Check, X, Clock, Eye, Sparkles, Wrench, BarChart3, Zap, Map } from 'lucide-react';

type IdeaStatus = 'done' | 'cancelled' | 'pending';

interface Idea {
  id: string;
  title: string;
  desc: string;
  status: IdeaStatus;
  category?: string;
}

type SubTab = 'ideas' | 'roadmap';

// ---- IDEAS DATA (from ideas-tab.tsx) ----
const ideasData: { category: string; icon: typeof Lightbulb; color: string; items: Idea[] }[] = [
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
      { id: 'C1', title: 'Build Engine contextual', desc: 'Recomendaciones de items que se adaptan al estado de la partida', status: 'pending', category: 'Competencia' },
      { id: 'C2', title: 'Draft Coach con scoring', desc: 'Synergy score entre picks del equipo, counter suggestions', status: 'pending', category: 'Competencia' },
      { id: 'C3', title: 'Radar chart de habilidades', desc: '8 skills en radar chart (CS, map awareness, trading)', status: 'pending', category: 'Competencia' },
      { id: 'C4', title: 'WR Analytics dedicado', desc: 'Plataforma Wild Rift con tier lists, builds, draft assistant', status: 'pending', category: 'Competencia' },
      { id: 'C5', title: 'Sample size badges', desc: 'Cada stat muestra el N de partidas debajo', status: 'pending', category: 'Competencia' },
      { id: 'C6', title: 'Tier lists comunitarios', desc: 'Usuarios crean y publican tier lists propias', status: 'pending', category: 'Competencia' },
      { id: 'C7', title: 'Meta Tracker parche a parche', desc: 'Gráfico de evolución WR del campeón a lo largo de parches', status: 'pending', category: 'Competencia' },
      { id: 'C8', title: 'Matchup stats con significancia', desc: 'WR de matchups con flags de significancia estadística', status: 'pending', category: 'Competencia' },
      { id: 'C9', title: 'Cards compartibles (Social)', desc: 'Generar imágenes PNG de rank/profile/tier para compartir', status: 'pending', category: 'Competencia' },
      { id: 'C10', title: 'ARAM Tier List dedicado', desc: 'Tier list para ARAM con estratégicas de reroll', status: 'pending', category: 'Competencia' },
      { id: 'C11', title: 'Team Impact Analyzer', desc: 'Post-game: cuantifica contribución individual vs team luck', status: 'pending', category: 'Competencia' },
      { id: 'C12', title: 'Patch Impact Personalizado', desc: '"Tu main X fue nerfeado — así te adaptás"', status: 'pending', category: 'Competencia' },
      { id: 'C13', title: 'Clasificación Wild Rift #1', desc: 'Enfocarse 100% en WR = posición única', status: 'pending', category: 'Competencia' },
      { id: 'C14', title: 'Tauri Desktop Overlay', desc: 'App desktop liviana (Tauri) para auto-imports + overlays', status: 'pending', category: 'Competencia' },
      { id: 'C15', title: 'Smart Scouting con Tags', desc: 'Tags de playstyle: Onetricks, Dodge rate, Tilt probability', status: 'pending', category: 'Competencia' },
    ],
  },
];

// ---- ROADMAP DATA (from roadmap-tab.tsx — merged) ----
const roadmapData: { category: string; icon: typeof Sparkles; color: string; items: Idea[] }[] = [
  {
    category: 'Estética & Visual',
    icon: Sparkles,
    color: '#f0c646',
    items: [
      { id: 'E1', title: 'Partículas doradas flotantes', desc: 'Polvo dorado tipo client de LoL. Framer Motion + canvas', status: 'done' },
      { id: 'E2', title: 'Font Beaufort para títulos', desc: 'Font oficial de LoL vía @font-face para headings', status: 'done' },
      { id: 'E3', title: 'Splash Art Gallery en modal', desc: 'Carousel de splashes (clásico, PROJECT, Mecha) con parallax', status: 'done' },
      { id: 'E4', title: 'Iconos de rol visuales', desc: 'SVG custom: Top/Jungle/Mid/ADC/Support badges', status: 'done' },
      { id: 'E5', title: 'Tier List estilo board', desc: 'Grid de avatares grandes clickeables tipo OP.GG', status: 'done' },
      { id: 'E6', title: 'Loading screen animada', desc: 'Spinner estilo LoL con logo girando dorado', status: 'done' },
      { id: 'E7', title: 'Dark mode variants', desc: 'Blue Essence, Red Essence, Prestige (negro + dorado). Toggle en header', status: 'done' },
      { id: 'E8', title: 'Mini-map decorativo', desc: 'Mapa de Summoners Rift como fondo con campeones posicionados por rol', status: 'done' },
      { id: 'E9', title: 'Runas visuales con iconos', desc: 'Iconos reales de Data Dragon (RunesReforged) en vez de texto', status: 'done' },
      { id: 'E10', title: 'Transición entre juegos', desc: 'Flash dorado / golpe de espada al cambiar LoL ↔ WR', status: 'done' },
      { id: 'E11', title: 'Gold pulse más prominente', desc: 'Animación dorada pulsante en badges S-Tier y En vivo', status: 'done' },
      { id: 'E12', title: 'Skill icons en builds', desc: 'Iconos de habilidades junto a las descripciones en el modal', status: 'done' },
      { id: 'E13', title: 'Mapa visión interactivo', desc: 'Mini-mapa con wards placement recomendado por rol', status: 'done' },
      { id: 'E14', title: 'Splash arts en landing', desc: 'Carrusel de splash arts en la landing page', status: 'done' },
    ],
  },
  {
    category: 'Mejoras Técnicas',
    icon: Wrench,
    color: '#0acbe6',
    items: [
      { id: 'T1', title: 'Refactor monolito', desc: 'Dividir page.tsx (2342 líneas) en componentes: TierList, ChampionModal, etc.', status: 'done' },
      { id: 'T2', title: 'Limpiar dependencias', desc: 'Remover ~35 paquetes sin uso. Reducir bundle size', status: 'done' },
      { id: 'T3', title: 'Data Dragon versión dinámico', desc: 'Sync automático en vez de hardcoded. Versión desde Riot CDN', status: 'done' },
      { id: 'T4', title: 'Fix TypeScript', desc: 'Sacar ignoreBuildErrors:true. Limpiar tipos duplicados', status: 'done' },
      { id: 'T5', title: 'Usar Prisma', desc: 'Migrar data hardcodeada a SQLite para edición vía UI', status: 'cancelled' },
      { id: 'T6', title: 'Accessibility (a11y)', desc: 'ARIA labels, keyboard nav, focus trapping en modales', status: 'done' },
      { id: 'T7', title: 'reactStrictMode: true', desc: 'Activar para cachar bugs de double-rendering', status: 'done' },
      { id: 'T8', title: 'Skeleton loaders', desc: 'Usar Skeleton de shadcn para loading states', status: 'done' },
      { id: 'T9', title: 'Toast notifications', desc: 'Usar Sonner para feedback: copiar, buscar, cambiar region', status: 'done' },
      { id: 'T10', title: 'Error boundaries', desc: 'Catch errors gracefully sin romper toda la app', status: 'done' },
      { id: 'T11', title: 'SEO / Meta tags', desc: 'Open Graph, Twitter Cards, meta description para compartir', status: 'done' },
      { id: 'T12', title: 'Imagenes optimizadas', desc: 'next/image para los splash arts y champion icons', status: 'done' },
    ],
  },
  {
    category: 'Data & Contenido',
    icon: BarChart3,
    color: '#0fba81',
    items: [
      { id: 'D1', title: 'Parches reales', desc: 'Scrapear notas de parche del blog de Riot / CommunityDragon', status: 'done' },
      { id: 'D2', title: '100% datos completos', desc: 'aiAnalysis + runes detalladas + counters/synergias para TODOS los campeones', status: 'done' },
      { id: 'D3', title: 'Pro Picks reales', desc: 'Scrapear de gol.gg u Oracles Elixir', status: 'pending' },
      { id: 'D4', title: 'Counters con datos reales', desc: 'WR de matchups (ej: Darius vs Garen: 54.2%) de champion.gg', status: 'pending' },
      { id: 'D5', title: 'Tier List automático', desc: 'Calcular tier basado en WR + Pick Rate + Ban Rate reales', status: 'pending' },
      { id: 'D6', title: 'Runas populares', desc: 'Top 3 rune pages por campeón desde CommunityDragon', status: 'pending' },
    ],
  },
  {
    category: 'Funcionalidades',
    icon: Zap,
    color: '#e84057',
    items: [
      { id: 'F1', title: 'Chat IA flotante', desc: 'Botón Pregúntale al Sage conectado a /api/ai-reason. CANCELADO por decisión del CEO', status: 'cancelled' },
      { id: 'F2', title: 'Comparador de Campeones', desc: 'Side-by-side: stats, WR, counters, synergies de 2 campeones', status: 'pending' },
      { id: 'F3', title: 'Builder de Comp', desc: 'Arrastrar 5 campeones y analizar synergies, counters, WR', status: 'cancelled' },
      { id: 'F4', title: 'Draft Assistant', desc: 'Flujo de decisión: que pick contra X, que sinergia con Y', status: 'cancelled' },
      { id: 'F5', title: 'Counter Picker Tool', desc: 'Input: campeón enemigo. Output: top 3 counters con WR y razones', status: 'cancelled' },
      { id: 'F6', title: 'Alertas de Parche', desc: 'Badge NUEVO PARCHE cuando cambia la versión. Polling /api/version', status: 'done' },
      { id: 'F7', title: 'Ranked Distribution', desc: 'Tab nueva con distribución de ranks por región (Hierro a Challenger)', status: 'pending' },
      { id: 'F8', title: 'Meta Tracker', desc: 'Gráfico de línea: WR del campeón parche a parche. Datos CommunityDragon', status: 'pending' },
      { id: 'F9', title: 'Perfil Real con Riot API', desc: 'Conectar de verdad: match history, masteries, LP gains', status: 'pending' },
      { id: 'F10', title: 'PWA', desc: 'manifest.json + service worker. Instalable en celu. Notificaciones push', status: 'pending' },
      { id: 'F11', title: 'Favoritos (localStorage)', desc: 'Marcar campeones con estrella. Filtro en Tier List', status: 'done' },
      { id: 'F12', title: 'Copy Build to Clipboard', desc: 'Botón que copia items como texto para pegar en el client', status: 'done' },
      { id: 'F13', title: 'Share Link', desc: 'URL compartible: moba-sage.vercel.app/champion/yasuo', status: 'pending' },
      { id: 'F14', title: 'Onboarding / Tour', desc: 'Primer uso: tooltips guiados por las tabs', status: 'pending' },
      { id: 'F15', title: 'Búsqueda predictiva', desc: 'Autocomplete al escribir nombre de campeón', status: 'done' },
      { id: 'F16', title: 'Historial de vistas', desc: 'Últimos vistos en Tier List', status: 'pending' },
      { id: 'F17', title: 'Temporadas/Etapas por campeón', desc: 'Early game, Mid game, Late game con power curves', status: 'pending' },
      { id: 'F18', title: 'Notas personales por campeón', desc: 'Textarea editable en modal para notas del usuario (localStorage)', status: 'pending' },
    ],
  },
];

const statusConfig: Record<IdeaStatus, { label: string; color: string; bg: string; icon: typeof Check }> = {
  done: { label: 'Listo', color: '#0fba81', bg: 'rgba(15,186,129,0.1)', icon: Check },
  cancelled: { label: 'Cancelado', color: '#5b5a56', bg: 'rgba(91,90,86,0.08)', icon: X },
  pending: { label: 'Pendiente', color: '#f0c646', bg: 'rgba(240,198,70,0.08)', icon: Clock },
};

function ProgressBar({ data }: { data: { items: Idea[] }[] }) {
  const totalDone = data.reduce((sum, cat) => sum + cat.items.filter(i => i.status === 'done').length, 0);
  const totalCancelled = data.reduce((sum, cat) => sum + cat.items.filter(i => i.status === 'cancelled').length, 0);
  const totalPending = data.reduce((sum, cat) => sum + cat.items.filter(i => i.status === 'pending').length, 0);
  const total = totalDone + totalCancelled + totalPending;
  const pct = total > 0 ? Math.round((totalDone / total) * 100) : 0;

  return (
    <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(30,35,40,0.5)', border: '1px solid rgba(120,90,40,0.15)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-lol-muted font-medium">Progreso General</span>
        <div className="flex items-center gap-2 sm:gap-3 text-[10px] flex-wrap">
          <span className="flex items-center gap-1"><Check className="w-3 h-3 text-lol-green" />{totalDone} listas</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-lol-warning" />{totalPending} pendientes</span>
          <span className="flex items-center gap-1"><X className="w-3 h-3 text-lol-dim" />{totalCancelled} canceladas</span>
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
  );
}

function CategoryList({ data }: { data: { category: string; icon: typeof Lightbulb; color: string; items: Idea[] }[] }) {
  return (
    <div className="space-y-4">
      {data.map((cat, catIdx) => {
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
              <h3 className="text-sm font-semibold text-lol-text">{cat.category}</h3>
              <span className="text-[10px] text-lol-dim ml-auto">{catDone}/{catTotal} completadas</span>
            </div>
            <div className="divide-y divide-[#785a28]/10">
              {cat.items.map(idea => {
                const cfg = statusConfig[idea.status];
                const StatusIcon = cfg.icon;
                return (
                  <div
                    key={idea.id}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-lol-card/30"
                    style={idea.status === 'cancelled' ? { opacity: 0.5 } : {}}
                  >
                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                      <StatusIcon className="w-3 h-3" style={{ color: cfg.color }} />
                    </div>
                    <span className="text-[10px] font-mono text-lol-dim shrink-0 w-5">{idea.id}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-medium ${idea.status === 'cancelled' ? 'line-through text-lol-dim' : 'text-lol-text'}`}>
                        {idea.title}
                      </h4>
                      <p className="text-[10px] text-lol-dim mt-0.5 truncate">{idea.desc}</p>
                    </div>
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0"
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
  );
}

export function IdeasTab() {
  const [subTab, setSubTab] = useState<SubTab>('ideas');

  const totalDone = ideasData.reduce((sum, cat) => sum + cat.items.filter(i => i.status === 'done').length, 0);
  const totalAll = ideasData.reduce((sum, cat) => sum + cat.items.length, 0);
  const pct = Math.round((totalDone / totalAll) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Lightbulb className="w-5 h-5 text-lol-warning" />
        <div>
          <h2 className="text-lg font-bold text-lol-text">Lluvia de Ideas & Roadmap</h2>
          <p className="text-xs text-lol-dim">Backlog completo — {totalDone}/{totalAll} completadas ({pct}%)</p>
        </div>
      </div>

      {/* Sub-tab toggle */}
      <div className="flex items-center gap-2">
        {(['ideas', 'roadmap'] as SubTab[]).map(tab => {
          const isActive = subTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`
                px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5
                ${isActive
                  ? 'bg-lol-gold/15 text-lol-gold border border-lol-gold/30 shadow-[0_0_10px_rgba(200,170,110,0.08)]'
                  : 'text-lol-dim hover:text-lol-muted hover:bg-lol-card/40 border border-transparent'
                }
              `}
              aria-pressed={isActive}
            >
              {tab === 'ideas' ? <Lightbulb className="w-3 h-3" /> : <Map className="w-3 h-3" />}
              {tab === 'ideas' ? 'Ideas' : 'Roadmap'}
            </button>
          );
        })}
        <span className="ml-auto text-[10px] text-lol-dim">
          {subTab === 'ideas' ? 'Incluye investigación de competencia' : 'Basado en BRAINSTORM.md'}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={subTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {subTab === 'ideas' ? (
            <>
              <ProgressBar data={ideasData} />
              <CategoryList data={ideasData} showCategory={true} />
            </>
          ) : (
            <>
              <ProgressBar data={roadmapData} />
              <CategoryList data={roadmapData} showCategory={false} />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
