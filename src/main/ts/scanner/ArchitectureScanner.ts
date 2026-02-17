import { BaseScanner } from './BaseScanner';
import { ScanResult, createScanResult } from '../types';
import { IAIClient } from '../core/ai/IAIClient';
import { chunkContent, wrapCodeForPrompt, validateAIResponse } from '../core/ai/AIUtils';
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

      Responde SOLO JSON válido. "message" y "suggestion" EN ESPAÑOL:
      {
        "issues": [
          {
            "severity": "HIGH" | "MEDIUM" | "LOW",
            "category": "Arquitectura",
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
          results.push(createScanResult({
            file: this.relativePath(filePath),
            message: `${issue.category}: ${issue.message}. Sugerencia: ${issue.suggestion}`,
            severity: issue.severity,
            rule: 'ai-architecture-review',
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

          SI DETECTAS DESORGANIZACIÓN (muchos archivos en raíz, falta de carpetas src/app/controllers, mezcla de lenguajes sin separación):
          1. Reporta el problema de "Falta de Estructura Estándar".
          2. RECOMIENDA UN FRAMEWORK ESPECÍFICO basado en los archivos que ves (ej: si ves .js recomienda NestJS o Express con Clean Arch; si ves .py recomienda Django o FastAPI con estructura modular).
          3. Explica por qué ese framework beneficiaría a la empresa (CGE).

          Responde SOLO con JSON válido:
          {
              "issues": [
                  {
                      "severity": "HIGH",
                      "category": "Estructura de Proyecto",
                      "message": "Explicación del problema de organización",
                      "suggestion": "Recomendación del Framework y estructura a adoptar"
                  }
              ]
          }
          Si la estructura se ve bien (tiene carpetas claras como src, internal, pkg, api, etc), devuelve "issues": [].
      `;

      const rawResponse = await this.aiClient.sendPrompt(prompt, { useSkills: true });
      const aiResponse = validateAIResponse(rawResponse);

      aiResponse.issues.forEach(issue => {
        const result = createScanResult({
          file: 'RAÍZ_DEL_PROYECTO',
          message: `[${issue.category}] ${issue.message}.\n💡 RECOMENDACIÓN: ${issue.suggestion}`,
          severity: issue.severity,
          rule: 'project-structure-check',
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
