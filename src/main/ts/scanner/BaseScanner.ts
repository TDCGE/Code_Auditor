import fs from 'fs-extra';
import path from 'path';
import micromatch from 'micromatch';
import { ScanResult } from '../types'

/**
 * Clase base abstracta para todos los scanners del sistema (patrón **Template Method**).
 * Define el flujo `scan()`: buscar archivos → filtrar excluidos → leer → analizar → emitir resultados.
 * Las subclases implementan `getName()`, `findFiles()` y `analyzeFile()`.
 *
 * @see SecretScanner — Scanner determinista de secretos hardcodeados.
 * @see AuthScanner — Scanner AI-powered de autenticación.
 * @see ArchitectureScanner — Scanner AI-powered de arquitectura.
 */
export abstract class BaseScanner {
  protected targetPath: string;
  protected excludePatterns: string[] = [];

  /**
   * @param targetPath — Ruta raíz del proyecto a analizar.
   * @param excludePatterns — Patrones glob proporcionados por el usuario para excluir archivos.
   */
  constructor(targetPath: string, excludePatterns: string[] = []) {
    this.targetPath = targetPath;
    this.excludePatterns = excludePatterns;
  }

  /** Retorna el nombre descriptivo del scanner (mostrado en consola y reportes). */
  abstract getName(): string;

  /** Override in subclasses to return the list of files to analyze. */
  protected abstract findFiles(): string[];

  /** Override in subclasses to analyze a single file's content. */
  protected abstract analyzeFile(filePath: string, content: string): Promise<ScanResult[]>;

  /** Verifica que un path resuelto esté dentro del directPath objetivo. */
  private isWithinTarget(filePath: string): boolean {
    const resolved = path.resolve(filePath);
    const target = path.resolve(this.targetPath);
    return resolved.startsWith(target + path.sep) || resolved === target;
  }

  /** Template method: finds files, reads them, analyzes each, and emits results. */
  async scan(onResult?: (result: ScanResult) => void): Promise<ScanResult[]> {
    const allResults: ScanResult[] = [];
    const files = this.findFiles();
    const filteredFiles = this.filterExcluded(files).filter(f => this.isWithinTarget(f));

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const results = await this.analyzeFile(file, content);

        for (const result of results) {
          allResults.push(result);
          if (onResult) onResult(result);
        }
      } catch (err) {
        // Ignorar errores de lectura
      }
    }

    return allResults;
  }

  /** Helper to filter out excluded files based on user patterns. */
  protected filterExcluded(files: string[]): string[] {
    if (this.excludePatterns.length === 0) return files;

    return files.filter(file => {
      const relativePath = this.relativePath(file);
      return !micromatch.isMatch(relativePath, this.excludePatterns);
    });
  }

  /** Helper to get a relative path from targetPath. */
  protected relativePath(absolutePath: string): string {
    return path.relative(this.targetPath, absolutePath);
  }
}
