import { ethers } from 'ethers';
import { getAbiForContractName, safeVersion } from '@thxnetwork/api/services/ContractService';
import { API_URL, AUTH_URL, BPT_ADDRESS, PRIVATE_KEY, SC_ADDRESS } from '@thxnetwork/api/config/secrets';
import { contractArtifacts } from '@thxnetwork/contracts/exports';
import db from '@thxnetwork/api/util/database';
import { toChecksumAddress } from 'web3-utils';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { ChainId } from '@thxnetwork/common/lib/types/enums';
import { SafeFactory } from '@safe-global/protocol-kit';
import { getProvider } from '@thxnetwork/api/util/network';
import { THXAPIClient } from '@thxnetwork/sdk/clients/';
import SafeService from '@thxnetwork/api/services/SafeService';
import { PointBalance } from '@thxnetwork/api/models/PointBalance';
import { Participant } from '@thxnetwork/api/models/Participant';

db.connect(process.env.MONGODB_URI_PROD);

const HARDHAT_RPC = 'http://127.0.0.1:8545/';
const MINT_TO = '0x9013ae40FCd95D46BA4902F3974A71C40793680B';
const MINT_AMOUNT = '1000';

// VE Whitelist
async function main() {
    // const thx = new THXAPIClient({
    //     authUrl: AUTH_URL,
    //     apiUrl: API_URL,
    //     clientId: 'BitG_fGJI5k70kQgEeyID',
    //     clientSecret: 'pniCrGc49hb_l18_MrpahhJC8SexAV1nHE9RR9CkZA2qA_YbRmJd1hSHl5fcpJA1ngmRwuoys47JfLtYJDlSgA',
    // });
    // await thx.events.create({ event: 'test', identity: '4de81b20-c71d-11ee-ac82-a970a9e4ebc4' });

    const chunks = Array.from({ length: 36 }, (_, i) => i * 1000);
    const walletList = await Wallet.find({ sub: { $exists: true } });
    const checks = {};
    for (const skip of chunks) {
        const operations = [];
        const pointBalances = await PointBalance.find().skip(skip).limit(1000);

        for (const pointBalance of pointBalances) {
            const wallets = walletList.filter((w) => String(w._id) === pointBalance.walletId && w.sub);
            if (!wallets.length || wallets.length > 1) continue;

            operations.push({
                updateOne: {
                    filter: { sub: wallets[0].sub, poolId: pointBalance.poolId },
                    update: { $set: { balance: Number(pointBalance.balance) } },
                },
            });
        }

        await Participant.bulkWrite(operations);
        console.log(new Date(), 'chunk', skip, operations.length, Object.values(checks).length);
    }
}

// VE Whitelist
// async function main() {
//     const thx = new THXAPIClient({
//         authUrl: AUTH_URL,
//         apiUrl: API_URL,
//         clientId: 'BitG_fGJI5k70kQgEeyID',
//         clientSecret: 'pniCrGc49hb_l18_MrpahhJC8SexAV1nHE9RR9CkZA2qA_YbRmJd1hSHl5fcpJA1ngmRwuoys47JfLtYJDlSgA',
//     });

//     await thx.events.create({ event: 'test', identity: '4de81b20-c71d-11ee-ac82-a970a9e4ebc4' });

//     const hardhatProvider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC);
//     const signer = new ethers.Wallet(PRIVATE_KEY, hardhatProvider) as unknown as ethers.Signer;
//     const bpt = new ethers.Contract(
//         BPT_ADDRESS,
//         getAbiForContractName('BPT') as unknown as ethers.ContractInterface,
//         signer,
//     );
//     await bpt.mint(MINT_TO, MINT_AMOUNT);
//     const whitelist = new ethers.Contract(SC_ADDRESS, contractArtifacts['SmartWalletWhitelist'].abi, signer);
//     await whitelist.approveWallet(MINT_TO);
// }

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
