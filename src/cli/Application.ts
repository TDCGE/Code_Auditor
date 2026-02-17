import { CLIOptions } from './CLIOptions';
import { createFromProvider } from '../core/ai/factory/AIClientProvider';
import { ScannerRegistry } from '../core/scanner/ScannerRegistry';
import { SecretScanner } from '../scanners/SecretScanner';
import { ArchitectureScanner } from '../scanners/ArchitectureScanner';
import { AuthScanner } from '../scanners/AuthScanner';
import { ConsoleReporter } from '../core/reporter/ConsoleReporter';
import { Orchestrator } from '../core/Orchestrator';

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
    const orchestrator = new Orchestrator(options.path, scanners, reporter);
    await orchestrator.start();
  }
}
