# SOP 02 — Actualización de Tier List

## Objetivo
Actualizar los datos de la tier list con la información más reciente del meta: win rates, pick rates, ban rates, builds óptimas y tendencias para cada campeón.

## Frecuencia
- **Cron:** Cada 30 minutos (verificar si hay datos nuevos)
- **Actualización real:** Cada vez que hay datos suficientes de nuevas partidas (~24-48h post-patch)

## Fuentes de Datos

### 1. U.GG (fuente primaria)
- **URL base:** `https://www.u.gg/lol/tier-list`
- **Datos por campeón:** `https://www.u.gg/lol/champions/{champion-name}/build`
- Incluye: Win rate, Pick rate, Ban rate, Build recomendada, Runas

### 2. OP.GG (respaldo)
- **URL:** `https://www.op.gg/tier-list`
- **Datos por campeón:** `https://www.op.gg/ champions/{champion-name}/builds`

### 3. Champion.gg (estadísticas avanzadas)
- **URL:** `https://champion.gg/statistics/`
- Incluye: Win rate por duración de partida, DPM, Gold diff

### 4. LoLalytics (data granular)
- **URL:** `https://www.lolalytics.com/lol/tierlist/`
- Datos segmentados por elo y patch

## Pasos

### PASO 1: Verificar versión del meta
```
1. Leer /public/data/tierlist-feed.json → campo "metaVersion" o "patchVersion"
2. Comparar con versión actual de Data Dragon
3. Si coinciden Y la data tiene menos de 6 horas → FIN
4. Si hay nuevo parche o data vieja → Continuar
```

### PASO 2: Obtener datos de tier list
```
1. Web scrape de https://www.u.gg/lol/tier-list
2. Para cada campeón, extraer:
   - Nombre
   - Rol (Top, Jungle, Mid, ADC, Support)
   - Win Rate (%)
   - Pick Rate (%)
   - Ban Rate (%)
   - Tier (S+, S, A+, A, B, C)
3. Formato: array de objetos Champion
```

### PASO 3: Asignar tiers
```
Reglas de tier assignment basadas en Win Rate + Pick Rate:

S+  → WR >= 53% AND Pick >= 5% (dominante)
S   → WR >= 52% AND (Pick >= 3% OR Ban >= 5%)
A+  → WR >= 51% AND Pick >= 2%
A   → WR >= 49% AND Pick >= 1%
B   → WR >= 47% OR (WR >= 45% AND Pick >= 2%)
C   → Todo lo demás
```

### PASO 4: Generar datos de builds
```
Para campeones S+ y S:
1. Obtener build de https://www.u.gg/lol/champions/{name}/build
2. Extraer:
   - Item build completo (6 items + orden)
   - Skill max order (Q > W > E > R)
   - Runas primarias y secundarias
3. Formatear como array de item IDs
```

### PASO 5: Calcular tendencias
```
1. Comparar datos actuales con datos anteriores (guardados)
2. Para cada campeón:
   - "rising" → WR subió > 1% en la última semana
   - "falling" → WR bajó > 1% en la última semana
   - "stable" → Cambio < 1%
3. Identificar "Top Movers" (mayores cambios)
```

### PASO 6: Actualizar `/public/data/tierlist-feed.json`
```json
{
  "version": "v10",
  "lastUpdated": "2026-04-28T23:00:00Z",
  "patchVersion": "15.5.1",
  "metaLastUpdated": "2026-04-28T23:00:00Z",
  "source": "u.gg + op.gg",
  "champions": [
    {
      "id": 1,
      "name": "Annie",
      "title": "La Niña Oscura",
      "role": "Mid",
      "tier": "S",
      "winRate": 52.5,
      "pickRate": 4.2,
      "banRate": 1.8,
      "trend": "rising",
      "build": ["3157", "3135", "4645", "3089", "3136", "3157"],
      "skills": "Q>W>E",
      "counters": ["Kassadin", "Yasuo"],
      "synergies": ["Amumu", "Sejuani"],
      "aiAnalysis": "Annie fuerte en meta actual gracias a...",
      "proBuild": { ... }
    }
  ],
  "weeklyChanges": {
    "rising": ["Annie", "Yasuo"],
    "falling": ["Jinx", "Zed"]
  }
}
```

### PASO 7: Actualizar archivos de datos de la app
```
1. Actualizar /api/champions → lee de tierlist-feed.json
2. Verificar integridad: todos los campeones tienen datos válidos
3. Limpiar datos stale (campeones sin actualización > 7 días)
```

## Output Esperado
- `/public/data/tierlist-feed.json` actualizado
- Champion data con tiers, builds, tendencias
- Log de cambios detectados

## Error Handling
- Si U.GG bloquea scrape → intentar con OP.GG
- Si ambas fuentes fallan → mantener datos anteriores, reportar error
- Si un campeón tiene datos inconsistentes → usar promedio de fuentes
