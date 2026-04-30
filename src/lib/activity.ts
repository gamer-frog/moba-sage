/**
 * MOBA SAGE — Shared Activity Feed Types & Config
 *
 * Single source of truth for ActivityEntry interface,
 * type color mappings, and type icon mappings used across:
 * - app-header.tsx (notification bell dropdown)
 * - activity-popup.tsx (auto-popup on first visit)
 * - activity-tab.tsx (full activity feed tab)
 */

import {
  Rocket, Sparkles, Eye, AlertTriangle, Bug, Palette,
} from 'lucide-react';
import { C } from '@/components/moba/theme-colors';

export interface ActivityEntry {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  commit?: string;
  category: string;
}

export interface ActivityFeed {
  version: string;
  lastUpdated: string;
  entries: ActivityEntry[];
  highlights: string[];
}

export const TYPE_COLORS: Record<string, string> = {
  deploy: C.gold,
  feature: C.green,
  audit: C.success,
  fix: C.danger,
  improvement: C.warning,
  maintenance: C.goldDark,
};

export const TYPE_ICONS: Record<string, typeof Rocket> = {
  deploy: Rocket,
  feature: Sparkles,
  audit: Eye,
  fix: AlertTriangle,
  improvement: Sparkles,
  maintenance: Bug,
};

/** Extended config with bg + label (used by activity-tab) */
export const TYPE_CONFIG: Record<string, { icon: typeof Rocket; color: string; label: string; bg: string }> = {
  deploy: { icon: Rocket, color: C.gold, label: 'Despliegue', bg: `${C.gold}1a` },
  feature: { icon: Sparkles, color: C.green, label: 'Función', bg: `${C.green}1a` },
  audit: { icon: Eye, color: C.success, label: 'Auditoría', bg: `${C.success}1a` },
  fix: { icon: Bug, color: C.danger, label: 'Corrección', bg: `${C.danger}1a` },
  improvement: { icon: Palette, color: C.warning, label: 'Mejora', bg: `${C.warning}1a` },
};
