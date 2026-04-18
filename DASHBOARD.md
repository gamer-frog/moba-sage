# DASHBOARD — MOBA SAGE
> Actualizado: 2026-04-18 17:00 BA | Tick #4

## Estado
| Campo | Valor |
|-------|-------|
| Tareas activas | 7 |
| Estado | ACTIVO |
| Deploy | Vercel (moba-sage.vercel.app) |
| Repo | github.com/gamer-frog/moba-sage |
| Branch | main |
| Campeones LoL | 66 (8 S-tier, 31 A-tier, 27 otros) |
| Campeones WR | 22 (6 S-tier, 11 A-tier, 5 otros) |
| Patch LoL | 16.8 (actualizado desde 14.8) |
| Patch WR | 6.4 |
| CRONS activas | 3 |

## CRONS Configuradas
| Cron | Frecuencia | Job ID | Descripción |
|------|-----------|--------|-------------|
| Pipeline Circular | Cada 2 horas | 101230 | Ejecuta 14 tareas automáticas del pipeline |
| Mantenimiento | Cada 6 horas | 101243 | Lee TASKS.md, ejecuta tarea, actualiza DASHBOARD |
| Verificar Deploy | Diario 12:00 BA | 101244 | Verifica que Vercel responda 200 |

## Que hago
- Pipeline de TAREAS circular (14 tareas automáticas)
- Tier List S/A LoL (Patch 16.8) — 66 campeones
- Tier List S/A Wild Rift (Patch 6.4) — 22 campeones
- Análisis IA automático por campeón (pre-escrito)
- Builds rotos + counters + sinergias (S-tier ambos juegos)
- Cosas Rotas: splash arts S/A tier + builds + insights IA
- Escena competitiva pro (LCK/LPL/LEC/LCS)
- Perfil de invocador (demo mode)
- Roadmap de desarrollo (7 categorías, 30+ features)
- Banner transparencia (fuentes, update, beneficios)

## Necesita al CEO
| Que | Urgencia |
|-----|----------|
| API Key de Riot Games | ALTA — Permite datos reales de ranked/invocadores |
| API Key U.GG/Mobalytics | MEDIA — Estadísticas actualizadas automáticamente |
| Feedback usuarios | BAJA — Escuchar qué features quieren más |

## TAREAS Pipeline (14 tareas circulares)
| # | Tarea | Intervalo | Status |
|---|-------|-----------|--------|
| 0 | Verificar nuevas patches | 30 min | done |
| 1 | Actualizar tier list | 60 min | done |
| 2 | Generar insights de IA | 45 min | pending |
| 3 | Detectar cosas rotas | 30 min | pending |
| 4 | Actualizar badges de frescura | 120 min | done |
| 5 | Analizar sinergias de meta | 90 min | pending |
| 6 | Actualizar counters | 60 min | done |
| 7 | Sincronizar datos de Wild Rift | 180 min | pending |
| 8 | Generar resumen semanal | 1440 min | pending |
| 9 | Verificar builds recomendados | 120 min | done |
| 10 | Monitorear tier changes | 30 min | done |
| 11 | Actualizar runas sugeridas | 240 min | pending |
| 12 | Procesar feedback de usuarios | 60 min | pending |
| 13 | Backup de base de datos | 360 min | done |

## Log
- [2026-04-17] Build inicial + deploy a Vercel
- [2026-04-17] Landing page con selector LoL/Wild Rift
- [2026-04-17] Tab de Perfil de Invocador (demo)
- [2026-04-17] Tab Competitivo con pro picks (LCK/LPL/LEC/LCS)
- [2026-04-17] Tab Roadmap con 7 categorías y 30+ features planificadas
- [2026-04-17] Builds rotos por campeón S-tier (1-2 builds cada uno)
- [2026-04-17] Análisis IA automático pre-escrito para Tier S
- [2026-04-17] Iconos de campeones en Cosas Rotas
- [2026-04-17] Banner de transparencia en landing (fuentes, update, beneficios)
- [2026-04-17] DASHBOARD.md + TASKS.md creados
- [2026-04-18] CRONS configuradas (Pipeline 2h, Mantenimiento 6h, Deploy check diario)
- [2026-04-18] Git push de todas las features acumuladas
- [2026-04-18] Cosas Rotas mejorada: splash arts S/A tier + builds rotos + grid A-tier
- [2026-04-18] Wild Rift datos reales: 22 campeones (6 S-tier, 11 A-tier)
- [2026-04-18] WR: Patch 6.4, builds, counters, sinergias, análisis IA para S-tier
- [2026-04-18] WR: "coming soon" reemplazado con dashboard completo
- [2026-04-18] DASHBOARD.md Tick #3 actualizado
- [2026-04-18] TICK #4: Patch LoL actualizado 14.8 → 16.8.1 (70 archivos)
- [2026-04-18] T2 completada: Git sync + patch update
- [2026-04-18] WR version calculation fix (ya no daba negativo)
