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
    const TO = '0x9013ae40FCd95D46BA4902F3974A71C40793680B';
    const AMOUNT = parseUnits('10000').toString();
    const chainId = ChainId.Hardhat;
    const signer = new ethers.Wallet(PRIVATE_KEY, hardhatProvider) as unknown as ethers.Signer;

    const bpt = new ethers.Contract(contractNetworks[chainId].BPT, contractArtifacts['BPT'].abi, signer);
    const thx = new ethers.Contract(contractNetworks[chainId].THX, contractArtifacts['THX'].abi, signer);
    const usdc = new ethers.Contract(contractNetworks[chainId].USDC, contractArtifacts['USDC'].abi, signer);

    await bpt.transfer(TO, AMOUNT);
    await thx.transfer(TO, AMOUNT);
    await usdc.transfer(TO, AMOUNT);

    const whitelist = new ethers.Contract(
        contractNetworks[chainId].SmartWalletWhitelist,
        contractArtifacts['SmartWalletWhitelist'].abi,
        signer,
    );
    await whitelist.approveWallet(TO);

    // Travel past first week else this throws "Reward distribution has not started yet"
    await increaseBlockTime(hardhatProvider, 60 * 60 * 24 * 7);
}
