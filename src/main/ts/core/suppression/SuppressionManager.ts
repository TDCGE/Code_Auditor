import fs from 'fs';
import path from 'path';
import micromatch from 'micromatch';
import { globSync } from 'glob';
import { ScanResult } from '../../types';
import { SuppressionEntry, SuppressionsFile } from './SuppressionEntry';

export class SuppressionManager {
  private targetPath: string;
  private suppressions: SuppressionEntry[] = [];
  private considerations: string[] = [];
  private suppressedCount = 0;

  constructor(targetPath: string) {
    this.targetPath = targetPath;
  }

  /** Carga suppressions.json si existe. No-op si no se encuentra. */
  load(): void {
    const filePath = path.join(this.targetPath, 'audit', 'suppressions.json');
    if (!fs.existsSync(filePath)) return;

    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as SuppressionsFile;
      if (Array.isArray(raw.suppressions)) {
        this.suppressions = raw.suppressions;
      }
      if (Array.isArray(raw.considerations)) {
        this.considerations = raw.considerations;
      }
    } catch {
      // Archivo corrupto — ignorar
    }
  }

  /** Importa falsos positivos desde review-log.md de versiones anteriores. */
  importFromReviewLog(): void {
    const reviewLogs = globSync('audit/v*/review-log.md', {
      cwd: this.targetPath,
      absolute: true,
    });

    for (const logPath of reviewLogs) {
      try {
        const content = fs.readFileSync(logPath, 'utf-8');
        const versionMatch = logPath.match(/audit[/\\]v(\d+)[/\\]/);
        const version = versionMatch ? versionMatch[1] : 'unknown';

        const entries = this.parseReviewLog(content, version);
        this.mergeEntries(entries);
      } catch {
        // Ignorar errores de lectura
      }
    }
  }

  /** Persiste las supresiones actuales a suppressions.json. */
  save(): void {
    if (this.suppressions.length === 0) return;

    const auditDir = path.join(this.targetPath, 'audit');
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }

    const data: SuppressionsFile = {
      suppressions: this.suppressions,
      considerations: this.considerations,
    };

    fs.writeFileSync(
      path.join(auditDir, 'suppressions.json'),
      JSON.stringify(data, null, 2),
      'utf-8',
    );
  }

  /** Evalúa si un resultado debe ser suprimido. */
  isSuppressed(result: ScanResult): boolean {
    for (const entry of this.suppressions) {
      if (result.rule !== entry.rule) continue;

      if (entry.filePattern) {
        const normalizedFile = result.file.replace(/\\/g, '/');
        if (!micromatch.isMatch(normalizedFile, entry.filePattern)) continue;
      }

      if (entry.messageContains) {
        if (!result.message.includes(entry.messageContains)) continue;
      }

      this.suppressedCount++;
      return true;
    }
    return false;
  }

  getSuppressedCount(): number {
    return this.suppressedCount;
  }

  getConsiderations(): string[] {
    return this.considerations;
  }

  /** Parsea una tabla Markdown de review-log y extrae filas con "Falso positivo". */
  private parseReviewLog(content: string, version: string): SuppressionEntry[] {
    const entries: SuppressionEntry[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      // Solo procesar líneas de tabla que contengan "Falso positivo"
      if (!line.includes('Falso positivo')) continue;

      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      // Esperamos: #, Regla, Archivo, Veredicto, Comentario
      if (cells.length < 5) continue;

      const rule = cells[1].replace(/`/g, '').trim();
      const file = cells[2].trim();
      const comment = cells[4].trim();

      // Normalizar path: quitar número de línea, convertir \ a /
      const filePattern = `**/${file.replace(/:\d+$/, '').replace(/\\/g, '/')}`;

      entries.push({
        rule,
        filePattern,
        reason: comment || `Marcado como falso positivo en review-log v${version}`,
        source: `review-log-v${version}`,
      });
    }

    return entries;
  }

  /** Merge sin duplicados (por rule + filePattern). */
  private mergeEntries(newEntries: SuppressionEntry[]): void {
    for (const entry of newEntries) {
      const exists = this.suppressions.some(
        s => s.rule === entry.rule && s.filePattern === entry.filePattern,
      );
      if (!exists) {
        this.suppressions.push(entry);
      }
    }
  }
}
