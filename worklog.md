# MOBA-SAGE Worklog

## 2025-07-10 — Three Major Changes

### Task 1: Fix Coaching Tab Warding Bug
**File:** `src/components/moba/tabs/coaching-tab.tsx`

**Bug:** Line 338 referenced an undefined variable `wColor` in the Warding section's style props. The `.map()` callback provides `tip` (a `WardingTip` with a `.color` property), but the styles used `${wColor}` instead of `${tip.color}`.

**Fix:** Replaced all 4 instances of `wColor` with `tip.color` on lines 338, 341, and 342:
- `style={{ background: \`${wColor}06\`, ... }}` → `style={{ background: \`${tip.color}06\`, ... }}`
- Same for border, borderLeft, and icon color styles

---

### Task 2: Merge Patches & Meta Sub-Tabs into One Scrollable View
**File:** `src/components/moba/tabs/patches-meta-tab.tsx`

**Changes:**
1. **Removed `activeSection` state** (line 529) — no longer needed since all content shows at once
2. **Removed sub-tab switcher UI** (lines 679-702) — the 3-tab bar (Análisis & Meta / Historial de Parches / Combos Rotos) is gone
3. **Removed all conditional rendering** based on `activeSection` — all 3 sections now render unconditionally in order:
   - RiotPatchNotesBanner → MetaImpactSection → PatchAnalysisSection → S/A/B Tier Champions → Historial de Parches → Insights/Combos Rotos → Resumen IA placeholder
4. **Enhanced RiotPatchNotesBanner** — now accepts a `version` prop and constructs a specific URL like `https://www.leagueoflegends.com/es-es/news/game-updates/patch-14-12-notes/`. The banner is more prominent with larger sizing, stronger border, and version badge.
5. **Added "Notas de Parche — Resumen IA" placeholder section** — a glass card with dashed border showing "Próximamente" status, Sparkles icon animation, descriptive text about the planned `/api/riot-patch-notes` endpoint, and a link to read official notes in the meantime.

---

### Task 3: Redesign Combos Tab to Look Like LoL Champion Select
**File:** `src/components/moba/tabs/combos-tab.tsx`

**Changes to `ComboListCard` (left panel):**
- Replaced horizontal champion portrait strip (`flex items-center gap-1`) with a **vertical champion stack** on the left side of each card
- Each champion portrait is 36x36px (40x40 when selected) with 10px vertical overlap (`marginTop: -10px`)
- First champion (KEY) has a 2px gold border; others have 1.5px muted border
- Card layout is now `[vertical champion stack] + [combo name + badges]` using `flex items-stretch`

**Changes to `ComboDetailPanel` (right panel):**
- Replaced the staggered champion portrait strip with a **Champion Select Grid** layout
- 5 champions displayed in a centered row, each in a 64x64px square frame
- First champion (KEY) has 2.5px gold border with prominent glow shadow
- Each portrait has a numbered badge (top-right) and champion name below
- First champion shows "KEY" label at bottom with gold gradient overlay
- Animations changed from vertical slide-in to scale-in for a lock-in effect

**No changes to mobile layout or Pro Compositions section.**

---

**All changes pass ESLint with zero new errors. Dev server compiles and renders successfully.**

---

## 2026-05-01 — Full App Error Audit & Fixes (Round 12)

### Summary
Complete audit of all 31+ source files. Found and fixed 8 bugs across 6 files.

### Bug 1 (CRITICAL): patches-feed.json array not parsed
**File:** `src/components/moba/tabs/patches-meta-tab.tsx:714`
**Problem:** `patches-feed.json` is a bare JSON array `[...]`, but code cast it as `PatchesFeed` and did `data.patches || []`. Since arrays have no `.patches` property, feed patches never loaded — the timeline was always empty.
**Fix:** `setFeedPatches(Array.isArray(raw) ? raw : (raw as PatchesFeed).patches || [])`

### Bug 2 (CRITICAL): tierlist-feed.json missing `weeklyTop` field
**File:** `public/tierlist-feed.json`
**Problem:** Component reads `feedData?.lol?.weeklyTop || []` but the JSON had no `weeklyTop` key. The "Top Movimientos Semanales" section was always empty.
**Fix:** Added `weeklyTop` array with 10 champions (5 rising, 5 falling) derived from existing rising/falling data.

### Bug 3 (HIGH): ITEM_DESCRIPTIONS missing "Dawnstone" key
**File:** `src/components/moba/tabs/patches-meta-tab.tsx:115`
**Problem:** Feed item `"Dawnstone (support mythic)"` gets split to `"Dawnstone"` before lookup, but only `"Dawnstone (support mythic)"` existed as a key.
**Fix:** Added both `"Dawnstone"` and `"Dawnstone (support mythic)"` keys.

### Bug 4 (HIGH): `wrStatColor` label mismatch in champion modal
**File:** `src/components/moba/modal/helpers.ts:5-8`
**Problem:** Function checked for labels `'WR'` and `'Ban'`, but `champion-stats.tsx` passes `'Win Rate'`, `'Ban Rate'`, `'Pick Rate'`, `'Pro Pick'`. ALL modal stats rendered with wrong color (always `C.warning`).
**Fix:** Changed to `label.includes('Win')`, `label.includes('Ban')`, `label.includes('Pick')`.

### Bug 5 (MEDIUM): TIER_CONFIG crash on undefined tier
**Files:** `tier-section.tsx:21`, `comparison-tab.tsx:238`
**Problem:** `TIER_CONFIG[tier]` without null check — crashes if tier is 'D' or any unexpected value.
**Fix:** Added fallback: `TIER_CONFIG[tier] || TIER_CONFIG['B']`

### Bug 6 (MEDIUM): `isFiltering` always true
**File:** `src/components/moba/tabs/patches-meta-tab.tsx:791`
**Problem:** `const isFiltering = selectedGame !== null` was ALWAYS true when a game was selected, hiding game filter buttons permanently.
**Fix:** Renamed to `showGameFilter = selectedGame === null` and updated references.

### Bug 7 (LOW): Unused import `CategoryBadge`
**File:** `src/components/moba/tabs/patches-meta-tab.tsx:15`
**Fix:** Removed unused import.

### Bug 8 (LOW): `key={i}` in rising/falling maps
**File:** `src/components/moba/tabs/tier-list-tab.tsx:443,513`
**Fix:** Changed to `key={name}` for stable reconciliation.

### Also fixed:
- `FeedPatch` interface: made `game` and `status` optional to match actual JSON data
- `CoachingTab` type: changed `selectedGame: string` to `selectedGame: string | null`

**Build: ✅ Clean. All routes compile successfully.**

---

Task ID: 2-a
Agent: Main Agent (Round 13)
Task: Remove patches sub-tabs, flatten content, fix game filter bug, add item descriptions

Work Log:
- Removed `activeSection` state from PatchesMetaTab component
- Removed sub-tab switcher UI (Análisis & Meta / Historial de Parches)
- Flattened all content into one scrollable view: RiotPatchNotesBanner → Season 2 Banner → MetaImpact → PatchAnalysis → TierSummary → GameFilters → Timeline → PatchList
- Fixed game filter bug: changed `{!showGameFilter && (` to `{showGameFilter && (` so filters only show when no game is selected
- Added missing item descriptions for Dawnstone, First Strike, and Hail of Blades
- Build verified clean

Stage Summary:
- Patches tab is now a clean single-page scrollable view without confusing sub-tabs
- Game filter buttons correctly appear only when no specific game is selected
- All items in patch changes now have proper descriptions
