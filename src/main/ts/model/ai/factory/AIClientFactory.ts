import { IAIClient } from '../IAIClient';

export interface AIClientContext {
  guidelines?: string;
}

export abstract class AIClientFactory {
  abstract createAIClient(context?: AIClientContext): IAIClient;
}
