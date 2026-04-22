# TICKS — MOBA SAGE
> Auto-maintenance tasks executed by cron jobs
> Last run: 2026-04-22 01:45 BA | Next run: 2026-04-22 02:00 BA (cada 15 min)

## CRON JOBS CONFIGURED
| Job | ID | Schedule | Descripción |
|-----|-----|----------|-------------|
| Verificación Diaria | 111406 | 06:00, 12:00, 18:00 BA | Build + Vercel 200 + APIs + DDragon sync |
| Ralph Loop Auto-Mejora | 111446 | Cada 15 minutos | Scan + critique + competidores + fixes + push |

## DAILY (every 6h) — Job 111406
- [ ] T1: Build verification — `npm run build` must pass with 0 errors
- [ ] T2: Live site check — curl https://moba-sage.vercel.app/ must return 200
- [ ] T3: API health — all /api/* endpoints return 200 with valid JSON
- [ ] T4: DDragon version sync — check if LoL patch changed, update if needed

## RALPH LOOP (cada 15 min) — Job 111446
- [ ] R1: Scan app con agent-browser — visitá todas las tabs, verificá que cargue contenido
- [ ] R2: Criticar — encontrá bugs visuales, broken links, missing data, empty tabs
- [ ] R3: Competitor scan — search LoL analytics apps, listá features que faltan
- [ ] R4: Fix bugs — implementá max 3 fixes por run
- [ ] R5: Aesthetic review — check visual consistency, spacing, colors
- [ ] R6: Update activity-feed.json con cambios hechos
- [ ] R7: Update ticks.md con log entry
- [ ] R8: Git push si hubo cambios
- [ ] R9: SILENCIO salvo discovery o error

## REGLAS
- No chat IA flotante
- No login, no downloads, no Google auth
- No git pull --rebase
- Todo en español
- Verificar build antes de push

## LOG
- [2026-04-22 00:45 BA] Setup inicial: 3 crons configurados (diaria + 2 Ralph Loop). Popup + tabs separadas deployadas y verificadas en Vercel. Commit 1a46a28.
- [2026-04-22 01:23 BA] Refactor crons: eliminados Ralph Loops semanales (111408, 111409). Creado Ralph Loop auto-mejora cada 15 min (111446). Fix popup close bug (eliminado estado `dismissed` que mataba AnimatePresence).
- [2026-04-22 01:40 BA] Feature: Meta-builds scraper API (/api/meta-builds). Commit c15326f.
- [2026-04-22 01:45 BA] Ralph Loop QA: Scan completo 10 tabs. Bugs: popup no cierra (CRITICAL), search no limpia (MAJOR). Fixes: popup reescrito (AnimatePresence mode=wait, useCallback, type=button), botón clear X en búsqueda. Build OK.
