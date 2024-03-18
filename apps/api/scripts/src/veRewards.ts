import { ethers } from 'ethers';
import { PRIVATE_KEY } from '@thxnetwork/api/config/secrets';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { ChainId } from '@thxnetwork/common/enums';
import { parseUnits } from 'ethers/lib/utils';

export default async function main() {
    const HARDHAT_RPC = 'http://127.0.0.1:8545/';
    const hardhatProvider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC);
    const chainId = ChainId.Hardhat;
    const signer = new ethers.Wallet(PRIVATE_KEY, hardhatProvider) as unknown as ethers.Signer;
    const bpt = new ethers.Contract(contractNetworks[chainId].BPT, contractArtifacts['BPT'].abi, signer);
    const bal = new ethers.Contract(contractNetworks[chainId].BAL, contractArtifacts['BAL'].abi, signer);
    const ve = new ethers.Contract(
        contractNetworks[chainId].VotingEscrow,
        contractArtifacts['VotingEscrow'].abi,
        signer,
    );
    const rf = new ethers.Contract(
        contractNetworks[chainId].RewardFaucet,
        contractArtifacts['RewardFaucet'].abi,
        signer,
    );
    const rd = new ethers.Contract(
        contractNetworks[chainId].RewardDistributor,
        contractArtifacts['RewardDistributor'].abi,
        signer,
    );
    const AMOUNT = parseUnits('1000').toString();

    await rf.distributePastRewards(bpt.address);
    await rf.distributePastRewards(bal.address);

    // Deposit reward tokens into rdthx
    await bpt.approve(rf.address, AMOUNT);
    await bal.approve(rf.address, AMOUNT);

    // Claim all pending BAL rewards and prepare for distriubtion
    // await ve.claimExternalRewards();
    // Mock externalRewards by transfering directly into rd
    await bal.transfer(rd.address, AMOUNT);

    // Spread the amount evenly over 4 weeks from the current block
    // Can only run after reward distribution has started
    await rf.depositEqualWeeksPeriod(bpt.address, AMOUNT, '4');
    await rf.depositEqualWeeksPeriod(bal.address, AMOUNT, '4');
}
