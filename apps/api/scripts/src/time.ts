import { ethers } from 'ethers';

export async function increaseBlockTime(provider, seconds) {
    await provider.send('evm_increaseTime', [seconds]);
    await provider.send('evm_mine', []);
}

export default async function main() {
    const HARDHAT_RPC = 'http://127.0.0.1:8545/';
    const hardhatProvider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC);

    // Travel past first week else this throws "Reward distribution has not started yet"
    await increaseBlockTime(hardhatProvider, 60 * 60 * 24 * 7);
}
