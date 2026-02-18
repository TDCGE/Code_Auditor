import { AIClientFactory, AIClientContext } from './AIClientFactory';
import { IAIClient } from '../IAIClient';
import { ClaudeAIClient } from '../ClaudeAIClient';

export class ClaudeClient extends AIClientFactory {
  public createAIClient(context?: AIClientContext): IAIClient {
    return new ClaudeAIClient(context?.guidelines);
  }
}
