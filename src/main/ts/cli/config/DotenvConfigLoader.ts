import { IConfigLoader } from "./IConfigLoader";
import dotenv from "dotenv";

/**
 * Cargador de configuración basado en archivos `.env` (patrón **Strategy**).
 * Implementa {@link IConfigLoader} delegando a la librería `dotenv` para
 * inyectar variables de entorno (ej: `GEMINI_API_KEY`, `AI_PROVIDER`) en `process.env`.
 */
export class DotenvConfigLoader implements IConfigLoader {
    /** Carga las variables definidas en el archivo `.env` del directorio de trabajo. */
    load(): void {
        dotenv.config();
    }
}