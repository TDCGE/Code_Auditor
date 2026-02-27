# cli/ — Interfaz de línea de comandos

## Responsabilidad

Módulo de la capa de presentación que gestiona la interfaz de línea de comandos del CGE-Verificator. Parsea argumentos, carga configuración y delega la ejecución a la capa de modelo.

## Archivos

| Archivo | Descripción | Patrón |
|---------|-------------|--------|
| `Application.ts` | Fachada principal: inicializa dependencias y lanza la auditoría | **Facade** |
| `Banner.ts` | Banner ASCII mostrado al inicio de la ejecución | — |
| `CLIOptions.ts` | Interface con las opciones de línea de comandos | — |
| `config/IConfigLoader.ts` | Contrato para cargadores de configuración | **ISP** |
| `config/DotenvConfigLoader.ts` | Implementación basada en archivos `.env` | **Strategy** |
| `index.ts` | Barrel export del módulo | — |

## Flujo de ejecución

```
src/main/index.ts (Commander.js)
  └── Application.bootstrap(opts)
        ├── DotenvConfigLoader.load()    → carga .env
        ├── Banner.showBanner()          → ASCII art
        └── Application.run(opts)
              ├── GuidelinesLoader.load() → guidelines del proyecto
              ├── createFromProvider()    → IAIClient
              ├── ScannerRegistry         → registra 7 scanners
              ├── ConsoleReporter         → (+ JsonReporter si --output-json)
              └── Orchestrator.start()    → ejecuta auditoría completa
```

## Opciones CLI

| Opción | Descripción | Default |
|--------|-------------|---------|
| `-p, --path <dir>` | Directorio del proyecto a analizar | `.` |
| `-e, --exclude <patterns>` | Patrones glob separados por comas para excluir | `''` |
| `--output-json <file>` | Ruta para exportar resumen JSON (CI/CD) | — |

## Principios SOLID aplicados

- **ISP (Interface Segregation)**: `IConfigLoader` expone solo `load()`, sin acoplar a dotenv.
- **DIP (Dependency Inversion)**: `Application` depende de abstracciones (`IConfigLoader`, `IAIClient`, `ResultReporter`).
- **SRP (Single Responsibility)**: Cada clase tiene una única responsabilidad clara.
