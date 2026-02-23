import chalk from 'chalk';
import fs from 'fs';
import { globSync } from 'glob';
import { Detector } from './detector/Detector';
import { BaseScanner } from '../scanner/BaseScanner';
import { ResultReporter } from './reporter/ResultReporter';
import { SuppressionManager } from './suppression/SuppressionManager';
import { ConsoleReporter } from './reporter/ConsoleReporter';
import { AuditMetrics } from '../types';

export class Orchestrator {
  private detector: Detector;
  private scanners: BaseScanner[];
  private reporter: ResultReporter;

  constructor(detector: Detector, scanners: BaseScanner[], reporter: ResultReporter) {
    this.detector = detector;
    this.scanners = scanners;
    this.reporter = reporter;
  }

  public async start(): Promise<void> {
    const targetPath = this.detector.getTargetPath();
    console.log(chalk.blue(`[*] Iniciando análisis en tiempo real en: ${targetPath}`));

    // 1. Detección
    const stacks = await this.detector.detect();

    console.log(chalk.green(`[+] Proyectos detectados:`));
    stacks.forEach(s => {
        console.log(`    - ${s.stack.toUpperCase()} en: ${s.path}`);
    });

    // 2. Calcular métricas del proyecto
    const metrics = this.calculateMetrics(targetPath, stacks.map(s => s.stack));
    if (this.reporter.setMetrics) {
      this.reporter.setMetrics(metrics);
    }
    console.log(chalk.green(`[+] Métricas: ${metrics.totalFiles} archivos, ${metrics.totalLines.toLocaleString()} líneas, ${metrics.testFiles} tests`));

    // 3. Cargar supresiones
    const suppressionManager = new SuppressionManager(targetPath);
    suppressionManager.load();
    suppressionManager.importFromReviewLog();
    suppressionManager.save();

    const considerations = suppressionManager.getConsiderations();
    if (considerations.length > 0) {
      console.log(chalk.yellow('\n[i] Consideraciones del log de supresiones:'));
      considerations.forEach(c => console.log(chalk.gray(`    - ${c}`)));
    }

    console.log(chalk.yellow('\n[?] Ejecutando reglas de seguridad... (Los hallazgos aparecerán inmediatamente)\n'));

    // 4. Ejecución con Streaming
    for (const scanner of this.scanners) {
        if (this.reporter.setCurrentScanner) {
            this.reporter.setCurrentScanner(scanner.getName());
        }

        console.log(chalk.cyan.bold(`>>> Iniciando: ${scanner.getName()}`));

        await scanner.scan((result) => {
          if (!suppressionManager.isSuppressed(result)) {
            this.reporter.printResult(result);
          }
        });

        console.log(chalk.gray(`<<< Finalizado: ${scanner.getName()}\n`));
    }

    // 5. Resumen de supresiones
    const suppressed = suppressionManager.getSuppressedCount();
    if (suppressed > 0) {
      console.log(chalk.gray(`[i] ${suppressed} hallazgo(s) suprimido(s) por suppressions.json`));
    }

    // 6. Pasar count al reporter si es ConsoleReporter
    if (this.reporter instanceof ConsoleReporter) {
      this.reporter.setSuppressedCount(suppressed);
    }

    // 7. Resumen Final
    this.reporter.printSummary();

    // 8. Exportar a Markdown
    if (this.reporter.save) {
        await this.reporter.save(targetPath);
    }
  }

  private calculateMetrics(targetPath: string, stacks: string[]): AuditMetrics {
    const codeFiles = globSync('**/*.{ts,js,py,java,cs}', {
      cwd: targetPath,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/*.test.*', '**/*.spec.*'],
      nodir: true,
      absolute: true,
    });

    const testFiles = globSync('**/{*.test.*,*.spec.*,test_*.py,Test*.java}', {
      cwd: targetPath,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      nodir: true,
    });

    let totalLines = 0;
    for (const file of codeFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        totalLines += content.split(/\r?\n/).length;
      } catch {
        // Ignore read errors
      }
    }

    return {
      totalFiles: codeFiles.length,
      totalLines,
      testFiles: testFiles.length,
      stacks: [...new Set(stacks.filter(s => s !== 'unknown'))],
    };
  }
}
