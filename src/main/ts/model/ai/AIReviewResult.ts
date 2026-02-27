import { Severity } from '../../types';

/**
 * Resultado estructurado devuelto por los clientes de IA tras analizar código.
 * Los scanners AI-powered consumen esta interfaz para convertir hallazgos en {@link ScanResult}.
 */
export interface AIReviewResult {
    /** Lista de hallazgos detectados por el modelo de IA. Array vacío si no hay problemas. */
    issues: {
        /** Nivel de severidad del hallazgo. */
        severity: Severity;
        /** Categoría temática del hallazgo (ej: 'Architecture', 'Security'). */
        category: 'Architecture' | 'Security' | 'Best Practices' | string;
        /** Descripción del problema detectado (en español). */
        message: string;
        /** Recomendación concreta para resolver el problema (en español). */
        suggestion: string;
    }[];
}
