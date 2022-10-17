const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { diamond, assetPool, helpSign, hex2a, getDiamondCuts, createPoolRegistry } = require('./utils.js');

describe('07 RelayHub', function () {
    let solution;
    let registry, factory;
    let owner;
    let voter;

    before(async function () {
        [owner, voter] = await ethers.getSigners();
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
            'RelayHubFacet',
        ]);
        registry = await createPoolRegistry(await collector.getAddress(), 0);
        solution = await assetPool(factory.deployAssetPool(diamondCuts, registry.address));
    });
    describe('Signing access', async function () {
        it('Not manager', async function () {
            await solution.addMember(await voter.getAddress());
            const tx = await helpSign(solution, 'setRewardPollDuration', [180], voter);
            expect(tx.events[0].args.success).to.eq(false);
            expect(hex2a(tx.events[0].args.data.substr(10))).to.eq('NOT_MANAGER');
        });
        it('Wrong nonce', async function () {
            const call = solution.interface.encodeFunctionData('setRewardPollDuration', [180]);
            const hash = web3.utils.soliditySha3(call, 5);
            const sig = await owner.signMessage(ethers.utils.arrayify(hash));

            await expect(solution.call(call, 5, sig)).to.be.revertedWith('INVALID_NONCE');
        });
        it('Relayception', async function () {
            await solution.addManager(await voter.getAddress());

            const call = solution.interface.encodeFunctionData('setRewardPollDuration', [360]);
            const nonce = Number(await solution.getLatestNonce(await voter.getAddress())) + 1;
            const hash = web3.utils.soliditySha3(call, nonce);
            const sig = await voter.signMessage(ethers.utils.arrayify(hash));
            const tx = await helpSign(solution, 'call', [call, nonce, sig], owner);

            expect(tx.events[0].args.success).to.eq(true);
            expect(await solution.getRewardPollDuration()).to.eq(360);
        });
    });
    describe('Signing voting flow', async function () {
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
                'RelayHubFacet',
            ]);
            solution = await assetPool(factory.deployAssetPool(diamondCuts, registry.address));
            await solution.addMember(await voter.getAddress());
            await solution.setRewardPollDuration(180);
        });
        it('Add reward, no access', async function () {
            const tx = await helpSign(solution, 'addReward', [parseEther('5'), 180], voter);
            expect(tx.events[0].args.success).to.eq(false);
            expect(hex2a(tx.events[0].args.data.substr(10))).to.eq('NOT_OWNER');
        });
        it('Add reward', async function () {
            await helpSign(solution, 'addReward', [parseEther('5'), 180], owner);
        });
        it('Vote reward', async function () {
            await helpSign(solution, 'rewardPollVote', [1, true], owner);
        });
        it('Finalize reward', async function () {
            await ethers.provider.send('evm_increaseTime', [250]);
            await helpSign(solution, 'rewardPollFinalize', [1], owner);
        });
        it('Claim reward', async function () {
            tx = await helpSign(solution, 'claimRewardFor', [1, await voter.getAddress()], owner);
        });
        it('Vote withdraw', async function () {
            await helpSign(solution, 'withdrawPollVote', [2, true], owner);
        });
        it('Finalize withdraw', async function () {
            await ethers.provider.send('evm_increaseTime', [250]);
            await helpSign(solution, 'withdrawPollFinalize', [2], owner);
        });
    });
});
