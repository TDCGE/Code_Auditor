import chalk from 'chalk';
import { ScanResult } from '../scanners/BaseScanner';
import { ResultReporter } from './ResultReporter';

export class ConsoleReporter implements ResultReporter {
  private hasCriticalIssues = false;

  printResult(r: ScanResult): void {
    if (r.severity === 'HIGH') this.hasCriticalIssues = true;

    const badge = r.severity === 'HIGH'
      ? chalk.bgRed.white.bold(' CRÍTICO ')
      : (r.severity === 'MEDIUM' ? chalk.bgYellow.black(' MEDIO ') : chalk.bgBlue.white(' BAJO '));

    console.log(`${badge} ${chalk.white.bold(r.message)}`);
    console.log(chalk.gray(`  └─ Archivo: ${r.file}:${r.line}`));
    console.log('');
  }

  printSummary(): void {
    console.log(chalk.bgBlue.white.bold(' === RESUMEN FINAL === '));
    if (this.hasCriticalIssues) {
      console.log(chalk.red('✖ Se encontraron problemas CRÍTICOS que deben resolverse.'));
    } else {
      console.log(chalk.green('✔ Análisis completado. El código parece seguro.'));
    }
  }
}
