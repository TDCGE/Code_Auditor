import fs from 'fs-extra';
import path from 'path';

export interface ScanResult {
  file: string;
  line: number;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  rule: string;
}

export abstract class BaseScanner {
  protected targetPath: string;

  constructor(targetPath: string) {
    this.targetPath = targetPath;
  }

  abstract getName(): string;

  /** Override in subclasses to return the list of files to analyze. */
  protected abstract findFiles(): string[];

  /** Override in subclasses to analyze a single file's content. */
  protected abstract analyzeFile(filePath: string, content: string): Promise<ScanResult[]>;

  /** Template method: finds files, reads them, analyzes each, and emits results. */
  async scan(onResult?: (result: ScanResult) => void): Promise<ScanResult[]> {
    const allResults: ScanResult[] = [];
    const files = this.findFiles();

    for (const file of files) {
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

  /** Helper to get a relative path from targetPath. */
  protected relativePath(absolutePath: string): string {
    return path.relative(this.targetPath, absolutePath);
  }
}
