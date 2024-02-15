import { ethers } from 'ethers';
import { getAbiForContractName } from '@thxnetwork/api/services/ContractService';
import { BPT_ADDRESS, PRIVATE_KEY, SC_ADDRESS } from '@thxnetwork/api/config/secrets';
import { contractArtifacts } from '@thxnetwork/contracts/exports';

export default async function main() {
    const HARDHAT_RPC = 'http://127.0.0.1:8545/';
    const MINT_TO = '0x9013ae40FCd95D46BA4902F3974A71C40793680B';
    const MINT_AMOUNT = '1000';
    const hardhatProvider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, hardhatProvider) as unknown as ethers.Signer;
    const bpt = new ethers.Contract(
        BPT_ADDRESS,
        getAbiForContractName('BPT') as unknown as ethers.ContractInterface,
        signer,
    );
    await bpt.mint(MINT_TO, MINT_AMOUNT);

    const whitelist = new ethers.Contract(SC_ADDRESS, contractArtifacts['SmartWalletWhitelist'].abi, signer);
    await whitelist.approveWallet(MINT_TO);
}
