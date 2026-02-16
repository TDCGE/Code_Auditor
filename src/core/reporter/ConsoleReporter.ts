import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import {ScanResult} from '../../scanners/ScanResult';
import {ResultReporter} from './ResultReporter';
import {ScannerSection} from "../scanner/ScannerSection";

export class ConsoleReporter implements ResultReporter {
  private hasCriticalIssues = false;
  private currentScanner = '';
  private sections: ScannerSection[] = [];

  printResult(r: ScanResult): void {
    if (r.severity === 'HIGH') this.hasCriticalIssues = true;

    const badge = r.severity === 'HIGH'
      ? chalk.bgRed.white.bold(' CRÍTICO ')
      : (r.severity === 'MEDIUM' ? chalk.bgYellow.black(' MEDIO ') : chalk.bgBlue.white(' BAJO '));

    console.log(`${badge} ${chalk.white.bold(r.message)}`);
    console.log(chalk.gray(`  └─ Archivo: ${r.file}:${r.line}`));
    console.log('');

    // Accumulate for Markdown export
    const section = this.sections.find(s => s.scanner === this.currentScanner);
    if (section) {
      section.results.push(r);
    }
  }

  printSummary(): void {
    console.log(chalk.bgBlue.white.bold(' === RESUMEN FINAL === '));
    if (this.hasCriticalIssues) {
      console.log(chalk.red('✖ Se encontraron problemas CRÍTICOS que deben resolverse.'));
    } else {
      console.log(chalk.green('✔ Análisis completado. El código parece seguro.'));
    }
  }

  setCurrentScanner(name: string): void {
    this.currentScanner = name;
    this.sections.push({ scanner: name, results: [] });
  }

  async save(targetPath: string): Promise<void> {
    const dir = path.join(path.resolve(targetPath), 'analysisByVCV');
    const filePath = path.join(dir, 'analysis.md');

    fs.mkdirSync(dir, { recursive: true });

    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

    const severityLabel: Record<string, string> = {
      HIGH: 'CRÍTICO',
      MEDIUM: 'MEDIO',
      LOW: 'BAJO',
    };

    let md = `# Reporte de Análisis - CGE-Verificator\n\n`;
    md += `**Fecha:** ${timestamp}\n`;
    md += `**Directorio analizado:** ${targetPath}\n\n`;
    md += `---\n\n`;

    let totalHigh = 0;
    let totalMedium = 0;
    let totalLow = 0;

    for (const section of this.sections) {
      if (section.results.length === 0) continue;

      md += `## ${section.scanner}\n\n`;

      for (const r of section.results) {
        if (r.severity === 'HIGH') totalHigh++;
        else if (r.severity === 'MEDIUM') totalMedium++;
        else totalLow++;

        let mainMessage = r.message;
        let recommendation = '';
        let suggestion = '';

        // 1. Extraer recomendación (ArchitectureScanner.analyzeStructure)
        const recIdx = mainMessage.indexOf('\n💡 RECOMENDACIÓN: ');
        if (recIdx !== -1) {
          recommendation = mainMessage.substring(recIdx + '\n💡 RECOMENDACIÓN: '.length);
          mainMessage = mainMessage.substring(0, recIdx);
        }

        // 2. Extraer sugerencia inline (AuthScanner / ArchitectureScanner.analyzeFile)
        const sugIdx = mainMessage.indexOf('. Sugerencia: ');
        if (sugIdx !== -1) {
          suggestion = mainMessage.substring(sugIdx + '. Sugerencia: '.length);
          mainMessage = mainMessage.substring(0, sugIdx + 1); // conservar el punto
        }

        // 3. Separar título de descripción en el primer ': '
        const colonIdx = mainMessage.indexOf(': ');
        if (colonIdx !== -1) {
          const title = mainMessage.substring(0, colonIdx);
          const description = mainMessage.substring(colonIdx + 2);
          md += `### [${severityLabel[r.severity]}] ${title}\n\n${description}\n\n`;
        } else {
          md += `### [${severityLabel[r.severity]}] ${mainMessage}\n\n`;
        }

        // 4. Renderizar sugerencia/recomendación como blockquote
        if (suggestion) {
          md += `> **Sugerencia:** ${suggestion}\n\n`;
        }
        if (recommendation) {
          md += `> 💡 **RECOMENDACIÓN:** ${recommendation}\n\n`;
        }
        md += `- **Archivo:** ${r.file}:${r.line}\n`;
        md += `- **Regla:** \`${r.rule}\`\n\n`;
      }

      md += `---\n\n`;
    }

    const total = totalHigh + totalMedium + totalLow;

    md += `## Resumen\n\n`;

    if (this.hasCriticalIssues) {
      md += `Se encontraron problemas **CRÍTICOS** que deben resolverse.\n\n`;
    } else if (total > 0) {
      md += `Análisis completado. No se encontraron problemas críticos.\n\n`;
    } else {
      md += `Análisis completado. El código parece seguro.\n\n`;
    }

    md += `| Severidad | Cantidad |\n`;
    md += `|-----------|----------|\n`;
    md += `| ALTO      | ${totalHigh}        |\n`;
    md += `| MEDIO     | ${totalMedium}        |\n`;
    md += `| BAJO      | ${totalLow}        |\n`;
    md += `| **Total** | **${total}**   |\n`;

    fs.writeFileSync(filePath, md, 'utf-8');
    console.log(chalk.green(`\n[✔] Reporte Markdown guardado en: ${filePath}`));
  }
}
