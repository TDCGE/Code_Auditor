import {AIReviewResult} from "./AIReviewResult";

export interface IAIClient {
  hasKey(): boolean;
  analyzeCode(codeSnippet: string, filename: string): Promise<AIReviewResult>;
  sendPrompt(prompt: string, options?: { useSkills?: boolean }): Promise<AIReviewResult>;
}
