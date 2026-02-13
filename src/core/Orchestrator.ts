import chalk from 'chalk';
import { Detector } from './Detector';
import { BaseScanner } from '../scanners/BaseScanner';
import { ResultReporter } from './ResultReporter';

export class Orchestrator {
  private targetPath: string;
  private scanners: BaseScanner[];
  private reporter: ResultReporter;

  constructor(targetPath: string, scanners: BaseScanner[], reporter: ResultReporter) {
    this.targetPath = targetPath;
    this.scanners = scanners;
    this.reporter = reporter;
  }

  public async start(): Promise<void> {
    console.log(chalk.blue(`[*] Iniciando análisis en tiempo real en: ${this.targetPath}`));

    // 1. Detección
    const detector = new Detector(this.targetPath);
    const stacks = await detector.detect();

    console.log(chalk.green(`[+] Proyectos detectados:`));
    stacks.forEach(s => {
        console.log(`    - ${s.stack.toUpperCase()} en: ${s.path}`);
    });

    console.log(chalk.yellow('\n[?] Ejecutando reglas de seguridad... (Los hallazgos aparecerán inmediatamente)\n'));

    // 2. Ejecución con Streaming
    for (const scanner of this.scanners) {
        if (this.reporter.setCurrentScanner) {
            this.reporter.setCurrentScanner(scanner.getName());
        }

        console.log(chalk.cyan.bold(`>>> Iniciando: ${scanner.getName()}`));

        await scanner.scan((result) => this.reporter.printResult(result));

        console.log(chalk.gray(`<<< Finalizado: ${scanner.getName()}\n`));
    }

    // 3. Resumen Final
    this.reporter.printSummary();

    // 4. Exportar a Markdown
    if (this.reporter.save) {
        await this.reporter.save(this.targetPath);
    }
  }
}
