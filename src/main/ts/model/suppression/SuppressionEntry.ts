export interface SuppressionEntry {
  rule: string;
  filePattern?: string;
  messageContains?: string;
  reason: string;
  source?: string;
}

export interface SuppressionsFile {
  suppressions: SuppressionEntry[];
  considerations: string[];
}
