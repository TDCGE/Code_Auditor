import { AIClientFactory, AIClientContext } from './AIClientFactory';
import { IAIClient } from '../IAIClient';
import { ClaudeAIClient } from '../ClaudeAIClient';

/**
 * Fábrica concreta que produce instancias de {@link ClaudeAIClient} (patrón **Abstract Factory**).
 * Inyecta las guidelines del contexto al constructor del cliente.
 */
export class ClaudeClient extends AIClientFactory {
  /** Crea un {@link ClaudeAIClient} con las guidelines del contexto. */
  public createAIClient(context?: AIClientContext): IAIClient {
    return new ClaudeAIClient(context?.guidelines);
  }
}
