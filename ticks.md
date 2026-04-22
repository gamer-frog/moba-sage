# TICKS — MOBA SAGE
> Auto-maintenance tasks executed by cron jobs
> Last run: 2026-04-22 02:40 BA | Next run: 2026-04-22 02:55 BA (cada 15 min)

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
- [2026-04-22 02:02 BA] Ralph Loop QA: Scan completo + competidores (OP.GG, Blitz, Mobalytics, U.GG, Porofessor, STATUP). 3 Fixes: (1) WR patch mismatch 17.8→6.8 en todos los archivos (API, banner, data, patches API), (2) Skill icon overlay duplicado Q Q→Q cuando imagen falla, (3) Popup close z-index 200→201 + Escape handler. Build OK.
- [2026-04-22 02:02 BA] Ralph Loop Meta Update: Patch 16.8→26.8 en 8 archivos. S-tier actualizado con datos reales (web search Mobalytics/U.GG/PropelRC/Tapin). Demoted: Master Yi, Lee Sin, Yasuo (S→A). Promoted: Garen, Katarina, Graves, Ashe (A→S). Nuevos S-tier: Nocturne, Blitzcrank, Brand, K'Sante, Viego. Total S-tier: 13 campeones. Fecha parche 2025→2026. Build OK.
- [2026-04-22 02:31 BA] Ralph Loop Web Scrape Meta: Tier list completamente actualizada con datos reales scrapeados de Blitz.gg, U.GG, Mobalytics, Metabot.gg. +7 nuevos campeones S-tier (Ornn, Briar, Aurelion Sol, Veigar, Nilah, Soraka, Zyra). Demotidos: Thresh, Darius, Caitlyn, K'Sante, Graves, Blitzcrank, Viego (pulled del parche). Nuevo campo metaUpdated + metaSources en interfaz Champion para distinguir datos frescos vs stale. WR/pick/ban rates actualizados con datos reales. Build OK.
- [2026-04-22 02:35 BA] Ralph Loop: Version API refactor (gamePatch separado de CDN version). Meta freshness indicator en Tier List (timestamp + fuentes). Banner muestra parche correcto. Commit hashes actualizados en activity-feed. Build OK.
- [2026-04-22 02:40 BA] Ralph Loop: Meta 26.8 refresh con web search (6 fuentes). Malphite B→S, Nautilus B→S, Diana A→S (datos reales Buildzcrank/PropelRC/Amber.gg/Blitz.gg/Mobalytics). Brand S→A. Kennen B→A. metaUpdated + metaSources en todos los promocionados. Fuentes expandidas a 6. Build OK.
