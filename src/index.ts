import * as cron from 'node-cron';
import * as fs from 'fs';
import { ethers, Wallet } from "ethers";

const rpc = 'https://api.roninchain.com/rpc';
// Limit batchMaxCount to 1, new Ronin RPC does not support batching yet
const provider = new ethers.JsonRpcProvider(rpc, 2020, { batchMaxCount: 1 });
let atiaAbi = [
  {
    "inputs": [
      {
        "internal_type": "",
        "name": "_user",
        "type": "address",
      }
    ],
    "name": "hasCurrentlyActivated",
    "outputs": [
      {
        "internal_type": "",
        "name": "",
        "type": "bool",
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "anonymous": false
  },
  {
    "inputs": [],
    "name": "activateStreak",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "anonymous": false
  }]

const atiaContract = new ethers.Contract('0x9d3936dbd9a794ee31ef9f13814233d435bd806c', atiaAbi, provider)

cron.schedule('0 1 * * *', () => {
  console.log(`\n🙏 Making an offering to Atia`)
  checkBlessings()
}, {
  timezone: "UTC"
});

async function checkBlessings() {
  getKeys().then((keys) => {
    keys.forEach((key: string) => {
      const signer = new ethers.Wallet(key, provider)
      isActivated(signer.address).then((res) => {
        if (res) return
        activateStreak(signer).then((res) => {
          if (!res) return
          console.log(`✅ Atia's Blessing activated for ${signer.address}`)
        })
      })
    })
  })
}

async function isActivated(address: string) {
  return atiaContract.hasCurrentlyActivated(address).then((res: boolean) => res)
}

async function activateStreak(signer: Wallet) {
  const connectedContract = <ethers.Contract>atiaContract.connect(signer)
  try {
    return await connectedContract.activateStreak().then(() => { return true })
  } catch (e: Error | any) {
    console.error(`⚠️ Blessing failed for ${signer.address} ${e.code} (${e.info.error.message})`)
    return false
  }

}

async function getKeys() {
  return JSON.parse(fs.readFileSync('./privateKeys', 'utf8')).keys
}

async function start() {
  if (!fs.existsSync('./privateKeys')) {
    throw Error(`privateKeys file not found`)
  } else if ((await getKeys()).length <= 0) {
    throw Error(`No keys defined`)
  }
  console.log(`⚙️ Starting Atia's Blessing bot (${(await getKeys()).length} addresses)`)
  checkBlessings()
}

start()
