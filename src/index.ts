#!/usr/bin/env node
import {Command} from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import {Orchestrator} from './core/Orchestrator';
import {ConsoleReporter} from './core/ConsoleReporter';
import {ScannerRegistry} from './core/ScannerRegistry';
import {SecretScanner} from './scanners/SecretScanner';
import {ArchitectureScanner} from './scanners/ArchitectureScanner';
import {AuthScanner} from './scanners/AuthScanner';
import {IAIClient} from "./core/ai/IAIClient";
import dotenv from "dotenv";
import {ClaudeClient} from "./core/ai/factory/ClaudeClient";
import {GeminiClient} from "./core/ai/factory/GeminiClient";
import {ClaudeAIClient} from "./core/ai/ClaudeAIClient";
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
    .option('--provider <provider>', 'Proveedor de IA: claude, gemini, auto', 'auto')
    .action(async (options) => {
        try {
            let client: AIClientFactory;
            const aiProvider = process.env.AI_PROVIDER?.toLowerCase()
            if (aiProvider == 'claude' || aiProvider == 'auto') {
                client = new ClaudeClient();
            } else { // aiProvider == 'gemini'
                client = new GeminiClient();
            }
            const aiClient: IAIClient = client.createAIClient();
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
