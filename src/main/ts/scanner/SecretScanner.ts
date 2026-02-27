import { BaseScanner } from './BaseScanner';
import { ScanResult, createScanResult } from '../types';
import { globSync } from 'glob';

/**
 * Patrones regex para detección de secretos y credenciales hardcodeadas.
 * Cada patrón define nombre, expresión regular y severidad del hallazgo.
 */
const patterns = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/, severity: 'HIGH' as const },
  { name: 'Secreto Genérico', regex: /(api_key|apikey|secret|password|auth_token)\s*(=|:)\s*['"][A-Za-z0-9_\-]{8,}['"]/, severity: 'HIGH' as const },
  { name: 'Llave Privada', regex: /-----BEGIN PRIVATE KEY-----/, severity: 'HIGH' as const },
  { name: 'Correo Corporativo Hardcodeado', regex: /[a-zA-Z0-9._%+-]+@cge\.cl/, severity: 'LOW' as const }
];

/**
 * Scanner determinista de secretos y credenciales hardcodeadas.
 * Extiende {@link BaseScanner} y analiza cada línea de código contra patrones regex
 * predefinidos. Ignora líneas que usan `process.env` (lectura segura de variables).
 */
export class SecretScanner extends BaseScanner {
  /** {@inheritDoc BaseScanner.getName} */
  getName(): string {
    return 'Escáner de Secretos (Credenciales Hardcodeadas)';
  }

  /** Busca archivos de código fuente y configuración susceptibles de contener secretos. */
  protected findFiles(): string[] {
    // Hardcoded ignores are for glob performance (large directories).
    // User-provided --exclude patterns are applied separately in BaseScanner.filterExcluded().
    return globSync('**/*.{js,ts,py,java,json,xml,yml,yaml,env}', {
      cwd: this.targetPath,
      ignore: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/.idea/**'
      ],
      nodir: true,
      absolute: true
    });
  }

  /** Analiza cada línea del archivo contra los patrones regex de secretos. */
  protected async analyzeFile(filePath: string, content: string): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    const lines = content.split(/\r?\n/);

    lines.forEach((lineContent, index) => {
      if (lineContent.includes('process.env')) return;

      for (const pattern of patterns) {
        if (pattern.regex.test(lineContent)) {
          results.push(createScanResult({
            file: this.relativePath(filePath),
            line: index + 1,
            message: `Detectado ${pattern.name}`,
            severity: pattern.severity,
            rule: 'no-hardcoded-secrets',
          }));
        }
      }
    });

    return results;
  }
}
