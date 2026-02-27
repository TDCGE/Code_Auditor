/**
 * Opciones de línea de comandos del CLI CGE-Verificator.
 * Parseadas por Commander.js en el punto de entrada y consumidas por {@link Application.run}.
 */
export interface CLIOptions {
  /** Ruta del directorio del proyecto a analizar. */
  path: string;
  /** Patrones glob separados por comas para excluir archivos/carpetas del análisis. */
  exclude: string;
  /** Ruta donde escribir un resumen JSON para consumo programático (CI/CD). */
  outputJson?: string;
}
