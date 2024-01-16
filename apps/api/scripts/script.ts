import { ethers } from 'ethers';
import { getAbiForContractName } from '@thxnetwork/api/config/contracts';
import { BPT_ADDRESS, PRIVATE_KEY } from '@thxnetwork/api/config/secrets';
import db from '@thxnetwork/api/util/database';

db.connect(process.env.MONGODB_URI);

const HARDHAT_RPC = 'http://127.0.0.1:8545/';
const MINT_TO = '0x9013ae40FCd95D46BA4902F3974A71C40793680B';
const MINT_AMOUNT = '1000';

async function main() {
    const hardhatProvider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, hardhatProvider) as unknown as ethers.Signer;
    const abi = getAbiForContractName('BPT') as unknown as ethers.ContractInterface;
    const bpt = new ethers.Contract(BPT_ADDRESS, abi, signer);

    await bpt.mint(MINT_TO, MINT_AMOUNT);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
