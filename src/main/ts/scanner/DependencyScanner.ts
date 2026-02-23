import { BaseScanner } from './BaseScanner';
import { ScanResult, createScanResult, Severity } from '../types';
import { Detector } from '../model/detector/Detector';
import { execSync } from 'child_process';

export class DependencyScanner extends BaseScanner {
  private detector: Detector;

  constructor(targetPath: string, detector: Detector, excludePatterns: string[] = []) {
    super(targetPath, excludePatterns);
    this.detector = detector;
  }

  getName(): string {
    return 'Escáner de Dependencias Vulnerables';
  }

  protected findFiles(): string[] {
    return [];
  }

  protected async analyzeFile(_filePath: string, _content: string): Promise<ScanResult[]> {
    return [];
  }

  async scan(onResult?: (result: ScanResult) => void): Promise<ScanResult[]> {
    const allResults: ScanResult[] = [];
    const stacks = await this.detector.detect();

    for (const detected of stacks) {
      let results: ScanResult[] = [];

      switch (detected.stack) {
        case 'node':
          results = this.auditNode(detected.path);
          break;
        case 'python':
          results = this.auditPython(detected.path);
          break;
        case 'java':
          results = this.auditJava(detected.path);
          break;
      }

      for (const result of results) {
        allResults.push(result);
        if (onResult) onResult(result);
      }
    }

    return allResults;
  }

  private auditNode(projectPath: string): ScanResult[] {
    try {
      const output = execSync('npm audit --json', {
        cwd: projectPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 60000,
      }).toString();

      return this.parseNpmAudit(output, projectPath);
    } catch (err: unknown) {
      // npm audit exits with non-zero when vulnerabilities are found
      if (err && typeof err === 'object' && 'stdout' in err) {
        const stdout = (err as { stdout: Buffer }).stdout?.toString();
        if (stdout) {
          return this.parseNpmAudit(stdout, projectPath);
        }
      }
      return [createScanResult({
        file: this.relativePath(projectPath) || '.',
        message: 'No se pudo ejecutar npm audit. Asegúrese de que npm esté instalado y que el proyecto tenga package-lock.json.',
        severity: 'LOW',
        rule: 'dependency-audit-unavailable',
        suggestion: 'Ejecute "npm install" para generar el package-lock.json y luego "npm audit" manualmente.',
      })];
    }
  }

  private parseNpmAudit(output: string, projectPath: string): ScanResult[] {
    const results: ScanResult[] = [];

    try {
      const audit = JSON.parse(output);
      const vulnerabilities = audit.vulnerabilities || {};

      for (const [pkgName, vuln] of Object.entries(vulnerabilities)) {
        const v = vuln as { severity?: string; via?: unknown[]; fixAvailable?: unknown };
        const severity = this.mapNpmSeverity(v.severity || 'info');
        const viaDescriptions = this.extractViaDescriptions(v.via);
        const fixInfo = v.fixAvailable ? ' (fix disponible)' : '';

        results.push(createScanResult({
          file: this.relativePath(projectPath) || '.',
          message: `Dependencia vulnerable: ${pkgName} [${(v.severity || 'unknown').toUpperCase()}]${fixInfo}. ${viaDescriptions}`,
          severity,
          rule: 'vulnerable-dependency',
          suggestion: `Ejecute "npm audit fix" o actualice ${pkgName} a una versión parcheada.`,
        }));
      }
    } catch {
      // JSON parse failed — ignore
    }

    return results;
  }

  private extractViaDescriptions(via: unknown[] | undefined): string {
    if (!Array.isArray(via)) return '';
    const descriptions: string[] = [];
    for (const item of via) {
      if (typeof item === 'object' && item !== null && 'title' in item) {
        descriptions.push((item as { title: string }).title);
      }
    }
    return descriptions.length > 0 ? descriptions.join('; ') : '';
  }

  private mapNpmSeverity(severity: string): Severity {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'HIGH';
      case 'moderate':
        return 'MEDIUM';
      case 'low':
      case 'info':
      default:
        return 'LOW';
    }
  }

  private auditPython(projectPath: string): ScanResult[] {
    try {
      const output = execSync('pip audit --format=json', {
        cwd: projectPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 60000,
      }).toString();

      return this.parsePipAudit(output, projectPath);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'stdout' in err) {
        const stdout = (err as { stdout: Buffer }).stdout?.toString();
        if (stdout) {
          return this.parsePipAudit(stdout, projectPath);
        }
      }
      return [createScanResult({
        file: this.relativePath(projectPath) || '.',
        message: 'No se pudo ejecutar pip audit. Asegúrese de que pip-audit esté instalado (pip install pip-audit).',
        severity: 'LOW',
        rule: 'dependency-audit-unavailable',
        suggestion: 'Instale pip-audit con "pip install pip-audit" y ejecute "pip audit" manualmente.',
      })];
    }
  }

  private parsePipAudit(output: string, projectPath: string): ScanResult[] {
    const results: ScanResult[] = [];

    try {
      const audit = JSON.parse(output);
      const dependencies = audit.dependencies || [];

      for (const dep of dependencies) {
        const vulns = dep.vulns || [];
        for (const vuln of vulns) {
          results.push(createScanResult({
            file: this.relativePath(projectPath) || '.',
            message: `Dependencia Python vulnerable: ${dep.name}@${dep.version} — ${vuln.id}: ${vuln.description || 'Sin descripción'}`,
            severity: 'HIGH',
            rule: 'vulnerable-dependency',
            suggestion: vuln.fix_versions?.length > 0
              ? `Actualice ${dep.name} a versión ${vuln.fix_versions.join(' o ')}.`
              : `Revise alternativas para ${dep.name}.`,
          }));
        }
      }
    } catch {
      // JSON parse failed — ignore
    }

    return results;
  }

  private auditJava(projectPath: string): ScanResult[] {
    try {
      execSync('mvn dependency:tree -DoutputType=text', {
        cwd: projectPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 120000,
      });

      // Maven dependency:tree doesn't report vulnerabilities directly.
      // We just inform the user to use OWASP dependency-check.
      return [createScanResult({
        file: this.relativePath(projectPath) || '.',
        message: 'Proyecto Java detectado. Se recomienda usar OWASP dependency-check para auditar dependencias.',
        severity: 'LOW',
        rule: 'dependency-audit-unavailable',
        suggestion: 'Agregue org.owasp:dependency-check-maven a su pom.xml y ejecute "mvn dependency-check:check".',
      })];
    } catch {
      return [createScanResult({
        file: this.relativePath(projectPath) || '.',
        message: 'No se pudo ejecutar mvn dependency:tree. Asegúrese de que Maven esté instalado.',
        severity: 'LOW',
        rule: 'dependency-audit-unavailable',
        suggestion: 'Instale Maven y ejecute "mvn dependency:tree" manualmente.',
      })];
    }
  }
}
