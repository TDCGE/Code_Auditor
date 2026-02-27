import { IAIClient } from '../IAIClient';

/**
 * Contexto opcional inyectado a las fábricas de clientes de IA.
 * Permite pasar información del proyecto auditado (como guidelines) al momento de la creación.
 */
export interface AIClientContext {
  /** Contenido de `guidelines.md` del proyecto auditado. */
  guidelines?: string;
}

/**
 * Fábrica abstracta de clientes de IA (patrón **Abstract Factory**).
 * Define el contrato para crear instancias de {@link IAIClient} sin acoplar
 * al consumidor a una implementación concreta (Claude o Gemini).
 *
 * @see ClaudeClient — Fábrica concreta para Claude.
 * @see GeminiClient — Fábrica concreta para Gemini.
 */
export abstract class AIClientFactory {
  /** Crea una instancia de cliente de IA con el contexto proporcionado. */
  abstract createAIClient(context?: AIClientContext): IAIClient;
}
