import fs from 'fs';
import { ScanResult, hasLine, AuditMetrics } from '../../types';
import { ResultReporter } from './ResultReporter';
import { Severity } from '../../types/Severity';

/**
 * Decorador de {@link ResultReporter} que agrega salida JSON (patrón **Decorator**).
 * Envuelve un reporter existente (típicamente {@link ConsoleReporter}) y, de forma
 * transparente, acumula los resultados para escribir un resumen JSON al finalizar.
 * Útil para integración con CI/CD vía la opción `--output-json`.
 */
export class JsonReporter implements ResultReporter {
  private readonly wrapped: ResultReporter;
  private readonly outputPath: string;
  private readonly results: ScanResult[] = [];

  /**
   * @param wrapped — Reporter base que será decorado.
   * @param outputPath — Ruta del archivo JSON de salida.
   */
  constructor(wrapped: ResultReporter, outputPath: string) {
    this.wrapped = wrapped;
    this.outputPath = outputPath;
  }

  /** Acumula el resultado y delega la impresión al reporter envuelto. */
  printResult(result: ScanResult): void {
    this.results.push(result);
    this.wrapped.printResult(result);
  }

  /** Delega al reporter envuelto. */
  printSummary(): void {
    this.wrapped.printSummary();
  }

  /** Delega al reporter envuelto. */
  setCurrentScanner(name: string): void {
    this.wrapped.setCurrentScanner?.(name);
  }

  /** Delega al reporter envuelto. */
  setMetrics(metrics: AuditMetrics): void {
    this.wrapped.setMetrics?.(metrics);
  }

  /** Delega el save al reporter envuelto y luego escribe el archivo JSON. */
  async save(targetPath: string): Promise<string> {
    const mdPath = await this.wrapped.save?.(targetPath) ?? '';
    await this.writeJson(mdPath);
    return mdPath;
  }

  /** Escribe el resumen JSON con conteos, issues y referencia al reporte Markdown. */
  private async writeJson(reportPath: string): Promise<void> {
    const counts: Record<Severity, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const r of this.results) {
      counts[r.severity]++;
    }

    const summary = {
      hasCritical: this.results.some(r => r.severity === 'HIGH'),
      total: this.results.length,
      counts,
      issues: this.results.map(r => ({
        file: r.file,
        line: hasLine(r) ? r.line : undefined,
        severity: r.severity,
        message: r.message,
        suggestion: r.suggestion,
        rule: r.rule,
      })),
      reportPath,
    };

    fs.writeFileSync(this.outputPath, JSON.stringify(summary, null, 2), 'utf-8');
  }
}
