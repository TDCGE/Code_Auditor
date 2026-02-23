import chalk from 'chalk';
import fs from 'fs';
import { ScanResult, hasLine, SEVERITY_CONFIG, SeverityBadgeColor, AuditMetrics } from '../../types';
import { ResultReporter } from './ResultReporter';
import { ScannerSection } from '../scanner/ScannerSection';
import { AuditVersionManager } from './AuditVersionManager';

const BADGE_FORMATTERS: Record<SeverityBadgeColor, (text: string) => string> = {
  red:    (t) => chalk.bgRed.white.bold(t),
  yellow: (t) => chalk.bgYellow.black(t),
  blue:   (t) => chalk.bgBlue.white(t),
};

export class ConsoleReporter implements ResultReporter {
  private hasCriticalIssues = false;
  private currentScanner = '';
  private sections: ScannerSection[] = [];
  private suppressedCount = 0;
  private readonly guidelinesUsed: boolean;
  private metrics: AuditMetrics | null = null;

  constructor(guidelinesUsed: boolean = false) {
    this.guidelinesUsed = guidelinesUsed;
  }

  setSuppressedCount(count: number): void {
    this.suppressedCount = count;
  }

  setMetrics(metrics: AuditMetrics): void {
    this.metrics = metrics;
  }

  printResult(r: ScanResult): void {
    if (r.severity === 'HIGH') this.hasCriticalIssues = true;

    const cfg = SEVERITY_CONFIG[r.severity];
    const badge = BADGE_FORMATTERS[cfg.badgeColor](` ${cfg.label} `);

    console.log(`${badge} ${chalk.white.bold(r.message)}`);
    console.log(chalk.gray(`  └─ Archivo: ${r.file}${hasLine(r) ? ':' + r.line : ''}`));
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

  async save(targetPath: string): Promise<string> {
    const versionManager = new AuditVersionManager(targetPath);
    const versionDir = versionManager.createVersionDir();

    const auditMd = this.generateAuditMarkdown(targetPath);
    fs.writeFileSync(`${versionDir}/audit.md`, auditMd, 'utf-8');

    const reviewLogMd = this.generateReviewLog();
    fs.writeFileSync(`${versionDir}/review-log.md`, reviewLogMd, 'utf-8');

    const changelogMd = this.generateChangelog();
    fs.writeFileSync(`${versionDir}/changelog.md`, changelogMd, 'utf-8');

    console.log(chalk.green(`\n[✔] Reporte de auditoría guardado en: ${versionDir}`));
    return versionDir;
  }

  private generateAuditMarkdown(targetPath: string): string {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

    let md = `# Reporte de Análisis - CGE-Verificator\n\n`;
    md += `**Fecha:** ${timestamp}\n`;
    md += `**Directorio analizado:** ${targetPath}\n`;
    md += `**Guidelines del proyecto:** ${this.guidelinesUsed ? 'Sí — auditoría alineada con guidelines.md' : 'No — auditoría sin contexto de guidelines'}\n\n`;

    if (this.metrics) {
      md += `### Métricas del Proyecto\n\n`;
      md += `| Métrica | Valor |\n`;
      md += `|---------|-------|\n`;
      md += `| Archivos de código | ${this.metrics.totalFiles} |\n`;
      md += `| Líneas totales | ${this.metrics.totalLines.toLocaleString()} |\n`;
      md += `| Archivos de test | ${this.metrics.testFiles} |\n`;
      md += `| Stacks detectados | ${this.metrics.stacks.join(', ') || 'N/A'} |\n\n`;
    }

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
          mainMessage = mainMessage.substring(0, sugIdx + 1);
        }

        // 3. Fallback al campo suggestion del ScanResult
        if (!suggestion && r.suggestion) {
          suggestion = r.suggestion;
        }

        // 4. Separar título de descripción en el primer ': '
        const label = SEVERITY_CONFIG[r.severity].label;
        const colonIdx = mainMessage.indexOf(': ');
        if (colonIdx !== -1) {
          const title = mainMessage.substring(0, colonIdx);
          const description = mainMessage.substring(colonIdx + 2);
          md += `### [${label}] ${title}\n\n${description}\n\n`;
        } else {
          md += `### [${label}] ${mainMessage}\n\n`;
        }

        // 5. Renderizar sugerencia/recomendación como blockquote
        if (suggestion) {
          md += `> **Sugerencia:** ${suggestion}\n\n`;
        }
        if (recommendation) {
          md += `> 💡 **RECOMENDACIÓN:** ${recommendation}\n\n`;
        }
        md += `- **Archivo:** ${r.file}${hasLine(r) ? ':' + r.line : ''}\n`;
        md += `- **Regla:** \`${r.rule}\`\n\n`;
      }

      md += `---\n\n`;
    }

    const total = totalHigh + totalMedium + totalLow;

    // Executive Summary
    md += `## Resumen Ejecutivo\n\n`;

    const healthScore = Math.max(0, 100 - (totalHigh * 15 + totalMedium * 5 + totalLow * 1));
    const healthEmoji = healthScore >= 80 ? 'Verde' : healthScore >= 50 ? 'Amarillo' : 'Rojo';
    md += `**Health Score:** ${healthScore}/100 (${healthEmoji})\n\n`;

    // Issue count by category
    const categoryCounts: Record<string, number> = {};
    for (const section of this.sections) {
      for (const r of section.results) {
        const cat = section.scanner;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    }

    if (Object.keys(categoryCounts).length > 0) {
      md += `**Issues por categoría:**\n\n`;
      md += `| Categoría | Cantidad |\n`;
      md += `|-----------|----------|\n`;
      for (const [cat, count] of Object.entries(categoryCounts)) {
        md += `| ${cat} | ${count} |\n`;
      }
      md += `\n`;
    }

    // Top 3 priorities
    const allIssues: { severity: string; message: string; scanner: string }[] = [];
    for (const section of this.sections) {
      for (const r of section.results) {
        allIssues.push({ severity: r.severity, message: r.message, scanner: section.scanner });
      }
    }

    const highIssues = allIssues.filter(i => i.severity === 'HIGH');
    const mediumIssues = allIssues.filter(i => i.severity === 'MEDIUM');
    const priorities = highIssues.length > 0 ? highIssues.slice(0, 3) : mediumIssues.slice(0, 3);

    if (priorities.length > 0) {
      md += `**Top ${priorities.length} prioridades:**\n\n`;
      priorities.forEach((p, idx) => {
        const shortMsg = p.message.length > 120 ? p.message.substring(0, 120) + '...' : p.message;
        md += `${idx + 1}. **[${p.severity}]** ${shortMsg}\n`;
      });
      md += `\n`;
    }

    md += `---\n\n`;

    // Original summary table
    md += `## Resumen de Severidades\n\n`;

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

    if (this.suppressedCount > 0) {
      md += `| Suprimidos | ${this.suppressedCount} |\n`;
    }

    return md;
  }

  private generateReviewLog(): string {
    let md = `# Review Log - Revisión Manual de Auditoría\n\n`;
    md += `> Complete esta tabla tras revisar cada hallazgo del reporte \`audit.md\`.\n\n`;
    md += `| # | Regla | Archivo | Veredicto | Comentario |\n`;
    md += `|---|-------|---------|-----------|------------|\n`;

    let idx = 1;
    for (const section of this.sections) {
      for (const r of section.results) {
        const file = hasLine(r) ? `${r.file}:${r.line}` : r.file;
        md += `| ${idx} | \`${r.rule}\` | ${file} | Por revisar | |\n`;
        idx++;
      }
    }

    md += `\n### Veredictos posibles\n\n`;
    md += `- **Confirmado**: El hallazgo es válido y debe corregirse.\n`;
    md += `- **Falso positivo**: El hallazgo no aplica en este contexto.\n`;
    md += `- **Por solucionar**: Hallazgo válido, pendiente de corrección.\n`;
    md += `- **Resuelto**: Hallazgo corregido (ver changelog.md).\n`;

    return md;
  }

  private generateChangelog(): string {
    let md = `# Changelog - Registro de Correcciones\n\n`;
    md += `> Documente aquí las correcciones aplicadas a los hallazgos de \`audit.md\`.\n\n`;

    let idx = 1;
    for (const section of this.sections) {
      for (const r of section.results) {
        md += `## Hallazgo #${idx}: ${r.rule}\n\n`;
        md += `- **Estado:** Pendiente\n`;
        md += `- **Archivos modificados:** \n`;
        md += `- **Descripción del cambio:** \n`;
        md += `- **Commit:** \n\n`;
        idx++;
      }
    }

    return md;
  }
}
