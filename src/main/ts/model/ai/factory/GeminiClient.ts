import { IAIClient } from '../IAIClient';
import { GeminiAIClient } from '../GeminiAIClient';
import { AIClientFactory, AIClientContext } from './AIClientFactory';
import dotenv from 'dotenv';

dotenv.config();

export class GeminiClient extends AIClientFactory {
  public createAIClient(context?: AIClientContext): IAIClient {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey !== 'tu_api_key_aqui' && geminiKey.length > 10) {
      return new GeminiAIClient(context?.guidelines);
    }
    throw new Error('Gemini option configured, but no gemini key provided.');
  }
}
