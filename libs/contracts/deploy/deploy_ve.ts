import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ContractFactory, Signer } from 'ethers';
import { contractArtifacts, contractNetworks } from '../exports';
import { getChainId } from 'hardhat';

const deploy = (contractName: string, args: string[], signer: Signer) => {
    const artifact = contractArtifacts[contractName];
    if (!artifact) throw new Error(`Could not find artifact for ${contractName}`);
    const factory = new ContractFactory(artifact.abi, artifact.bytecode, signer);
    return factory.deploy(...args);
};

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { ethers, getNamedAccounts, network } = hre;
    const { owner } = await getNamedAccounts();
    const chainId = await getChainId();
    const signer = await ethers.getSigner(owner);
    const BPT_ADDRESS = contractNetworks[chainId].BPT;
    const votingEscrowImpl = await deploy('VotingEscrow', [], signer);
    const rewardDistributorImpl = await deploy('RewardDistributor', [], signer);
    const rewardFaucetImpl = await deploy('RewardFaucet', [], signer);
    const launchpad = await deploy(
        'Launchpad',
        [votingEscrowImpl.address, rewardDistributorImpl.address, rewardFaucetImpl.address],
        signer,
    );
    console.log('Deployed launchpad!', launchpad.address);

    let tx = await launchpad.deploy(
        BPT_ADDRESS,
        'Voted Escrow THX',
        'VeTHX',
        7776000, // 90 days
        Math.ceil(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days from now
        owner, // Admin unlock all
        owner, // Admin early unlock
    );
    tx = await tx.wait();

    const event = tx.events.find((event: any) => event.event == 'VESystemCreated');
    const { votingEscrow, rewardDistributor, rewardFaucet, admin } = event.args;
    console.log(`deploying "VotingEscrow" (tx: ${tx.transactionHash})...: deployed at ${votingEscrow}`);
    console.log(`deploying "RewardDistributor" (tx: ${tx.transactionHash})...: deployed at ${rewardDistributor}`);
    console.log(`deploying "RewardFaucet" (tx: ${tx.transactionHash})...: deployed at ${rewardFaucet}`);

    const vethx = new ethers.Contract(votingEscrow, contractArtifacts['VotingEscrow'].abi, signer);
    const rdthx = new ethers.Contract(rewardDistributor, contractArtifacts['RewardDistributor'].abi, signer);
    const rfthx = new ethers.Contract(rewardFaucet, contractArtifacts['RewardFaucet'].abi, signer);
    const smartCheckerList = await deploy('SmartWalletWhitelist', [owner], signer);
    console.log(`deploying "SmartWalletWhitelist" (tx: "")...: deployed at ${smartCheckerList.address}`);

    // Add smart wallet whitelist checker
    await vethx.commit_smart_wallet_checker(smartCheckerList.address);
    console.log('VeTHX:', 'commit_smart_wallet_checker', smartCheckerList.address);
    await vethx.apply_smart_wallet_checker();
    console.log('VeTHX:', 'apply_smart_wallet_checker', true);
    await vethx.set_early_unlock(true);
    console.log('VeTHX:', 'set_early_unlock', true);
    // await vethx.set_early_unlock_penalty_speed(1);

    // Set early exit penalty treasury to reward distributor
    await vethx.set_penalty_treasury(rewardDistributor);
    console.log('VeTHX:', 'set_penalty_treasury', rewardDistributor);

    return network.live; // Makes sure we don't redeploy on live networks
};
export default func;
func.id = 've';
func.tags = ['VotingEscrow', 'RewardDistributor', 'RewardFaucet'];
