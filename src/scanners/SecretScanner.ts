import { BaseScanner } from './BaseScanner';
import { ScanResult } from '../types';
import { globSync } from 'glob';

const patterns = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/, severity: 'HIGH' as const },
  { name: 'Secreto Genérico', regex: /(api_key|apikey|secret|password|auth_token)\s*(=|:)\s*['"][A-Za-z0-9_\-]{8,}['"]/, severity: 'HIGH' as const },
  { name: 'Llave Privada', regex: /-----BEGIN PRIVATE KEY-----/, severity: 'HIGH' as const },
  { name: 'Correo Corporativo Hardcodeado', regex: /[a-zA-Z0-9._%+-]+@cge\.cl/, severity: 'LOW' as const }
];

export class SecretScanner extends BaseScanner {
  getName(): string {
    return 'Escáner de Secretos (Credenciales Hardcodeadas)';
  }

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

  protected async analyzeFile(filePath: string, content: string): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    const lines = content.split(/\r?\n/);

    lines.forEach((lineContent, index) => {
      if (lineContent.includes('process.env')) return;

      for (const pattern of patterns) {
        if (pattern.regex.test(lineContent)) {
          results.push({
            file: this.relativePath(filePath),
            line: index + 1,
            message: `Detectado ${pattern.name}`,
            severity: pattern.severity,
            rule: 'no-hardcoded-secrets'
          });
        }
      }
    });

    return results;
  }
}
