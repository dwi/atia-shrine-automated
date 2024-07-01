import { ethers } from 'ethers';
import * as fs from 'fs';
import { getKeys } from '@utils/misc';
import { logger } from '@utils/logger';
import { RONIN_PROVIDER } from '@constants';

var colors = require('colors');

const PREFIX = colors.blue(`Atia's Blessing`);

const atiaAbi = JSON.parse(fs.readFileSync('abis/atia.json', 'utf8'));

const atiaContract = new ethers.Contract('0x9d3936dbd9a794ee31ef9f13814233d435bd806c', atiaAbi, RONIN_PROVIDER);

export async function checkBlessings() {
  const keys = await getKeys('keys');
  // console.log(`🤖 ${PREFIX}: Starting daily pray (${keys.length} addr)`);

  for (const key of keys) {
    if (!key.prayerPrivateKey) {
      logger.error(`${PREFIX}: No prayer private key found!`);
      logger.error(key);
      continue;
    }

    const signer = new ethers.Wallet(key.prayerPrivateKey, RONIN_PROVIDER);

    if (!key.delegateeAddresses) {
      key.delegateeAddresses = [signer.address];
    }

    if (key.delegateeAddresses.length > 5) {
      logger.error(`${colors.gray(signer.address.slice(-4))} ${PREFIX}: Too much delegatees for a prayer`);
      continue;
    }

    for (const delegatee of key.delegateeAddresses) {
      await isActivated(delegatee).then(async ({ status, streak }) => {
        if (status) {
          logger.idle(`${colors.gray(signer.address.slice(-4))} ${PREFIX}: Already prayed (streak: ${colors.yellow(streak)})`);
        } else {
          await activateStreak(signer, delegatee).then(({ status, streak }) => {
            if (!status) return;
            logger.log(`${colors.gray(signer.address.slice(-4))} ${PREFIX}: Prayed (streak: ${colors.yellow(streak)})`);
          });
        }
      });
    }
  }
  //console.log('\n')
}

async function isActivated(address: string) {
  const { currentStreakCount } = await atiaContract.getStreak(address);
  const { _, hasPrayedToday } = await atiaContract.getActivationStatus(address);

  return { status: hasPrayedToday, streak: Number(currentStreakCount) };
}

async function activateStreak(signer: ethers.Wallet, delegatee: string) {
  const connectedContract = <ethers.Contract>atiaContract.connect(signer);
  try {
    const { currentStreakCount } = await connectedContract.getStreak(delegatee);
    const tx = await connectedContract.activateStreak(delegatee);
    await tx.wait();
    return { status: true, streak: Number(currentStreakCount) + 1 };
  } catch (e: Error | any) {
    logger.error(
      `${colors.gray(signer.address.slice(-4))} ${PREFIX}: Failed to pray for ${colors.gray(delegatee.slice(-4))} ${e.code} (${e.info?.error?.message})`,
    );
    return { status: false };
  }
}
