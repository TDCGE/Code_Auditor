import chalk from 'chalk';
import figlet from 'figlet';

export class Banner {
  static showBanner(): void {
    console.log(
        chalk.blue(
            figlet.textSync('CGE-Verificator', { horizontalLayout: 'full' })
        )
    );
  }
}
