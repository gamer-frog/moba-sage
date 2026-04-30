// Shared utility functions for champion modal sub-components

import { C } from '@/components/moba/theme-colors';

export function wrStatColor(wr: number, label: string): string {
  if (label === 'WR') return wr >= 53 ? C.green : wr >= 51 ? C.success : wr >= 49 ? C.warning : C.danger;
  if (label === 'Ban') return wr > 5 ? C.danger : C.muted;
  return C.warning;
}
