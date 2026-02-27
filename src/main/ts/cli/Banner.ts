import chalk from 'chalk';
import figlet from 'figlet';

/**
 * Banner ASCII del CLI CGE-Verificator.
 * Muestra el nombre de la herramienta en formato figlet al iniciar la ejecución.
 */
export class Banner {
  /** Imprime el banner "CGE-Verificator" en color azul con formato ASCII art. */
  static showBanner(): void {
    console.log(
        chalk.blue(
            figlet.textSync('CGE-Verificator', { horizontalLayout: 'full' })
        )
    );
  }
}
