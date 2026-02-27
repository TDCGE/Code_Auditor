# model/ — Lógica de negocio y orquestación

## Responsabilidad

Contiene la lógica de negocio del sistema: orquestación del flujo de auditoría, clientes de IA, detección de stacks tecnológicos, carga de guidelines, generación de reportes, registro de scanners y gestión de supresiones.

## Subcarpetas

| Subcarpeta | Responsabilidad | Patrón principal |
|------------|-----------------|------------------|
| `ai/` | Clientes de IA (Claude, Gemini) y utilidades de prompts | DIP, Strategy |
| `ai/factory/` | Fábricas de clientes de IA | **Abstract Factory** |
| `detector/` | Detección de stacks tecnológicos (Node, Python, Java) | — |
| `guidelines/` | Carga de `guidelines.md` del proyecto auditado | — |
| `reporter/` | Generación de reportes (consola, Markdown, JSON) | **Decorator**, ISP |
| `scanner/` | Registro centralizado de scanners | **Registry** |
| `suppression/` | Gestión de falsos positivos y supresiones | — |

## Archivos raíz

| Archivo | Descripción | Patrón |
|---------|-------------|--------|
| `Orchestrator.ts` | Coordina todo el flujo de auditoría | **Facade/Mediator** |

## Patrones de diseño aplicados

### Abstract Factory (`ai/factory/`)
- `AIClientFactory` (abstracta) → `ClaudeClient`, `GeminiClient` (concretas)
- `createFromProvider()` selecciona la fábrica según `AI_PROVIDER`
- Permite agregar nuevos proveedores de IA sin modificar los scanners

### Decorator (`reporter/`)
- `JsonReporter` envuelve `ConsoleReporter` de forma transparente
- Agrega salida JSON sin modificar el comportamiento base
- Activado condicionalmente por la opción `--output-json`

### Registry (`scanner/`)
- `ScannerRegistry` almacena fábricas de scanners para instanciación diferida
- Desacopla la configuración (qué scanners usar) de la ejecución

### Facade/Mediator (`Orchestrator.ts`)
- Coordina detector, scanners, reporter y supresiones
- Único punto de entrada para el flujo completo de auditoría

## Flujo de datos

```
Orchestrator.start()
  ├── Detector.detect()           → DetectedStack[]
  ├── calculateMetrics()          → AuditMetrics
  ├── SuppressionManager.load()   → supresiones cargadas
  ├── for each Scanner:
  │   └── scanner.scan(onResult)  → ScanResult[] (streaming)
  │       └── reporter.printResult()
  ├── reporter.printSummary()
  └── reporter.save()             → audit/vN/{audit.md, review-log.md, changelog.md}
```
