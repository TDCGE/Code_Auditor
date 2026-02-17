import { BaseScanner } from './BaseScanner';
import { ScanResult } from '../types';
import { IAIClient } from '../core/ai/IAIClient';
import { globSync } from 'glob';
import path from 'path';

export class AuthScanner extends BaseScanner {
  private aiClient: IAIClient;

  constructor(targetPath: string, aiClient: IAIClient, excludePatterns: string[] = []) {
    super(targetPath, excludePatterns);
    this.aiClient = aiClient;
  }

  getName(): string {
    return 'Auditor de Autenticación y Autorización';
  }

  protected findFiles(): string[] {
    return globSync('**/{auth,login,session,middleware,security,config}*.{ts,js,py,java}', {
      cwd: this.targetPath,
      ignore: ['**/node_modules/**', '**/dist/**'],
      nodir: true,
      absolute: true
    });
  }

  protected async analyzeFile(filePath: string, content: string): Promise<ScanResult[]> {
    const prompt = `
      Actúa como un Experto en Ciberseguridad (OWASP).
      Analiza el código de "${path.basename(filePath)}" buscando fallos CRÍTICOS de Autenticación/Autorización.

      Reglas:
      1. JWT: Uso de decode() en lugar de verify(), secretos débiles, falta de expiración.
      2. Passwords: Algoritmos obsoletos (MD5, SHA1).
      3. Control de Acceso: Rutas sin protección o roles.
      4. Session: Cookies inseguras.

      Responde SOLO con un JSON válido. EL CONTENIDO DE "message" y "suggestion" DEBE ESTAR EN ESPAÑOL:
      {
        "issues": [
          {
            "severity": "HIGH" | "MEDIUM",
            "category": "Autenticación" | "Autorización",
            "message": "Descripción del fallo en español",
            "suggestion": "Solución técnica en español"
          }
        ]
      }
      Si es seguro, "issues": [].

      CÓDIGO:
      ${content.substring(0, 5000)}
    `;

    const aiResponse = await this.aiClient.sendPrompt(prompt);

    return aiResponse.issues.map(issue => ({
      file: this.relativePath(filePath),
      line: 1,
      message: `[${issue.category}] ${issue.message}. Sugerencia: ${issue.suggestion}`,
      severity: issue.severity,
      rule: 'auth-security-best-practices'
    }));
  }

  async scan(onResult?: (result: ScanResult) => void): Promise<ScanResult[]> {
    if (!this.aiClient.hasKey()) {
      const warning: ScanResult = {
        file: 'N/A',
        line: 0,
        message: 'Cliente de IA no disponible. El análisis de autenticación fue omitido.',
        severity: 'LOW',
        rule: 'ai-client-unavailable',
        suggestion: 'Configure AI_PROVIDER y las credenciales correspondientes para habilitar este escáner.'
      };
      if (onResult) onResult(warning);
      return [warning];
    }
    return super.scan(onResult);
  }
}
