import path from 'path';
import { IAIClient, AIReviewResult } from './IAIClient';

export class ClaudeAIClient implements IAIClient {
  private available: boolean | null = null;

  public hasKey(): boolean {
    if (this.available !== null) return this.available;

    try {
      const { execSync } = require('child_process');
      execSync('claude --version', { stdio: 'ignore' });
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

  private async callClaude(prompt: string, useSkills: boolean = false): Promise<AIReviewResult> {
    try {
      const { query } = await import('@anthropic-ai/claude-agent-sdk');
      const verificatorRoot = path.resolve(__dirname, '..', '..');

      const baseOptions = {
        systemPrompt: `Eres un experto en Seguridad OWASP y Arquitectura de Software.
Responde SIEMPRE con JSON válido. Mensajes y sugerencias EN ESPAÑOL.`,
        maxTurns: 1,
        allowedTools: [] as string[],
      };

      const skillOptions = {
        cwd: verificatorRoot,
        settingSources: ['project' as const],
        systemPrompt: `Eres un Arquitecto de Software Senior y Experto en Seguridad OWASP.
Responde SIEMPRE con JSON válido. Mensajes y sugerencias EN ESPAÑOL.
IMPORTANTE: Invoca la skill "design-patterns-guide" para enriquecer tu análisis
con patrones GoF y principios SOLID.`,
        maxTurns: 5,
        allowedTools: ['Skill', 'Read', 'Glob'],
      };

      const sdkOptions = useSkills ? skillOptions : baseOptions;

      let resultText = '';
      for await (const message of query({ prompt, options: sdkOptions })) {
        if (message.type === 'result' && message.subtype === 'success') {
          resultText = message.result;
        }
      }

      if (resultText) {
        const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson) as AIReviewResult;
      }
      return { issues: [] };
    } catch (error) {
      console.error('Error en cliente Claude:', error);
      return { issues: [] };
    }
  }
}
