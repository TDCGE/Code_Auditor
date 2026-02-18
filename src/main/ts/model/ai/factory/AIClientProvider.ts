import { IAIClient } from '../IAIClient';
import { AIClientContext } from './AIClientFactory';
import { ClaudeClient } from './ClaudeClient';
import { GeminiClient } from './GeminiClient';

export function createFromProvider(provider?: string, context?: AIClientContext): IAIClient {
  const factory = provider?.toLowerCase() === 'gemini'
    ? new GeminiClient()
    : new ClaudeClient();
  return factory.createAIClient(context);
}
