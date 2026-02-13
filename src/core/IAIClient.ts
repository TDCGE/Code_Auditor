export interface AIReviewResult {
  issues: {
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    category: 'Architecture' | 'Security' | 'Best Practices' | string;
    message: string;
    suggestion: string;
  }[];
}

export interface IAIClient {
  hasKey(): boolean;
  analyzeCode(codeSnippet: string, filename: string): Promise<AIReviewResult>;
  sendPrompt(prompt: string): Promise<AIReviewResult>;
}
