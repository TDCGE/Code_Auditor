import fs from 'fs';
import path from 'path';

/**
 * Gestiona el versionado de carpetas de auditoría (SRP).
 *
 * Estructura generada:
 * ```
 * <targetPath>/audit/
 *   v1/
 *     audit.md
 *     review-log.md
 *     changelog.md
 *   v2/
 *     ...
 * ```
 */
export class AuditVersionManager {
  private auditRoot: string;

  constructor(targetPath: string) {
    this.auditRoot = path.join(path.resolve(targetPath), 'audit');
  }

  /** Escanea carpetas vN existentes y retorna el path del siguiente (ej: audit/v3). */
  getNextVersionDir(): string {
    let maxVersion = 0;

    if (fs.existsSync(this.auditRoot)) {
      const entries = fs.readdirSync(this.auditRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const match = entry.name.match(/^v(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxVersion) maxVersion = num;
          }
        }
      }
    }

    return path.join(this.auditRoot, `v${maxVersion + 1}`);
  }

  /** Crea la carpeta versionada y retorna su path. */
  createVersionDir(): string {
    const versionDir = this.getNextVersionDir();
    fs.mkdirSync(versionDir, { recursive: true });
    return versionDir;
  }
}
