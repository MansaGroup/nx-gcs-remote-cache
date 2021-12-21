import chalk from 'chalk';

function prefixFactory(colorFn: (msg: string) => string) {
  return `${colorFn('>')} ${chalk.inverse(chalk.bold(colorFn(' NX GCS ')))}`;
}

const LOG_PREFIX = prefixFactory(chalk.cyan);
const LOG_WARN_PREFIX = prefixFactory(chalk.yellow);

export const logger = {
  log(message: string): void {
    console.log(`\n${LOG_PREFIX} ${chalk.bold(message)}\n`);
  },

  warn(message: string): void {
    console.log(`\n${LOG_WARN_PREFIX} ${chalk.bold(message)}\n`);
  },
};
