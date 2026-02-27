import { BaseScanner } from './BaseScanner';
import { ScanResult, createScanResult } from '../types';
import { IAIClient } from '../model/ai/IAIClient';
import { chunkContent, wrapCodeForPrompt, validateAIResponse } from '../model/ai/AIUtils';
import { globSync } from 'glob';
import path from 'path';
import fs from 'fs';

/**
 * Scanner AI-powered de calidad de código (Clean Code).
 * Extiende {@link BaseScanner} y analiza los 5 archivos más grandes del proyecto
 * buscando complejidad excesiva, duplicación, convenciones de naming inconsistentes,
 * code smells y falta de manejo de errores.
 */
export class CodeQualityScanner extends BaseScanner {
  private aiClient: IAIClient;

  /**
   * @param targetPath — Ruta raíz del proyecto a analizar.
   * @param aiClient — Cliente de IA para análisis semántico.
   * @param excludePatterns — Patrones glob de exclusión del usuario.
   */
  constructor(targetPath: string, aiClient: IAIClient, excludePatterns: string[] = []) {
    super(targetPath, excludePatterns);
    this.aiClient = aiClient;
  }

  /** {@inheritDoc BaseScanner.getName} */
  getName(): string {
    return 'Auditor de Calidad de Código con IA';
  }

  /** Selecciona los 5 archivos más grandes (por tamaño) excluyendo tests. */
  protected findFiles(): string[] {
    const files = globSync('**/*.{ts,js,py,java,cs}', {
      cwd: this.targetPath,
      ignore: [
        '**/node_modules/**', '**/dist/**', '**/.git/**',
        '**/*.test.*', '**/*.spec.*', '**/test_*', '**/Test*',
        '**/__tests__/**', '**/__mocks__/**',
      ],
      nodir: true,
      absolute: true,
    });

    // Sort by size descending and take top 5
    const withSize = files.map(f => {
      try {
        return { path: f, size: fs.statSync(f).size };
      } catch {
        return { path: f, size: 0 };
      }
    });

    withSize.sort((a, b) => b.size - a.size);
    return withSize.slice(0, 5).map(f => f.path);
  }

  /** Envía cada chunk del archivo al cliente de IA para análisis de calidad de código. */
  protected async analyzeFile(filePath: string, content: string): Promise<ScanResult[]> {
    const chunks = chunkContent(content);
    const results: ScanResult[] = [];

    for (const chunk of chunks) {
      try {
        const wrappedCode = wrapCodeForPrompt(chunk.text, path.basename(filePath));

        const prompt = `
      Actúa como un Experto en Calidad de Código y Clean Code.
      Analiza "${path.basename(filePath)}" buscando problemas de calidad:

      1. Complejidad excesiva: funciones > 50 líneas, anidamiento > 3 niveles, complejidad ciclomática alta.
      2. Duplicación de código: bloques repetidos que deberían extraerse a funciones/métodos.
      3. Convenciones de naming inconsistentes: mezcla de camelCase/snake_case, nombres poco descriptivos.
      4. Code smells: God Objects, Feature Envy, Long Parameter Lists (>4 params), Data Clumps.
      5. Falta de manejo de errores: try/catch vacíos, promesas sin catch, excepciones silenciadas.

      Responde SOLO con JSON válido. "message" y "suggestion" EN ESPAÑOL:
      {
        "issues": [
          {
            "severity": "HIGH" | "MEDIUM" | "LOW",
            "category": "Calidad de Código",
            "message": "Descripción del problema",
            "suggestion": "Cómo resolver el problema"
          }
        ]
      }
      Si el código es de buena calidad, "issues": [].

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
        console.error(`[CodeQualityScanner] Error analizando chunk de ${path.basename(filePath)}: ${msg}`);
      }
    }

    return results;
  }

  /** Clasifica un hallazgo de calidad en sub-regla según palabras clave del mensaje. */
  private categorizeRule(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('complejidad') || lower.includes('complexity') || lower.includes('anidamiento') || lower.includes('líneas')) {
      return 'code-complexity';
    }
    if (lower.includes('duplica') || lower.includes('repetid')) {
      return 'code-duplication';
    }
    if (lower.includes('naming') || lower.includes('nombre') || lower.includes('nomenclatura') || lower.includes('convención')) {
      return 'naming-convention';
    }
    return 'code-smell';
  }

  /** Override: verifica disponibilidad de IA antes de ejecutar (degradación graceful). */
  async scan(onResult?: (result: ScanResult) => void): Promise<ScanResult[]> {
    if (!this.aiClient.hasKey()) {
      const warning = createScanResult({
        file: 'N/A',
        message: 'Cliente de IA no disponible. El análisis de calidad de código fue omitido.',
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
