#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { Application, CLIOptions, Banner } from './cli';

dotenv.config();

const program = new Command();

program
    .version('1.0.0')
    .description('Herramienta de Verificación de Calidad y Seguridad para CGE (Vibe Coding QA)')
    .option('-p, --path <path d=".">', 'Ruta del directorio a escanear', '.')
    .option('-e, --exclude <patterns>', 'Patrones glob separados por comas para excluir archivos/carpetas (ej: "node_modules,dist,*.test.ts")', '')
    .action(async (options: CLIOptions) => {
        try {
            Banner.showBanner();
            await new Application().run(options);
        } catch (error) {
            console.error(chalk.red('Error fatal durante la ejecución:'), error);
            process.exit(1);
        }
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
