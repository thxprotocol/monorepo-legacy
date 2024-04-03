import { ethers } from 'ethers';
import { PRIVATE_KEY } from '@thxnetwork/api/config/secrets';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { ChainId } from '@thxnetwork/common/enums';
import { parseUnits } from 'ethers/lib/utils';

async function increaseBlockTime(provider, seconds) {
    await provider.send('evm_increaseTime', [seconds]);
    await provider.send('evm_mine', []);
}

export default async function main() {
    const HARDHAT_RPC = 'http://127.0.0.1:8545/';
    const hardhatProvider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC);
    const TO = '0xaf9d56684466fcFcEA0a2B7fC137AB864d642946';
    // const TO = '0x7b8fc09eb5D80eadA6AE74b112463eA006DC25B5';
    const AMOUNT_USDC = parseUnits('10000').toString();
    const AMOUNT_THX = parseUnits('10000').toString();
    const chainId = ChainId.Hardhat;
    const signer = new ethers.Wallet(PRIVATE_KEY, hardhatProvider) as unknown as ethers.Signer;

    const usdc = new ethers.Contract(contractNetworks[chainId].USDC, contractArtifacts['USDC'].abi, signer);
    await usdc.transfer(TO, AMOUNT_USDC);

    const thx = new ethers.Contract(contractNetworks[chainId].THX, contractArtifacts['THX'].abi, signer);
    await thx.transfer(TO, AMOUNT_THX);

    // Increase time till past veTHX reward distribution start time
    // await increaseBlockTime(hardhatProvider, 60 * 60 * 24 * 7);
}
