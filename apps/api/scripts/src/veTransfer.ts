import { ethers } from 'ethers';
import { PRIVATE_KEY } from '@thxnetwork/api/config/secrets';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { ChainId } from '@thxnetwork/common/enums';
import { parseUnits } from 'ethers/lib/utils';

export default async function main() {
    const HARDHAT_RPC = 'http://127.0.0.1:8545/';
    const hardhatProvider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC);
    // const TO = '0x9013ae40FCd95D46BA4902F3974A71C40793680B';
    const TO = '0xaf9d56684466fcFcEA0a2B7fC137AB864d642946';

    const AMOUNT = parseUnits('10000').toString();
    const chainId = ChainId.Hardhat;
    const signer = new ethers.Wallet(PRIVATE_KEY, hardhatProvider) as unknown as ethers.Signer;
    const bpt = new ethers.Contract(contractNetworks[chainId].BPT, contractArtifacts['BPT'].abi, signer);

    await bpt.transfer(TO, AMOUNT);
}
