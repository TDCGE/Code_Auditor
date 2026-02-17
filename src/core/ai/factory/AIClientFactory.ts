import { IAIClient } from '../IAIClient';

export abstract class AIClientFactory {
  abstract createAIClient(): IAIClient;
}
