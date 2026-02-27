import { CLIOptions } from './CLIOptions';
import { IConfigLoader } from './config/IConfigLoader';
import { DotenvConfigLoader } from './config/DotenvConfigLoader';
import { createFromProvider } from '../model/ai/factory/AIClientProvider';
import { ScannerRegistry } from '../model/scanner/ScannerRegistry';
import { SecretScanner } from '../scanner/SecretScanner';
import { DependencyScanner } from '../scanner/DependencyScanner';
import { CodeQualityScanner } from '../scanner/CodeQualityScanner';
import { ArchitectureScanner } from '../scanner/ArchitectureScanner';
import { AuthScanner } from '../scanner/AuthScanner';
import { PerformanceScanner } from '../scanner/PerformanceScanner';
import { TestingScanner } from '../scanner/TestingScanner';
import { ConsoleReporter } from '../model/reporter/ConsoleReporter';
import { JsonReporter } from '../model/reporter/JsonReporter';
import { Orchestrator } from '../model/Orchestrator';
import { Detector } from '../model/detector/Detector';
import { GuidelinesLoader } from '../model/guidelines/GuidelinesLoader';
import { ResultReporter } from '../model/reporter/ResultReporter';
import chalk from 'chalk';
import { Banner } from './Banner';

/**
 * Fachada principal del sistema CGE-Verificator (patrón **Facade**).
 * Orquesta la inicialización de dependencias (AI client, scanners, reporter, detector)
 * y delega la ejecución completa al {@link Orchestrator}.
 */
export class Application {
  /**
   * Ejecuta el flujo completo de auditoría: carga guidelines, crea AI client,
   * registra scanners, compone el reporter y lanza el Orchestrator.
   * @param options — Opciones parseadas desde la línea de comandos.
   */
  async run(options: CLIOptions): Promise<void> {
    const excludePatterns = options.exclude
      ? options.exclude.split(',').map((p: string) => p.trim()).filter(Boolean)
      : [];

    // Cargar guidelines del proyecto auditado
    const guidelines = GuidelinesLoader.load(options.path);
    if (guidelines.found) {
      console.log(chalk.green(`[+] Guidelines cargadas desde: ${guidelines.filePath}`));
    } else {
      console.log(chalk.gray(`[i] No se encontró guidelines.md en el proyecto. Auditoría sin contexto de guidelines.`));
    }

    // Crear AI client con contexto de guidelines
    const aiClient = createFromProvider(process.env.AI_PROVIDER, {
      guidelines: guidelines.found ? guidelines.raw : undefined,
    });

    // Crear detector antes del registro de scanners (DependencyScanner lo necesita)
    const detector = new Detector(options.path, excludePatterns);

    const registry = new ScannerRegistry();
    // Deterministas primero (rápidos)
    registry.register((p, excl) => new SecretScanner(p, excl));
    registry.register((p, excl) => new DependencyScanner(p, detector, excl));
    // IA (más lentos)
    registry.register((p, excl) => new CodeQualityScanner(p, aiClient, excl));
    registry.register((p, excl) => new ArchitectureScanner(p, aiClient, excl));
    registry.register((p, excl) => new AuthScanner(p, aiClient, excl));
    registry.register((p, excl) => new PerformanceScanner(p, aiClient, excl));
    // Testing al final (analiza archivos de test que otros ignoran)
    registry.register((p, excl) => new TestingScanner(p, aiClient, excl));

    const scanners = registry.createScanners(options.path, excludePatterns);

    // Componer reporter (Decorator pattern para JSON output)
    let reporter: ResultReporter = new ConsoleReporter(guidelines.found);
    if (options.outputJson) {
      reporter = new JsonReporter(reporter, options.outputJson);
    }
    const orchestrator = new Orchestrator(detector, scanners, reporter);
    await orchestrator.start();
  }

  /**
   * Punto de entrada estático: carga configuración, muestra el banner e inicia la auditoría.
   * Captura errores fatales y termina el proceso con código de salida 1.
   * @param opts — Opciones CLI recibidas de Commander.js.
   */
  static async bootstrap(opts: CLIOptions) {
    try {
      const configLoaders: IConfigLoader[] = [new DotenvConfigLoader()];
      configLoaders.forEach((loader) => loader.load());

      Banner.showBanner();
      await new Application().run(opts);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      console.error(chalk.red('Error fatal durante la ejecución:'), msg);
      process.exit(1);
    }
  }
}
