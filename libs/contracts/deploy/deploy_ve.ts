import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ContractFactory, Signer } from 'ethers';
import { contractArtifacts } from '../exports';
import { parseUnits } from 'ethers/lib/utils';

const deploy = async (contractName: string, args: string[], signer: Signer) => {
    const artifact = contractArtifacts[contractName];
    if (!artifact) throw new Error(`Could not find artifact for ${contractName}`);
    const factory = new ContractFactory(artifact.abi, artifact.bytecode, signer);
    const tx = await factory.deploy(...args);
    console.log(`deploying "${contractName}" (tx: "")...: deployed at ${tx.address}`);
    return tx;
};

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { ethers, getNamedAccounts, network } = hre;
    const { owner } = await getNamedAccounts();
    const signer = await ethers.getSigner(owner);

    // Deploy implementations
    const votingEscrowImpl = await deploy('VotingEscrow', [], signer);
    const rewardDistributorImpl = await deploy('RewardDistributor', [], signer);
    const rewardFaucetImpl = await deploy('RewardFaucet', [], signer);

    // Deploy tokens
    const thx = await deploy('THX', [signer.address, parseUnits('1000000', 'ether').toString()], signer);
    const usdc = await deploy('USDC', [signer.address, parseUnits('1000000', 'ether').toString()], signer);
    const balToken = await deploy('BAL', [signer.address, parseUnits('1000000', 'ether').toString()], signer);
    const bptToken = await deploy('BPT', [signer.address, parseUnits('1000000', 'ether').toString()], signer);
    const bptGaugeToken = await deploy('BPTGauge', [bptToken.address], signer);
    const balancerVault = await deploy('BalancerVault', [bptToken.address, usdc.address, thx.address], signer);

    await bptToken.setVault(balancerVault.address);
    // Transfer 50% of the BPT to BalancerVault for testing create liquidity flows
    await bptToken.transfer(balancerVault.address, parseUnits('500000', 'ether').toString());

    // Deploy VE launhpad
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
        bptGaugeToken.address,
        'Voted Escrow 20USDC-80THX-gauge',
        'veTHX',
        7776000, // 90 days
        Math.ceil(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days from now
        owner, // admin_unlock_all
        owner, // admin_early_unlock
        '0x0000000000000000000000000000000000000000', // empty will set it to the rewardDistributor
    );

    tx = await tx.wait();

    const event = tx.events.find((event: any) => event.event == 'VESystemCreated');
    const { votingEscrow, rewardDistributor, rewardFaucet } = event.args;
    console.log(`deploying "VotingEscrow" (tx: ${tx.transactionHash})...: deployed at ${votingEscrow}`);
    console.log(`deploying "RewardDistributor" (tx: ${tx.transactionHash})...: deployed at ${rewardDistributor}`);
    console.log(`deploying "RewardFaucet" (tx: ${tx.transactionHash})...: deployed at ${rewardFaucet}`);

    const vethx = new ethers.Contract(votingEscrow, contractArtifacts['VotingEscrow'].abi, signer);
    const rdthx = new ethers.Contract(rewardDistributor, contractArtifacts['RewardDistributor'].abi, signer);
    const smartCheckerList = await deploy('SmartWalletWhitelist', [owner], signer);

    await deploy('LensReward', [], signer);

    // Configure reward tokens in reward distributor
    await rdthx.addAllowedRewardTokens([balToken.address, bptToken.address]);

    // Add smart wallet whitelist checker
    await vethx.commit_smart_wallet_checker(smartCheckerList.address);
    console.log('veTHX:', 'commit_smart_wallet_checker', smartCheckerList.address);

    await vethx.apply_smart_wallet_checker();
    console.log('veTHX:', 'apply_smart_wallet_checker', true);

    await vethx.set_early_unlock(true);
    console.log('veTHX:', 'set_early_unlock', true);
    // await vethx.set_early_unlock_penalty_speed(1); //Default

    // Set early exit penalty treasury to reward distributor
    await vethx.set_penalty_treasury(rewardDistributor);
    console.log('veTHX:', 'set_penalty_treasury', rewardDistributor);

    // Allow all contract wallets
    await smartCheckerList.setAllowAll(true);

    // Deploy THXRegistry
    const registry = await deploy('THXRegistry', [usdc.address, owner, rdthx.address, bptGaugeToken.address], signer);
    await registry.setPayoutRate('3000'); // 30%

    // Deploy PaymentSplitter
    const splitter = await deploy('THXPaymentSplitter', [owner, registry.address], signer);
    await splitter.setRegistry(registry.address);

    return network.live; // Makes sure we don't redeploy on live networks
};
export default func;
func.id = 've';
func.tags = ['VotingEscrow', 'RewardDistributor', 'RewardFaucet', 'Registry', 'PaymentSplitter'];
