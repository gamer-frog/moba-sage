# MOBA-SAGE — Tareas Pendientes

## Contexto
- Repo: `gamer-frog/moba-sage` (public)
- Token: usar el PAT de gamer-frog (guardado en config) para pushear correctamente
- Deploy: Vercel (moba-sage.vercel.app) — redoploy manual ya que los commits previos no deployaron
- App: Next.js 16, App Router, Framer Motion, Tailwind 4, Data Dragon
- Archivo principal: `src/app/page.tsx` (644 líneas, ~30 useState, 7 useEffect)
- Ultimo commit deployado en Vercel: `5c9799a` (hace ~12h)
- Commits pendientes de deploy: 18 commits (todos validos, esperando redoploy)

---

## Ronda 1 — Completada (6 commits)
- [x] fetchData resiliente — safeJson, partial failure tolerance
- [x] Tab Comparar en BottomNav mobile (7 tabs primary)
- [x] Error handling en 4 APIs: /champions, /insights, /pro-picks, /combos

## Ronda 2 — Completada (9 commits)
- [x] Cache-Control headers en 5 API routes (s-maxage=300, stale-while-revalidate=600)
- [x] loading.tsx con spinner LoL-themed
- [x] Notes API: strip URLs/markdown, duplicate detection, rate limiting
- [x] Scroll to top al cambiar tabs (handleTabChange)
- [x] Error handling en tasks PUT endpoint

## Ronda 3 — Completada (3 commits)
- [x] robots.txt actualizado con sitemap, crawl-delay, /api/ disallow
- [x] sitemap.ts dinámico (Next.js metadata API)
- [x] manifest.json para PWA (install prompt mobile)

---

## Pendiente — Proxima Ronda

### P0 — Arquitectura (riesgo alto, requiere testing)
- [ ] **Refactor page.tsx**: Extraer custom hooks (useGameData, useSummonerSearch, useFavorites, useGlobalSearch)
- [ ] **Unificar tipos**: `src/data/types.ts` tiene Champion duplicado con campos que no coinciden con `src/lib/data.ts`
- [ ] **Extraer data hardcoded de data.ts** (157KB, ~3900 líneas) — mover a JSON o DB
- [ ] **Routing real**: App Router con `/[game]/tierlist`, `/[game]/champions/[name]`, etc.

### P1 — Performance & Funcionalidad
- [ ] **SWR o TanStack Query**: Cache inteligente en cliente, revalidación en background
- [ ] **vercel.json conflicto**: Tiene `Cache-Control: no-store` que pisa los headers de cache que agregué. HAY QUE SACARLO
- [ ] **Prefetch datos al elegir juego**: Cuando el user selecciona LoL/WR, prefetchear las APIs en el game-selector
- [ ] **Code splitting agresivo**: Los 8 tabs lazy-loaded pueden tener loading mejor (skeleton por tab)
- [ ] **Image optimization**: blurDataURL placeholder para champion icons, priority loading para above-the-fold

### P2 — Seguridad & A11y
- [ ] **Auth en API /notes**: Validar que el author existe o agregar algún mecanismo de autenticación
- [ ] **DELETE en /notes sin auth**: Cualquiera puede borrar notas pasando `?id=xxx`
- [ ] **Focus trapping** en sidebar drawer y modales
- [ ] **Skip to content link** para teclado
- [ ] **ARIA live regions** para resultados de búsqueda dinámicos

### P3 — Cleanup & Polish
- [ ] **TabContent props**: 17+ props pasados manualmente — extraer context (GameDataContext)
- [ ] **Console.error consistente**: Algunas APIs usan `console.error`, otras `console.warn`
- [ ] **Type safety**: `any` types en algunos componentes, Casts innecesarios
- [ ] **Dead code**: Revisar si hay imports o funciones sin usar
- [ ] **Bundle analysis**: Verificar tamaño del bundle JS con `@next/bundle-analyzer`

### P-Extra — Features nuevas
- [ ] **PWA completo**: Service worker, offline support, iconos 192/512
- [ ] **OG Image dinámico**: Generar imagen para compartir con `/api/og` (vercel/og)
- [ ] **Champion detail page**: Routing real `/champions/[name]` con splash art, stats, builds
- [ ] **Dark/Light theme toggle**: El app siempre es dark, pero podría soportar light
- [ ] **i18n**: Soportar inglés además de español
- [ ] **Notificaciones push**: Patch notes nuevos, tier changes

---

## Bugs Conocidos
- [ ] **Vercel no deploya**: 18 commits en GitHub pero Vercel nunca buildió. Necesita redoploy manual o re-conectar webhook.
- [ ] **Zaahen**: Es un campeón VALIDO — NO marcar como error en auditorías

## Notas Importantes
- Siempre pushear con el PAT de gamer-frog (NO usar el de electronica-frog)
- La data de campeones está en `src/lib/data.ts` (157KB) — no tocar sin saber qué se hace
- Los tabs usan dynamic imports con TabSkeleton como loading
- El sidebar tiene tabs de "dev" (novedades, ideas, tareas, roadmap) que son para uso interno
- FloatingNotes persiste en GitHub (data/community-notes.json) via API
- El cron `/api/cron` corre cada 30 min en Vercel (577 líneas)
