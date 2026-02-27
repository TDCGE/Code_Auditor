import fs from 'fs';
import path from 'path';

/**
 * Resultado de la carga de guidelines del proyecto auditado.
 * Si el archivo no existe, `found` es `false` y `raw` es vacío.
 */
export interface Guidelines {
  /** Contenido completo del archivo `guidelines.md`. */
  raw: string;
  /** Indica si se encontró el archivo de guidelines en la raíz del proyecto. */
  found: boolean;
  /** Ruta absoluta del archivo de guidelines (vacía si no se encontró). */
  filePath: string;
}

/**
 * Cargador de guidelines del proyecto auditado.
 * Busca un archivo `guidelines.md` en la raíz del proyecto objetivo y
 * retorna su contenido para inyectarlo como contexto en los prompts de IA.
 */
export class GuidelinesLoader {
  /**
   * Carga `guidelines.md` desde la raíz del proyecto.
   * @param targetPath — Ruta raíz del proyecto auditado.
   * @returns Objeto {@link Guidelines} con el contenido y metadata.
   */
  static load(targetPath: string): Guidelines {
    const filePath = path.join(targetPath, 'guidelines.md');

    if (!fs.existsSync(filePath)) {
      return { raw: '', found: false, filePath: '' };
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    return { raw, found: true, filePath };
  }
}
