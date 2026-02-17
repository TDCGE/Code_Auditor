import { CLIOptions } from './CLIOptions';
import { IConfigLoader } from './config/IConfigLoader';
import { DotenvConfigLoader } from './config/DotenvConfigLoader';
import { createFromProvider } from '../core/ai/factory/AIClientProvider';
import { ScannerRegistry } from '../core/scanner/ScannerRegistry';
import { SecretScanner } from '../scanner/SecretScanner';
import { ArchitectureScanner } from '../scanner/ArchitectureScanner';
import { AuthScanner } from '../scanner/AuthScanner';
import { ConsoleReporter } from '../core/reporter/ConsoleReporter';
import { Orchestrator } from '../core/Orchestrator';
import { Detector } from '../core/detector/Detector';
import chalk from 'chalk';
import { Banner } from './Banner';

export class Application {
  async run(options: CLIOptions): Promise<void> {
    const excludePatterns = options.exclude
      ? options.exclude.split(',').map((p: string) => p.trim()).filter(Boolean)
      : [];

    const aiClient = createFromProvider(process.env.AI_PROVIDER);

    const registry = new ScannerRegistry();
    registry.register((p, excl) => new SecretScanner(p, excl));
    registry.register((p, excl) => new ArchitectureScanner(p, aiClient, excl));
    registry.register((p, excl) => new AuthScanner(p, aiClient, excl));

    const scanners = registry.createScanners(options.path, excludePatterns);
    const reporter = new ConsoleReporter();
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
