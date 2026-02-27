# src/main/ts/ — Arquitectura del CGE-Verificator

## Visión general

CGE-Verificator es una herramienta CLI de análisis estático y semántico que audita proyectos de software buscando vulnerabilidades de seguridad, violaciones arquitectónicas y oportunidades de mejora. Combina detección determinista (regex, herramientas nativas) con análisis AI-powered (Claude o Gemini).

## Estructura de carpetas

```
src/main/ts/
├── cli/                    # Capa de presentación (CLI)
│   ├── config/             # Cargadores de configuración
│   ├── Application.ts      # Facade principal
│   ├── Banner.ts           # ASCII art
│   ├── CLIOptions.ts       # Opciones de línea de comandos
│   └── index.ts            # Barrel export
├── model/                  # Capa de lógica de negocio
│   ├── ai/                 # Clientes de IA
│   │   └── factory/        # Abstract Factory de clientes
│   ├── detector/           # Detección de stacks tecnológicos
│   ├── guidelines/         # Carga de guidelines del proyecto
│   ├── reporter/           # Generación de reportes
│   ├── scanner/            # Registro de scanners
│   ├── suppression/        # Gestión de supresiones
│   └── Orchestrator.ts     # Coordinador del flujo
├── scanner/                # Implementaciones de scanners
│   ├── BaseScanner.ts      # Template Method (clase abstracta)
│   ├── SecretScanner.ts    # Secretos hardcodeados (regex)
│   ├── DependencyScanner.ts # Dependencias vulnerables (npm/pip/mvn)
│   ├── AuthScanner.ts      # Autenticación/Autorización (IA)
│   ├── ArchitectureScanner.ts # Arquitectura y estructura (IA)
│   ├── CodeQualityScanner.ts  # Calidad de código (IA)
│   ├── PerformanceScanner.ts  # Rendimiento (IA)
│   └── TestingScanner.ts   # Testing y cobertura (híbrido)
└── types/                  # Tipos compartidos
    ├── Severity.ts         # Niveles de severidad
    ├── ScanResult.ts       # Resultados de escaneo
    ├── AuditMetrics.ts     # Métricas del proyecto
    └── index.ts            # Barrel export
```

## Flujo de ejecución

```
CLI (Commander.js)
  └── Application.bootstrap()
        ├── Configuración (DotenvConfigLoader)
        ├── Guidelines (GuidelinesLoader)
        ├── AI Client (AIClientFactory → IAIClient)
        ├── Scanners (ScannerRegistry → BaseScanner[])
        ├── Reporter (ConsoleReporter [+ JsonReporter])
        └── Orchestrator.start()
              ├── Detector.detect() → stacks
              ├── calculateMetrics() → métricas
              ├── SuppressionManager → supresiones
              ├── Scanner.scan() × 7 → resultados (streaming)
              ├── Reporter.printSummary()
              └── Reporter.save() → audit/vN/
```

## Patrones de diseño aplicados

| Patrón | Ubicación | Descripción |
|--------|-----------|-------------|
| **Template Method** | `BaseScanner` | Define flujo `scan()` con hooks `findFiles()` y `analyzeFile()` |
| **Abstract Factory** | `ai/factory/` | `AIClientFactory` → `ClaudeClient`, `GeminiClient` |
| **Decorator** | `reporter/` | `JsonReporter` envuelve `ConsoleReporter` |
| **Strategy** | `cli/config/` | `IConfigLoader` → `DotenvConfigLoader` |
| **Facade** | `Application`, `Orchestrator` | Simplifican la interacción con subsistemas complejos |
| **Registry** | `ScannerRegistry` | Registro centralizado de fábricas de scanners |
| **Observer/Callback** | `BaseScanner.scan()` | Streaming de resultados via callback `onResult` |
| **Simple Factory** | `createScanResult()` | Creación validada de `ScanResult` con defaults |

## Principios SOLID

| Principio | Aplicación |
|-----------|------------|
| **SRP** | Cada clase tiene una responsabilidad única (scanner, reporter, detector, etc.) |
| **OCP** | Nuevos scanners se agregan extendiendo `BaseScanner` sin modificar código existente |
| **LSP** | Todos los scanners son sustituibles donde se espera `BaseScanner` |
| **ISP** | `ResultReporter` tiene métodos opcionales (`setCurrentScanner?`, `save?`); `IConfigLoader` expone solo `load()` |
| **DIP** | Scanners dependen de `IAIClient` (abstracción), no de `ClaudeAIClient`/`GeminiAIClient` |

## Categorías de scanners

### Deterministas
Rápidos, predecibles, sin dependencia de IA:
- **SecretScanner**: regex contra patrones conocidos
- **DependencyScanner**: herramientas nativas (`npm audit`, `pip-audit`)

### AI-powered
Análisis semántico profundo, requieren cliente de IA configurado:
- **AuthScanner**, **ArchitectureScanner**, **CodeQualityScanner**, **PerformanceScanner**

### Híbrido
Combina ambos enfoques:
- **TestingScanner**: ratio de cobertura (determinista) + calidad de tests (IA)

## Degradación graceful

Si el cliente de IA no está disponible, los scanners AI-powered emiten un warning informativo y continúan sin interrumpir la ejecución. Los scanners deterministas funcionan independientemente.
