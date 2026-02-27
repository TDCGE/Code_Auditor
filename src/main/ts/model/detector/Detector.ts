import path from 'path';
import {globSync} from 'glob';
import {DetectedStack} from "./DetectedStack";

/** Stacks tecnológicos reconocidos por el detector. */
export type TechStack = 'node' | 'python' | 'java' | 'unknown';

/**
 * Detector de stacks tecnológicos del proyecto analizado.
 * Identifica proyectos Node.js, Python y Java buscando archivos de configuración
 * característicos (`package.json`, `requirements.txt`, `pom.xml`, etc.) de forma recursiva.
 */
export class Detector {
  private readonly targetPath: string;
  private readonly excludePatterns: string[];

  /**
   * @param targetPath — Ruta raíz del proyecto a analizar.
   * @param excludePatterns — Patrones glob para excluir directorios de la búsqueda.
   */
  constructor(targetPath: string, excludePatterns: string[] = []) {
    this.targetPath = targetPath;
    this.excludePatterns = excludePatterns;
  }

  /** Retorna la ruta raíz del proyecto analizado. */
  public getTargetPath(): string {
    return this.targetPath;
  }

  /**
   * Detecta todos los stacks tecnológicos presentes en el proyecto.
   * Busca recursivamente archivos de configuración y retorna un array de {@link DetectedStack}.
   * Si no detecta ningún stack específico, retorna `[{stack: 'unknown', path: targetPath}]`.
   */
  public async detect(): Promise<DetectedStack[]> {
    const detected: DetectedStack[] = [];

    // Opciones comunes para glob
    const globOptions = {
      cwd: this.targetPath,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/venv/**', '**/__pycache__/**', ...this.excludePatterns],
      absolute: true,
      nodir: true
    };

    // 1. Detección de Node.js (Recursiva)
    const packageJsonFiles = globSync('**/package.json', globOptions);
    packageJsonFiles.forEach(file => {
      detected.push({ stack: 'node', path: path.dirname(file) });
    });

    // 2. Detección de Python (Recursiva)
    const pythonFiles = globSync('**/{requirements.txt,Pipfile,pyproject.toml}', globOptions);
    pythonFiles.forEach(file => {
      // Evitar duplicados si hay varios archivos en la misma carpeta
      const dir = path.dirname(file);
      if (!detected.some(d => d.stack === 'python' && d.path === dir)) {
        detected.push({ stack: 'python', path: dir });
      }
    });

    // 3. Detección de Java (Recursiva)
    const javaFiles = globSync('**/{pom.xml,build.gradle}', globOptions);
    javaFiles.forEach(file => {
        const dir = path.dirname(file);
        if (!detected.some(d => d.stack === 'java' && d.path === dir)) {
            detected.push({ stack: 'java', path: dir });
        }
    });

    // Si no se encuentra nada específico, marcamos la raíz como desconocida pero escaneable
    if (detected.length === 0) {
      detected.push({ stack: 'unknown', path: this.targetPath });
    }

    return detected;
  }
}
