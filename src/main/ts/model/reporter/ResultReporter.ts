import { ScanResult, AuditMetrics } from '../../types';

/**
 * Contrato para reportadores de resultados de auditoría (patrón **ISP — Interface Segregation**).
 * Define los métodos obligatorios (`printResult`, `printSummary`) y opcionales
 * (`setCurrentScanner`, `setMetrics`, `save`) para máxima flexibilidad.
 *
 * @see ConsoleReporter — Implementación principal con salida a consola y Markdown.
 * @see JsonReporter — Decorador que agrega salida JSON.
 */
export interface ResultReporter {
  /** Imprime/procesa un resultado individual de un scanner. */
  printResult(result: ScanResult): void;
  /** Imprime el resumen final de la auditoría. */
  printSummary(): void;
  /** Establece el nombre del scanner activo (para agrupar resultados por sección). */
  setCurrentScanner?(name: string): void;
  /** Inyecta las métricas del proyecto para incluirlas en el reporte. */
  setMetrics?(metrics: AuditMetrics): void;
  /**
   * Persiste el reporte en disco (Markdown, JSON, etc.).
   * @param targetPath — Ruta del proyecto auditado (para crear `audit/vN/`).
   * @returns Ruta del directorio donde se guardó el reporte.
   */
  save?(targetPath: string): Promise<string>;
}
