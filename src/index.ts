require('dotenv').config();
var cron = require('node-cron');
import * as fs from 'fs';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getKeys } from '@utils/misc';
import * as modules from './modules';

axiosRetry(axios, {
  retries: 3, // number of retries
  retryDelay: (retryCount) => {
    console.log(`retry attempt: ${retryCount}`);
    return retryCount * 10000; // time interval between retries
  },
  retryCondition: (error) => {
    const { code, message } = error;
    return new Set(['ERR_SOCKET_CONNECTION_TIMEOUT', 'ECONNABORTED', undefined, 0]).has(<string>code) || message.includes('timeout');
  },
});

cron.schedule(
  '5 3 * * *',
  async () => {
    console.log(`\n🙏 Running 03:05 jobs`);
    await modules.checkBlessings();
  },
  {
    timezone: 'UTC',
  },
);

cron.schedule(
  '10 6 * * *',
  async () => {
    console.log(`\n🙏 Running 06:05 jobs`);
    await modules.checkKongz();
  },
  {
    timezone: 'UTC',
  },
);


async function start() {
  if (!fs.existsSync('./privateKeys')) {
    throw Error(`privateKeys file not found`);
  } else if ((await getKeys('keys')).length <= 0) {
    throw Error(`No keys defined`);
  }

  await modules.checkBlessings();
  await modules.checkKongz();
}

start();
