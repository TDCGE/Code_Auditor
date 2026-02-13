import dotenv from 'dotenv';
import { IAIClient } from './IAIClient';
import { GeminiAIClient } from './AIClient';
import { ClaudeAIClient } from './ClaudeAIClient';

dotenv.config();

export type AIProvider = 'claude' | 'gemini' | 'auto';

export function createAIClient(provider: AIProvider = 'auto'): IAIClient {
  const resolved = resolveProvider(provider);

  if (resolved === 'gemini') {
    return new GeminiAIClient();
  }
  return new ClaudeAIClient();
}

function resolveProvider(provider: AIProvider): 'claude' | 'gemini' {
  if (provider !== 'auto') return provider;

  const envProvider = process.env.AI_PROVIDER?.toLowerCase();
  if (envProvider === 'claude' || envProvider === 'gemini') return envProvider;

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey !== 'tu_api_key_aqui' && geminiKey.length > 10) {
    return 'gemini';
  }

  return 'claude';
}
