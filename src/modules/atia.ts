import { ethers } from 'ethers';
import { getKeys } from '../index';
var colors = require('colors');

const rpc = 'https://api.roninchain.com/rpc';
// Limit batchMaxCount to 1, new Ronin RPC does not support batching yet
const provider = new ethers.JsonRpcProvider(rpc, 2020, { batchMaxCount: 1 });
const PREFIX = `Atia's Blessing`;

let atiaAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'activateStreak',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getStreak',
    outputs: [
      {
        internalType: 'uint256',
        name: 'currentStreakCount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lastActivated',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'longestStreakCount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lostStreakCount',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getActivationStatus',
    outputs: [
      {
        internalType: 'bool',
        name: 'isLostStreak',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'hasPrayedToday',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

const atiaContract = new ethers.Contract('0x9d3936dbd9a794ee31ef9f13814233d435bd806c', atiaAbi, provider);

export async function checkBlessings() {
  const keys = await getKeys('keys');
  console.log(`⚙️ Starting ${PREFIX} daily pray (${keys.length} addr)`);
  for (const key of keys) {
    const signer = new ethers.Wallet(key, provider);
    isActivated(signer.address).then(({ status, streak }) => {
      if (status) {
        console.log(`⏱️ ${PREFIX}: Already activated for ${colors.gray(signer.address.slice(-4))} (streak: ${colors.yellow(streak)})`);
      } else {
        activateStreak(signer).then(({ status, streak }) => {
          if (!status) return;
          console.log(`✅ ${PREFIX}: Activated for ${colors.gray(signer.address.slice(-4))} (streak: ${colors.yellow(streak)})`);
        });
      }
    });
  }
}

async function isActivated(address: string) {
  const { currentStreakCount } = await atiaContract.getStreak(address);
  const status = atiaContract.getActivationStatus(address).then(({ _, hasPrayedToday }) => hasPrayedToday);
  return { status, streak: Number(currentStreakCount) };
}

async function activateStreak(signer: ethers.Wallet) {
  const connectedContract = <ethers.Contract>atiaContract.connect(signer);
  try {
    const { currentStreakCount } = await connectedContract.getStreak(signer.address);
    await connectedContract.activateStreak(signer.address);
    return { status: true, streak: Number(currentStreakCount) + 1 };
  } catch (e: Error | any) {
    console.log(e);
    console.error(`⚠️ ${PREFIX}: Failed to pray for ${colors.gray(signer.address.slice(-4))} ${e.code} (${e.info?.error?.message})`);
    return { status: false };
  }
}
