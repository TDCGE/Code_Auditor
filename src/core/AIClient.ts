import https from 'https';
import dotenv from 'dotenv';
import { IAIClient, AIReviewResult } from './IAIClient';

dotenv.config();

// Re-export for backwards compatibility
export { AIReviewResult } from './IAIClient';

export class AIClient implements IAIClient {
  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  public hasKey(): boolean {
    return !!this.apiKey && this.apiKey !== 'PEGAR_TU_KEY_AQUI' && this.apiKey.length > 10;
  }

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

  public async sendPrompt(prompt: string): Promise<AIReviewResult> {
    if (!this.apiKey) throw new Error('API Key no configurada');
    return this.callGeminiAPI(prompt);
  }

  private async callGeminiAPI(prompt: string): Promise<AIReviewResult> {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
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
