import { ethers } from 'ethers';
import { getAbiForContractName, safeVersion } from '@thxnetwork/api/services/ContractService';
import { BPT_ADDRESS, PRIVATE_KEY, SC_ADDRESS } from '@thxnetwork/api/config/secrets';
import { contractArtifacts } from '@thxnetwork/contracts/exports';
import db from '@thxnetwork/api/util/database';
import { toChecksumAddress } from 'web3-utils';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { ChainId } from '@thxnetwork/common/lib/types/enums';
import { SafeFactory } from '@safe-global/protocol-kit';
import { getProvider } from '@thxnetwork/api/util/network';

db.connect(process.env.MONGODB_URI);

const HARDHAT_RPC = 'http://127.0.0.1:8545/';
const MINT_TO = '0x9013ae40FCd95D46BA4902F3974A71C40793680B';
const MINT_AMOUNT = '1000';

// VE Whitelist
async function main() {
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

// Deploy a Safe
// async function main() {
//     const SAFE = toChecksumAddress(''); // Provide values
//     const RELAYER = toChecksumAddress(''); // Provide values
//     const ACCOUNT = toChecksumAddress(''); // Provide values
//     const wallet = await Wallet.findOne({
//         address: SAFE,
//         chainId: ChainId.Polygon,
//     });
//     if (SAFE !== wallet.address) throw new Error('Provided address does not equal Safe address.');

//     const { ethAdapter } = getProvider(ChainId.Polygon);
//     const safeFactory = await SafeFactory.create({
//         safeVersion,
//         ethAdapter,
//     });
//     const safeAccountConfig = {
//         owners: [RELAYER, ACCOUNT],
//         threshold: 2,
//     };
//     const safeAddress = await safeFactory.predictSafeAddress(safeAccountConfig);
//     console.log(safeAddress);

//     await safeFactory.deploySafe({ safeAccountConfig, options: { gasLimit: '3000000' } });
// }

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
