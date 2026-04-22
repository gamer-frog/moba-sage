# TICKS — MOBA SAGE
> Auto-maintenance tasks executed by cron jobs
> Last run: 2026-04-22 00:45 BA | Next run: 2026-04-22 06:00 BA

## CRON JOBS CONFIGURED
| Job | ID | Schedule | Descripción |
|-----|-----|----------|-------------|
| Verificación Diaria | 111406 | 06:00, 12:00, 18:00 BA | Build + Vercel 200 + APIs + DDragon sync |
| Ralph Loop Lunes | 111408 | Lun 08:30 BA | Scan + critique + competidores + fixes |
| Ralph Loop Jueves | 111409 | Jue 08:30 BA | Scan + critique + competidores + fixes |

## DAILY (every 6h) — Job 111406
- [ ] T1: Build verification — `npm run build` must pass with 0 errors
- [ ] T2: Live site check — curl https://moba-sage.vercel.app/ must return 200
- [ ] T3: API health — all /api/* endpoints return 200 with valid JSON
- [ ] T4: DDragon version sync — check if LoL patch changed, update if needed

## WEEKLY (Ralph Loop) — Jobs 111408, 111409
- [ ] R1: Scan app with agent-browser — visit all tabs, verify content loads
- [ ] R2: Critique — find visual bugs, broken links, missing data, empty tabs
- [ ] R3: Competitor scan — search for LoL analytics apps, list missing features
- [ ] R4: Fix bugs — implement max 3 fixes per run
- [ ] R5: Aesthetic review — check visual consistency, spacing, colors
- [ ] R6: Update activity-feed.json with changes made
- [ ] R7: Update ticks.md with log entry

## LOG
- [2026-04-22 00:45 BA] Setup inicial: 3 crons configurados (diaria + 2 Ralph Loop). Popup + tabs separadas deployadas y verificadas en Vercel. Commit 1a46a28.
