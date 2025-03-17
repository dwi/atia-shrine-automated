import { ethers } from 'ethers';

const RONIN_RPC = 'https://ronin.drpc.org';
export const RONIN_PROVIDER = new ethers.JsonRpcProvider(RONIN_RPC, 2020, { batchMaxCount: 1, staticNetwork: ethers.Network.from(2020) });
