'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Swords, X, Clock, FileText, Info, BookOpen, Loader2 } from 'lucide-react';
import { ChampionIcon } from '../champion-icon';

// ---- Local types for guides feed ----
interface GuideEntry {
  id: string;
  champion: string;
  role: string;
  patch: string;
  title: string;
  summary: string;
  tags: string[];
  keyPoints: string[];
  fileName: string;
  game?: string;
}

interface GuidesFeed {
  lastUpdated: string;
  source: string;
  totalGuides: number;
  guides: GuideEntry[];
}

// ---- Guide Detail Modal ----
function GuideModal({ guide, onClose }: { guide: GuideEntry; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Guía: ${guide.title}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl scrollbar-none border border-lol-gold/25"
        style={{
          background: 'linear-gradient(180deg, #1e2328 0%, #0a0e1a 100%)',
          boxShadow: '0 0 60px rgba(200,170,110,0.1), 0 25px 50px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg, transparent, #c8aa6e, transparent)' }} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-lol-card text-lol-dim hover:text-lol-text"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="shrink-0">
              {guide.champion !== 'General' ? (
                <ChampionIcon name={guide.champion} tier="A" />
              ) : (
                <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center border-[2.5px] border-lol-gold/40 bg-lol-gold/10">
                  <Swords className="w-6 h-6 text-lol-gold" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="lol-title text-lg text-lol-text leading-tight mb-2">{guide.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-lol-gold/10 text-lol-gold border border-lol-gold/30"
                >
                  LoL
                </span>
                <span className="text-[10px] font-mono text-lol-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" /> v{guide.patch}
                </span>
                {guide.role && (
                  <span className="text-[10px] text-lol-dim">· {guide.role}</span>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm text-lol-muted leading-relaxed">{guide.summary}</p>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(120,90,40,0.3), transparent)' }} />

        {/* Key Points */}
        <div className="p-6">
          <h3 className="lol-label text-xs font-semibold text-lol-gold mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            Puntos Clave
          </h3>
          <div className="space-y-2.5">
            {guide.keyPoints.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-lol-gold/10 border border-lol-gold/20">
                  <span className="text-[10px] font-bold text-lol-gold">{i + 1}</span>
                </div>
                <span className="text-xs text-lol-muted leading-relaxed">{point}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tags */}
        {guide.tags && guide.tags.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3 h-3 text-lol-gold-dark" />
              {guide.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium text-lol-muted bg-lol-card/60 border border-lol-gold-dark/15"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content coming soon */}
        <div className="mx-6 mb-6 p-4 rounded-xl text-center bg-lol-gold/[0.04] border border-lol-gold/10">
          <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-lol-gold/10 border border-lol-gold/15">
            <Clock className="w-5 h-5 text-lol-gold" />
          </div>
          <p className="text-xs font-semibold text-lol-text mb-1">Contenido en desarrollo</p>
          <p className="text-[10px] text-lol-dim">La guía completa con builds, runas y estrategias estará disponible próximamente.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---- Fallback placeholder cards for empty state ----
const PLACEHOLDER_GUIDES = [
  { icon: <Swords className="w-5 h-5 text-lol-gold" />, title: 'Guías de Campeones', desc: 'Builds, runas y matchups detallados para cada campeón del meta.' },
  { icon: <BookOpen className="w-5 h-5 text-lol-gold" />, title: 'Guías de Macro', desc: 'Wave management, rotaciones, objetivas y planificación de partidas.' },
  { icon: <Tag className="w-5 h-5 text-lol-gold" />, title: 'Guías de Roles', desc: 'Estrategias específicas para cada rol: Top, Jungla, Mid, ADC y Support.' },
];

export function GuidesTab() {
  const [guides, setGuides] = useState<GuideEntry[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<GuideEntry | null>(null);
  const [loading, setLoading] = useState(true);

  // Escape to close guide modal
  useEffect(() => {
    if (!selectedGuide) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedGuide(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedGuide]);

  useEffect(() => {
    async function fetchGuides() {
      try {
        const res = await fetch('/guides-feed.json');
        if (res.ok) {
          const data: GuidesFeed = await res.json();
          // Filter out any Valorant guides at fetch time
          const allGuides = data.guides || [];
          setGuides(allGuides.filter(g => g.game !== 'valorant'));
        }
      } catch (err) {
        console.error('Error loading guides:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGuides();
  }, []);

  return (
    <div className="space-y-4">
      {/* Coaching cross-link — compact tip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-lol-gold/6 border border-lol-gold/15"
      >
        <Info className="w-3.5 h-3.5 text-lol-gold shrink-0" />
        <p className="text-[11px] text-lol-muted flex-1">
          Buscás tips de mecánicas y errores comunes? Visitá{' '}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('moba-sage-switch-tab', { detail: 'coaching' }))}
            className="text-lol-gold font-semibold hover:underline cursor-pointer"
          >
            Coaching
          </button>
        </p>
      </motion.div>

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-lol-gold" />
          <h3 className="lol-label text-xs font-semibold text-lol-text uppercase tracking-wider">
            Guías Disponibles
          </h3>
        </div>
        {!loading && guides.length > 0 && (
          <span className="text-[10px] text-lol-dim font-mono">{guides.length} guías</span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-lol-gold animate-spin" />
          <span className="text-xs text-lol-dim ml-2">Cargando guías...</span>
        </div>
      )}

      {/* Guide Card Grid */}
      {!loading && guides.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {guides.map((guide, idx) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedGuide(guide); } }}
              onClick={() => setSelectedGuide(guide)}
              className="glass-card rounded-xl p-4 cursor-pointer lol-card-hover border border-lol-gold-dark/15"
            >
              {/* Champion icon + title + badges */}
              <div className="flex items-start gap-3 mb-3">
                <div className="shrink-0">
                  {guide.champion !== 'General' ? (
                    <ChampionIcon name={guide.champion} tier="A" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-lol-gold/10 border border-lol-gold/30">
                      <Swords className="w-5 h-5 text-lol-gold" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-lol-text leading-tight mb-1 line-clamp-2 lol-title">{guide.title}</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-lol-dim">v{guide.patch}</span>
                    {guide.role && (
                      <span className="text-[10px] text-lol-muted">· {guide.role}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs text-lol-muted leading-relaxed line-clamp-3 mb-3">{guide.summary}</p>

              {/* Tags */}
              {guide.tags && guide.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {guide.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full text-lol-dim bg-lol-card border border-lol-gold-dark/10"
                    >
                      {tag}
                    </span>
                  ))}
                  {guide.tags.length > 3 && (
                    <span className="text-[10px] text-lol-dim">+{guide.tags.length - 3}</span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty / Coming Soon State */}
      {!loading && guides.length === 0 && (
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-8 text-center border border-lol-gold-dark/15">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-lol-gold/30" />
            <p className="text-sm font-semibold text-lol-text mb-1">Próximamente</p>
            <p className="text-xs text-lol-dim max-w-sm mx-auto">
              Las guías detalladas con builds, runas y estrategias estarán disponibles pronto.
              Mientras tanto, explorá las demás pestañas.
            </p>
          </div>

          {/* Placeholder category cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLACEHOLDER_GUIDES.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-xl p-4 border border-lol-gold-dark/10"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-lol-gold/10 border border-lol-gold/20 mb-3">
                  {item.icon}
                </div>
                <h4 className="text-sm font-semibold text-lol-text mb-1 lol-title">{item.title}</h4>
                <p className="text-[11px] text-lol-dim leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Guide Detail Modal */}
      <AnimatePresence>
        {selectedGuide && (
          <GuideModal guide={selectedGuide} onClose={() => setSelectedGuide(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
