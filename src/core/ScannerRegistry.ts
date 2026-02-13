import { BaseScanner } from '../scanners/BaseScanner';

export type ScannerFactory = (targetPath: string) => BaseScanner;

export class ScannerRegistry {
  private factories: ScannerFactory[] = [];

  register(factory: ScannerFactory): void {
    this.factories.push(factory);
  }

  createScanners(targetPath: string): BaseScanner[] {
    return this.factories.map(f => f(targetPath));
  }
}
