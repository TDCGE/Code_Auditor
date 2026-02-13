import { ScanResult } from '../scanners/BaseScanner';

export interface ResultReporter {
  printResult(result: ScanResult): void;
  printSummary(): void;
}
