/**
 * MOBA SAGE — Shared Time Utilities
 *
 * Single source of truth for time formatting functions used across:
 * - app-header.tsx (notification timestamps)
 * - activity-popup.tsx (popup timestamps)
 * - activity-tab.tsx (feed timestamps)
 * - loading-screen.tsx (data freshness)
 * - modal/helpers.ts (meta build "time ago")
 * - floating-notes.tsx (note timestamps)
 */

const TZ = 'America/Argentina/Buenos_Aires';

/** Relative time ago (short) — "hace 5m", "hace 2h", "hace 3d" */
export function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins <= 0) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

/** Time of day HH:MM in Argentine timezone */
export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('es-AR', {
      timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false,
    });
  } catch {
    return '--:--';
  }
}

/** Short date in Argentine timezone — "30 Abr 2026" */
export function formatDateShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-AR', {
      timeZone: TZ, day: 'numeric', month: 'short',
    });
  } catch {
    return '';
  }
}

/** Full timestamp — "30 Abr 2026 · 14:08" */
export function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    const day = d.getDate();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const month = months[d.getMonth()];
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${d.getFullYear()} · ${hours}:${mins}`;
  } catch {
    return '';
  }
}
