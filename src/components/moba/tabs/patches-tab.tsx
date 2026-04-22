'use client';

import { motion } from 'framer-motion';
import { ScrollText, Clock, Brain, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { PatchNote, GameSelection } from '../types';

function getPatchNotesUrl(patch: PatchNote): string {
  const v = patch.version.replace(/\./g, '-');
  if (patch.sourceGame === 'WR') {
    return `https://www.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-${v}-notes/`;
  }
  return `https://www.leagueoflegends.com/en-us/news/game-updates/patch-${v}-notes/`;
}

export function PatchesTab({ patches, loading, selectedGame }: { patches: PatchNote[]; loading: boolean; selectedGame: GameSelection }) {
  const filteredPatches = patches.filter(p => {
    if (selectedGame === 'lol') return p.sourceGame === 'LoL';
    if (selectedGame === 'wildrift') return p.sourceGame === 'WR';
    return true;
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[#5b5a56]">
        <ScrollText className="w-4 h-4" />
        <span className="text-sm">{filteredPatches.length} parche(s) encontrado(s)</span>
      </div>
      {loading ? (
        Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-6 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))
      ) : filteredPatches.length === 0 ? (
        <div className="text-center py-12 text-[#5b5a56]">
          <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No hay parches disponibles para este juego</p>
        </div>
      ) : (
        filteredPatches.map(patch => (
          <motion.div key={patch.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="glass-card rounded-xl p-5 border border-[#785a28]/25">
            <div className="flex items-start gap-3 mb-4">
              <Badge className="bg-[#c8aa6e] text-[#0a0e1a] font-bold text-sm px-3 py-1 shrink-0">{patch.version}</Badge>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-[#f0e6d2]">{patch.title}</h3>
                <div className="flex items-center gap-2 text-xs text-[#5b5a56] mt-1 flex-wrap">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(patch.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <Badge variant="outline" className="text-[10px] border-[#785a28]/40 text-[#5b5a56]">{patch.sourceGame}</Badge>
                  <a href={getPatchNotesUrl(patch)} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-[10px] text-[#c8aa6e] hover:text-[#f0e6d2] transition-colors">
                    Notas Oficiales <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-[#c8aa6e] uppercase tracking-wider mb-2">Resumen</h4>
              <p className="text-sm text-[#a09b8c] leading-relaxed">{patch.summary}</p>
            </div>
            {patch.digest && (
              <div className="rounded-lg p-4 border border-[#0acbe6]/15 bg-[#0acbe6]/5">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-[#0acbe6]" />
                  <h4 className="text-xs font-semibold text-[#0acbe6] uppercase tracking-wider">Análisis IA</h4>
                </div>
                <p className="text-sm text-[#f0e6d2] leading-relaxed">{patch.digest}</p>
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
}
