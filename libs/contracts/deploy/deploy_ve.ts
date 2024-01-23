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
    const { owner, balReceiver } = await getNamedAccounts();
    const chainId = await getChainId();
    const signer = await ethers.getSigner(owner);
    const BPT_ADDRESS = contractNetworks[chainId].BPT;
    const votingEscrowImpl = await deploy('VotingEscrow', [], signer);
    const rewardDistributorImpl = await deploy('RewardDistributor', [], signer);
    const rewardFaucetImpl = await deploy('RewardFaucet', [], signer);
    const balToken = await deploy('BalToken', [], signer);
    const balMinter = await deploy('BalMinter', [balToken.address], signer);
    const launchpad = await deploy(
        'Launchpad',
        [
            votingEscrowImpl.address,
            rewardDistributorImpl.address,
            rewardFaucetImpl.address,
            balToken.address,
            balMinter.address,
        ],
        signer,
    );
    console.log('Deployed launchpad!', launchpad.address);

    /*
    @notice Deploys new VotingEscrow, RewardDistributor and RewardFaucet contracts
    @param tokenBptAddr The address of the token to be used for locking
    @param name The name for the new VotingEscrow contract
    @param symbol The symbol for the new VotingEscrow contract
    @param maxLockTime A constraint for the maximum lock time in the new VotingEscrow contract
    @param rewardDistributorStartTime The start time for reward distribution
    @param admin_unlock_all Admin address to enable unlock-all feature in VotingEscrow (zero-address to disable forever)
    @param admin_early_unlock Admin address to enable eraly-unlock feature in VotingEscrow (zero-address to disable forever)
    @param rewardReceiver The receiver address of claimed BAL-token rewards
    */
    let tx = await launchpad.deploy(
        BPT_ADDRESS,
        'Voted Escrow THX',
        'VeTHX',
        7776000, // 90 days
        Math.ceil(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days from now
        owner, // admin_unlock_all
        owner, // admin_early_unlock
        balReceiver, // rewardReceiver 0xaf9d56684466fcFcEA0a2B7fC137AB864d642946
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
    const lensReward = await deploy('LensReward', [], signer);
    console.log(`deploying "LensReward" (tx: "")...: deployed at ${lensReward.address}`);

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
