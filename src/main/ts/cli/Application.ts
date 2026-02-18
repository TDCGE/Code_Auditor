import { CLIOptions } from './CLIOptions';
import { IConfigLoader } from './config/IConfigLoader';
import { DotenvConfigLoader } from './config/DotenvConfigLoader';
import { createFromProvider } from '../model/ai/factory/AIClientProvider';
import { ScannerRegistry } from '../model/scanner/ScannerRegistry';
import { SecretScanner } from '../scanner/SecretScanner';
import { ArchitectureScanner } from '../scanner/ArchitectureScanner';
import { AuthScanner } from '../scanner/AuthScanner';
import { ConsoleReporter } from '../model/reporter/ConsoleReporter';
import { JsonReporter } from '../model/reporter/JsonReporter';
import { Orchestrator } from '../model/Orchestrator';
import { Detector } from '../model/detector/Detector';
import { GuidelinesLoader } from '../model/guidelines/GuidelinesLoader';
import { ResultReporter } from '../model/reporter/ResultReporter';
import chalk from 'chalk';
import { Banner } from './Banner';

export class Application {
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

    const registry = new ScannerRegistry();
    registry.register((p, excl) => new SecretScanner(p, excl));
    registry.register((p, excl) => new ArchitectureScanner(p, aiClient, excl));
    registry.register((p, excl) => new AuthScanner(p, aiClient, excl));

    const scanners = registry.createScanners(options.path, excludePatterns);

    // Componer reporter (Decorator pattern para JSON output)
    let reporter: ResultReporter = new ConsoleReporter(guidelines.found);
    if (options.outputJson) {
      reporter = new JsonReporter(reporter, options.outputJson);
    }

    const detector = new Detector(options.path, excludePatterns);
    const orchestrator = new Orchestrator(detector, scanners, reporter);
    await orchestrator.start();
  }

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
