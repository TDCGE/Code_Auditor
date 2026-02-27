/**
 * @module types
 * Barrel export de todos los tipos compartidos del sistema CGE-Verificator.
 * Centraliza las re-exportaciones para que el resto del proyecto importe desde `../types`.
 */
export { Severity, SEVERITIES, SEVERITY_CONFIG, SeverityBadgeColor, SeverityMeta } from './Severity';
export {
  ScanResult,
  BaseScanResult,
  LineLevelScanResult,
  FilePath,
  RuleId,
  hasLine,
  createScanResult,
} from './ScanResult';
export { AuditMetrics } from './AuditMetrics';
