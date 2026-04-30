
---
Task ID: 4
Agent: main
Task: Round 4 — 7 codebase improvements

Work Log:
- Fixed formatTimestamp timezone bug (was using local time, now uses ARG tz consistently)
- Removed dead `expandedNote` state in FloatingNotes
- Memoized GoldParticles array to prevent re-render churn
- Added AbortController to ChampionModal meta-build fetch
- Filtered global search results by selected game (was showing all champions)
- Refactored AppHeader bell interval with useCallback for stable reference
- Added aria-live, role=listbox to search overlay; empty state only on query

Stage Summary:
- 7 fixes across 7 files: lib/time.ts, floating-notes.tsx, gold-particles.tsx, champion-modal.tsx, use-global-search.ts, app-header.tsx, page.tsx
- Build passes clean, pushed as electronica-frog
