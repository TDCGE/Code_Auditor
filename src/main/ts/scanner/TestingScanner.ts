import { BaseScanner } from './BaseScanner';
import { ScanResult, createScanResult } from '../types';
import { IAIClient } from '../model/ai/IAIClient';
import { chunkContent, wrapCodeForPrompt, validateAIResponse } from '../model/ai/AIUtils';
import { globSync } from 'glob';
import path from 'path';

export class TestingScanner extends BaseScanner {
  private aiClient: IAIClient;

  constructor(targetPath: string, aiClient: IAIClient, excludePatterns: string[] = []) {
    super(targetPath, excludePatterns);
    this.aiClient = aiClient;
  }

  getName(): string {
    return 'Auditor de Testing y Cobertura';
  }

  protected findFiles(): string[] {
    return globSync('**/*.{test,spec}.{ts,js,py,java}', {
      cwd: this.targetPath,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      nodir: true,
      absolute: true,
    });
  }

  protected async analyzeFile(filePath: string, content: string): Promise<ScanResult[]> {
    const chunks = chunkContent(content);
    const results: ScanResult[] = [];

    for (const chunk of chunks) {
      try {
        const wrappedCode = wrapCodeForPrompt(chunk.text, path.basename(filePath));

        const prompt = `
      Actúa como un Experto en Testing y Calidad de Software.
      Analiza los tests del archivo "${path.basename(filePath)}" buscando problemas de calidad.

      Evalúa:
      1. Calidad de assertions: ¿Usan asserts genéricos (toBeTruthy) en vez de específicos (toEqual, toHaveBeenCalledWith)?
      2. Escenarios edge-case faltantes: ¿Se prueban valores nulos, vacíos, límites, errores?
      3. Tests que solo prueban el "happy path" sin considerar flujos de error.
      4. Tests frágiles: acoplados a implementación interna en vez de comportamiento.

      Responde SOLO con un JSON válido. "message" y "suggestion" EN ESPAÑOL:
      {
        "issues": [
          {
            "severity": "HIGH" | "MEDIUM" | "LOW",
            "category": "Testing",
            "message": "Descripción del problema de calidad del test",
            "suggestion": "Cómo mejorar el test"
          }
        ]
      }
      Si los tests son de buena calidad, "issues": [].

      ${wrappedCode}
    `;

        const rawResponse = await this.aiClient.sendPrompt(prompt);
        const aiResponse = validateAIResponse(rawResponse);

        for (const issue of aiResponse.issues) {
          results.push(createScanResult({
            file: this.relativePath(filePath),
            message: `[${issue.category}] ${issue.message}. Sugerencia: ${issue.suggestion}`,
            severity: issue.severity,
            rule: 'test-quality-issue',
            suggestion: issue.suggestion,
          }));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[TestingScanner] Error analizando chunk de ${path.basename(filePath)}: ${msg}`);
      }
    }

    return results;
  }

  async scan(onResult?: (result: ScanResult) => void): Promise<ScanResult[]> {
    const allResults: ScanResult[] = [];

    // Parte determinista: ratio de cobertura y detección de frameworks
    const coverageResults = this.analyzeCoverageRatio();
    const frameworkResults = this.detectTestFramework();

    for (const result of [...coverageResults, ...frameworkResults]) {
      allResults.push(result);
      if (onResult) onResult(result);
    }

    // Parte IA: análisis de calidad de tests existentes
    if (this.aiClient.hasKey()) {
      const aiResults = await super.scan(onResult);
      allResults.push(...aiResults);
    } else if (this.findFiles().length > 0) {
      const warning = createScanResult({
        file: 'N/A',
        message: 'Cliente de IA no disponible. El análisis de calidad de tests fue omitido.',
        severity: 'LOW',
        rule: 'ai-client-unavailable',
        suggestion: 'Configure AI_PROVIDER y las credenciales correspondientes para habilitar el análisis de calidad de tests.',
      });
      allResults.push(warning);
      if (onResult) onResult(warning);
    }

    return allResults;
  }

  private analyzeCoverageRatio(): ScanResult[] {
    const results: ScanResult[] = [];

    const codeFiles = globSync('**/*.{ts,js,py,java}', {
      cwd: this.targetPath,
      ignore: [
        '**/node_modules/**', '**/dist/**', '**/.git/**',
        '**/*.test.*', '**/*.spec.*', '**/test_*', '**/Test*',
        '**/__tests__/**', '**/__mocks__/**',
      ],
      nodir: true,
    });

    const testFiles = globSync('**/{*.test.*,*.spec.*,test_*.py,Test*.java}', {
      cwd: this.targetPath,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      nodir: true,
    });

    const codeCount = codeFiles.length;
    const testCount = testFiles.length;

    if (codeCount === 0) return results;

    const ratio = testCount / codeCount;

    if (ratio < 0.1) {
      results.push(createScanResult({
        file: 'PROYECTO',
        message: `Cobertura de tests insuficiente: ${testCount} archivos de test para ${codeCount} archivos de código (ratio: ${ratio.toFixed(2)}). Se recomienda un mínimo de 1 test por cada 10 archivos de código.`,
        severity: 'HIGH',
        rule: 'insufficient-test-coverage',
        suggestion: 'Agregue tests unitarios para los módulos críticos del proyecto. Priorice la lógica de negocio y las funciones con efectos secundarios.',
      }));
    } else if (ratio < 0.3) {
      results.push(createScanResult({
        file: 'PROYECTO',
        message: `Cobertura de tests mejorable: ${testCount} archivos de test para ${codeCount} archivos de código (ratio: ${ratio.toFixed(2)}). Se recomienda aumentar la cobertura.`,
        severity: 'MEDIUM',
        rule: 'insufficient-test-coverage',
        suggestion: 'Incremente los tests unitarios, especialmente para módulos de autenticación, validación y lógica de negocio.',
      }));
    }

    return results;
  }

  private detectTestFramework(): ScanResult[] {
    const results: ScanResult[] = [];

    // Check Node.js test frameworks
    const packageJsonFiles = globSync('**/package.json', {
      cwd: this.targetPath,
      ignore: ['**/node_modules/**'],
      nodir: true,
      absolute: true,
    });

    let hasNodeTestFramework = false;
    for (const pkgFile of packageJsonFiles) {
      try {
        const content = require('fs').readFileSync(pkgFile, 'utf-8');
        const pkg = JSON.parse(content);
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
        };
        if (allDeps.jest || allDeps.mocha || allDeps.vitest || allDeps.ava || allDeps.jasmine) {
          hasNodeTestFramework = true;
          break;
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Check Python test frameworks
    const requirementsFiles = globSync('**/{requirements*.txt,Pipfile,pyproject.toml}', {
      cwd: this.targetPath,
      ignore: ['**/node_modules/**'],
      nodir: true,
      absolute: true,
    });

    let hasPythonTestFramework = false;
    for (const reqFile of requirementsFiles) {
      try {
        const content = require('fs').readFileSync(reqFile, 'utf-8');
        if (/pytest|unittest|nose/.test(content)) {
          hasPythonTestFramework = true;
          break;
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Check Java test frameworks
    const javaConfigFiles = globSync('**/{pom.xml,build.gradle}', {
      cwd: this.targetPath,
      ignore: ['**/node_modules/**'],
      nodir: true,
      absolute: true,
    });

    let hasJavaTestFramework = false;
    for (const configFile of javaConfigFiles) {
      try {
        const content = require('fs').readFileSync(configFile, 'utf-8');
        if (/junit|testng|mockito/.test(content)) {
          hasJavaTestFramework = true;
          break;
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Only report if there are code files of that type but no framework
    const hasNodeCode = packageJsonFiles.length > 0;
    const hasPythonCode = requirementsFiles.length > 0;
    const hasJavaCode = javaConfigFiles.length > 0;

    if (hasNodeCode && !hasNodeTestFramework) {
      results.push(createScanResult({
        file: 'PROYECTO',
        message: 'No se detectó un framework de testing Node.js (jest, mocha, vitest) en las dependencias del proyecto.',
        severity: 'MEDIUM',
        rule: 'missing-test-framework',
        suggestion: 'Instale un framework de testing como Jest ("npm install --save-dev jest") y configure scripts de test en package.json.',
      }));
    }

    if (hasPythonCode && !hasPythonTestFramework) {
      results.push(createScanResult({
        file: 'PROYECTO',
        message: 'No se detectó un framework de testing Python (pytest, unittest) en las dependencias del proyecto.',
        severity: 'MEDIUM',
        rule: 'missing-test-framework',
        suggestion: 'Instale pytest ("pip install pytest") y cree archivos test_*.py para sus módulos.',
      }));
    }

    if (hasJavaCode && !hasJavaTestFramework) {
      results.push(createScanResult({
        file: 'PROYECTO',
        message: 'No se detectó un framework de testing Java (JUnit, TestNG) en la configuración del proyecto.',
        severity: 'MEDIUM',
        rule: 'missing-test-framework',
        suggestion: 'Agregue JUnit 5 como dependencia de test en su pom.xml o build.gradle.',
      }));
    }

    return results;
  }
}
