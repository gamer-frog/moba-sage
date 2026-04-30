# SOP 01 — Actualización de Parches

## Objetivo
Obtener el parche más reciente de League of Legends desde fuentes oficiales de Riot Games, procesarlo, traducirlo al español de forma mejorada, y actualizar los archivos de datos de la app.

## Frecuencia
- **Ideal:** Cada vez que Riot lanza un parche nuevo (cada ~2 semanas)
- **Cron:** Verificar cada 30 min si hay parche nuevo

## Fuentes de Datos Oficiales

### 1. Parche Notes de Riot (inglés)
- **URL base:** `https://www.leagueoflegends.com/en-us/news/game-updates/patch-{version}-notes/`
- **Versiones activas:** Consultar `https://ddragon.leagueoflegends.com/api/versions.json`
- **API de versión:** `https://ddragon.leagueoflegends.com/realms/na.json` → `v` field

### 2. Parche Notes en español (referencia)
- **URL:** `https://www.leagueoflegends.com/es-es/news/game-updates/patch-{version}-notes/`
- **Usar como referencia** pero mejorar la traducción

### 3. Data Dragon para assets
- **Champion images:** `https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{name}.png`
- **Item images:** `https://ddragon.leagueoflegends.com/cdn/{version}/img/item/{id}.png`
- **Splash art:** `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/{name}_0.jpg`

## Pasos

### PASO 1: Detectar versión actual
```
1. Hacer GET a https://ddragon.leagueoflegends.com/api/versions.json
2. La primera versión del array es la más reciente
3. Comparar con la versión guardada en /public/data/patch-analysis.json → campo "version"
4. Si son iguales → FIN (no hay parche nuevo)
5. Si son diferentes → Continuar al PASO 2
```

### PASO 2: Obtener patch notes oficiales
```
1. Formatear versión para URL: reemplazar puntos por guiones (ej: "15.4.1" → "15-4-1")
2. Hacer web scrape de:
   - EN: https://www.leagueoflegends.com/en-us/news/game-updates/patch-{version}-notes/
   - ES: https://www.leagueoflegends.com/es-es/news/game-updates/patch-{version}-notes/
3. Extraer:
   - Resumen del parche
   - Cambios a campeones (buffs/nerfs/adjustments)
   - Cambios a items
   - Cambios a sistemas (runas, jungle, etc.)
   - Campeones nuevos/reworks
```

### PASO 3: Procesar cambios por campeón
```
Para cada campeón mencionado en el parche:
1. Identificar tipo de cambio: "buff", "nerf", "adjust"
   - Buff = estadísticas aumentadas, cooldowns reducidos, daño mejorado
   - Nerf = estadísticas reducidas, cooldowns aumentados, daño reducido
   - Adjust = cambios de mecánicas sin buff/nerf claro
2. Determinar magnitud del impacto:
   - HIGH = cambios significativos que afectan la viabilidad en meta
   - MEDIUM = ajustes moderados
   - LOW = cambios menores (estadísticas base, tooltips)
3. Extraer descripción del cambio en inglés
```

### PASO 4: Generar traducción mejorada
```
Para cada cambio:
1. Tomar el texto en inglés del parche oficial
2. Traducir al español (es-AR, tono gaming):
   - Usar terminología de LoL en español
   - Mantener nombres de habilidades en inglés entre paréntesis
   - Ejemplo: "Q - Disparo Penetrante (Piercing Arrow)"
3. Mejorar vs traducción oficial de Riot:
   - Agregar contexto de impacto en el meta
   - Explicar con qué sinergias se beneficia/perjudica
   - Formato más legible que el oficial
4. Generar un "digest" de 2-3 oraciones resumiendo el parche
```

### PASO 5: Actualizar archivos JSON

#### 5a. Actualizar `/public/data/patch-analysis.json`
```json
{
  "version": "15.5.1",
  "date": "2026-04-28",
  "status": "current",
  "summary": "Patch digest en español...",
  "highlights": ["Yasuo buff significativo", "Jinx nerf a W"],
  "champions": [
    {
      "name": "Yasuo",
      "role": "Mid",
      "changes": [
        {
          "type": "buff",
          "severity": "HIGH",
          "ability": "Q",
          "description": "Daño aumentado de 20/45/70/95/120 a 25/50/75/100/130",
          "descriptionEs": "Daño de Disparo de Tormenta aumentado, lo que mejora su tradeo en lane"
        }
      ],
      "impact": "rising",
      "impactReason": "Buff significativo puede devolverlo a tier A en mid lane"
    }
  ],
  "items": [
    {
      "name": "Edge of Night",
      "id": "3814",
      "changes": "Costo reducido de 2900 a 2700",
      "type": "buff"
    }
  ],
  "systems": [
    {
      "category": "Jungle",
      "description": "Monstruos épicos dan 50 menos XP en niveles 1-5",
      "impact": "Jungle Early Game reducido"
    }
  ],
  "metaDirection": [
    "Mages fortalecidos por cambios a items de AP",
    "Assassins nerfeados por reducción de lethality"
  ]
}
```

#### 5b. Actualizar `/patches-feed.json`
Agregar entrada al array `patches` con:
```json
{
  "id": 20260428,
  "version": "15.5.1",
  "title": "Patch 15.5.1 Notes",
  "summary": "Resumen en español mejorado...",
  "digest": "Digest de 2 oraciones...",
  "game": "LoL",
  "sourceGame": "LoL",
  "date": "2026-04-28",
  "status": "live",
  "url": "https://www.leagueoflegends.com/en-us/news/game-updates/patch-15-5-1-notes/",
  "changes": {
    "buffs": ["Yasuo Q daño aumentado", "Syndra E rango aumentado"],
    "nerfs": ["Jinx W slow reducido", "Zed R ratio reducido"],
    "newItems": [],
    "adjustments": ["Lee Sin W shield reducido"]
  },
  "highlights": [
    "Yasuo recibe buff significativo a Q",
    "Jinx nerfeada en utilidad"
  ]
}
```

### PASO 6: Actualizar API version
```
1. Hacer GET a https://ddragon.leagueoflegends.com/realms/na.json
2. Extraer campo "v" (versión) y "dd" (fecha del CDN)
3. Estos datos se usan en /api/version endpoint
4. La app (page.tsx) usa updateDdVersion() para actualizar las URLs de imágenes
```

## Output Esperado
- `/public/data/patch-analysis.json` actualizado
- `/patches-feed.json` actualizado con nuevo parche
- Log en `operations/logs/` con timestamp y resultado

## Error Handling
- Si Riot devuelve 404 → el parche no existe aún, reintentar en 30 min
- Si la scrape falla → intentar con versión alternativa (patch X.Y.0)
- Si el push falla → reportar error, no modificar archivos locales
