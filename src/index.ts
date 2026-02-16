#!/usr/bin/env node
import {Command} from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import {Orchestrator} from './core/Orchestrator';
import {ConsoleReporter} from './core/reporter/ConsoleReporter';
import {ScannerRegistry} from './core/scanner/ScannerRegistry';
import {SecretScanner} from './scanners/SecretScanner';
import {ArchitectureScanner} from './scanners/ArchitectureScanner';
import {AuthScanner} from './scanners/AuthScanner';
import {IAIClient} from "./core/ai/IAIClient";
import dotenv from "dotenv";
import {ClaudeClient} from "./core/ai/factory/ClaudeClient";
import {GeminiClient} from "./core/ai/factory/GeminiClient";
import {AIClientFactory} from "./core/ai/factory/AIClientFactory";

dotenv.config();

const program = new Command();

console.log(
    chalk.blue(
        figlet.textSync('CGE-Verificator', {horizontalLayout: 'full'})
    )
);

program
    .version('1.0.0')
    .description('Herramienta de Verificación de Calidad y Seguridad para CGE (Vibe Coding QA)')
    .option('-p, --path <path d=".">', 'Ruta del directorio a escanear', '.')
    .option('-e, --exclude <patterns>', 'Patrones glob separados por comas para excluir archivos/carpetas (ej: "node_modules,dist,*.test.ts")', '')
    .action(async (options) => {
        try {
            // Parse exclude patterns
            const excludePatterns = options.exclude
                ? options.exclude.split(',').map((p: string) => p.trim()).filter(Boolean)
                : [];

            // Select AI provider based on AI_PROVIDER env var (defaults to claude)
            let client: AIClientFactory;
            const aiProvider = process.env.AI_PROVIDER?.toLowerCase();
            if (aiProvider === 'gemini') {
                client = new GeminiClient();
            } else {
                // Default to Claude for undefined, 'claude', or any other value
                client = new ClaudeClient();
            }
            const aiClient: IAIClient = client.createAIClient();

            const registry = new ScannerRegistry();
            registry.register((p, excl) => new SecretScanner(p, excl));
            registry.register((p, excl) => new ArchitectureScanner(p, aiClient, excl));
            registry.register((p, excl) => new AuthScanner(p, aiClient, excl));

            const scanners = registry.createScanners(options.path, excludePatterns);
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
