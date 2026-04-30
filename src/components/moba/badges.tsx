'use client';

import { Badge } from '@/components/ui/badge';
import { Circle, Loader2, CheckCircle2, X } from 'lucide-react';
import { ROLE_CONFIG, CATEGORY_CONFIG } from './constants';

export function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role];
  if (!cfg) return <Badge variant="outline" className="text-[10px] px-2 py-0.5">{role}</Badge>;
  const Icon = cfg.icon;
  return (
    <Badge
      variant="outline"
      className="gap-1 text-[10px] font-semibold px-2 py-0.5 shrink-0"
      style={{
        borderColor: `${cfg.color}40`,
        color: cfg.color,
        backgroundColor: `${cfg.color}12`,
      }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string; label: string }> = {
    pending: { color: '#a09b8c', label: 'Pendiente' },
    running: { color: '#0acbe6', label: 'Ejecutando' },
    done: { color: '#0acbe6', label: 'Completado' },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: `${c.color}15`,
        color: c.color,
        borderColor: `${c.color}30`,
      }}
    >
      {status === 'pending' && <Circle className="w-3 h-3" />}
      {status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === 'done' && <CheckCircle2 className="w-3 h-3" />}
      {c.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.meta;
  const Icon = cfg.icon;
  return (
    <Badge
      variant="outline"
      className="gap-1 text-[10px]"
      style={{ borderColor: cfg.color, color: cfg.color }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

export function RoadmapStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string; label: string }> = {
    done: { color: '#0fba81', label: 'Completado' },
    progress: { color: '#0acbe6', label: 'En progreso' },
    planned: { color: '#5b5a56', label: 'Planificado' },
    cancelled: { color: '#e84057', label: 'CANCELADO' },
  };
  const c = cfg[status] || cfg.planned;
  const isCancelled = status === 'cancelled';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${isCancelled ? 'line-through opacity-70' : ''}`}
      style={{
        backgroundColor: isCancelled ? 'rgba(232,64,87,0.15)' : `${c.color}12`,
        color: c.color,
        borderColor: isCancelled ? 'rgba(232,64,87,0.4)' : `${c.color}25`,
      }}
    >
      {status === 'done' && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {status === 'cancelled' && <X className="w-3 h-3 mr-1" />}
      {c.label}
    </span>
  );
}

export function TournamentBadge({ tournament }: { tournament: string }) {
  const colors: Record<string, string> = {
    LCK: '#e84057',
    LPL: '#0fba81',
    LEC: '#0acbe6',
    LCS: '#c8aa6e',
  };
  const color = colors[tournament] || '#5b5a56';
  return (
    <Badge
      variant="outline"
      className="text-[10px] font-semibold px-2 py-0.5"
      style={{
        borderColor: `${color}40`,
        color: color,
        backgroundColor: `${color}12`,
      }}
    >
      {tournament}
    </Badge>
  );
}
