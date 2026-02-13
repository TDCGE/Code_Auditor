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

**Opción A -- Claude (sin API key):**

```env
AI_PROVIDER=claude
```

Requiere tener `claude` CLI instalado y autenticado globalmente.

**Opción B -- Gemini:**

```env
GEMINI_API_KEY=tu_api_key_aqui
AI_PROVIDER=gemini
```

**Opción C -- Auto (por defecto):**

```env
AI_PROVIDER=auto
```

Usa Gemini si `GEMINI_API_KEY` está configurada, sino usa Claude.

## Uso

```bash
npx ts-node src/index.ts --path <directorio-a-analizar>
```

### Opciones

| Flag | Descripción | Valor por defecto |
|------|-------------|-------------------|
| `-p, --path <ruta>` | Directorio del proyecto a escanear | `.` (directorio actual) |
| `--provider <proveedor>` | Proveedor de IA: `claude`, `gemini` o `auto` | `auto` |

### Ejemplos

```bash
# Analizar un proyecto Python en una ruta específica con Claude
npx ts-node src/index.ts -p ./mi-proyecto --provider claude

# Analizar el directorio actual con Gemini
npx ts-node src/index.ts --provider gemini

# Analizar un proyecto dejando que elija el proveedor automáticamente
npx ts-node src/index.ts -p ../otro-proyecto
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
│   ├── AIClient.ts          # Cliente Gemini
│   ├── ClaudeAIClient.ts    # Cliente Claude (Agent SDK)
│   ├── IAIClient.ts         # Interfaz común de IA
│   ├── ScannerRegistry.ts   # Registro de escáneres
│   ├── ResultReporter.ts    # Interfaz de reporte
│   └── ConsoleReporter.ts   # Reporte por consola
└── scanners/
    ├── BaseScanner.ts       # Clase base abstracta
    ├── SecretScanner.ts     # Detección de secretos (regex)
    ├── AuthScanner.ts       # Auditoría de auth (IA)
    └── ArchitectureScanner.ts # Revisión arquitectónica (IA)
```