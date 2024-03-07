import { PRIVATE_KEY } from '@thxnetwork/api/config/secrets';
import { ChainId } from '@thxnetwork/common/enums';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { ethers } from 'ethers';

async function increaseBlockTime(provider, seconds) {
    await provider.send('evm_increaseTime', [seconds]);
    await provider.send('evm_mine', []);
}

const HARDHAT_RPC = 'http://127.0.0.1:8545/';
const MINT_TO = '0x9013ae40FCd95D46BA4902F3974A71C40793680B';
const MINT_AMOUNT = '1000';
const RELAYER = '0x08302CF8648A961c607e3e7Bd7B7Ec3230c2A6c5';

// Get current reward amount for user address
export default async function main() {
    // const { signer } = getProvider(ChainId.Polygon);
    // const { abi } = contractArtifacts['LensReward'];
    // // const lens = await new ethers.ContractFactory(abi, bytecode, signer).deploy();
    // const lens = new ethers.Contract('0x6f908EFc188DB4D9d1b5635E1B8F6C594B7df069', abi, signer);
    // const { claimableAmount } = await lens.callStatic.getUserClaimableReward(
    //     toChecksumAddress('0x417e1bCF39742534ae65988E4Eb3eAC1A243cBC0'),
    //     toChecksumAddress('0xD8F8D283092094B9C88E566DB1A8B72513C7809b'),
    //     toChecksumAddress('0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3'),
    // );
    // console.log(claimableAmount);

    const chainId = ChainId.Polygon;
    const hardhatProvider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, hardhatProvider) as unknown as ethers.Signer;
    const rfthx = new ethers.Contract(
        contractNetworks[chainId].RewardFaucet,
        contractArtifacts['RewardFaucet'].abi,
        signer,
    );
    const rdthx = new ethers.Contract(
        contractNetworks[chainId].RewardDistributor,
        contractArtifacts['RewardDistributor'].abi,
        signer,
    );
    const bpt = new ethers.Contract(contractNetworks[chainId].BPT, contractArtifacts['BPT'].abi, signer);
    const bal = new ethers.Contract(contractNetworks[chainId].BAL, contractArtifacts['BalToken'].abi, signer);
    const usdc = new ethers.Contract(contractNetworks[chainId].USDC, contractArtifacts['USDCToken'].abi, signer);

    // Whitelist and fill user wallet
    await bpt.mint(MINT_TO, MINT_AMOUNT);
    await usdc.mint(MINT_TO, String(ethers.utils.parseUnits('50', 'ether')));
    const whitelist = new ethers.Contract(
        contractNetworks[chainId].SmartWalletWhitelist,
        contractArtifacts['SmartWalletWhitelist'].abi,
        signer,
    );
    await whitelist.approveWallet(MINT_TO);

    // Deploy rewards
    const amountBPT = String(ethers.utils.parseUnits('100000', 'ether'));
    const amountBAL = String(ethers.utils.parseUnits('1000', 'ether'));

    // Travel past first week else this throws "Reward distribution has not started yet"
    await increaseBlockTime(hardhatProvider, 60 * 60 * 24 * 7);
}
