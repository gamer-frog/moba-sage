# TASKS — MOBA SAGE

## TICK ACTUAL: #5

## DEV CRON ROTATION
| Ciclo | Task | Frecuencia | Feed |
|-------|------|-----------|------|
| 1 | DEV_PATCHES | Cada 2h | patches-feed.json |
| 2 | DEV_TIERLIST | Cada 4h | tierlist-feed.json |
| 3 | DEV_GUIDES | Cada 6h | guides-feed.json |
| 4 | DEV_MAINTENANCE | Daily | activity-feed.json |

## TAREAS COMPLETADAS (Esta Sesión)

### [x] F1: Beaufort font en headings/labels
- .lol-title y .lol-label en globals.css
- Aplicado en tier-list, broken-stuff, patches, combos, competitive, coaching

### [x] F3: Campanita de notificaciones
- Bell icon en header con red dot badge (count)
- Dropdown con entries del día desde activity-feed.json
- Click outside to close, animación framer-motion

### [x] F4: Popup Novedades mejorado
- Más visual, Beaufort font, spring animation
- localStorage para "no volver a mostrar"

### [x] F5: Patches actualizados con análisis profundo
- patches-feed.json con brokenChampions, metaShifts, tierBefore/tierAfter
- patch-analysis.json con keyChanges, systemChanges, itemImpact

### [x] F6: Tab COACHING nueva
- Mecánicas fundamentales (6 tips: last hitting, wave management, trading, creep block, map awareness, powerspikes)
- Warding por rol (Top, Jungle, Mid, ADC, Support)
- Composiciones Pro (5 comps: Engage, Poke, Split Push, Pick, Protect ADC)

### [x] F7: ANÁLISIS DE PARCHE en Cosas Rotas
- Sección nueva al inicio con patch info + quién queda roto/caído
- Datos desde patch-analysis.json

### [x] F8: Comps Pro en Coaching Tab
- 5 composiciones reales con campeones, playstyle, descripción

### [x] F9: Guide modales funcionales
- Click en card abre modal con champ icon, key points, tags
- Animación spring con framer-motion

### [x] F10: Merge Ideas + Roadmap
- Una sola tab con sub-tabs Ideas | Roadmap
- Roadmap eliminada como tab separada

### [x] F11: Combos expandibles inline
- Click en combo card muestra stats completos (WR, diff, description)

### [x] F12: Competitive Tab mobile cards
- Card layout en mobile (ProPickCard expandible)
- Tabla en desktop

### [x] F13: Ability tooltips en Champion Modal
- Hover Q/W/E/R muestra tooltip con nombre real + descripción
- 30 campeones mapeados con nombres de habilidades

### [x] F14: Dev tabs con [DEV] prefix
- Labels en #5b5a56, prefix [DEV] en sidebar

### [x] F15: Landing Page actualizada
- Tab count dinámico (11), nueva card Coaching IA

### [x] F16: Favicon 🔮
- Emoji SVG inline, removido CDN genérico

### [x] F17: prefers-reduced-motion
- CSS media query + GoldParticles respetan la preferencia

### [x] T5: Splash art en Cosas Rotas
- A-tier con SplashArtIcon + gold glow hover (sesión anterior)

## TAREAS PENDIENTES

### [ ] T4: Configurar TICK 93015
- Cron 401 desde sandbox. Payload documentado en TASKS.md.
- Requiere acceso admin para aplicar.

### [ ] T6: Datos de Wild Rift reales
- Agregar campeones WR a data.ts
- Coaching tab WR placeholder ya existe

### [ ] T7: Runas óptimas por campeón
- Campo `runes` con página + fragmentos en cada campeón

### [ ] T8: Sparklines de win rate
- Mini gráficos comparativos en tier list

### [ ] T9: PWA support
- manifest.json, service worker, offline

### [ ] T20: Theme system real (Blue/Red/Prestige)
- CSS vars definidas pero no consumidas. Reemplazar inline styles.

### [ ] T21: URL routing
- Deep linking, browser back/forward, shareable URLs

### [ ] T22: Riot API real para Profile
- Actualmente demo mode. Conectar con API key.

### [ ] T23: Pro data más completo
- Agregar VCS, PCS, CBLOL regions a competitive tab
- Links a VODs y match data

### [ ] T24: Unified wrColor() helper
- Extraer a helpers.ts, eliminar 3 duplicados

### [ ] T25: Match History (API)
- Historial de partidas en Profile tab

## TAREAS HISTÓRICAS
- [x] T1: Setup inicial
- [x] T2: Fix + push sync
- [x] T3: Pipeline documentado
