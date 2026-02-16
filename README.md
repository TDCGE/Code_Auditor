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
npx ts-node src/index.ts --path <directorio-a-analizar>
```

### Opciones

| Flag | Descripción | Valor por defecto |
|------|-------------|-------------------|
| `-p, --path <ruta>` | Directorio del proyecto a escanear | `.` (directorio actual) |
| `-e, --exclude <patterns>` | Patrones glob separados por comas para excluir archivos/carpetas | `''` (sin exclusiones) |

### Ejemplos

```bash
# Analizar un proyecto excluyendo carpetas de pruebas y build
npx ts-node src/index.ts -p ./mi-proyecto --exclude 'test,dist,build'

# Analizar excluyendo todos los archivos de test
npx ts-node src/index.ts --exclude '*.test.ts,*.spec.ts'

# Analizar con exclusiones múltiples
npx ts-node src/index.ts -p ../otro-proyecto --exclude 'vendor,temp,*.log'

# Analizar el directorio actual sin exclusiones
npx ts-node src/index.ts
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

## Reporte Markdown

Al finalizar el análisis, la herramienta genera automáticamente un reporte en formato Markdown en:

```
<directorio-analizado>/analysisByVCV/analysis.md
```

El reporte incluye:
- Fecha y directorio analizado
- Todos los hallazgos agrupados por escáner, con severidad, archivo, línea y regla
- Tabla resumen con conteo por severidad

## Severidades

Los hallazgos se clasifican en tres niveles, mostrados con colores en la terminal:

- **ALTO** (rojo) -- Problemas críticos que requieren atención inmediata
- **MEDIO** (amarillo) -- Problemas que deberían resolverse pronto
- **BAJO** (azul) -- Sugerencias de mejora y buenas prácticas

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
├── index.ts                 # CLI (Commander.js)
├── core/
│   ├── Orchestrator.ts      # Coordina escaneo y resultados
│   ├── Detector.ts          # Detecta stacks tecnológicos
│   ├── AIClientFactory.ts   # Factory para proveedores de IA
│   ├── GeminiAIClient.ts    # Cliente Gemini
│   ├── ClaudeAIClient.ts    # Cliente Claude (Agent SDK)
│   ├── IAIClient.ts         # Interfaz común de IA
│   ├── ScannerRegistry.ts   # Registro de escáneres
│   ├── ResultReporter.ts    # Interfaz de reporte (con export a Markdown)
│   └── ConsoleReporter.ts   # Reporte por consola + export a .md
└── scanners/
    ├── BaseScanner.ts       # Clase base abstracta
    ├── SecretScanner.ts     # Detección de secretos (regex)
    ├── AuthScanner.ts       # Auditoría de auth (IA)
    └── ArchitectureScanner.ts # Revisión arquitectónica (IA)
```