// Shared utility functions for champion modal sub-components

import { C } from '@/components/moba/theme-colors';
import { timeAgo } from '@/lib/time';

// Re-export for backward compatibility
export { timeAgo as timeAgoMeta } from '@/lib/time';

export function wrStatColor(wr: number, label: string): string {
  if (label === 'WR') return wr >= 53 ? C.green : wr >= 51 ? C.success : wr >= 49 ? C.warning : C.danger;
  if (label === 'Ban') return wr > 5 ? C.danger : C.muted;
  return C.warning;
}
