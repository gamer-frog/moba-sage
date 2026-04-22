# TICKS — MOBA SAGE
> Auto-maintenance tasks executed by cron jobs
> Last run: — | Next run: —

## DAILY (every 6h)
- [ ] T1: Build verification — `npm run build` must pass with 0 errors
- [ ] T2: Live site check — curl https://moba-sage.vercel.app/ must return 200
- [ ] T3: API health — all /api/* endpoints return 200 with valid JSON
- [ ] T4: DDragon version sync — check if LoL patch changed, update if needed

## HOURLY
- [ ] H1: Uptime ping — curl moba-sage.vercel.app, alert if not 200
- [ ] H2: Console error check — scan for JS errors via browser automation

## WEEKLY (every Monday)
- [ ] W1: Competitor scan — search for LoL analytics apps, note features
- [ ] W2: Full audit — accessibility, SEO, performance, data freshness
- [ ] W3: Dependency update — check for outdated/vulnerable packages
- [ ] W4: Data quality — verify champion data completeness

## PER DEPLOY
- [ ] D1: Post-deploy verification — all tabs load, modals work, images load
- [ ] D2: Activity feed update — add entry to activity-feed.json
- [ ] D3: Screenshot — capture key pages for visual regression

## RALPH LOOP (continuous improvement)
- [ ] R1: Scan app with web reader, analyze content quality
- [ ] R2: Compare with 3 competitor apps, list missing features
- [ ] R3: Generate improvement suggestions ranked by impact
- [ ] R4: Auto-fix: remove dead code, unused imports, typos
- [ ] R5: Aesthetic review: check visual consistency, spacing, colors
- [ ] R6: Mobile test: verify responsive behavior

## LOG
<!-- Entries added automatically by cron jobs -->
