import {TechStack} from "./Detector";

/**
 * Resultado de la detección de un stack tecnológico en el proyecto analizado.
 * Producido por {@link Detector.detect} y consumido por scanners y el Orchestrator.
 */
export interface DetectedStack {
    /** Stack tecnológico identificado (ej: `'node'`, `'python'`, `'java'`). */
    stack: TechStack;
    /** Ruta absoluta del directorio donde se detectó el stack. */
    path: string;
}