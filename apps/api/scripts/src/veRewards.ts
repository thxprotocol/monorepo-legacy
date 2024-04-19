import { ethers } from 'ethers';
import { PRIVATE_KEY } from '@thxnetwork/api/config/secrets';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { ChainId } from '@thxnetwork/common/enums';
import { parseUnits } from 'ethers/lib/utils';
import { increaseBlockTime } from './time';

export default async function main() {
    const HARDHAT_RPC = 'http://127.0.0.1:8545/';
    const hardhatProvider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC);
    const chainId = ChainId.Hardhat;
    const signer = new ethers.Wallet(PRIVATE_KEY, hardhatProvider) as unknown as ethers.Signer;
    const bpt = new ethers.Contract(contractNetworks[chainId].BPT, contractArtifacts['BPT'].abi, signer);
    const bal = new ethers.Contract(contractNetworks[chainId].BAL, contractArtifacts['BAL'].abi, signer);
    const rewardFaucet = new ethers.Contract(
        contractNetworks[chainId].RewardFaucet,
        contractArtifacts['RewardFaucet'].abi,
        signer,
    );
    const AMOUNTBAL = parseUnits('100').toString();
    const AMOUNTBPT = parseUnits('1000').toString();

    // Travel past reward distribution start time
    await increaseBlockTime(hardhatProvider, 60 * 60 * 24 * 7);

    // Deposit reward tokens into rdthx
    await bal.approve(rewardFaucet.address, AMOUNTBAL);
    await bpt.approve(rewardFaucet.address, AMOUNTBPT);

    // // Claim all pending BAL rewards and prepare for distriubtion
    // // await ve.claimExternalRewards();
    // // Mock externalRewards by transfering directly into rd
    // await bal.transfer(rd.address, AMOUNT);

    // Make sure to redistribute past rewards before depositing
    // await rf.distributePastRewards(bpt.address);
    // await rf.distributePastRewards(bal.address);

    // Spread the amount evenly over 4 weeks from the current block
    // Can only run after reward distribution has started
    const tx1 = await rewardFaucet.depositEqualWeeksPeriod(bal.address, AMOUNTBAL, '4');
    console.log(await tx1.wait());
    const tx2 = await rewardFaucet.depositEqualWeeksPeriod(bpt.address, AMOUNTBPT, '4');
    console.log(await tx2.wait());

    console.log(await rewardFaucet.getUpcomingRewardsForNWeeks(bal.address, '4'));
    console.log(await rewardFaucet.getUpcomingRewardsForNWeeks(bpt.address, '4'));
}
