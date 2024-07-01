var colors = require('colors');

const ts = (): string => {
  return new Date().toISOString().slice(0, -5).replace('T', ' ');
};

export const logger = {
  log(...message: any[]): void {
    console.log(ts(), '✅', ...message);
  },
  bot(...message: any[]): void {
    console.log(ts(), '🤖', ...message);
  },

  error(...message: any[]): void {
    console.error(ts(), '❌', ...message);
  },

  idle(...message: any[]): void {
    console.log(ts(), '🏁', ...message);
  },
};
