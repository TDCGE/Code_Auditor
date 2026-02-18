# CGE-Verificator

Herramienta CLI de verificación de calidad y seguridad de código para proyectos de desarrollo. Analiza proyectos Node.js, Python y Java en busca de credenciales expuestas, vulnerabilidades de autenticación y problemas arquitectónicos, combinando detección por regex con análisis semántico potenciado por IA (Google Gemini o Claude).

## Requisitos previos

- **Node.js** v18 o superior
- **Un proveedor de IA** (al menos uno):
  - **Claude**: Claude Code CLI instalado y autenticado (`npm i -g @anthropic-ai/claude-code`)
  - **Gemini**: Una API key de [Google AI Studio](https://aistudio.google.com/)

## Instalación

```bash
git clone <url-del-repositorio>
cd vibeCodingVerificator
npm install
```

### Configurar el proveedor de IA

Copiar el archivo de ejemplo y editar según el proveedor elegido:

```bash
cp .env.example .env
```

**Opción A -- Claude (por defecto):**

```env
AI_PROVIDER=claude
```

Requiere tener `claude` CLI instalado y autenticado globalmente. Si no se especifica `AI_PROVIDER`, Claude será el proveedor por defecto.

**Opción B -- Gemini:**

```env
GEMINI_API_KEY=tu_api_key_aqui
AI_PROVIDER=gemini
```

## Uso

```bash
npx ts-node src/main/index.ts --path <directorio-a-analizar>
```

### Opciones

| Flag | Descripción | Valor por defecto |
|------|-------------|-------------------|
| `-p, --path <ruta>` | Directorio del proyecto a escanear | `.` (directorio actual) |
| `-e, --exclude <patterns>` | Patrones glob separados por comas para excluir archivos/carpetas | `''` (sin exclusiones) |

### Ejemplos

```bash
# Analizar un proyecto excluyendo carpetas de pruebas y build
npx ts-node src/main/index.ts -p ./mi-proyecto --exclude 'test,dist,build'

# Analizar excluyendo todos los archivos de test
npx ts-node src/main/index.ts --exclude '*.test.ts,*.spec.ts'

# Analizar con exclusiones múltiples
npx ts-node src/main/index.ts -p ../otro-proyecto --exclude 'vendor,temp,*.log'

# Analizar el directorio actual sin exclusiones
npx ts-node src/main/index.ts
```

## Escáneres incluidos

La herramienta ejecuta tres escáneres en secuencia, mostrando los hallazgos en tiempo real:

### 1. Escáner de Secretos

Detección por regex de credenciales hardcodeadas:
- Claves AWS (`AKIA...`)
- API keys y tokens secretos
- Claves privadas (RSA, SSH)
- Correos corporativos hardcodeados

### 2. Revisor de Arquitectura (IA)

Análisis de la estructura del proyecto y calidad de código:
- Organización de carpetas y convenciones de nombrado
- Violaciones de principios SOLID
- Antipatrones de diseño
- Recomendaciones de frameworks y estructura

### 3. Auditor de Autenticación (IA)

Análisis de archivos de auth, login, session, middleware, security y config:
- Uso incorrecto de JWT (decode vs verify, secretos débiles, falta de expiración)
- Algoritmos de hashing obsoletos (MD5, SHA1)
- Rutas sin protección o sin control de roles
- Cookies de sesión inseguras

## Reporte de Auditoría

Al finalizar el análisis, la herramienta genera automáticamente una carpeta de auditoría versionada:

```
<directorio-analizado>/audit/
  suppressions.json        # Supresiones de falsos positivos (opcional)
  v1/
    audit.md               # Reporte principal de hallazgos
    review-log.md          # Tabla de revisión manual
    changelog.md           # Registro de correcciones
  v2/
    ...
```

Cada ejecución crea una nueva carpeta versionada (`v1`, `v2`, ...) con auto-incremento:

- **audit.md** -- Reporte completo con hallazgos agrupados por escáner, severidad, archivo, línea, regla, sugerencias y tabla resumen
- **review-log.md** -- Tabla para revisión manual donde cada hallazgo puede marcarse como "Confirmado", "Falso positivo", "Por solucionar" o "Resuelto"
- **changelog.md** -- Plantilla para documentar las correcciones aplicadas a cada hallazgo

## Sistema de Supresiones

Permite suprimir falsos positivos para que no aparezcan en ejecuciones futuras.

**Ubicación:** `<directorio-analizado>/audit/suppressions.json`

**Formato:**

```json
{
  "suppressions": [
    {
      "rule": "hardcoded-secret",
      "filePattern": "**/config/constants.ts",
      "messageContains": "EXAMPLE_KEY",
      "reason": "Valor de ejemplo, no es un secreto real",
      "source": "review-log-v1"
    }
  ],
  "considerations": []
}
```

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `rule` | Si | Nombre de la regla a suprimir |
| `filePattern` | No | Patrón glob para filtrar por archivo |
| `messageContains` | No | Texto que debe contener el mensaje del hallazgo |
| `reason` | Si | Justificación de la supresión |
| `source` | No | Origen de la supresión (ej: `review-log-v1`) |

**Importación automática:** Los hallazgos marcados como "Falso positivo" en `review-log.md` de versiones anteriores se importan automáticamente como supresiones en la siguiente ejecución.

## Severidades

Los hallazgos se clasifican en tres niveles, mostrados con colores en la terminal:

- **CRITICO** (rojo) -- Vulnerabilidad explotable que requiere corrección inmediata
- **MEDIO** (amarillo) -- Mala práctica con riesgo potencial de seguridad o mantenibilidad
- **BAJO** (azul) -- Sugerencia de mejora sin riesgo inmediato

## Stacks soportados

El detector identifica automáticamente proyectos por la presencia de:

| Stack | Archivos detectados |
|-------|-------------------|
| Node.js | `package.json` |
| Python | `requirements.txt`, `Pipfile`, `pyproject.toml` |
| Java | `pom.xml`, `build.gradle` |

Si no se detecta ninguno, el proyecto se escanea igualmente.

## Estructura del proyecto

```
src/
└── main/
    ├── index.ts                          # CLI (Commander.js)
    └── ts/
        ├── cli/                          # Bootstrap, banner, configuración
        │   ├── Application.ts            # Punto de arranque de la app
        │   ├── Banner.ts                 # Banner de bienvenida
        │   ├── CLIOptions.ts             # Definición de opciones CLI
        │   ├── index.ts                  # Re-exports del módulo cli
        │   └── config/                   # Carga de configuración
        │       ├── IConfigLoader.ts      # Interfaz de config loader
        │       └── DotenvConfigLoader.ts # Implementación con dotenv
        ├── core/                         # Lógica central
        │   ├── Orchestrator.ts           # Coordina escaneo y resultados
        │   ├── ai/                       # Clientes IA
        │   │   ├── IAIClient.ts          # Interfaz común (Strategy)
        │   │   ├── AIReviewResult.ts     # Tipo de resultado IA
        │   │   ├── AIUtils.ts            # Utilidades compartidas
        │   │   ├── GeminiAIClient.ts     # Implementación Gemini
        │   │   ├── ClaudeAIClient.ts     # Implementación Claude SDK
        │   │   └── factory/              # Abstract Factory de clientes IA
        │   │       ├── AIClientFactory.ts
        │   │       ├── AIClientProvider.ts
        │   │       ├── ClaudeClient.ts
        │   │       └── GeminiClient.ts
        │   ├── detector/                 # Detección de stacks tecnológicos
        │   │   ├── Detector.ts
        │   │   └── DetectedStack.ts
        │   ├── reporter/                 # Reportes consola + Markdown
        │   │   ├── ResultReporter.ts     # Interfaz de reporte
        │   │   ├── ConsoleReporter.ts    # Consola + export a .md
        │   │   └── AuditVersionManager.ts # Versionado de auditorías
        │   ├── scanner/                  # Registry + tipos de escáneres
        │   │   ├── ScannerRegistry.ts    # Registro de factories (Registry)
        │   │   └── ScannerSection.ts     # Tipo sección de escáner
        │   └── suppression/              # Sistema de supresiones
        │       ├── SuppressionEntry.ts   # Tipos de supresión
        │       └── SuppressionManager.ts # Carga, evalúa y persiste supresiones
        ├── scanner/                      # Implementaciones de escáneres
        │   ├── BaseScanner.ts            # Clase base abstracta (Template Method)
        │   ├── SecretScanner.ts          # Detección de secretos (regex)
        │   ├── AuthScanner.ts            # Auditoría de auth (IA)
        │   └── ArchitectureScanner.ts    # Revisión arquitectónica (IA)
        └── types/                        # Tipos compartidos
            ├── index.ts                  # Re-exports
            ├── ScanResult.ts             # Tipo resultado de escaneo
            └── Severity.ts               # Niveles de severidad + metadata
```

## Patrones de Diseño

El proyecto implementa los siguientes patrones GoF:

| Patrón | Implementación | Archivo clave |
|--------|---------------|---------------|
| Template Method | `BaseScanner.scan()` define el flujo `findFiles()` → `analyzeFile()` | `scanner/BaseScanner.ts` |
| Abstract Factory | `AIClientFactory` + fábricas concretas `ClaudeClient` / `GeminiClient` | `core/ai/factory/` |
| Strategy | `IAIClient` interfaz con implementaciones intercambiables | `core/ai/IAIClient.ts` |
| Registry | `ScannerRegistry` registra factories de escáneres | `core/scanner/ScannerRegistry.ts` |
| Observer/Callback | `scan(onResult)` emite resultados en tiempo real | `BaseScanner.ts` + `Orchestrator.ts` |