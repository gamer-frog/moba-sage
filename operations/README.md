# MOBA SAGE — Operaciones Automatizadas

Carpeta de SOPs (Standard Operating Procedures) que el bot ejecuta periodicamente via cron.

## Estructura

```
operations/
  README.md              ← Este archivo
  manifest.json          ← Indice de operaciones activas + estado
  01-patch-update.md     ← Actualizar parches (Riot → traducción → JSON)
  02-tierlist-update.md  ← Actualizar tier list (fuentes → datos → JSON)
  03-site-health.md      ← Verificar salud del sitio
  logs/
    YYYY-MM-DD.md        ← Logs de ejecución diaria
```

## Flujo del Cron

1. El cron se ejecuta cada 30 minutos
2. Lee `manifest.json` para saber qué operaciones están activas
3. Para cada operación activa, lee el archivo SOP correspondiente
4. Ejecuta los pasos descritos en orden
5. Si hay cambios (nuevos datos), los pushea al repo
6. Escribe el resultado en `logs/YYYY-MM-DD.md`
7. Reporta via Discord

## Convenciones

- Cada SOP tiene: objetivo, fuentes de datos, pasos, output esperado, frecuencia
- Los archivos JSON de datos van en `/public/data/`
- Los logs van en `operations/logs/`
- Si un paso falla, se reporta el error pero se continúa con los demás
