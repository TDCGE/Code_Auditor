import {AIReviewResult} from "./AIReviewResult";

/**
 * Contrato de los clientes de IA del sistema (patrón **Inversión de Dependencias — DIP**).
 * Los scanners dependen de esta abstracción, no de implementaciones concretas
 * como {@link ClaudeAIClient} o {@link GeminiAIClient}.
 */
export interface IAIClient {
  /** Indica si el cliente tiene las credenciales necesarias para operar. */
  hasKey(): boolean;
  /**
   * Analiza un fragmento de código y retorna hallazgos estructurados.
   * @param codeSnippet — Código fuente a analizar.
   * @param filename — Nombre del archivo (para contexto en el prompt).
   */
  analyzeCode(codeSnippet: string, filename: string): Promise<AIReviewResult>;
  /**
   * Envía un prompt libre al modelo de IA y retorna hallazgos estructurados.
   * @param prompt — Prompt completo a enviar al modelo.
   * @param options — Opciones adicionales (ej: `useSkills` para habilitar skills de Claude).
   */
  sendPrompt(prompt: string, options?: { useSkills?: boolean }): Promise<AIReviewResult>;
}
