// Shared utility functions for champion modal sub-components

import { C } from '@/components/moba/theme-colors';

export function wrStatColor(value: number, label: string): string {
  // Use includes() so it matches 'Win Rate', 'WR', 'Ban Rate', 'Ban', etc.
  if (label.includes('Win') || label === 'WR') {
    return value >= 53 ? C.green : value >= 51 ? C.success : value >= 49 ? C.warning : C.danger;
  }
  if (label.includes('Ban')) {
    return value > 5 ? C.danger : C.muted;
  }
  if (label.includes('Pick') || label.includes('Pro')) {
    return value >= 10 ? C.green : value >= 5 ? C.success : C.muted;
  }
  return C.warning;
}
