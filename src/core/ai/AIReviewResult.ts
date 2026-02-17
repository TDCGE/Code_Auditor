import { Severity } from '../../types';

export interface AIReviewResult {
    issues: {
        severity: Severity;
        category: 'Architecture' | 'Security' | 'Best Practices' | string;
        message: string;
        suggestion: string;
    }[];
}
