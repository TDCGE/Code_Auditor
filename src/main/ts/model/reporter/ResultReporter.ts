import { ScanResult } from '../../types';

export interface ResultReporter {
  printResult(result: ScanResult): void;
  printSummary(): void;
  setCurrentScanner?(name: string): void;
  save?(targetPath: string): Promise<string>;
}
