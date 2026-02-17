/**
 * Niveles de severidad para hallazgos de seguridad y arquitectura.
 *
 * - **HIGH**: Vulnerabilidad explotable que requiere corrección inmediata.
 * - **MEDIUM**: Mala práctica con riesgo potencial de seguridad o mantenibilidad.
 * - **LOW**: Sugerencia de mejora sin riesgo inmediato.
 */
export const SEVERITIES = ['HIGH', 'MEDIUM', 'LOW'] as const;

export type Severity = (typeof SEVERITIES)[number];

/** Colores válidos para badges de severidad en la consola. */
export type SeverityBadgeColor = 'red' | 'yellow' | 'blue';

/** Metadata de un nivel de severidad. */
export interface SeverityMeta {
  label: string;
  weight: number;
  badgeColor: SeverityBadgeColor;
}

/** Metadata centralizada de cada nivel de severidad (Encapsular lo que Varía). */
export const SEVERITY_CONFIG: Readonly<Record<Severity, SeverityMeta>> = Object.freeze({
  HIGH:   { label: 'CRÍTICO', weight: 3, badgeColor: 'red' } as const,
  MEDIUM: { label: 'MEDIO',   weight: 2, badgeColor: 'yellow' } as const,
  LOW:    { label: 'BAJO',    weight: 1, badgeColor: 'blue' } as const,
});
