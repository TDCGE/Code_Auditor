import {ScanResult} from '../../types';

/**
 * Sección de resultados agrupados por scanner.
 * Utilizada por {@link ConsoleReporter} para organizar el reporte Markdown por categoría.
 */
export interface ScannerSection {
    /** Nombre del scanner que generó los resultados. */
    scanner: string;
    /** Resultados acumulados de este scanner. */
    results: ScanResult[];
}