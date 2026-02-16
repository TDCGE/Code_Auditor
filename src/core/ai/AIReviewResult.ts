export interface AIReviewResult {
    issues: {
        severity: 'HIGH' | 'MEDIUM' | 'LOW';
        category: 'Architecture' | 'Security' | 'Best Practices' | string;
        message: string;
        suggestion: string;
    }[];
}