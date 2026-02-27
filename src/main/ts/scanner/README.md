# scanner/ — Implementaciones de scanners de seguridad y calidad

## Responsabilidad

Contiene todas las implementaciones concretas de scanners que analizan el código del proyecto objetivo. Cada scanner se especializa en un dominio de análisis y extiende la clase base `BaseScanner`.

## Clase base

### `BaseScanner.ts` — Template Method

Clase abstracta que define el flujo de escaneo como un **Template Method**:

```
scan() → findFiles() → filterExcluded() → readFile() → analyzeFile() → emitResult
```

Las subclases implementan tres métodos abstractos:
- `getName()`: nombre descriptivo del scanner.
- `findFiles()`: selección de archivos relevantes.
- `analyzeFile()`: análisis del contenido de cada archivo.

## Scanners disponibles

### Deterministas (sin IA)

| Scanner | Archivo | Análisis |
|---------|---------|----------|
| **SecretScanner** | `SecretScanner.ts` | Detecta credenciales hardcodeadas (AWS keys, API secrets, llaves privadas, correos corporativos) mediante patrones regex |
| **DependencyScanner** | `DependencyScanner.ts` | Ejecuta `npm audit`, `pip-audit` o `mvn dependency:tree` según el stack detectado |

### AI-powered

| Scanner | Archivo | Análisis |
|---------|---------|----------|
| **AuthScanner** | `AuthScanner.ts` | Fallos de autenticación/autorización (JWT, hashing, cookies, rutas sin protección) |
| **ArchitectureScanner** | `ArchitectureScanner.ts` | Violaciones SOLID, antipatrones, estructura de proyecto (análisis en dos fases) |
| **CodeQualityScanner** | `CodeQualityScanner.ts` | Complejidad excesiva, duplicación, code smells, naming inconsistente |
| **PerformanceScanner** | `PerformanceScanner.ts` | Queries N+1, resource leaks, operaciones bloqueantes, falta de caching |
| **TestingScanner** | `TestingScanner.ts` | Ratio de cobertura, detección de frameworks, calidad de assertions (híbrido: determinista + IA) |

## Degradación graceful

Todos los scanners AI-powered verifican `aiClient.hasKey()` antes de ejecutar. Si el cliente de IA no está disponible, emiten un warning de severidad `LOW` con regla `ai-client-unavailable` y retornan sin interrumpir la ejecución.

## Patrón Callback/Observer

Los scanners emiten resultados individualmente via callback `onResult` en lugar de acumular y retornar en batch. Esto permite al `Orchestrator` mostrar hallazgos en tiempo real durante la ejecución.

## Orden de ejecución

Definido en `Application.ts`:
1. SecretScanner (determinista, rápido)
2. DependencyScanner (determinista)
3. CodeQualityScanner (IA)
4. ArchitectureScanner (IA con skills)
5. AuthScanner (IA)
6. PerformanceScanner (IA)
7. TestingScanner (híbrido, al final porque analiza archivos de test que otros ignoran)
