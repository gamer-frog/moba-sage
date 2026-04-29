# MOBA-SAGE — Tareas Pendientes

## Contexto
- Repo: `gamer-frog/moba-sage` (public)
- Pushear SIEMPRE como gamer-frog (PAT guardado en config)
- Deploy: Vercel (moba-sage.vercel.app)
- App: Next.js 16, App Router, Framer Motion, Tailwind 4, Data Dragon
- Archivo principal: `src/app/page.tsx` (644 lineas, ~30 useState, 7 useEffect)
- Data: `src/lib/data.ts` (157KB, ~3900 lineas) — NO tocar sin saber que se hace
- Zaahen ES un campeon VALIDO — nunca marcar como error

---

## Ralph Loop — Instrucciones para el Cron

El cron DEBE ejecutar un ciclo de mejora continua (Ralph Loop):

1. **VISITAR** la app en https://moba-sage.vercel.app/ usando el browser (agent-browser)
2. **NAVEGAR** por todos los tabs: Tier List, Parches, Rotas, Combos, Comparar, Coaching, Competitivo, Guias, Perfil, Novedades, Ideas, Tareas, Roadmap
3. **CRITICAR** — buscar estos tipos de problemas:
   - Bugs visuales (textos cortados, elementos fuera de lugar, colores raros)
   - UX problems (cosas que no responden al click, scroll roto, botones inutiles)
   - Contenido vacio o placeholder que deberia tener data real
   - Mobile responsiveness (probar en viewport mobile)
   - Accesibilidad (contrast, touch targets, focus states)
   - Performance (cosas lentas, flashes de contenido vacio)
   - Links rotos, imagenes rotas, iconos faltantes
   - Errores en consola del browser
4. **CORREGIR** el problema encontrado en el codigo fuente
5. **PUSHEAR** el fix como gamer-frog
6. **ACTUALIZAR** este archivo marcando lo que se hizo
7. **REPETIR** — ir al paso 1

Regla: Un fix por commit, mensajes claros. Si es riesgoso (refactor grande), no tocar.

---

## Ronda 1 — Completada
- [x] fetchData resiliente — safeJson, partial failure tolerance
- [x] Tab Comparar en BottomNav mobile (7 tabs primary)
- [x] Error handling en 4 APIs: /champions, /insights, /pro-picks, /combos

## Ronda 2 — Completada
- [x] Cache-Control headers en 5 API routes (s-maxage=300, stale-while-revalidate=600)
- [x] loading.tsx con spinner LoL-themed
- [x] Notes API: strip URLs/markdown, duplicate detection, rate limiting
- [x] Scroll to top al cambiar tabs (handleTabChange)
- [x] Error handling en tasks PUT endpoint

## Ronda 3 — Completada
- [x] robots.txt actualizado con sitemap, crawl-delay, /api/ disallow
- [x] sitemap.ts dinamico (Next.js metadata API)
- [x] manifest.json para PWA (install prompt mobile)
- [x] vercel.json: removido Cache-Control no-store que pisaba headers de cache
- [x] TASKS.md creado con todas las tareas pendientes
- [x] Crons cada 15 min para Ralph Loop

---

## Pendiente — Ralph Loop Targets

### Critica Visual & UX (para auditar con el browser)
- [ ] Revisar que TODOS los tabs carguen correctamente en mobile y desktop
- [ ] Verificar que la comparacion de campeones funcione (seleccionar 2 campeones, ver stats)
- [ ] Verificar que el tab Coaching muestre tips reales, no placeholders
- [ ] Verificar que el tab Competitivo muestre datos de pro picks
- [ ] Verificar que el tab Roadmap muestre el progreso correctamente
- [ ] Verificar que el tab Guias tenga contenido o redirija bien a Coaching
- [ ] Verificar que el buscador global (Cmd+K) filtre correctamente
- [ ] Verificar que el modal de campeon muestre splash art, stats, counters
- [ ] Verificar que la busqueda de summoner en Perfil funcione
- [ ] Verificar que FloatingNotes se abra, permita escribir y borrar
- [ ] Revisar el game selector landing — que las animaciones funcionen
- [ ] Revisar scrollbar y overflow en todos los tabs
- [ ] Verificar que los iconos de campeon carguen (Data Dragon)
- [ ] Revisar que el header muestre la version del parche correctamente
- [ ] Verificar el boton de back-to-top aparece y funciona
- [ ] Revisar la popup de actividad (novedades) al iniciar
- [ ] Verificar que el flash al cambiar de juego funcione
- [ ] Revisar el sidebar drawer en mobile (backdrop, animacion, cierre)
- [ ] Verificar el BottomNav en mobile — los 7 tabs son accesibles?

### P0 — Arquitectura (riesgo alto, NO tocar sin testing)
- [ ] Refactor page.tsx: Extraer custom hooks (useGameData, useSummonerSearch, useFavorites, useGlobalSearch)
- [ ] Unificar tipos: `src/data/types.ts` tiene Champion duplicado con campos que no coinciden con `src/lib/data.ts`
- [ ] Extraer data hardcoded de data.ts (157KB) — mover a JSON o DB
- [ ] Routing real: App Router con `/[game]/tierlist`, `/[game]/champions/[name]`

### P1 — Performance & Funcionalidad
- [ ] SWR o TanStack Query: Cache inteligente en cliente
- [ ] Prefetch datos al elegir juego en game-selector
- [ ] Code splitting: skeleton loading especifico por tab (no generico TabSkeleton)
- [ ] Image optimization: blurDataURL placeholder para champion icons
- [ ] Lazy loading del sidebar en mobile (no renderizar hasta que se abra)

### P2 — Seguridad & A11y
- [ ] Auth en API /notes (cualquiera puede borrar con DELETE ?id=xxx)
- [ ] Focus trapping en sidebar drawer y modales
- [ ] Skip to content link para teclado
- [ ] ARIA live regions para resultados de busqueda
- [ ] Verificar contraste de colores (WCAG AA)

### P3 — Cleanup & Polish
- [ ] TabContent props: 17+ props manuales — extraer GameDataContext
- [ ] Dead code: imports o funciones sin usar
- [ ] Type safety: any types, casts innecesarios
- [ ] Bundle analysis: @next/bundle-analyzer
- [ ] Console.error vs console.warn consistente

### P-Extra — Features nuevas
- [ ] PWA completo: Service worker, offline, iconos 192/512
- [ ] OG Image dinamico con vercel/og
- [ ] Champion detail page: routing real /champions/[name]
- [ ] Dark/Light theme toggle
- [ ] i18n: soportar ingles ademas de espanol

---

## Archivos Clave del Proyecto
- `src/app/page.tsx` — Componente principal (monolito, 644 lineas)
- `src/app/layout.tsx` — Layout con ErrorBoundary, MobaThemeProvider, Toaster
- `src/app/error.tsx` — Error boundary de ruta
- `src/app/not-found.tsx` — 404 page
- `src/app/loading.tsx` — Loading skeleton
- `src/app/globals.css` — Estilos (723 lineas, bastante completo)
- `src/app/api/champions/route.ts` — API campeones
- `src/app/api/patches/route.ts` — API parches
- `src/app/api/insights/route.ts` — API insights
- `src/app/api/tasks/route.ts` — API tareas
- `src/app/api/pro-picks/route.ts` — API pro picks
- `src/app/api/combos/route.ts` — API combos
- `src/app/api/version/route.ts` — API version
- `src/app/api/notes/route.ts` — API notas (persiste en GitHub)
- `src/app/api/cron/route.ts` — Cron v2.0 (577 lineas)
- `src/lib/data.ts` — Data hardcoded (157KB) — NO REFACTORIZAR
- `src/components/moba/sidebar-nav.tsx` — Sidebar navigation
- `src/components/moba/bottom-nav.tsx` — Bottom navigation mobile
- `src/components/moba/champion-icon.tsx` — Iconos de campeon (6 variantes)
- `src/components/moba/helpers.ts` — Helpers (URLs, mapeos, utilidades)
- `src/components/moba/constants.ts` — Constantes (tiers, roles, tabs)
- `src/components/moba/game-selector.tsx` — Game selector landing (349 lineas)
- `src/components/moba/app-header.tsx` — Header con notificaciones (442 lineas)
- `src/components/moba/loading-screen.tsx` — Loading screen inicial
- `src/components/moba/error-boundary.tsx` — Error boundary class component
- `src/components/moba/activity-popup.tsx` — Popup de actividad (289 lineas)
- `src/components/moba/floating-notes.tsx` — Notas flotantes (338 lineas)
- `src/components/moba/tabs/` — 13 tab components (tier-list, patches, broken, combos, comparison, coaching, competitive, guides, profile, tasks, ideas, activity, roadmap)

---

## Historial de Sesiones
- Sesion 1: fetchData resiliente, BottomNav, error handling APIs, cache headers, loading.tsx, notes security, scroll-to-top, SEO, PWA, vercel.json fix
