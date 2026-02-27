import { BaseScanner } from './BaseScanner';
import { ScanResult, createScanResult, Severity } from '../types';
import { Detector } from '../model/detector/Detector';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Scanner determinista de dependencias vulnerables.
 * Extiende {@link BaseScanner} pero override `scan()` directamente (no usa `findFiles`/`analyzeFile`)
 * para ejecutar herramientas nativas de auditoría: `npm audit`, `pip-audit` y `mvn dependency:tree`.
 * Detecta automáticamente los stacks del proyecto vía {@link Detector}.
 */
export class DependencyScanner extends BaseScanner {
  private detector: Detector;

  /**
   * @param targetPath — Ruta raíz del proyecto a analizar.
   * @param detector — Detector de stacks para saber qué herramientas de auditoría ejecutar.
   * @param excludePatterns — Patrones glob de exclusión del usuario.
   */
  constructor(targetPath: string, detector: Detector, excludePatterns: string[] = []) {
    super(targetPath, excludePatterns);
    this.detector = detector;
  }

  /** {@inheritDoc BaseScanner.getName} */
  getName(): string {
    return 'Escáner de Dependencias Vulnerables';
  }

  protected findFiles(): string[] {
    return [];
  }

  protected async analyzeFile(_filePath: string, _content: string): Promise<ScanResult[]> {
    return [];
  }

  /** Ejecuta auditoría de dependencias para cada stack detectado en el proyecto. */
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

  /** Ejecuta `npm audit --json` y parsea los resultados. */
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

  /** Parsea la salida JSON de `npm audit` y genera resultados por vulnerabilidad. */
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

  /** Extrae descripciones de la cadena `via` de npm audit. */
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

  /** Mapea severidades de npm audit a severidades del sistema CGE-Verificator. */
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

  /** Ejecuta `pip-audit` contra `requirements.txt` y parsea los resultados. */
  private auditPython(projectPath: string): ScanResult[] {
    const requirementsPath = path.join(projectPath, 'requirements.txt');

    if (!fs.existsSync(requirementsPath)) {
      return [createScanResult({
        file: this.relativePath(projectPath) || '.',
        message: 'No se encontró requirements.txt en el proyecto Python. No se puede auditar dependencias sin un archivo de requerimientos.',
        severity: 'LOW',
        rule: 'dependency-audit-unavailable',
        suggestion: 'Genere un requirements.txt con "pip freeze > requirements.txt" para habilitar la auditoría de dependencias.',
      })];
    }

    try {
      const output = execSync('pip-audit -r requirements.txt --format=json', {
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

      const stderr = (err && typeof err === 'object' && 'stderr' in err)
        ? (err as { stderr: Buffer }).stderr?.toString() || ''
        : '';
      const isNotInstalled = /No module named|is not recognized|not found|ENOENT/.test(stderr);

      if (isNotInstalled) {
        return [createScanResult({
          file: this.relativePath(projectPath) || '.',
          message: 'pip-audit no está instalado. No se puede auditar dependencias Python.',
          severity: 'LOW',
          rule: 'dependency-audit-unavailable',
          suggestion: 'Instale pip-audit con "pip install pip-audit" y ejecute "pip-audit -r requirements.txt" manualmente.',
        })];
      }

      return [createScanResult({
        file: this.relativePath(projectPath) || '.',
        message: `Error al ejecutar pip-audit: ${stderr.trim() || 'error desconocido'}.`,
        severity: 'LOW',
        rule: 'dependency-audit-error',
        suggestion: 'Revise que requirements.txt sea válido y ejecute "pip-audit -r requirements.txt" manualmente para más detalles.',
      })];
    }
  }

  /** Parsea la salida JSON de `pip-audit` y genera resultados por vulnerabilidad. */
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

  /** Ejecuta `mvn dependency:tree` y recomienda OWASP dependency-check para Java. */
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
