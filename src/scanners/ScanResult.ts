export interface ScanResult {
    file: string;
    line: number;
    message: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    rule: string;
}