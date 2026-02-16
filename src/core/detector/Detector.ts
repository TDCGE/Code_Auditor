import path from 'path';
import {globSync} from 'glob';
import {DetectedStack} from "./DetectedStack";

export type TechStack = 'node' | 'python' | 'java' | 'unknown';

export class Detector {
  private readonly targetPath: string;

  constructor(targetPath: string) {
    this.targetPath = targetPath;
  }

  public async detect(): Promise<DetectedStack[]> {
    const detected: DetectedStack[] = [];

    // Opciones comunes para glob
    const globOptions = {
      cwd: this.targetPath,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/venv/**', '**/__pycache__/**'],
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
