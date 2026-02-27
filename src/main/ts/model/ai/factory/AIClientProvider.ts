import { IAIClient } from '../IAIClient';
import { AIClientContext } from './AIClientFactory';
import { ClaudeClient } from './ClaudeClient';
import { GeminiClient } from './GeminiClient';

/**
 * Factory Method / Provider que selecciona la fábrica concreta según el proveedor indicado.
 * Si `provider` es `'gemini'`, usa {@link GeminiClient}; en cualquier otro caso usa {@link ClaudeClient} (default).
 *
 * @param provider — Nombre del proveedor de IA (valor de `AI_PROVIDER`).
 * @param context — Contexto opcional con guidelines del proyecto auditado.
 * @returns Instancia de {@link IAIClient} lista para usar.
 */
export function createFromProvider(provider?: string, context?: AIClientContext): IAIClient {
  const factory = provider?.toLowerCase() === 'gemini'
    ? new GeminiClient()
    : new ClaudeClient();
  return factory.createAIClient(context);
}
