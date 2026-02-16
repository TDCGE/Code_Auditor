import { ScanResult } from '../../scanners/ScanResult';

export interface ResultReporter {
  printResult(result: ScanResult): void;
  printSummary(): void;
  setCurrentScanner?(name: string): void;
  save?(targetPath: string): Promise<void>;
}
