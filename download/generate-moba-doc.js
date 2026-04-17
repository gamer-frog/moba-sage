const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  PageOrientation, TabStopType, TabStopPosition, ExternalHyperlink,
  LevelFormat, TableOfContents,
} = require("docx");

// Color palette - Tech/Gaming themed (cool + medium + active)
const palette = {
  primary: "#0A1628",
  body: "#1A1A2E",
  secondary: "#5A6080",
  accent: "#C8AA6E",  // LoL gold
  accent2: "#0ACBE6", // LoL cyan
  surface: "#F8F9FF",
  tableBg: "#F1F3F8",
  tableHeader: "#E8EAF0",
};

const bodyFont = { ascii: "Calibri", eastAsia: "Microsoft YaHei" };
const headingFont = { ascii: "Calibri", eastAsia: "SimHei" };

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200, line: 312 },
    children: [new TextRun({ text, bold: true, size: 32, font: headingFont, color: palette.primary })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140, line: 312 },
    children: [new TextRun({ text, bold: true, size: 28, font: headingFont, color: palette.primary })],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100, line: 312 },
    children: [new TextRun({ text, bold: true, size: 24, font: headingFont, color: palette.accent })],
  });
}

function bodyText(text) {
  return new Paragraph({
    spacing: { after: 120, line: 312 },
    children: [new TextRun({ text, size: 22, font: bodyFont, color: palette.body })],
  });
}

function bulletItem(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 80, line: 312 },
    children: [new TextRun({ text, size: 22, font: bodyFont, color: palette.body })],
  });
}

function boldBodyText(boldPart, normalPart) {
  return new Paragraph({
    spacing: { after: 120, line: 312 },
    children: [
      new TextRun({ text: boldPart, bold: true, size: 22, font: bodyFont, color: palette.primary }),
      new TextRun({ text: normalPart, size: 22, font: bodyFont, color: palette.body }),
    ],
  });
}

function linkText(label, url) {
  return new Paragraph({
    spacing: { after: 100, line: 312 },
    children: [
      new ExternalHyperlink({
        children: [new TextRun({ text: label, style: "Hyperlink", size: 22, font: bodyFont })],
        link: url,
      }),
    ],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 60 }, children: [] });
}

function makeTableRow(cells, isHeader = false) {
  return new TableRow({
    tableHeader: isHeader,
    cantSplit: true,
    children: cells.map(text =>
      new TableCell({
        children: [new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [new TextRun({
            text,
            bold: isHeader,
            size: isHeader ? 21 : 20,
            font: bodyFont,
            color: isHeader ? palette.primary : palette.body,
          })],
        })],
        shading: isHeader ? { type: ShadingType.CLEAR, fill: palette.tableHeader } : undefined,
        margins: { top: 50, bottom: 50, left: 120, right: 120 },
      })
    ),
  });
}

function makeTable(headers, rows, colWidths) {
  const totalCols = headers.length;
  const defaultWidth = Math.floor(100 / totalCols);
  const widths = colWidths || headers.map(() => defaultWidth);

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: palette.accent },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: palette.accent },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      makeTableRow(headers, true),
      ...rows.map(row => makeTableRow(row)),
    ],
  });
}

// ==================== BUILD DOCUMENT ====================

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: bodyFont, size: 22, color: palette.body },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: headingFont, size: 32, bold: true, color: palette.primary },
        paragraph: { spacing: { before: 360, after: 200, line: 312 } },
      },
      heading2: {
        run: { font: headingFont, size: 28, bold: true, color: palette.primary },
        paragraph: { spacing: { before: 280, after: 140, line: 312 } },
      },
      heading3: {
        run: { font: headingFont, size: 24, bold: true, color: palette.accent },
        paragraph: { spacing: { before: 200, after: 100, line: 312 } },
      },
    },
  },
  numbering: {
    config: [
      {
        reference: "list-tech",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "list-missing",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "list-future",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [
    // ==================== COVER SECTION ====================
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: [
        // Full-page dark background table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              height: { value: 16838, rule: "exact" },
              children: [
                new TableCell({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: palette.primary },
                  verticalAlign: "center",
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 200 },
                      children: [new TextRun({ text: "MOBA SAGE", bold: true, size: 72, font: headingFont, color: palette.accent })],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 600 },
                      children: [new TextRun({ text: "Analytics con IA", size: 36, font: bodyFont, color: palette.accent2 })],
                    }),
                    // Gold separator line
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 600 },
                      children: [new TextRun({ text: "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", size: 20, color: palette.accent })],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 100 },
                      children: [new TextRun({ text: "Documentacion Tecnica Completa", size: 28, font: headingFont, color: "FFFFFF" })],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 80 },
                      children: [new TextRun({ text: "Tecnologias | Arquitectura | API | Data Sources", size: 22, font: bodyFont, color: "B0B8C8" })],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 80 },
                      children: [new TextRun({ text: "Features Implementadas | Lo que Falta | Roadmap", size: 22, font: bodyFont, color: "B0B8C8" })],
                    }),
                    emptyLine(),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 80 },
                      children: [new TextRun({ text: "Fecha: 18 de Abril, 2026", size: 20, font: bodyFont, color: palette.secondary })],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "URL: moba-sage.vercel.app", size: 20, font: bodyFont, color: palette.accent2 })],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    },

    // ==================== TOC SECTION ====================
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "MOBA SAGE \u2014 Documentacion Tecnica", size: 18, color: palette.secondary, font: bodyFont })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: palette.secondary })],
          })],
        }),
      },
      children: [
        new Paragraph({
          spacing: { after: 300 },
          children: [new TextRun({ text: "Tabla de Contenidos", bold: true, size: 36, font: headingFont, color: palette.primary })],
        }),
        new TableOfContents("Tabla de Contenidos", {
          hyperlink: true,
          headingStyleRange: "1-3",
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
          children: [new TextRun({ text: "(Haz clic derecho sobre la tabla de contenidos y selecciona 'Actualizar campo' para refrescar los numeros de pagina)", size: 18, color: palette.secondary, italics: true, font: bodyFont })],
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },

    // ==================== BODY SECTION ====================
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "MOBA SAGE \u2014 Documentacion Tecnica", size: 18, color: palette.secondary, font: bodyFont })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: palette.secondary })],
          })],
        }),
      },
      children: [

        // ==================== 1. RESUMEN EJECUTIVO ====================
        heading1("1. Resumen Ejecutivo"),
        bodyText("MOBA SAGE es una aplicacion web de analytics para juegos MOBA (Multiplayer Online Battle Arena), centrada actualmente en League of Legends, con planes de expansion hacia Wild Rift. La aplicacion utiliza inteligencia artificial para analizar el meta del juego, generar tier lists, proporcionar insights de campeones, y ofrecer herramientas de analisis para jugadores competitivos. Desplegada en Vercel y accesible en moba-sage.vercel.app, la aplicacion combina un diseno oscuro tematico inspirado en la estetica de League of Legends con funcionalidades avanzadas de analisis de datos."),
        bodyText("La app fue disenada como una plataforma integral que agrupa multiples herramientas analiticas en una sola interfaz. Los jugadores pueden consultar tier lists actualizadas, leer analisis de patches, descubrir campeones rotos en el meta, y utilizar IA generativa para obtener analisis personalizados de cada campeon. Recientemente se agrego la funcionalidad de busqueda de perfiles de invocadores y un selector de juego con soporte futuro para Wild Rift."),
        bodyText("Este documento describe en detalle todas las tecnologias utilizadas, las fuentes de datos, la arquitectura del sistema, las features implementadas, lo que falta por agregar, y el roadmap futuro del proyecto."),

        // ==================== 2. TECNOLOGIAS UTILIZADAS ====================
        heading1("2. Tecnologias Utilizadas"),

        heading2("2.1 Frontend"),
        makeTable(
          ["Tecnologia", "Version", "Uso"],
          [
            ["Next.js", "16.1.1", "Framework React full-stack con App Router"],
            ["React", "19.0.0", "Libreria de UI declarativa"],
            ["TypeScript", "5.x", "Tipado estatico para el proyecto"],
            ["Tailwind CSS", "4.x", "Framework de estilos utility-first"],
            ["Framer Motion", "12.23.2", "Animaciones y transiciones fluidas"],
            ["shadcn/ui", "latest", "Componentes UI pre-estilizados (Radix)"],
            ["Lucide React", "0.525.0", "Biblioteca de iconos vectoriales"],
            ["Recharts", "2.15.4", "Graficos y visualizaciones de datos"],
          ],
          [25, 15, 60]
        ),
        emptyLine(),
        bodyText("El frontend utiliza el patron de Server Components de Next.js 16 con App Router. La pagina principal (page.tsx) es un Client Component ('use client') que gestiona el estado de la aplicacion con React hooks (useState, useEffect, useCallback). Los estilos se manejan principalmente con Tailwind CSS 4, complementados por CSS custom properties para los colores tematicos de League of Legends. Framer Motion proporciona animaciones de transicion entre tabs y efectos de hover en las filas de campeones."),

        heading2("2.2 Backend / API"),
        makeTable(
          ["Tecnologia", "Version", "Uso"],
          [
            ["Next.js API Routes", "16.1.1", "Endpoints REST en /api/*"],
            ["z-ai-web-dev-sdk", "0.0.17", "SDK para IA generativa (LLM)"],
            ["Data Layer (static)", "custom", "Datos embebidos en src/lib/data.ts"],
          ],
          [25, 15, 60]
        ),
        emptyLine(),
        bodyText("El backend consiste en API Routes de Next.js que sirven datos al frontend. La arquitectura fue disenada inicialmente con Prisma ORM y SQLite, pero fue refactorizada para usar datos estaticos embebidos (data.ts) como mecanismo de fallback para funcionar correctamente en el entorno serverless de Vercel. Los endpoints devuelven JSON puro y son consumidos por el frontend mediante fetch(). La IA generativa utiliza el SDK z-ai-web-dev-sdk para crear respuestas analiticas sobre el meta del juego."),

        heading2("2.3 Herramientas de Desarrollo"),
        makeTable(
          ["Herramienta", "Uso"],
          [
            ["Git + GitHub", "Control de versiones y hosting del codigo"],
            ["Vercel (Hobby)", "Despliegue automatico CI/CD"],
            ["Bun", "Runtime JavaScript alternativo (dev)"],
            ["ESLint", "Linting de codigo"],
            ["Prisma (legacy)", "ORM - usado localmente, no en produccion"],
            ["shadcn/ui CLI", "Generacion de componentes UI"],
          ],
          [30, 70]
        ),
        emptyLine(),
        bodyText("El flujo de desarrollo sigue un modelo simple: cambios en main branch desencadenan automaticamente un rebuild en Vercel. El deploy esta configurado para el directorio raiz del proyecto (no un subdirectorio). Prisma se mantiene en el proyecto como herencia de la arquitectura original, pero los datos en produccion provienen del archivo data.ts estatico."),

        // ==================== 3. FUENTES DE DATOS ====================
        heading1("3. Fuentes de Datos"),

        heading2("3.1 Datos Embebidos (Actuales)"),
        bodyText("Actualmente, MOBA SAGE opera con datos estaticos embebidos directamente en el archivo src/lib/data.ts. Esto fue necesario porque SQLite no funciona en el entorno serverless de Vercel (filesystem efimero y de solo lectura). Los datos incluyen 47 campeones con estadisticas de win rate, pick rate y ban rate, 1 patch note con resumen y analisis IA, 21 insights de IA sobre campeones, y 14 tareas automaticas de la cola circular."),
        bodyText("Las estadisticas de campeones son representativas del patch 14.8 de League of Legends. Cada campeon tiene: nombre, titulo, rol, tier (S o A), win rate, pick rate, ban rate, patch actual, y campo de juego. Los insights de IA cubren categorias como cambios de tier, buffs, nerfs, analisis de meta, counters y sinergias, cada uno con un nivel de confianza."),

        heading2("3.2 Riot Games Data Dragon CDN"),
        bodyText("Las imagenes de los campeones se cargan directamente desde el Content Delivery Network (CDN) de Riot Games llamado Data Dragon. Este es un servicio publico y gratuito que Riot mantiene para los assets visuales del juego. La URL base utilizada es:"),
        bulletItem("Splash art: https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/{NombreCampeon}.png"),
        bulletItem("Iconos de perfil: https://ddragon.leagueoflegends.com/cdn/14.8.1/img/profileicon/{iconId}.png"),
        bodyText("El CDN de Data Dragon no requiere autenticacion y es ampliamente utilizado por aplicaciones de terceros. La version 14.8.1 corresponde al patch actual soportado por la aplicacion. Se mantiene un mapa de nombres (CHAMPION_NAME_MAP) para normalizar nombres de campeones que difieren entre el nombre de campeón y el nombre del archivo de imagen (por ejemplo, 'Wukong' -> 'MonkeyKing', 'Lee Sin' -> 'LeeSin')."),

        heading2("3.3 Riot Games API (Futura / Demo)"),
        bodyText("La funcionalidad de busqueda de perfiles de invocadores tiene soporte preparado para la Riot Games API REST. Esta API permite obtener datos reales de jugadores como nivel, rango ranked, historial de partidas y mas. Sin embargo, actualmente NO hay una API key configurada en el proyecto, por lo que la funcion opera en modo demo con datos simulados."),
        bodyText("Para habilitar datos reales, se necesita configurar la variable de entorno RIOT_API_KEY en Vercel con una clave obtenida desde developer.riotgames.com. La API key permite acceder a endpoints como: /lol/summoner/v4/summoners/by-name/{name} para datos del invocador, y /lol/league/v4/entries/by-summoner/{id} para datos de ranked. La aplicacion soporta 17 regiones: NA, EUW, EUNE, KR, JP, BR, LAN, LAS, OCE, TR, RU, PH, SG, TH, TW, VN."),

        heading2("3.4 IA Generativa (z-ai-web-dev-sdk)"),
        bodyText("La funcionalidad de analisis con IA utiliza el SDK z-ai-web-dev-sdk, que proporciona acceso a modelos de lenguaje grande (LLM). Cuando un usuario selecciona un campeon y hace una pregunta sobre el meta, el backend envia un prompt al LLM con contexto del campeon (nombre, rol, tier, patch). El modelo genera un analisis detallado que incluye razonamiento, factores clave, nivel de confianza y campeones relacionados mencionados en la respuesta."),
        bodyText("El system prompt configura al modelo como un experto analista de MOBAs que responde siempre en espanol, analiza el meta actual, win rates, counters, sinergias y builds optimos. La confianza se calcula como un valor entre 0.70 y 0.95, y los factores clave se extraen de las oraciones mas relevantes del analisis generado."),

        // ==================== 4. ARQUITECTURA ====================
        heading1("4. Arquitectura del Sistema"),

        heading2("4.1 Estructura de Archivos"),
        makeTable(
          ["Ruta", "Descripcion"],
          [
            ["src/app/page.tsx", "Pagina principal - toda la UI de la app"],
            ["src/app/layout.tsx", "Layout raiz con tema oscuro y meta tags"],
            ["src/app/globals.css", "Estilos globales, tema LoL, glass-morphism"],
            ["src/lib/data.ts", "Capa de datos - datos embebidos + funciones de acceso"],
            ["src/lib/db.ts", "Cliente Prisma (legacy, no usado en produccion)"],
            ["src/lib/utils.ts", "Utilidades generales (cn helper)"],
            ["src/app/api/champions/route.ts", "GET - Obtener campeones filtrados"],
            ["src/app/api/patches/route.ts", "GET - Obtener patch notes"],
            ["src/app/api/insights/route.ts", "GET - Obtener insights de IA"],
            ["src/app/api/tasks/route.ts", "GET/PUT - Leer y actualizar tareas"],
            ["src/app/api/ai-reason/route.ts", "POST - Analisis con IA generativa"],
            ["src/app/api/summoner/route.ts", "GET - Buscar perfil de invocador"],
            ["src/components/ui/*", "Componentes shadcn/ui (40+ componentes)"],
            ["prisma/schema.prisma", "Schema Prisma (legacy, 4 modelos)"],
            ["prisma/seed.ts", "Seed data (legacy)"],
            ["package.json", "Dependencias y scripts del proyecto"],
          ],
          [35, 65]
        ),

        heading2("4.2 Flujo de Datos"),
        bodyText("La aplicacion sigue un patron de datos unidireccional. Al cargar la pagina, el componente Home ejecuta fetchData() que hace 4 llamadas fetch concurrentes a los endpoints de la API (/api/champions, /api/patches, /api/insights, /api/tasks). Cada API route importa las funciones de data.ts (getChampions, getPatches, getInsights, getTasks) que leen de los arreglos estaticos embebidos, aplican filtros si se pasan query params, y devuelven JSON."),
        bodyText("Los datos fluyen asi: Data embebida (data.ts) -> API Routes (server) -> fetch() -> Estado React (useState) -> Componentes UI. Para la funcionalidad de IA, el flujo es: Input del usuario -> fetch POST a /api/ai-reason -> z-ai-web-dev-sdk -> LLM -> Respuesta JSON -> UI. Para el perfil de invocador: Formulario -> fetch GET a /api/summoner -> Riot API (o demo data) -> JSON -> UI."),

        heading2("4.3 Modelo de Estado"),
        bodyText("El estado de la aplicacion se gestiona enteramente con React hooks en el componente Home:"),
        bulletItem("activeTab: Tab activo (tierlist, patches, broken, tasks, perfil)"),
        bulletItem("selectedGame: Juego seleccionado (null = landing, 'lol' = LoL, 'wildrift' = WR)"),
        bulletItem("champions/patches/insights/tasks: Datos cargados de la API"),
        bulletItem("searchQuery/roleFilter: Filtros de busqueda en tier list"),
        bulletItem("selectedChampion/aiDialogOpen/aiQuestion/aiReasoning/aiLoading: Estado del dialogo IA"),
        bulletItem("summonerSearch/summonerRegion/summonerData/summonerLoading: Estado del perfil de invocador"),

        heading2("4.4 Deployment"),
        bodyText("La aplicacion se despliega automaticamente en Vercel cada vez que se hace push al branch main del repositorio gamer-frog/moba-sage en GitHub. Vercel detecta el framework Next.js y ejecuta 'next build' para generar los assets estaticos y las funciones serverless. El dominio es moba-sage.vercel.app. El plan Hobby de Vercel es gratuito con limitaciones de bandwidth y ejecuciones serverless."),

        // ==================== 5. FEATURES IMPLEMENTADAS ====================
        heading1("5. Features Implementadas"),

        heading2("5.1 Landing Page - Selector de Juego"),
        bodyText("Al visitar moba-sage.vercel.app, los usuarios ven primero una landing page cinematografica a pantalla completa con dos botones enormes para elegir entre League of Legends y Wild Rift. Cada boton tiene su propio color tematico (oro para LoL, cyan para WR), efectos de hover con glow y escala, y animaciones de entrada con Framer Motion. Al hacer clic en LoL, se transiciona al dashboard principal. Al hacer clic en Wild Rift, se muestra una pagina 'Proximamente' con preview de features futuras."),
        bodyText("El logo de MOBA SAGE en el header funciona como boton de retroceso para volver al selector de juego desde cualquier pantalla. La transicion entre vistas es suave y fluida gracias a AnimatePresence de Framer Motion."),

        heading2("5.2 Tier List"),
        bodyText("La tier list es la feature principal de la aplicacion. Muestra 47 campeones divididos en dos tiers: S (Dioses del Meta) y A (Fuertes). Cada tier se muestra en una seccion visual con header de color (oro para S, cyan para A), lista de campeones en filas compactas, y estadisticas de WR (Win Rate), Pick Rate y Ban Rate. Los campeones se pueden filtrar por rol (Top, Jungle, Mid, ADC, Support) y buscar por nombre o titulo."),
        bodyText("Cada fila de campeon muestra: icono de splash art desde Data Dragon, nombre y titulo, badge de rol con color, y estadisticas en desktop. Al hacer clic en un campeon, se abre un dialogo de IA que permite hacer preguntas sobre ese campeon especifico."),

        heading2("5.3 Analisis con IA (Dialogo)"),
        bodyText("Al seleccionar un campeon, se abre un modal de dialogo con IA que permite analizar su estado en el meta. El dialogo muestra informacion del campeon (rol, tier, patch, win rate), un campo de texto para preguntas, y un boton para enviar la consulta. La respuesta de la IA incluye: razonamiento detallado, nivel de confianza con barra de progreso, factores clave extraidos del analisis, y campeones relacionados mencionados en la respuesta."),
        bodyText("El backend utiliza z-ai-web-dev-sdk para comunicarse con un LLM que genera el analisis. El prompt del sistema configura al modelo como experto en MOBAs. Los campeones relacionados se detectan buscando nombres de campeones conocidos dentro del texto de respuesta, permitiendo navegacion rapida entre analisis de diferentes campeones."),

        heading2("5.4 Patch Notes"),
        bodyText("La pestana de parches muestra las notas de la version actual con un diseno tipo tarjeta. Cada patch note incluye: badge de version, titulo, fecha, badge de juego fuente, resumen del parche, y un analisis generado por IA en una seccion destacada con borde cyan. Actualmente solo hay un parche registrado (14.8) pero la estructura soporta multiples parches."),

        heading2("5.5 Cosas Rotas y Combos OP"),
        bodyText("Esta pestana muestra insights de IA filtrados por categorias 'meta' y 'buff', presentando campeones y combinaciones que estan dominando el meta actual. Cada insight muestra: nombre del campeon, badge de categoria, contenido del insight, y nivel de confianza con barra de progreso. Los insights marcados como 'meta' tienen un badge adicional 'ROTO' en rojo para destacarlos visualmente."),

        heading2("5.6 Cola de Tareas Circulares"),
        bodyText("La pestana de tareas muestra 14 tareas automaticas que forman una cola circular para mantener los datos actualizados. Cada tarea tiene: titulo, descripcion, estado (Pendiente/Ejecutando/Completado), puntero de cola, e intervalo en minutos. Hay contadores en la parte superior que muestran cuantas tareas estan en cada estado. Al hacer clic en una tarea, se alterna su estado. Las tareas cubren funciones como verificar parches, actualizar tier lists, generar insights, detectar cosas rotas, analizar sinergias, y mas."),

        heading2("5.7 Perfil de Invocador"),
        bodyText("La pestana de perfil permite buscar invocadores de League of Legends por nombre y region. Incluye un campo de texto para el nombre del invocador, un dropdown con 17 regiones soportadas, y un boton de busqueda. Los resultados muestran: icono de perfil desde Data Dragon, nombre y nivel del invocador, tarjetas de ranked (Solo/Duo y Flex) con tier, rango, LP, wins, losses y win rate, y una lista de campeones mas jugados con iconos y win rates."),
        bodyText("Actualmente opera en modo demo con datos simulados. Para datos reales, se necesita configurar RIOT_API_KEY como variable de entorno en Vercel. Un banner informativo indica el modo actual al usuario."),

        // ==================== 6. QUE FALTA / LIMITACIONES ====================
        heading1("6. Lo que Falta y Limitaciones"),

        heading2("6.1 Datos Estticos vs. Dinamicos"),
        bodyText("La limitacion mas critica actual es que todos los datos de campeones, parches e insights son estaticos y embebidos en el codigo fuente. No hay ninguna conexion a APIs de datos en tiempo real que actualicen automaticamente las estadisticas. Esto significa que la tier list, los win rates, y los insights son representativos del patch 14.8 pero no se actualizan automaticamente cuando Riot lanza un nuevo parche. Para que la app sea verdaderamente util, necesita conectarse a fuentes de datos en tiempo real."),

        heading2("6.2 Riot API Key No Configurada"),
        bodyText("La Riot API no esta conectada. No hay una API key configurada en Vercel, por lo que la busqueda de perfiles muestra datos demo. Para obtener datos reales de jugadores, se necesita registrar una aplicacion en developer.riotgames.com y configurar la variable de entorno RIOT_API_KEY. La Riot API tiene rate limits (20 requests/segundo, 100 requests/2 minutos) que deben gestionarse en produccion."),

        heading2("6.3 Wild Rift Sin Datos"),
        bodyText("La opcion de Wild Rift muestra una pantalla 'Proximamente' pero no tiene datos reales. No hay campeones de WR, tier lists, ni conexion a la API de Wild Rift (que es diferente a la de LoL PC). Integrar WR requiere su propio set de datos, endpoints de API distintos, y una adaptacion del UI para las diferencias de formato entre ambos juegos."),

        heading2("6.4 Sin Base de Datos Persistente"),
        bodyText("La aplicacion no tiene una base de datos persistente. Los cambios en estados de tareas se pierden al refrescar la pagina. No hay historial de busquedas, usuarios autenticados, ni datos personalizados. Para escalar, se necesitaria integrar una base de datos compatible con serverless como Vercel Postgres, Supabase, PlanetScale, o Upstash Redis."),

        heading2("6.5 Sin Autenticacion de Usuarios"),
        bodyText("No hay sistema de login, registro, ni autenticacion. Todos los usuarios ven los mismos datos. Tampoco hay forma de guardar favoritos, tier lists personalizadas, ni historial de analisis. next-auth esta en las dependencias del proyecto pero no esta configurado."),

        heading2("6.6 Limitaciones de la IA"),
        bodyText("El analisis con IA depende del SDK z-ai-web-dev-sdk que esta disponible en el entorno de desarrollo. Los insights generados no se almacenan ni se cachean entre sesiones. No hay un sistema de feedback para mejorar las respuestas. La confianza se calcula de forma pseudo-aleatoria y no se basa en datos reales de precision del modelo."),

        // ==================== 7. QUE MAS SE PUEDE HACER ====================
        heading1("7. Que Mas Se Puede Hacer"),

        heading2("7.1 Features de Alto Impacto"),
        new Paragraph({
          numbering: { reference: "list-future", level: 0 },
          spacing: { after: 100, line: 312 },
          children: [
            new TextRun({ text: "Datos en tiempo real: ", bold: true, size: 22, font: bodyFont, color: palette.primary }),
            new TextRun({ text: "Conectar APIs de datos de terceros como U.GG, Mobalytics, o CommunityDragon para obtener estadisticas actualizadas automaticamente con cada parche.", size: 22, font: bodyFont, color: palette.body }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "list-future", level: 0 },
          spacing: { after: 100, line: 312 },
          children: [
            new TextRun({ text: "Integracion Riot API completa: ", bold: true, size: 22, font: bodyFont, color: palette.primary }),
            new TextRun({ text: "Configurar API key para obtener datos reales de invocadores, ranked, historial de partidas, maestria de campeones y runas.", size: 22, font: bodyFont, color: palette.body }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "list-future", level: 0 },
          spacing: { after: 100, line: 312 },
          children: [
            new TextRun({ text: "PWA completa: ", bold: true, size: 22, font: bodyFont, color: palette.primary }),
            new TextRun({ text: "Agregar manifest.json, service worker, y soporte offline para que la app funcione como aplicacion nativa en moviles.", size: 22, font: bodyFont, color: palette.body }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "list-future", level: 0 },
          spacing: { after: 100, line: 312 },
          children: [
            new TextRun({ text: "Notificaciones push: ", bold: true, size: 22, font: bodyFont, color: palette.primary }),
            new TextRun({ text: "Alertar a los usuarios cuando su campeon principal recibe buffs, nerfs, o cambios de tier.", size: 22, font: bodyFont, color: palette.body }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "list-future", level: 0 },
          spacing: { after: 100, line: 312 },
          children: [
            new TextRun({ text: "Builds y runas recomendados: ", bold: true, size: 22, font: bodyFont, color: palette.primary }),
            new TextRun({ text: "Mostrar builds de items, runas, y spell optimos para cada campeon basados en datos de win rate.", size: 22, font: bodyFont, color: palette.body }),
          ],
        }),

        heading2("7.2 Features de Medio Impacto"),
        new Paragraph({
          numbering: { reference: "list-tech", level: 0 },
          spacing: { after: 100, line: 312 },
          children: [
            new TextRun({ text: "Comparador de campeones: ", bold: true, size: 22, font: bodyFont, color: palette.primary }),
            new TextRun({ text: "Herramienta para comparar dos campeones lado a lado en estadisticas, matchups, y counters.", size: 22, font: bodyFont, color: palette.body }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "list-tech", level: 0 },
          spacing: { after: 100, line: 312 },
          children: [
            new TextRun({ text: "Graficos de tendencias: ", bold: true, size: 22, font: bodyFont, color: palette.primary }),
            new TextRun({ text: "Usar Recharts (ya incluido) para mostrar graficos de evolucion de win rates a lo largo de multiples parches.", size: 22, font: bodyFont, color: palette.body }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "list-tech", level: 0 },
          spacing: { after: 100, line: 312 },
          children: [
            new TextRun({ text: "Sistema de autenticacion: ", bold: true, size: 22, font: bodyFont, color: palette.primary }),
            new TextRun({ text: "Configurar next-auth (ya en dependencias) con Riot OAuth2 para login con cuenta de Riot.", size: 22, font: bodyFont, color: palette.body }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "list-tech", level: 0 },
          spacing: { after: 100, line: 312 },
          children: [
            new TextRun({ text: "Base de datos serverless: ", bold: true, size: 22, font: bodyFont, color: palette.primary }),
            new TextRun({ text: "Migrar a Vercel Postgres o Supabase para datos persistentes con soporte de relaciones y queries complejas.", size: 22, font: bodyFont, color: palette.body }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "list-tech", level: 0 },
          spacing: { after: 100, line: 312 },
          children: [
            new TextRun({ text: "Soporte multi-idioma: ", bold: true, size: 22, font: bodyFont, color: palette.primary }),
            new TextRun({ text: "next-intl esta en dependencias. Configurar i18n para espanol, ingles, portugues y otros idiomas.", size: 22, font: bodyFont, color: palette.body }),
          ],
        }),

        heading2("7.3 Features Avanzadas"),
        new Paragraph({
          numbering: { reference: "list-missing", level: 0 },
          spacing: { after: 100, line: 312 },
          children: [
            new TextRun({ text: "WebSocket para live data: ", bold: true, size: 22, font: bodyFont, color: palette.primary }),
            new TextRun({ text: "Implementar WebSocket ( Socket.io ) para actualizar estadisticas en tiempo real durante partidas en vivo.", size: 22, font: bodyFont, color: palette.body }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "list-missing", level: 0 },
          spacing: { after: 100, line: 312 },
          children: [
            new TextRun({ text: "Analisis de VODs: ", bold: true, size: 22, font: bodyFont, color: palette.primary }),
            new TextRun({ text: "Subir replay o VOD y que la IA analice la partida, detecte errores, y sugiera mejoras.", size: 22, font: bodyFont, color: palette.body }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "list-missing", level: 0 },
          spacing: { after: 100, line: 312 },
          children: [
            new TextRun({ text: "Team composition analyzer: ", bold: true, size: 22, font: bodyFont, color: palette.primary }),
            new TextRun({ text: "Ingresar 5 campeones y obtener analisis de synergias, win rate proyectado, y debilidades del comp.", size: 22, font: bodyFont, color: palette.body }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "list-missing", level: 0 },
          spacing: { after: 100, line: 312 },
          children: [
            new TextRun({ text: "Chatbot de coaching: ", bold: true, size: 22, font: bodyFont, color: palette.primary }),
            new TextRun({ text: "Chat con IA especializado en coaching que responda preguntas sobre estrategia, macros, y mejora personal.", size: 22, font: bodyFont, color: palette.body }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "list-missing", level: 0 },
          spacing: { after: 100, line: 312 },
          children: [
            new TextRun({ text: "Integracion con Discord: ", bold: true, size: 22, font: bodyFont, color: palette.primary }),
            new TextRun({ text: "Bot de Discord que notifique cambios de meta, tiers, y parches en canales de servidores.", size: 22, font: bodyFont, color: palette.body }),
          ],
        }),

        // ==================== 8. API ENDPOINTS ====================
        heading1("8. API Endpoints"),

        makeTable(
          ["Metodo", "Endpoint", "Descripcion", "Query Params"],
          [
            ["GET", "/api/champions", "Obtener campeones filtrados", "role, tier, game, search"],
            ["GET", "/api/patches", "Obtener patch notes", "game"],
            ["GET", "/api/insights", "Obtener insights de IA", "champion, category"],
            ["GET", "/api/tasks", "Obtener cola de tareas", "-"],
            ["PUT", "/api/tasks", "Actualizar estado de tarea", "Body: id, status"],
            ["POST", "/api/ai-reason", "Analisis con IA", "Body: question, champion, role, patch"],
            ["GET", "/api/summoner", "Buscar perfil invocador", "name, region"],
          ],
          [12, 22, 35, 31]
        ),
        emptyLine(),
        bodyText("Todos los endpoints devuelven JSON. Los endpoints GET son idempotentes. El endpoint POST /api/ai-reason requiere un body con al menos el campo 'question'. El endpoint PUT /api/tasks requiere 'id' y 'status' (valores validos: pending, running, done). El endpoint /api/summoner devuelve datos demo cuando no hay RIOT_API_KEY configurada."),

        // ==================== 9. CONFIGURACION Y DESPLIEGUE ====================
        heading1("9. Configuracion y Despliegue"),

        heading2("9.1 Variables de Entorno"),
        makeTable(
          ["Variable", "Estado", "Descripcion"],
          [
            ["RIOT_API_KEY", "No configurada", "API key de Riot Games para datos reales de invocadores"],
            ["DATABASE_URL", "Legacy", "URL de SQLite (no usada en produccion Vercel)"],
          ],
          [25, 20, 55]
        ),
        emptyLine(),
        bodyText("Para configurar la Riot API key en Vercel: ir a Settings > Environment Variables en el dashboard del proyecto, agregar RIOT_API_KEY con el valor obtenido de developer.riotgames.com, y redeploy."),

        heading2("9.2 Informacion de GitHub"),
        bulletItem("Repositorio: github.com/gamer-frog/moba-sage"),
        bulletItem("Branch principal: main"),
        bulletItem("CI/CD: Push a main -> Vercel auto-deploy"),
        bulletItem("Autor: gamer-frog <gamer-frog@users.noreply.github.com>"),

        heading2("9.3 Vercel Deployment"),
        bulletItem("URL: moba-sage.vercel.app"),
        bulletItem("Plan: Hobby (gratuito)"),
        bulletItem("Framework detectado: Next.js 16"),
        bulletItem("Root directory: Raiz del repositorio"),
        bulletItem("Build command: next build (automatico)"),
        bulletItem("Region: Automatica"),

        // ==================== 10. DISENO VISUAL ====================
        heading1("10. Diseno Visual"),

        heading2("10.1 Paleta de Colores"),
        makeTable(
          ["Color", "Hex", "Uso"],
          [
            ["Fondo principal", "#0A0E1A", "Background de toda la app (navy oscuro)"],
            ["Oro LoL", "#C8AA6E", "Acentos principales, titulo, tier S"],
            ["Cyan LoL", "#0ACBE6", "Acentos secundarios, tier A, live indicator"],
            ["Rojo", "#E84057", "Alertas, nerfs, elementos peligrosos"],
            ["Amarillo", "#F0C646", "Meta, warnings, highlights"],
            ["Texto principal", "#F0E6D2", "Color base del texto (crema oscuro)"],
            ["Texto secundario", "#A09B8C", "Textos descriptivos y captions"],
            ["Texto muted", "#5B5A56", "Placeholders y textos poco relevantes"],
            ["Borde dorado", "#785A28", "Bordes de cards, inputs, separadores"],
            ["Card background", "#1E2328", "Fondo de tarjetas y elementos"],
          ],
          [25, 15, 60]
        ),

        heading2("10.2 Elementos de Diseno"),
        bodyText("La aplicacion utiliza glass-morphism (efecto de vidrio con blur) para las tarjetas y contenedores, definido en la clase .glass-card de globals.css. Los scrolls personalizados usan scrollbar estrechos con colores tematicos dorados. Un overlay sutil de ruido SVG (1.5% opacidad) agrega profundidad visual al fondo. Las animaciones de Framer Motion incluyen transiciones de pagina, hover effects en filas de campeones, y animaciones de entrada escalonadas. Los iconos de campeones son circulares con borde de color segun tier y sombra glow."),

        emptyLine(),
      ],
    },
  ],
});

// Generate the document
const outputPath = "/home/z/my-project/download/MOBA_SAGE_Documentacion_Tecnica.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log("Document generated: " + outputPath);
});
