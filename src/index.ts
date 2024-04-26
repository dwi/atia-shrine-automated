var cron = require('node-cron');
import * as fs from 'fs';
import { checkBlessings } from './modules/atia';

cron.schedule(
  '5 5 * * *',
  () => {
    console.log(`\n🙏 Running 05:00 jobs`);
    checkBlessings();
  },
  {
    timezone: 'UTC',
  },
);

export async function getKeys(key: string) {
  return JSON.parse(fs.readFileSync('./privateKeys', 'utf8'))[key];
}

async function start() {
  if (!fs.existsSync('./privateKeys')) {
    throw Error(`privateKeys file not found`);
  } else if ((await getKeys('keys')).length <= 0) {
    throw Error(`No keys defined`);
  }

  await checkBlessings();
}

start();
