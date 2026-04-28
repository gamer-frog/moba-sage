# SOP 03 — Verificación de Salud del Sitio

## Objetivo
Verificar que moba-sage.vercel.app está funcionando correctamente: no hay errores de build, las APIs responden, y los datos son válidos.

## Frecuencia
- **Cron:** Cada 30 minutos
- **Tipo:** Siempre activo (health check básico)

## Pasos

### PASO 1: Verificar que el sitio carga
```
1. Hacer GET a https://moba-sage.vercel.app
2. Verificar status code = 200
3. Verificar que el HTML contiene "MOBA SAGE"
4. Si falla → REPORTAR CRITICAL
```

### PASO 2: Verificar APIs internas
```
Para cada endpoint, hacer GET y verificar respuesta:

/api/version    → debe tener { "lol": "X.Y.Z", "wr": "X.Y", "gamePatch": "X.Y" }
/api/champions  → debe ser array no vacío
/api/patches    → debe ser array
/api/insights   → debe ser array
/api/tasks      → debe ser array
/api/combos     → debe ser array
/api/pro-picks  → debe ser array

Si alguno falla (status != 200 o data vacía):
  → REPORTAR WARNING con endpoint específico
```

### PASO 3: Verificar archivos de datos JSON
```
1. Verificar que /data/tierlist-feed.json existe y es JSON válido
2. Verificar que /data/patch-analysis.json existe y es JSON válido
3. Verificar que /patches-feed.json existe y es JSON válido
4. Verificar que /activity-feed.json existe y es JSON válido

Para cada archivo:
  - Tamaño > 0
  - Parseable como JSON
  - Campos obligatorios presentes
```

### PASO 4: Verificar datos no estén stale
```
1. Leer metaLastUpdated de tierlist-feed.json
2. Si es más viejo que 48 horas → REPORTAR WARNING
3. Leer version de patch-analysis.json
4. Comparar con versión actual de Data Dragon
5. Si difieren → REPORTAR INFO (hay parche nuevo disponible)
```

### PASO 5: Verificar responsive ( desktop)
```
1. Navegar a https://moba-sage.vercel.app en viewport 1440x900
2. Seleccionar "League of Legends"
3. Verificar:
   - No hay horizontal scrollbar
   - main.right <= viewport width
   - Sidebar visible a la izquierda
4. Si overflow detectado → REPORTAR WARNING
```

### PASO 6: Verificar responsive (mobile)
```
1. Navegar a https://moba-sage.vercel.app en viewport 390x844
2. Seleccionar "League of Legends"
3. Verificar:
   - Bottom nav visible
   - No hay horizontal scroll
   - Contenido legible
4. Si hay problemas → REPORTAR WARNING
```

### PASO 7: Generar reporte
```
Formatear resultado como:
  - STATUS: OK / WARNING / CRITICAL
  - Timestamp
  - Detalle de cada check (PASS/FAIL)
  - Recomendaciones si hay issues
```

## Output Esperado
- Reporte de salud con status
- Log en `operations/logs/`
- Notificación via Discord solo si hay WARNING o CRITICAL

## Códigos de Estado
- **OK** → Todo funciona correctamente
- **WARNING** → Algo menor falló (API lenta, data stale)
- **CRITICAL** → Sitio caído o data corrupta

## Error Handling
- Si el sitio está caído → reintentar 1 vez en 30 segundos
- Si sigue caído → REPORTAR CRITICAL inmediatamente
- Si las APIs fallan → verificar si es Vercel cold start (esperar 10s y reintentar)
