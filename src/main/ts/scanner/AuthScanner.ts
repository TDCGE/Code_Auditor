import { BaseScanner } from './BaseScanner';
import { ScanResult, createScanResult } from '../types';
import { IAIClient } from '../model/ai/IAIClient';
import { chunkContent, wrapCodeForPrompt, validateAIResponse } from '../model/ai/AIUtils';
import { globSync } from 'glob';
import path from 'path';

/**
 * Scanner AI-powered de autenticación y autorización.
 * Extiende {@link BaseScanner} y utiliza un {@link IAIClient} para analizar archivos
 * relacionados con auth, login, session, middleware, JWT y control de acceso.
 * Busca fallos OWASP en JWT, hashing de contraseñas, rutas sin protección y cookies inseguras.
 */
export class AuthScanner extends BaseScanner {
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
    return 'Auditor de Autenticación y Autorización';
  }

  /** Busca archivos relacionados con autenticación, autorización y seguridad. */
  protected findFiles(): string[] {
    return globSync('**/{auth,login,session,middleware,security,config,user,permission,role,token,oauth,passport,guard,policy,route,api,controller,jwt,access}*.{ts,js,py,java}', {
      cwd: this.targetPath,
      ignore: ['**/node_modules/**', '**/dist/**'],
      nodir: true,
      absolute: true
    });
  }

  /** Envía cada chunk del archivo al cliente de IA para detectar fallos de autenticación/autorización. */
  protected async analyzeFile(filePath: string, content: string): Promise<ScanResult[]> {
    const chunks = chunkContent(content);
    const results: ScanResult[] = [];

    for (const chunk of chunks) {
      try {
        const wrappedCode = wrapCodeForPrompt(chunk.text, path.basename(filePath));

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

      ${wrappedCode}
    `;

        const rawResponse = await this.aiClient.sendPrompt(prompt);
        const aiResponse = validateAIResponse(rawResponse);

        for (const issue of aiResponse.issues) {
          results.push(createScanResult({
            file: this.relativePath(filePath),
            message: `[${issue.category}] ${issue.message}. Sugerencia: ${issue.suggestion}`,
            severity: issue.severity,
            rule: 'auth-security-best-practices',
            suggestion: issue.suggestion,
          }));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[AuthScanner] Error analizando chunk de ${path.basename(filePath)}: ${msg}`);
      }
    }

    return results;
  }

  /**
   * Override de scan: verifica disponibilidad del cliente de IA antes de ejecutar.
   * Si el cliente no está disponible, emite un warning y omite el análisis (degradación graceful).
   */
  async scan(onResult?: (result: ScanResult) => void): Promise<ScanResult[]> {
    if (!this.aiClient.hasKey()) {
      const warning = createScanResult({
        file: 'N/A',
        message: 'Cliente de IA no disponible. El análisis de autenticación fue omitido.',
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
