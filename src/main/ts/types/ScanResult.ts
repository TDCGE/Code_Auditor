import { Severity, SEVERITIES } from './Severity';

// ── Types ───────────────────────────────────────────────────────────────

/**
 * Alias semántico para rutas de archivo relativas al proyecto analizado.
 * No aporta seguridad de tipos adicional; existe como documentación inline.
 */
export type FilePath = string;

/**
 * Identificadores de regla con autocompletado IDE.
 * Extensible: cualquier string adicional es válido gracias a `(string & {})`.
 */
export type RuleId =
  | 'no-hardcoded-secrets'
  | 'auth-security-best-practices'
  | 'ai-architecture-review'
  | 'project-structure-check'
  | 'ai-client-unavailable'
  | 'vulnerable-dependency'
  | 'dependency-audit-unavailable'
  | 'insufficient-test-coverage'
  | 'missing-test-framework'
  | 'test-quality-issue'
  | 'code-complexity'
  | 'code-duplication'
  | 'naming-convention'
  | 'code-smell'
  | 'performance-n-plus-one'
  | 'performance-resource-leak'
  | 'performance-blocking-operation'
  | 'performance-issue'
  | 'maintainability-coupling'
  | 'maintainability-documentation'
  | (string & {});

/**
 * Resultado base de un escaneo. No incluye número de línea (ISP).
 * Usado por scanners que operan a nivel de proyecto o archivo completo.
 */
export interface BaseScanResult {
  /** Ruta relativa del archivo donde se encontró el hallazgo. */
  file: FilePath;
  /** Descripción del hallazgo. */
  message: string;
  /** Nivel de severidad del hallazgo. */
  severity: Severity;
  /** Identificador de la regla que generó el hallazgo. */
  rule: RuleId;
  /** Sugerencia de corrección. Siempre presente (string vacío como default via factory). */
  suggestion: string;
}

/**
 * Resultado de escaneo a nivel de línea. Extiende BaseScanResult con número de línea.
 * Usado por scanners que detectan problemas en líneas específicas (ej: SecretScanner).
 */
export interface LineLevelScanResult extends BaseScanResult {
  /** Número de línea (1-indexed) donde se detectó el hallazgo. */
  line: number;
}

/**
 * Unión discriminada por presencia de `line`.
 * Usar `hasLine()` como type guard para narrowing seguro.
 */
export type ScanResult = BaseScanResult | LineLevelScanResult;

// ── Type Guard ──────────────────────────────────────────────────────────

/** Type guard: determina si el resultado tiene número de línea. */
export function hasLine(result: ScanResult): result is LineLevelScanResult {
  return 'line' in result && typeof (result as LineLevelScanResult).line === 'number';
}

// ── Factory ─────────────────────────────────────────────────────────────

/**
 * Simple Factory con valor por defecto para `suggestion`.
 * Valida inputs en runtime para detectar errores de integración temprano.
 */
export function createScanResult(input: {
  file: FilePath;
  line?: number;
  message: string;
  severity: Severity;
  rule: RuleId;
  suggestion?: string;
}): ScanResult {
  if (!input.file) {
    throw new Error('createScanResult: "file" must be a non-empty string');
  }
  if (!input.message) {
    throw new Error('createScanResult: "message" must be a non-empty string');
  }
  if (input.line !== undefined && (!Number.isInteger(input.line) || input.line < 1)) {
    throw new Error('createScanResult: "line" must be a positive integer >= 1');
  }
  if (!(SEVERITIES as readonly string[]).includes(input.severity)) {
    throw new Error(`createScanResult: invalid severity "${input.severity}". Must be one of: ${SEVERITIES.join(', ')}`);
  }

  const base: BaseScanResult = {
    file: input.file,
    message: input.message,
    severity: input.severity,
    rule: input.rule,
    suggestion: input.suggestion ?? '',
  };

  if (input.line !== undefined) {
    return { ...base, line: input.line };
  }

  return base;
}
