import { BaseScanner } from '../../scanner/BaseScanner';

export type ScannerFactory = (targetPath: string, excludePatterns: string[]) => BaseScanner;

export class ScannerRegistry {
  private factories: ScannerFactory[] = [];

  register(factory: ScannerFactory): void {
    this.factories.push(factory);
  }

  createScanners(targetPath: string, excludePatterns: string[] = []): BaseScanner[] {
    return this.factories.map(f => f(targetPath, excludePatterns));
  }
}
