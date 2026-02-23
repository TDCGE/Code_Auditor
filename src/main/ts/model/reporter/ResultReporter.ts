import { ScanResult, AuditMetrics } from '../../types';

export interface ResultReporter {
  printResult(result: ScanResult): void;
  printSummary(): void;
  setCurrentScanner?(name: string): void;
  setMetrics?(metrics: AuditMetrics): void;
  save?(targetPath: string): Promise<string>;
}
