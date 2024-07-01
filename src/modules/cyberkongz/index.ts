import { ethers } from 'ethers';
import * as fs from 'fs';
import { getKeys } from '@utils/misc';
import { logger } from '@utils/logger';
import axios from 'axios';
import { RONIN_PROVIDER } from '@constants';
var colors = require('colors');

const PREFIX = colors.brightMagenta('CyberKongz');

const sliceDispenserAbi = JSON.parse(fs.readFileSync('abis/ck-slice-dispenser.json', 'utf8'));
const sliceDispenserContract = new ethers.Contract('0xd9696466ca9c3211643e4f150917776d940e7faf', sliceDispenserAbi, RONIN_PROVIDER);

const kreditsAbi = JSON.parse(fs.readFileSync('abis/ck-kredits.json', 'utf8'));
const kreditsContract = new ethers.Contract('0x54efb1cc4f0331405a39d42964c3c885396919e5', kreditsAbi, RONIN_PROVIDER);

export async function checkKongz() {
  const keys = await getKeys('kongKeys');

  for (const key of keys) {
    const signer = new ethers.Wallet(key, RONIN_PROVIDER);
    const VXs = await getVXs(signer);

    if (VXs.length < 1) {
      logger.error(`${colors.gray(signer.address.slice(-4))} ${PREFIX}: Wallet has no CyberKongz VX`);
      return;
    }

    const canClaimResult = await canClaim(signer, VXs);
    if (!canClaimResult) {
      logger.idle(`${colors.gray(signer.address.slice(-4))} ${PREFIX}: Kredits already claimed`);
      continue;
    }
    const { success, rewarded } = await claim(signer, VXs);
    if (success) {
      logger.log(
        `${colors.gray(signer.address.slice(-4))} ${PREFIX}: Claimed ${colors.yellow(Number(ethers.formatEther(rewarded)).toFixed(3))} Kredits`,
      );
    }
  }
}

async function getVXs(signer: ethers.Wallet) {
  try {
    const axios = require('axios');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-KEY': '0qtph2G19AZO958fKvchafZe8BCZzGRh',
      },
    };
    const postData = {
      contractAddresses: ['0x241a81fc0d6692707dad2b5025a3a7cf2cf25acf'],
      ownerAddress: signer.address,
      paging: {
        limit: 200,
        offset: 0,
        pagingStyle: 'offset',
      },
      tokenStandards: ['ERC721'],
    };
    const { data } = await axios.post('https://api-gateway.skymavis.com/skynet/ronin/tokens/balances/search', postData, config);
    return data.result?.items?.map((item: any) => item.tokenId) || [];
  } catch (e) {
    return [];
  }
}

async function canClaim(signer: ethers.Wallet, VXs: string[]) {
  try {
    return (<ethers.Contract>sliceDispenserContract.connect(signer)).canClaim(VXs).then((res: boolean[]) => res.every(Boolean));
  } catch (e) {
    return;
  }
}

async function claim(signer: ethers.Wallet, VXs: string[]) {
  const connectedContract = <ethers.Contract>sliceDispenserContract.connect(signer);
  const balBefore = await kreditsContract.balanceOf(signer.address);
  try {
    const tx = await connectedContract.claim(VXs);
    await tx.wait();
    const balAfter = await kreditsContract.balanceOf(signer.address);

    return {
      rewarded: BigInt(balAfter - balBefore),
      success: true,
    };
  } catch (e: Error | any) {
    logger.error(`${colors.gray(signer.address.slice(-4))} ${PREFIX}: Kredits claim failed ${e.code} (${e.info.error.message})`);
    return { success: false };
  }
}
