import { IAIClient } from '../IAIClient';
import { GeminiAIClient } from '../GeminiAIClient';
import { AIClientFactory, AIClientContext } from './AIClientFactory';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Fábrica concreta que produce instancias de {@link GeminiAIClient} (patrón **Abstract Factory**).
 * Valida que `GEMINI_API_KEY` esté configurada antes de crear el cliente.
 * Lanza error si la key no es válida.
 */
export class GeminiClient extends AIClientFactory {
  /**
   * Crea un {@link GeminiAIClient} con las guidelines del contexto.
   * @throws Error si `GEMINI_API_KEY` no está configurada o es inválida.
   */
  public createAIClient(context?: AIClientContext): IAIClient {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey !== 'tu_api_key_aqui' && geminiKey.length > 10) {
      return new GeminiAIClient(context?.guidelines);
    }
    throw new Error('Gemini option configured, but no gemini key provided.');
  }
}
