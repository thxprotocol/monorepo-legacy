const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { events, diamond, assetPool, getDiamondCuts, createPoolRegistry } = require('./utils.js');

describe('06 reward', function () {
    let owner;
    let voter;
    let withdraw, factory, registry;

    before(async function () {
        [owner, voter] = await ethers.getSigners();
        registry = await createPoolRegistry(await collector.getAddress(), 0);
        factory = await diamond();
        const diamondCuts = await getDiamondCuts([
            'MemberAccess',
            'BasePollProxy',
            'Token',
            'Reward',
            'RewardPoll',
            'RewardPollProxy',
            'DiamondCutFacet',
            'DiamondLoupeFacet',
            'OwnershipFacet',
        ]);
        withdraw = await assetPool(factory.deployAssetPool(diamondCuts, registry.address));
        await withdraw.setRewardPollDuration(100);
    });
    it('Initial state', async function () {
        const duration = await withdraw.getRewardPollDuration();
        expect(duration).to.eq(100);
    });
    it('Test proposeWithdraw', async function () {
        expect(await withdraw.getWithdrawAmount(1)).to.eq(0);
        expect(await withdraw.getWithdrawDuration(1)).to.eq(0);
        expect(await withdraw.getRewardIndex(1)).to.eq(0);

        const ev = await events(withdraw.addReward(parseEther('1'), 500));
        expect(ev[0].args.id).to.eq(1);

        expect(await withdraw.getWithdrawAmount(1)).to.eq(parseEther('1'));
        expect(await withdraw.getWithdrawDuration(1)).to.eq(500);
        expect(await withdraw.getRewardIndex(1)).to.eq(0);
    });
    it('Test rewardPollVote', async function () {
        expect(await withdraw.getYesCounter(1)).to.eq(0);
        await withdraw.rewardPollVote(1, true);
        expect(await withdraw.getYesCounter(1)).to.eq(1);
    });
});

describe('06 reward - claim', function () {
    let owner;
    let voter;
    let solution;

    before(async function () {
        [owner, voter] = await ethers.getSigners();

        const diamondCuts = await getDiamondCuts([
            'MemberAccess',
            'Token',
            'BasePollProxy',
            'Reward',
            'RewardPoll',
            'RewardPollProxy',
            'DiamondCutFacet',
            'DiamondLoupeFacet',
            'OwnershipFacet',
        ]);

        solution = await assetPool(factory.deployAssetPool(diamondCuts, registry.address));
        await solution.setRewardPollDuration(100);
        await solution.addReward(parseEther('5'), 250);

        await solution.rewardPollVote(1, true);
        await ethers.provider.send('evm_increaseTime', [180]);
        await solution.rewardPollFinalize(1);
    });
    it('Test claimReward', async function () {
        ev = await events(solution.claimReward(1));
        const member = ev[0].args.member;
        const id = ev[0].args.id;
        expect(member).to.be.eq(await solution.getMemberByAddress(await owner.getAddress()));
        expect(id).to.be.eq(2);

        withdrawTimestamp = (await ev[0].getBlock()).timestamp;
    });
    it('basepoll storage', async function () {
        expect(await solution.getStartTime(2)).to.be.eq(withdrawTimestamp);
        expect(await solution.getEndTime(2)).to.be.eq(withdrawTimestamp + 250);
        expect(await solution.getYesCounter(2)).to.be.eq(0);
        expect(await solution.getNoCounter(2)).to.be.eq(0);
        expect(await solution.getTotalVoted(2)).to.be.eq(0);
    });
    it('Claim reward as non member', async function () {
        await expect(solution.connect(voter).claimReward(1)).to.be.revertedWith('NOT_MEMBER');
    });
    it('Claim rewardFor non member', async function () {
        await expect(solution.connect(owner).claimRewardFor(1, await voter.getAddress())).to.be.revertedWith(
            'NOT_MEMBER',
        );
    });
    it('Claim rewardFor member as non owner', async function () {
        await expect(solution.connect(voter).claimRewardFor(1, await owner.getAddress())).to.be.revertedWith(
            'NOT_MEMBER',
        );
    });
    it('Claim non reward', async function () {
        await expect(solution.connect(owner).claimReward(2)).to.be.reverted;
    });
    it('Claim disabled reward', async function () {
        await solution.disableReward(1);

        await expect(solution.claimReward(1)).to.be.revertedWith('IS_NOT_ENABLED');
    });
    it('Claim re-enabled reward', async function () {
        await solution.enableReward(1);

        await expect(solution.claimReward(1)).to.emit(solution, 'WithdrawPollCreated');
    });
});
