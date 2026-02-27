# types/ — Tipos compartidos del sistema

## Responsabilidad

Define los tipos, interfaces y constantes compartidas por todas las capas del sistema CGE-Verificator. Centraliza las definiciones de dominio para evitar duplicación y garantizar consistencia.

## Contenido

| Archivo | Descripción |
|---------|-------------|
| `Severity.ts` | Niveles de severidad (`HIGH`, `MEDIUM`, `LOW`), metadata y colores de badge |
| `ScanResult.ts` | Tipos de resultado de escaneo (`BaseScanResult`, `LineLevelScanResult`), type guard `hasLine()` y Simple Factory `createScanResult()` |
| `AuditMetrics.ts` | Interface `AuditMetrics` con métricas cuantitativas del proyecto analizado |
| `index.ts` | Barrel export — re-exporta todos los tipos para importar desde `../types` |

## Patrones aplicados

- **Barrel Export**: `index.ts` centraliza todas las re-exportaciones del módulo.
- **Simple Factory**: `createScanResult()` valida inputs y aplica defaults.
- **Union discriminada**: `ScanResult = BaseScanResult | LineLevelScanResult` con type guard `hasLine()`.
- **ISP (Interface Segregation)**: `BaseScanResult` no incluye `line` para scanners que operan a nivel de proyecto.
- **Encapsular lo que varía**: `SEVERITY_CONFIG` centraliza metadata de severidades en un registro inmutable.

## Uso

```typescript
import { ScanResult, Severity, createScanResult, hasLine } from '../types';
```
