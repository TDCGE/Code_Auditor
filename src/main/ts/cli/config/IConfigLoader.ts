/**
 * Contrato para cargadores de configuración del sistema.
 * Aplica el **Principio de Segregación de Interfaces (ISP)**: expone
 * únicamente el método `load()` sin acoplar al consumidor a una implementación concreta.
 *
 * @see DotenvConfigLoader — Implementación concreta basada en dotenv.
 */
export interface IConfigLoader {
    /** Carga la configuración en el entorno de ejecución. */
    load(): void
}