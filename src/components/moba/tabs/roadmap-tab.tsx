'use client';

import { motion } from 'framer-motion';
import { Map, Database, Brain, Trophy, Wrench, Users, Smartphone, Zap, Image as ImageIcon } from 'lucide-react';
import { RoadmapStatusBadge } from '../badges';

const roadmapCategories = [
  {
    title: 'Datos & APIs', icon: Database, items: [
      { name: 'Conexión Riot API completa', status: 'progress', desc: 'API key configurada, datos reales de invocadores, ranked, historial' },
      { name: 'Datos en tiempo real (U.GG / Mobalytics)', status: 'planned', desc: 'Conectar APIs de terceros para estadísticas actualizadas automáticamente' },
      { name: 'Wild Rift - Datos completos', status: 'done', desc: 'Campeones con tier list (S/A/B), builds, counters, sinergias e IA' },
      { name: 'Community Dragon Assets', status: 'done', desc: 'CDN Data Dragon para iconos de campeones, items y splash arts' },
    ]
  },
  {
    title: 'IA & Analytics', icon: Brain, items: [
      { name: 'Auto-análisis IA (sin botón)', status: 'done', desc: 'La IA analiza automáticamente y muestra conclusiones pre-escritas' },
      { name: 'Coach IA (Chatbot)', status: 'cancelled', desc: 'Chat con IA especializado en coaching de LoL' },
      { name: 'Análisis de VODs', status: 'cancelled', desc: 'Subir replay/VOD y obtener análisis con IA' },
      { name: 'Team Comp Analyzer', status: 'cancelled', desc: 'Reemplazado por Combos Rotos' },
      { name: 'Predicción de patches', status: 'cancelled', desc: 'IA predice cambios de balance antes del parche' },
    ]
  },
  {
    title: 'Competitivo', icon: Trophy, items: [
      { name: 'Campeones Pro (LCK/LPL/LEC/LCS)', status: 'done', desc: 'Listado de campeones más usados en esports profesionales' },
      { name: 'Ban/Pick Analysis Pro', status: 'cancelled', desc: 'Análisis de bans y picks en series profesionales' },
      { name: 'Meta regional', status: 'planned', desc: 'Diferencias de meta entre regiones (KR vs NA vs EU)' },
    ]
  },
  {
    title: 'Builds & Runas', icon: Wrench, items: [
      { name: 'Builds recomendados', status: 'done', desc: '1-2 builds rotas para cada campeón S/A con iconos de items' },
      { name: 'Runas óptimas', status: 'planned', desc: 'Runas recomendadas por campeon y rol' },
      { name: 'Item build paths', status: 'planned', desc: 'Order de compra de items optimizado' },
      { name: 'Counter builds', status: 'planned', desc: 'Items específicos contra cada campeon' },
    ]
  },
  {
    title: 'Social & Usuarios', icon: Users, items: [
      { name: 'Autenticación Riot OAuth2', status: 'cancelled', desc: 'Login con cuenta de Riot Games' },
      { name: 'Perfiles guardados', status: 'cancelled', desc: 'Guardar favoritos, tier lists personalizadas' },
      { name: 'Comunidad', status: 'cancelled', desc: 'Compartir análisis, votar tier lists' },
      { name: 'Discord Bot', status: 'cancelled', desc: 'Notificaciones de meta en canales de Discord' },
    ]
  },
  {
    title: 'Plataforma', icon: Smartphone, items: [
      { name: 'PWA completa', status: 'cancelled', desc: 'Service worker, offline, installable' },
      { name: 'Notificaciones Push', status: 'cancelled', desc: 'Alertas de buffs/nerfs de campeones principales' },
      { name: 'Multi-idioma', status: 'cancelled', desc: 'Español, inglés, portugués, más' },
      { name: 'Tema claro/oscuro', status: 'cancelled', desc: 'Toggle entre temas' },
    ]
  },
  {
    title: 'Combos Rotos', icon: Zap, items: [
      { name: 'Combos de 2 campeones (Dúos)', status: 'done', desc: 'Sinergias rotas entre 2 campeones con win rate y dificultad' },
      { name: 'Combos de 3 campeones (Tríos)', status: 'done', desc: 'Tríos de campeones con gran sinergia en mapa' },
      { name: 'Combos de 4 campeones', status: 'done', desc: 'Composiciones de 4 con objetivo claro' },
      { name: 'Combos de 5 campeones (Equipos)', status: 'done', desc: 'Team comps completas rotas para ranked' },
    ]
  },
  {
    title: 'Assets & Data que podemos agregar', icon: ImageIcon, items: [
      { name: 'Spell icons (Q/W/E/R)', status: 'planned', desc: 'Iconos de habilidades de cada campeón' },
      { name: 'Item icons', status: 'done', desc: 'Imágenes de items del juego en builds' },
      { name: 'Rune icons', status: 'planned', desc: 'Iconos de runas (Precisión, Dominación, etc.)' },
      { name: 'Mapa de visión', status: 'planned', desc: 'Visualización de ward spots óptimos' },
      { name: 'Splash arts de skins', status: 'planned', desc: 'Galería de skins alternativas' },
      { name: 'Emotes/Iconos de perfil', status: 'planned', desc: 'Explorador de emotes y iconos' },
      { name: 'Datos de ranked distribution', status: 'planned', desc: 'Gráfico de distribución de rangos' },
      { name: 'Champion.gg / U.GG synergy data', status: 'planned', desc: 'Sinergias y matchups basados en millones de partidas' },
    ]
  },
];

export function RoadmapTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Map className="w-5 h-5 text-[#c8aa6e]" />
        <div>
          <h2 className="text-lg font-bold text-[#f0e6d2]">Roadmap</h2>
          <p className="text-xs text-[#5b5a56]">Plan de desarrollo y features futuras</p>
        </div>
      </div>
      <div className="space-y-4">
        {roadmapCategories.map((cat, catIdx) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.05 }}
            className="glass-card rounded-xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(120,90,40,0.15)' }}>
              <cat.icon className="w-4 h-4 text-[#c8aa6e]" />
              <h3 className="text-sm font-semibold text-[#f0e6d2]">{cat.title}</h3>
              <span className="text-[10px] text-[#5b5a56] ml-auto">{cat.items.length} items</span>
            </div>
            <div className="divide-y divide-[#785a28]/10">
              {cat.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 px-4 py-3 hover:bg-[#1e2328]/40 transition-colors">
                  <div className="mt-0.5 shrink-0">
                    <RoadmapStatusBadge status={item.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-[#f0e6d2]">{item.name}</h4>
                    <p className="text-[10px] text-[#5b5a56] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
