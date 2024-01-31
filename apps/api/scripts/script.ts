import { ethers } from 'ethers';
import { getAbiForContractName, safeVersion } from '@thxnetwork/api/services/ContractService';
import {
    BAL_ADDRESS,
    BPT_ADDRESS,
    PRIVATE_KEY,
    RD_ADDRESS,
    RF_ADDRESS,
    SC_ADDRESS,
    THX_ADDRESS,
    USDC_ADDRESS,
} from '@thxnetwork/api/config/secrets';
import { contractArtifacts } from '@thxnetwork/contracts/exports';
import db from '@thxnetwork/api/util/database';
import { toChecksumAddress } from 'web3-utils';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { ChainId } from '@thxnetwork/common/lib/types/enums';
import { SafeFactory } from '@safe-global/protocol-kit';
import { getProvider } from '@thxnetwork/api/util/network';

async function increaseBlockTime(provider, seconds) {
    await provider.send('evm_increaseTime', [seconds]);
    await provider.send('evm_mine', []);
}

db.connect(process.env.MONGODB_URI);

const HARDHAT_RPC = 'http://127.0.0.1:8545/';
const MINT_TO = '0x9013ae40FCd95D46BA4902F3974A71C40793680B';
const MINT_AMOUNT = '1000';
const RELAYER = '0x08302CF8648A961c607e3e7Bd7B7Ec3230c2A6c5';

// VE Whitelist
async function main() {
    const hardhatProvider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC);
    // const signer = new ethers.Wallet(PRIVATE_KEY, hardhatProvider) as unknown as ethers.Signer;
    // const rfthx = new ethers.Contract(RF_ADDRESS, contractArtifacts['RewardFaucet'].abi, signer);
    // const rdthx = new ethers.Contract(RD_ADDRESS, contractArtifacts['RewardDistributor'].abi, signer);
    // const bpt = new ethers.Contract(BPT_ADDRESS, contractArtifacts['BPTToken'].abi, signer);
    // const bal = new ethers.Contract(BAL_ADDRESS, contractArtifacts['BalToken'].abi, signer);
    // const thx = new ethers.Contract(THX_ADDRESS, contractArtifacts['THXToken'].abi, signer);
    // const usdc = new ethers.Contract(USDC_ADDRESS, contractArtifacts['USDCToken'].abi, signer);

    // // Whitelist and fill user wallet
    // await bpt.mint(MINT_TO, MINT_AMOUNT);
    // await thx.mint(MINT_TO, String(ethers.utils.parseUnits('5000', 'ether')));
    // await usdc.mint(MINT_TO, String(ethers.utils.parseUnits('50', 'ether')));
    // const whitelist = new ethers.Contract(SC_ADDRESS, contractArtifacts['SmartWalletWhitelist'].abi, signer);
    // await whitelist.approveWallet(MINT_TO);

    // // Deploy rewards
    // const amountBPT = String(ethers.utils.parseUnits('100000', 'ether'));
    // const amountBAL = String(ethers.utils.parseUnits('1000', 'ether'));

    // Travel past first week else this throws "Reward distribution has not started yet"
    await increaseBlockTime(hardhatProvider, 60 * 60 * 24 * 7);

    // // Add test THX as allowed reward token (incentive)
    // await rdthx.addAllowedRewardTokens([bpt.address, bal.address]);

    // // Mint 10000 tokens for relayer to deposit into reward distributor
    // await bpt.mint(RELAYER, amountBPT);
    // // Mint 100 BAL for relayer to deposit into reward distributor
    // await bal.mint(RELAYER, amountBAL);

    // // Deposit 10000 tokens into rdthx
    // await bpt.approve(rfthx.address, amountBPT);
    // await bal.approve(rfthx.address, amountBAL);
    // await rfthx.depositEqualWeeksPeriod(bpt.address, amountBPT, '4');
    // await rfthx.depositEqualWeeksPeriod(bal.address, amountBAL, '4');
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
