import { BaseScanner } from './BaseScanner';
import { ScanResult, createScanResult } from '../types';
import { IAIClient } from '../model/ai/IAIClient';
import { chunkContent, wrapCodeForPrompt, validateAIResponse } from '../model/ai/AIUtils';
import { globSync } from 'glob';
import path from 'path';

export class ArchitectureScanner extends BaseScanner {
  private aiClient: IAIClient;

  constructor(targetPath: string, aiClient: IAIClient, excludePatterns: string[] = []) {
    super(targetPath, excludePatterns);
    this.aiClient = aiClient;
  }

  getName(): string {
    return 'Revisor de Arquitectura con IA';
  }

  protected findFiles(): string[] {
    const files = globSync('**/*.{ts,js,py,java,cs}', {
      cwd: this.targetPath,
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*', '**/vulnerable_code.js'],
      nodir: true,
      absolute: true
    });
    return files.slice(0, 3);
  }

  protected async analyzeFile(filePath: string, content: string): Promise<ScanResult[]> {
    const chunks = chunkContent(content);
    const results: ScanResult[] = [];

    for (const chunk of chunks) {
      try {
        const wrappedCode = wrapCodeForPrompt(chunk.text, path.basename(filePath));

        const prompt = `
      Actúa como Arquitecto de Software Senior.
      Analiza "${path.basename(filePath)}" buscando:
      1. Violaciones SOLID.
      2. Antipatrones.
      3. Código espagueti o mala estructura.
      4. Acoplamiento excesivo: imports circulares, dependencias cruzadas entre capas (ej: modelo importando controlador).
      5. Baja cohesión: clases/módulos que mezclan responsabilidades no relacionadas.
      6. Falta de documentación en interfaces públicas: exports, clases o funciones expuestas sin JSDoc/docstring.

      Para issues de mantenibilidad (puntos 4-6), usa la categoría "Mantenibilidad".

      Responde SOLO JSON válido. "message" y "suggestion" EN ESPAÑOL:
      {
        "issues": [
          {
            "severity": "HIGH" | "MEDIUM" | "LOW",
            "category": "Arquitectura" | "Mantenibilidad",
            "message": "...",
            "suggestion": "..."
          }
        ]
      }

      ${wrappedCode}
    `;

        const rawResponse = await this.aiClient.sendPrompt(prompt, { useSkills: true });
        const aiResponse = validateAIResponse(rawResponse);

        for (const issue of aiResponse.issues) {
          const rule = issue.category === 'Mantenibilidad'
            ? this.categorizeMaintainabilityRule(issue.message)
            : 'ai-architecture-review';
          results.push(createScanResult({
            file: this.relativePath(filePath),
            message: `${issue.category}: ${issue.message}. Sugerencia: ${issue.suggestion}`,
            severity: issue.severity,
            rule,
            suggestion: issue.suggestion,
          }));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[ArchitectureScanner] Error analizando chunk de ${path.basename(filePath)}: ${msg}`);
      }
    }

    return results;
  }

  /** Override scan to: (1) guard hasKey, (2) run analyzeStructure, (3) delegate file analysis to super. */
  async scan(onResult?: (result: ScanResult) => void): Promise<ScanResult[]> {
    if (!this.aiClient.hasKey()) {
      const warning = createScanResult({
        file: 'N/A',
        message: 'Cliente de IA no disponible. El análisis de arquitectura fue omitido.',
        severity: 'LOW',
        rule: 'ai-client-unavailable',
        suggestion: 'Configure AI_PROVIDER y las credenciales correspondientes para habilitar este escáner.',
      });
      if (onResult) onResult(warning);
      return [warning];
    }

    // 1. Análisis de Estructura (Nivel Proyecto)
    const structureResults = await this.analyzeStructure(onResult);

    // 2. Análisis de Código (Nivel Archivo) via template method
    const fileResults = await super.scan(onResult);

    return [...structureResults, ...fileResults];
  }

  private categorizeMaintainabilityRule(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('documentación') || lower.includes('jsdoc') || lower.includes('docstring') || lower.includes('readme')) {
      return 'maintainability-documentation';
    }
    return 'maintainability-coupling';
  }

  private async analyzeStructure(onResult?: (result: ScanResult) => void): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    try {
      const structure = globSync('**', {
        cwd: this.targetPath,
        ignore: [
          '**/node_modules/**',
          '**/dist/**',
          '**/.git/**',
          ...this.excludePatterns.map(p => `**/${p}`)
        ],
        nodir: false,
        maxDepth: 2
      });

      const fileList = structure.join('\n');

      const prompt = `
          Actúa como un Arquitecto de Software experto en Estándares de la Industria.
          Analiza la siguiente estructura de carpetas y archivos de un proyecto:

          ${fileList}

          OBJETIVO: Determinar si el proyecto tiene una estructura clara y mantenible.

          Evalúa:
          1. ESTRUCTURA: Si detectas desorganización (muchos archivos en raíz, falta de carpetas src/app/controllers, mezcla de lenguajes sin separación), recomienda un framework específico.
          2. DOCUMENTACIÓN: Verifica presencia de README.md, carpeta docs/, y documentación de API.
          3. HERRAMIENTAS DE CALIDAD: Verifica presencia de configuración de linter (.eslintrc, pylintrc, checkstyle) y formatter (prettier, black, google-java-format).

          Para problemas de estructura usa category "Estructura de Proyecto".
          Para problemas de documentación/herramientas usa category "Mantenibilidad".

          Responde SOLO con JSON válido:
          {
              "issues": [
                  {
                      "severity": "HIGH" | "MEDIUM" | "LOW",
                      "category": "Estructura de Proyecto" | "Mantenibilidad",
                      "message": "Explicación del problema",
                      "suggestion": "Recomendación concreta"
                  }
              ]
          }
          Si todo se ve bien, devuelve "issues": [].
      `;

      const rawResponse = await this.aiClient.sendPrompt(prompt, { useSkills: true });
      const aiResponse = validateAIResponse(rawResponse);

      aiResponse.issues.forEach(issue => {
        const rule = issue.category === 'Mantenibilidad'
          ? this.categorizeMaintainabilityRule(issue.message)
          : 'project-structure-check';
        const result = createScanResult({
          file: 'RAÍZ_DEL_PROYECTO',
          message: `[${issue.category}] ${issue.message}.\n💡 RECOMENDACIÓN: ${issue.suggestion}`,
          severity: issue.severity,
          rule,
          suggestion: issue.suggestion,
        });

        results.push(result);
        if (onResult) onResult(result);
      });

    } catch (error) {
      // Ignorar errores de análisis de estructura
    }
    return results;
  }
}
