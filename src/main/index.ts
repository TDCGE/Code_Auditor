#!/usr/bin/env node
/**
 * @module main
 * Punto de entrada principal del CLI CGE-Verificator.
 * Configura Commander.js con las opciones `--path`, `--exclude` y `--output-json`,
 * y delega la ejecución a {@link Application.bootstrap}.
 */
import { Command } from 'commander';
import { version, description } from '../../package.json';
import { Application, CLIOptions } from './ts/cli';

const program = new Command();

program
    .version(version)
    .description(description)
    .option('-p, --path <directory>', 'Ruta del directorio a escanear', '.')
    .option('-e, --exclude <patterns>', 'Patrones glob separados por comas para excluir archivos/carpetas (ej: "node_modules,dist,*.test.ts")', '')
    .option('--output-json <file>', 'Ruta donde escribir un resumen JSON para consumo programático (CI/CD)')
    .action(async (opts: CLIOptions) => Application.bootstrap(opts));

program.parseAsync(process.argv).catch((err: unknown): void => {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    console.error('Error fatal durante la ejecución:', msg);
    process.exitCode = 1;
});
