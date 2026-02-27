import https from 'https';
import dotenv from 'dotenv';
import { IAIClient } from './IAIClient';
import {AIReviewResult} from "./AIReviewResult";

dotenv.config();

/**
 * Cliente de IA basado en la API REST de Google Gemini 2.5 Flash.
 * Implementa {@link IAIClient} usando `GEMINI_API_KEY` de las variables de entorno.
 *
 * Degrada gracefully: si la API key no está configurada o la llamada falla,
 * retorna `{issues: []}` sin interrumpir la ejecución.
 */
export class GeminiAIClient implements IAIClient {
  private readonly apiKey: string | undefined;
  private readonly guidelines: string;

  /**
   * @param guidelines — Contenido de `guidelines.md` del proyecto auditado (opcional).
   */
  constructor(guidelines?: string) {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.guidelines = guidelines ?? '';
  }

  /** Verifica que `GEMINI_API_KEY` esté configurada y sea válida. */
  public hasKey(): boolean {
    return !!this.apiKey && this.apiKey !== 'PEGAR_TU_KEY_AQUI' && this.apiKey.length > 10;
  }

  /** {@inheritDoc IAIClient.analyzeCode} */
  public async analyzeCode(codeSnippet: string, filename: string): Promise<AIReviewResult> {
    if (!this.apiKey) throw new Error('API Key no configurada');

    // Escapamos el código para que no rompa el JSON del prompt
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

    return this.callGeminiAPI(prompt);
  }

  /** {@inheritDoc IAIClient.sendPrompt} */
  public async sendPrompt(prompt: string, _options?: { useSkills?: boolean }): Promise<AIReviewResult> {
    if (!this.apiKey) throw new Error('API Key no configurada');
    return this.callGeminiAPI(prompt);
  }

  /** Construye el bloque de contexto de guidelines para anteponer al prompt. */
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
--- FIN GUIDELINES ---

`;
  }

  /**
   * Realiza una llamada HTTP POST a la API de Gemini y parsea la respuesta JSON.
   * @param prompt — Prompt completo (con guidelines prepend si aplica).
   */
  private async callGeminiAPI(prompt: string): Promise<AIReviewResult> {
    const fullPrompt = this.buildGuidelinesBlock() + prompt;
    const payload = {
      contents: [{ parts: [{ text: fullPrompt }] }]
    };

    const data = JSON.stringify(payload);

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            if (response.error) {
                // Si falla la API, retornamos vacío para no romper el flujo
                console.error("Error API IA:", response.error.message);
                resolve({ issues: [] }); 
                return;
            }
            
            const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textResponse) resolve({ issues: [] });

            const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '');
            resolve(JSON.parse(cleanJson));
          } catch (e) {
            console.error("Error parseando respuesta IA", e);
            resolve({ issues: [] });
          }
        });
      });

      req.on('error', (e) => reject(e));
      req.write(data);
      req.end();
    });
  }
}
export {AIReviewResult} from "./AIReviewResult";