import { BaseScanner } from './BaseScanner';
import { ScanResult, createScanResult } from '../types';
import { IAIClient } from '../model/ai/IAIClient';
import { chunkContent, wrapCodeForPrompt, validateAIResponse } from '../model/ai/AIUtils';
import { globSync } from 'glob';
import path from 'path';

export class PerformanceScanner extends BaseScanner {
  private aiClient: IAIClient;

  constructor(targetPath: string, aiClient: IAIClient, excludePatterns: string[] = []) {
    super(targetPath, excludePatterns);
    this.aiClient = aiClient;
  }

  getName(): string {
    return 'Auditor de Performance con IA';
  }

  protected findFiles(): string[] {
    return globSync(
      '**/{*database*,*db*,*query*,*repository*,*service*,*controller*,*handler*,*api*,*route*,*middleware*,*cache*,*connection*,*pool*}.{ts,js,py,java}',
      {
        cwd: this.targetPath,
        ignore: [
          '**/node_modules/**', '**/dist/**', '**/.git/**',
          '**/*.test.*', '**/*.spec.*',
        ],
        nodir: true,
        absolute: true,
      }
    );
  }

  protected async analyzeFile(filePath: string, content: string): Promise<ScanResult[]> {
    const chunks = chunkContent(content);
    const results: ScanResult[] = [];

    for (const chunk of chunks) {
      try {
        const wrappedCode = wrapCodeForPrompt(chunk.text, path.basename(filePath));

        const prompt = `
      Actúa como un Experto en Performance y Optimización de Software.
      Analiza "${path.basename(filePath)}" buscando problemas de rendimiento:

      1. Queries N+1: loops que ejecutan queries de base de datos dentro (forEach/map con await de DB).
      2. Falta de paginación: consultas que retornan todos los registros sin limit/offset.
      3. Resource leaks: conexiones de DB, streams, file handles que no se cierran (falta finally/using/with).
      4. Operaciones síncronas bloqueantes: fs.readFileSync, execSync en código de servidor, sleep en thread principal.
      5. Falta de caching: operaciones costosas (llamadas a API, queries complejas) que se ejecutan repetidamente sin cache.
      6. Complejidad algorítmica innecesaria: O(n²) donde O(n) o O(n log n) bastaría (loops anidados sobre misma colección).

      Responde SOLO con JSON válido. "message" y "suggestion" EN ESPAÑOL:
      {
        "issues": [
          {
            "severity": "HIGH" | "MEDIUM" | "LOW",
            "category": "Performance",
            "message": "Descripción del problema de rendimiento",
            "suggestion": "Cómo optimizar"
          }
        ]
      }
      Si no hay problemas de performance, "issues": [].

      ${wrappedCode}
    `;

        const rawResponse = await this.aiClient.sendPrompt(prompt);
        const aiResponse = validateAIResponse(rawResponse);

        for (const issue of aiResponse.issues) {
          const rule = this.categorizeRule(issue.message);
          results.push(createScanResult({
            file: this.relativePath(filePath),
            message: `[${issue.category}] ${issue.message}. Sugerencia: ${issue.suggestion}`,
            severity: issue.severity,
            rule,
            suggestion: issue.suggestion,
          }));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[PerformanceScanner] Error analizando chunk de ${path.basename(filePath)}: ${msg}`);
      }
    }

    return results;
  }

  private categorizeRule(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('n+1') || lower.includes('n plus 1') || lower.includes('query dentro') || lower.includes('loop')) {
      return 'performance-n-plus-one';
    }
    if (lower.includes('leak') || lower.includes('fuga') || lower.includes('cerrar') || lower.includes('close') || lower.includes('conexión')) {
      return 'performance-resource-leak';
    }
    if (lower.includes('síncron') || lower.includes('bloqueant') || lower.includes('sync') || lower.includes('blocking')) {
      return 'performance-blocking-operation';
    }
    return 'performance-issue';
  }

  async scan(onResult?: (result: ScanResult) => void): Promise<ScanResult[]> {
    if (!this.aiClient.hasKey()) {
      const warning = createScanResult({
        file: 'N/A',
        message: 'Cliente de IA no disponible. El análisis de performance fue omitido.',
        severity: 'LOW',
        rule: 'ai-client-unavailable',
        suggestion: 'Configure AI_PROVIDER y las credenciales correspondientes para habilitar este escáner.',
      });
      if (onResult) onResult(warning);
      return [warning];
    }
    return super.scan(onResult);
  }
}
