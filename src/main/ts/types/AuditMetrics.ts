/**
 * Métricas cuantitativas del proyecto analizado.
 * Calculadas por el {@link Orchestrator} antes de ejecutar los scanners
 * y consumidas por los reporters para enriquecer el informe de auditoría.
 */
export interface AuditMetrics {
  /** Cantidad total de archivos de código fuente (excluyendo tests). */
  totalFiles: number;
  /** Cantidad total de líneas de código fuente. */
  totalLines: number;
  /** Cantidad de archivos de test detectados. */
  testFiles: number;
  /** Stacks tecnológicos detectados (ej: `['node', 'python']`). */
  stacks: string[];
}
