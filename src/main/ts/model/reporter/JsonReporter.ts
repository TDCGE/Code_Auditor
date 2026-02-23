import fs from 'fs';
import { ScanResult, hasLine, AuditMetrics } from '../../types';
import { ResultReporter } from './ResultReporter';
import { Severity } from '../../types/Severity';

export class JsonReporter implements ResultReporter {
  private readonly wrapped: ResultReporter;
  private readonly outputPath: string;
  private readonly results: ScanResult[] = [];

  constructor(wrapped: ResultReporter, outputPath: string) {
    this.wrapped = wrapped;
    this.outputPath = outputPath;
  }

  printResult(result: ScanResult): void {
    this.results.push(result);
    this.wrapped.printResult(result);
  }

  printSummary(): void {
    this.wrapped.printSummary();
  }

  setCurrentScanner(name: string): void {
    this.wrapped.setCurrentScanner?.(name);
  }

  setMetrics(metrics: AuditMetrics): void {
    this.wrapped.setMetrics?.(metrics);
  }

  async save(targetPath: string): Promise<string> {
    const mdPath = await this.wrapped.save?.(targetPath) ?? '';
    await this.writeJson(mdPath);
    return mdPath;
  }

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
