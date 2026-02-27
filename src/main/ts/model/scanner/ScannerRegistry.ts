import { BaseScanner } from '../../scanner/BaseScanner';

/**
 * Función fábrica que crea una instancia de scanner dada la ruta objetivo y patrones de exclusión.
 * Registrada en {@link ScannerRegistry} para instanciación diferida.
 */
export type ScannerFactory = (targetPath: string, excludePatterns: string[]) => BaseScanner;

/**
 * Registro centralizado de scanners (patrón **Registry**).
 * Permite registrar fábricas de scanners y crear todas las instancias de forma diferida
 * con la misma configuración (path, exclusiones).
 */
export class ScannerRegistry {
  private factories: ScannerFactory[] = [];

  /** Registra una fábrica de scanner para instanciación posterior. */
  register(factory: ScannerFactory): void {
    this.factories.push(factory);
  }

  /**
   * Instancia todos los scanners registrados con la configuración dada.
   * @param targetPath — Ruta raíz del proyecto a analizar.
   * @param excludePatterns — Patrones glob de exclusión del usuario.
   */
  createScanners(targetPath: string, excludePatterns: string[] = []): BaseScanner[] {
    return this.factories.map(f => f(targetPath, excludePatterns));
  }
}
