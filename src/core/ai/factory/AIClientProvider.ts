import { IAIClient } from '../IAIClient';
import { ClaudeClient } from './ClaudeClient';
import { GeminiClient } from './GeminiClient';

export function createFromProvider(provider?: string): IAIClient {
  const factory = provider?.toLowerCase() === 'gemini'
    ? new GeminiClient()
    : new ClaudeClient();
  return factory.createAIClient();
}