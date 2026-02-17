import { Severity } from './Severity';

export interface ScanResult {
    file: string;
    line: number;
    message: string;
    severity: Severity;
    rule: string;
    suggestion?: string;
}
