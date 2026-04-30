/**
 * MOBA SAGE — Theme Color Constants
 *
 * Single source of truth for all hardcoded hex colors used in
 * inline styles where Tailwind tokens can't be applied directly
 * (e.g. dynamic opacity strings like `${color}15`).
 *
 * Usage: import { C } from '@/components/moba/theme-colors';
 *        style={{ color: C.green }}
 */

export const C = {
  // Primary palette
  gold:       '#c8aa6e',
  goldDark:   '#785a28',
  bg:         '#0a0e1a',
  card:       '#1e2328',
  text:       '#f0e6d2',

  // Semantic
  danger:     '#e84057',
  success:    '#0acbe6',   // teal/cyan — NOT green
  warning:    '#f0c646',
  green:      '#0fba81',   // true green — WR positive
  muted:      '#a09b8c',
  dim:        '#5b5a56',
  teal:       '#0a7a8f',

  // Extended (used in pick rate, modal, etc.)
  pick:       '#5b8af5',
  purple:     '#a78bfa',

  // Freshness
  stale:      '#e84057',
  acceptable: '#f0c646',
  fresh:      '#0fba81',

  // Opacity helpers — use with template literals
  // Example: `${C.green}12` → "#0fba8112"
} as const;

/** Win rate → color mapping */
export function wrColor(wr: number): string {
  if (wr >= 53) return C.green;
  if (wr >= 51) return C.success;
  if (wr >= 49) return C.warning;
  return C.danger;
}

/** Freshness based on hours since data was fetched */
export function freshnessColor(hours: number): { color: string; label: string } {
  if (hours < 1) return { color: C.green, label: 'Fresco' };
  if (hours < 6) return { color: C.warning, label: 'Aceptable' };
  return { color: C.danger, label: 'Antiguo' };
}

/** Role WR color mapping */
export function roleWrColor(avg: number): string {
  if (avg > 51) return C.green;
  if (avg > 50) return C.gold;
  return C.danger;
}
