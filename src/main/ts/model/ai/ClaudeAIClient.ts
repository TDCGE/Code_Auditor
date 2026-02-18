import path from 'path';
import { IAIClient } from './IAIClient';
import {AIReviewResult} from "./AIReviewResult";

// Dynamic import que ts-node no transforma a require()
const importESM = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>;

const AI_REVIEW_SCHEMA = {
  type: 'object' as const,
  properties: {
    issues: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          severity: { type: 'string' as const, enum: ['HIGH', 'MEDIUM', 'LOW'] },
          category: { type: 'string' as const },
          message: { type: 'string' as const },
          suggestion: { type: 'string' as const },
        },
        required: ['severity', 'category', 'message', 'suggestion'],
      },
    },
  },
  required: ['issues'],
};

export class ClaudeAIClient implements IAIClient {
  private available: boolean | null = null;
  private readonly guidelines: string;

  constructor(guidelines?: string) {
    this.guidelines = guidelines ?? '';
  }

  public hasKey(): boolean {
    if (this.available !== null) return this.available;

    try {
      const { execSync } = require('child_process');
      // Limpiar CLAUDECODE para permitir detección desde dentro de Claude Code
      const env = { ...process.env };
      delete env.CLAUDECODE;
      execSync('claude --version', { stdio: 'ignore', env });
      this.available = true;
    } catch {
      this.available = false;
    }

    return this.available;
  }

  public async analyzeCode(codeSnippet: string, filename: string): Promise<AIReviewResult> {
    const sanitizedCode = codeSnippet.replace(/"/g, '\\"').replace(/\n/g, '\\n');

    const prompt = `
      Actúa como un Arquitecto de Software Senior y Experto en Seguridad (OWASP).
      Analiza el siguiente código del archivo "${filename}".
      Busca estrictamente:
      1. Violaciones de principios SOLID.
      2. Antipatrones de diseño.
      3. Vulnerabilidades de seguridad lógica (no detectables por regex).
      4. Mal uso de frameworks.

      Responde SOLO con un JSON válido con esta estructura:
      {
        "issues": [
          {
            "severity": "HIGH",
            "category": "Architecture",
            "message": "...",
            "suggestion": "..."
          }
        ]
      }

      Si el código está bien, devuelve "issues": [].

      CÓDIGO A ANALIZAR:
      ${sanitizedCode.substring(0, 5000)}
    `;

    return this.callClaude(prompt, false);
  }

  public async sendPrompt(prompt: string, options?: { useSkills?: boolean }): Promise<AIReviewResult> {
    return this.callClaude(prompt, options?.useSkills ?? false);
  }

  private buildGuidelinesBlock(): string {
    if (!this.guidelines) return '';
    return `

CONTEXTO IMPORTANTE - GUIDELINES DEL PROYECTO:
El siguiente documento contiene las decisiones de arquitectura, patrones de diseño,
principios y seguridad que fueron establecidas durante el desarrollo inicial.
Tu auditoría DEBE ser coherente con estas guidelines. NO contradigas lo que fue
recomendado previamente. Si encuentras una desviación de las guidelines, repórtala
como tal (no como un error genérico).

--- INICIO GUIDELINES ---
${this.guidelines}
--- FIN GUIDELINES ---`;
  }

  private async callClaude(prompt: string, useSkills: boolean = false): Promise<AIReviewResult> {
    try {
      // Permitir ejecución desde dentro de una sesión de Claude Code
      delete process.env.CLAUDECODE;

      const { query } = await importESM('@anthropic-ai/claude-agent-sdk');
      const verificatorRoot = path.resolve(__dirname, '..', '..');
      const guidelinesBlock = this.buildGuidelinesBlock();

      const baseOptions = {
        systemPrompt: `Eres un experto en Seguridad OWASP y Arquitectura de Software.
Responde ÚNICAMENTE con JSON válido, sin texto adicional. Mensajes y sugerencias EN ESPAÑOL.${guidelinesBlock}`,
        maxTurns: 20,
        allowedTools: [] as string[],
        outputFormat: { type: 'json_schema' as const, schema: AI_REVIEW_SCHEMA },
      };

      const skillOptions = {
        cwd: verificatorRoot,
        settingSources: ['project' as const],
        systemPrompt: `Eres un Arquitecto de Software Senior y Experto en Seguridad OWASP.
Responde ÚNICAMENTE con JSON válido, sin texto adicional. Mensajes y sugerencias EN ESPAÑOL.
IMPORTANTE: Invoca la skill "design-patterns-guide" para enriquecer tu análisis
con patrones GoF y principios SOLID.${guidelinesBlock}`,
        maxTurns: 20,
        allowedTools: ['Skill', 'Read', 'Glob'],
        outputFormat: { type: 'json_schema' as const, schema: AI_REVIEW_SCHEMA },
      };

      const sdkOptions = useSkills ? skillOptions : baseOptions;

      let resultText = '';
      for await (const message of query({ prompt, options: sdkOptions })) {
        if (message.type === 'result') {
          if (message.subtype === 'success') {
            if (message.structured_output) {
              return message.structured_output as AIReviewResult;
            }
            resultText = message.result;
          } else {
            // Error del SDK (max_turns, max_structured_output_retries, etc.)
            console.error(`[Claude SDK] Error subtype: ${message.subtype}`);
            if (message.errors) {
              console.error(`[Claude SDK] Errors:`, message.errors);
            }
          }
        }
      }

      // Fallback: extraer JSON del texto libre
      if (resultText) {
        const start = resultText.indexOf('{');
        const end = resultText.lastIndexOf('}');
        if (start !== -1 && end > start) {
          return JSON.parse(resultText.substring(start, end + 1)) as AIReviewResult;
        }
        console.error('[Claude SDK] No se pudo extraer JSON del resultado:', resultText.substring(0, 200));
      }
      return { issues: [] };
    } catch (error) {
      console.error('Error en cliente Claude:', error);
      return { issues: [] };
    }
  }
}
