#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { Orchestrator } from './core/Orchestrator';
import { ConsoleReporter } from './core/ConsoleReporter';
import { createAIClient, AIProvider } from './core/AIClientFactory';
import { ScannerRegistry } from './core/ScannerRegistry';
import { SecretScanner } from './scanners/SecretScanner';
import { ArchitectureScanner } from './scanners/ArchitectureScanner';
import { AuthScanner } from './scanners/AuthScanner';

const program = new Command();

console.log(
  chalk.blue(
    figlet.textSync('CGE-Verificator', { horizontalLayout: 'full' })
  )
);

program
  .version('1.0.0')
  .description('Herramienta de Verificación de Calidad y Seguridad para CGE (Vibe Coding QA)')
  .option('-p, --path <path>', 'Ruta del directorio a escanear', '.')
  .option('--provider <provider>', 'Proveedor de IA: claude, gemini, auto', 'auto')
  .action(async (options) => {
    try {
      const aiClient = createAIClient(options.provider as AIProvider);
      const registry = new ScannerRegistry();
      registry.register(p => new SecretScanner(p));
      registry.register(p => new ArchitectureScanner(p, aiClient));
      registry.register(p => new AuthScanner(p, aiClient));

      const scanners = registry.createScanners(options.path);
      const reporter = new ConsoleReporter();
      const orchestrator = new Orchestrator(options.path, scanners, reporter);
      await orchestrator.start();
    } catch (error) {
      console.error(chalk.red('Error fatal durante la ejecución:'), error);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
