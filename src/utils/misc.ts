import * as fs from 'fs';
export async function getKeys(key: string) {
  return JSON.parse(fs.readFileSync('./privateKeys', 'utf8'))[key];
}
