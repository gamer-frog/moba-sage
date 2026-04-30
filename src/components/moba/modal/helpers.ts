// Shared utility functions for champion modal sub-components

export function timeAgoMeta(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins <= 0) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function wrStatColor(wr: number, label: string): string {
  if (label === 'WR') return wr >= 53 ? '#0fba81' : wr >= 51 ? '#0acbe6' : wr >= 49 ? '#f0c646' : '#e84057';
  if (label === 'Ban') return wr > 5 ? '#e84057' : '#a09b8c';
  return '#f0c646';
}
