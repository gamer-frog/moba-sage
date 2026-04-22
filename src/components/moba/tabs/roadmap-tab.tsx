'use client';

import { motion } from 'framer-motion';
import { Map, Check, X, Clock, Sparkles, Wrench, BarChart3, Zap } from 'lucide-react';

type IdeaStatus = 'done' | 'cancelled' | 'pending';

interface Idea {
  id: string;
  title: string;
  desc: string;
  status: IdeaStatus;
}

// Based on BRAINSTORM.md — cross-referenced with TASKS.md and actual codebase
const roadmapCategories = [
  {
    title: 'Estética & Visual',
    icon: Sparkles,
    color: '#f0c646',
    items: [
      { id: 'E1', title: 'Partículas doradas flotantes', desc: 'Polvo dorado tipo client de LoL. Framer Motion + canvas', status: 'done' as IdeaStatus },
      { id: 'E2', title: 'Font Beaufort para títulos', desc: 'Font oficial de LoL vía @font-face para headings', status: 'done' as IdeaStatus },
      { id: 'E3', title: 'Splash Art Gallery en modal', desc: 'Carousel de splashes (clásico, PROJECT, Mecha) con parallax', status: 'done' as IdeaStatus },
      { id: 'E4', title: 'Iconos de rol visuales', desc: 'SVG custom: Top/Jungle/Mid/ADC/Support badges', status: 'done' as IdeaStatus },
      { id: 'E5', title: 'Tier List estilo board', desc: 'Grid de avatares grandes clickeables tipo OP.GG', status: 'done' as IdeaStatus },
      { id: 'E6', title: 'Loading screen animada', desc: 'Spinner estilo LoL con logo girando dorado', status: 'done' as IdeaStatus },
      { id: 'E7', title: 'Dark mode variants', desc: 'Blue Essence, Red Essence, Prestige (negro + dorado). Toggle en header', status: 'done' as IdeaStatus },
      { id: 'E8', title: 'Mini-map decorativo', desc: 'Mapa de Summoners Rift como fondo con campeones posicionados por rol', status: 'done' as IdeaStatus },
      { id: 'E9', title: 'Runas visuales con iconos', desc: 'Iconos reales de Data Dragon (RunesReforged) en vez de texto', status: 'done' as IdeaStatus },
      { id: 'E10', title: 'Transición entre juegos', desc: 'Flash dorado / golpe de espada al cambiar LoL ↔ WR', status: 'done' as IdeaStatus },
      { id: 'E11', title: 'Gold pulse más prominente', desc: 'Animación dorada pulsante en badges S-Tier y En vivo', status: 'done' as IdeaStatus },
      { id: 'E12', title: 'Skill icons en builds', desc: 'Iconos de habilidades junto a las descripciones en el modal', status: 'done' as IdeaStatus },
      { id: 'E13', title: 'Mapa visión interactivo', desc: 'Mini-mapa con wards placement recomendado por rol', status: 'done' as IdeaStatus },
      { id: 'E14', title: 'Splash arts en landing', desc: 'Carrusel de splash arts en la landing page', status: 'done' as IdeaStatus },
    ],
  },
  {
    title: 'Mejoras Técnicas',
    icon: Wrench,
    color: '#0acbe6',
    items: [
      { id: 'T1', title: 'Refactor monolito', desc: 'Dividir page.tsx (2342 líneas) en componentes: TierList, ChampionModal, etc.', status: 'done' as IdeaStatus },
      { id: 'T2', title: 'Limpiar dependencias', desc: 'Remover ~35 paquetes sin uso. Reducir bundle size', status: 'done' as IdeaStatus },
      { id: 'T3', title: 'Data Dragon versión dinámico', desc: 'Sync automático en vez de hardcoded. Versión desde Riot CDN', status: 'done' as IdeaStatus },
      { id: 'T4', title: 'Fix TypeScript', desc: 'Sacar ignoreBuildErrors:true. Limpiar tipos duplicados', status: 'done' as IdeaStatus },
      { id: 'T5', title: 'Usar Prisma', desc: 'Migrar data hardcodeada a SQLite para edición vía UI', status: 'cancelled' as IdeaStatus },
      { id: 'T6', title: 'Accessibility (a11y)', desc: 'ARIA labels, keyboard nav, focus trapping en modales', status: 'done' as IdeaStatus },
      { id: 'T7', title: 'reactStrictMode: true', desc: 'Activar para cachar bugs de double-rendering', status: 'done' as IdeaStatus },
      { id: 'T8', title: 'Skeleton loaders', desc: 'Usar Skeleton de shadcn para loading states', status: 'done' as IdeaStatus },
      { id: 'T9', title: 'Toast notifications', desc: 'Usar Sonner para feedback: copiar, buscar, cambiar region', status: 'done' as IdeaStatus },
      { id: 'T10', title: 'Error boundaries', desc: 'Catch errors gracefully sin romper toda la app', status: 'done' as IdeaStatus },
      { id: 'T11', title: 'SEO / Meta tags', desc: 'Open Graph, Twitter Cards, meta description para compartir', status: 'done' as IdeaStatus },
      { id: 'T12', title: 'Imagenes optimizadas', desc: 'next/image para los splash arts y champion icons', status: 'done' as IdeaStatus },
    ],
  },
  {
    title: 'Data & Contenido',
    icon: BarChart3,
    color: '#0fba81',
    items: [
      { id: 'D1', title: 'Parches reales', desc: 'Scrapear notas de parche del blog de Riot / CommunityDragon', status: 'done' as IdeaStatus },
      { id: 'D2', title: '100% datos completos', desc: 'aiAnalysis + runes detalladas + counters/synergias para TODOS los campeones', status: 'done' as IdeaStatus },
      { id: 'D3', title: 'Pro Picks reales', desc: 'Scrapear de gol.gg u Oracles Elixir', status: 'pending' as IdeaStatus },
      { id: 'D4', title: 'Counters con datos reales', desc: 'WR de matchups (ej: Darius vs Garen: 54.2%) de champion.gg', status: 'pending' as IdeaStatus },
      { id: 'D5', title: 'Tier List automático', desc: 'Calcular tier basado en WR + Pick Rate + Ban Rate reales', status: 'pending' as IdeaStatus },
      { id: 'D6', title: 'Runas populares', desc: 'Top 3 rune pages por campeón desde CommunityDragon', status: 'pending' as IdeaStatus },
    ],
  },
  {
    title: 'Funcionalidades',
    icon: Zap,
    color: '#e84057',
    items: [
      { id: 'F1', title: 'Chat IA flotante', desc: 'Botón Pregúntale al Sage conectado a /api/ai-reason. CANCELADO por decisión del CEO', status: 'cancelled' as IdeaStatus },
      { id: 'F2', title: 'Comparador de Campeones', desc: 'Side-by-side: stats, WR, counters, synergies de 2 campeones', status: 'pending' as IdeaStatus },
      { id: 'F3', title: 'Builder de Comp', desc: 'Arrastrar 5 campeones y analizar synergies, counters, WR', status: 'cancelled' as IdeaStatus },
      { id: 'F4', title: 'Draft Assistant', desc: 'Flujo de decisión: que pick contra X, que sinergia con Y', status: 'cancelled' as IdeaStatus },
      { id: 'F5', title: 'Counter Picker Tool', desc: 'Input: campeón enemigo. Output: top 3 counters con WR y razones', status: 'cancelled' as IdeaStatus },
      { id: 'F6', title: 'Alertas de Parche', desc: 'Badge NUEVO PARCHE cuando cambia la versión. Polling /api/version', status: 'done' as IdeaStatus },
      { id: 'F7', title: 'Ranked Distribution', desc: 'Tab nueva con distribución de ranks por región (Hierro a Challenger)', status: 'pending' as IdeaStatus },
      { id: 'F8', title: 'Meta Tracker', desc: 'Gráfico de línea: WR del campeón parche a parche. Datos CommunityDragon', status: 'pending' as IdeaStatus },
      { id: 'F9', title: 'Perfil Real con Riot API', desc: 'Conectar de verdad: match history, masteries, LP gains', status: 'pending' as IdeaStatus },
      { id: 'F10', title: 'PWA', desc: 'manifest.json + service worker. Instalable en celu. Notificaciones push', status: 'pending' as IdeaStatus },
      { id: 'F11', title: 'Favoritos (localStorage)', desc: 'Marcar campeones con estrella. Filtro en Tier List', status: 'done' as IdeaStatus },
      { id: 'F12', title: 'Copy Build to Clipboard', desc: 'Botón que copia items como texto para pegar en el client', status: 'done' as IdeaStatus },
      { id: 'F13', title: 'Share Link', desc: 'URL compartible: moba-sage.vercel.app/champion/yasuo', status: 'pending' as IdeaStatus },
      { id: 'F14', title: 'Onboarding / Tour', desc: 'Primer uso: tooltips guiados por las tabs', status: 'pending' as IdeaStatus },
      { id: 'F15', title: 'Búsqueda predictiva', desc: 'Autocomplete al escribir nombre de campeón', status: 'done' as IdeaStatus },
      { id: 'F16', title: 'Historial de vistas', desc: 'Últimos vistos en Tier List', status: 'pending' as IdeaStatus },
      { id: 'F17', title: 'Temporadas/Etapas por campeón', desc: 'Early game, Mid game, Late game con power curves', status: 'pending' as IdeaStatus },
      { id: 'F18', title: 'Notas personales por campeón', desc: 'Textarea editable en modal para notas del usuario (localStorage)', status: 'pending' as IdeaStatus },
    ],
  },
];

const statusConfig: Record<IdeaStatus, { label: string; color: string; bg: string; icon: typeof Check }> = {
  done: { label: 'Listo', color: '#0fba81', bg: 'rgba(15,186,129,0.1)', icon: Check },
  cancelled: { label: 'Cancelado', color: '#5b5a56', bg: 'rgba(91,90,86,0.08)', icon: X },
  pending: { label: 'Pendiente', color: '#f0c646', bg: 'rgba(240,198,70,0.08)', icon: Clock },
};

export function RoadmapTab() {
  const totalDone = roadmapCategories.reduce((sum, cat) => sum + cat.items.filter(i => i.status === 'done').length, 0);
  const totalCancelled = roadmapCategories.reduce((sum, cat) => sum + cat.items.filter(i => i.status === 'cancelled').length, 0);
  const totalPending = roadmapCategories.reduce((sum, cat) => sum + cat.items.filter(i => i.status === 'pending').length, 0);
  const total = totalDone + totalCancelled + totalPending;
  const pct = Math.round((totalDone / total) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Map className="w-5 h-5 text-[#c8aa6e]" />
        <div>
          <h2 className="text-lg font-bold text-[#f0e6d2]">Roadmap</h2>
          <p className="text-xs text-[#5b5a56]">Ideas de BRAINSTORM.md — {totalDone}/{total} completadas ({pct}%)</p>
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
        {roadmapCategories.map((cat, catIdx) => {
          const catDone = cat.items.filter(i => i.status === 'done').length;
          const catTotal = cat.items.length;
          return (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.05 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(120,90,40,0.15)' }}>
                <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                <h3 className="text-sm font-semibold text-[#f0e6d2]">{cat.title}</h3>
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
