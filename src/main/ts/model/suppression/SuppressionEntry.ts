/**
 * Entrada de supresión que define un hallazgo a ignorar en futuras auditorías.
 * Las supresiones se cargan desde `audit/suppressions.json` o se importan
 * automáticamente desde review-logs marcados como "Falso positivo".
 */
export interface SuppressionEntry {
  /** Identificador de la regla a suprimir (ej: `'no-hardcoded-secrets'`). */
  rule: string;
  /** Patrón glob para restringir la supresión a archivos específicos. */
  filePattern?: string;
  /** Texto que debe estar contenido en el mensaje para que aplique la supresión. */
  messageContains?: string;
  /** Justificación de por qué se suprime este hallazgo. */
  reason: string;
  /** Origen de la supresión (ej: `'review-log-v1'`). */
  source?: string;
}

/**
 * Estructura del archivo `audit/suppressions.json`.
 * Contiene las supresiones activas y consideraciones generales del equipo.
 */
export interface SuppressionsFile {
  /** Lista de hallazgos suprimidos. */
  suppressions: SuppressionEntry[];
  /** Notas o advertencias del equipo sobre las supresiones. */
  considerations: string[];
}
