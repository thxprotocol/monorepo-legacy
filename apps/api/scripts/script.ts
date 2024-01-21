import { ethers } from 'ethers';
import { getAbiForContractName } from '@thxnetwork/api/services/ContractService';
import { API_URL, AUTH_URL, BPT_ADDRESS, PRIVATE_KEY, SC_ADDRESS } from '@thxnetwork/api/config/secrets';
import { contractArtifacts } from '@thxnetwork/contracts/exports';
import db from '@thxnetwork/api/util/database';
// import { THXAPIClient } from '@thxnetwork/sdk/clients';
// import axios from 'axios';
// import https from 'https';

db.connect(process.env.MONGODB_URI);

const HARDHAT_RPC = 'http://127.0.0.1:8545/';
const MINT_TO = '0x9013ae40FCd95D46BA4902F3974A71C40793680B';
const MINT_AMOUNT = '1000';

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

// async function main() {
//     const httpsAgent = new https.Agent({
//         rejectUnauthorized: false,
//     });
//     axios.defaults.httpsAgent = httpsAgent;

//     const thx = new THXAPIClient({
//         apiUrl: API_URL,
//         authUrl: AUTH_URL,
//         clientId: 'upncx25698snr7w2xcEiY',
//         clientSecret: 'WU_lvzq-FEYVIFMY3zGKpx6FkkbyDS5fGAh16S2NkhwtjbLXpmk9aSoAvY21APx10d-CGzElPkqdhuSkuFk_qA',
//     });
//     const id = await thx.identity.create();
//     console.log(id);
// }

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
