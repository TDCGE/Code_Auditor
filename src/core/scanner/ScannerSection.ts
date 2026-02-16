import {ScanResult} from "../../scanners/ScanResult";

export interface ScannerSection {
    scanner: string;
    results: ScanResult[];
}