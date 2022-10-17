const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { ethers } = require('hardhat');
const { constants, BigNumber, Wallet } = require('ethers');
const {
    events,
    diamond,
    timestamp,
    assetPool,
    helpSign,
    getDiamondCuts,
    createPoolRegistry,
    createTokenFactory,
} = require('./utils.js');

const multiplier = BigNumber.from('10').pow(15);
const twoHalfPercent = BigNumber.from('25').mul(multiplier);

describe('05 withdraw', function () {
    let owner;
    let withdraw, registry, factory;

    before(async function () {
        [owner, voter] = await ethers.getSigners();
        registry = await createPoolRegistry(await collector.getAddress(), 0);
        factory = await diamond();
        const diamondCuts = await getDiamondCuts([
            'MemberAccess',
            'Token',
            'BasePollProxy',
            'Withdraw',
            'WithdrawPoll',
            'WithdrawPollProxy',
            'DiamondCutFacet',
            'DiamondLoupeFacet',
            'OwnershipFacet',
        ]);

        withdraw = await assetPool(factory.deployAssetPool(diamondCuts, registry.address));
        await withdraw.setProposeWithdrawPollDuration(100);
    });
    it('Initial state', async function () {
        const duration = await withdraw.getProposeWithdrawPollDuration();
        expect(duration).to.eq(100);
    });
    it('Test proposeWithdraw', async function () {
        expect(await withdraw.getAmount(1)).to.eq(0);
        expect(await withdraw.getBeneficiary(1)).to.eq(constants.AddressZero);

        const ev = await events(withdraw.proposeWithdraw(parseEther('1'), await owner.getAddress()));

        expect(ev[0].args.id).to.eq(1);
        expect(await withdraw.getAmount(1)).to.eq(parseEther('1'));
        expect(await withdraw.getBeneficiary(1)).to.eq(1001);
    });
    it('Test proposeBulkWithdraw', async function () {
        const amounts = [],
            beneficiaries = [];
        for (let i = 0; i < 10; i++) {
            const signer = Wallet.createRandom();
            amounts.push(parseEther('1'));
            beneficiaries.push(await signer.getAddress());
        }
        const logs = await events(withdraw.proposeBulkWithdraw(amounts, beneficiaries));
        expect(logs.filter((e) => e.event === 'RoleGranted').length).to.eq(10);
        expect(logs.filter((e) => e.event === 'WithdrawPollCreated').length).to.eq(10);
        // expect(await withdraw.getAmount(i)).to.eq(parseEther('1'));
        // expect(await withdraw.getBeneficiary(i)).to.eq(1000 + i);
    });
    it('Test withdrawPollVote', async function () {
        expect(await withdraw.getYesCounter(1)).to.eq(0);
        await withdraw.withdrawPollVote(1, true);
        expect(await withdraw.getYesCounter(1)).to.eq(1);
    });
});

describe('05 - proposeWithdraw', function () {
    let withdraw;

    let owner;
    let voter;
    let poolMember;
    let token, registry;

    let withdrawTimestamp;

    before(async function () {
        [owner, voter, poolMember, collector] = await ethers.getSigners();
        const ExampleToken = await ethers.getContractFactory('ExampleToken');
        token = await ExampleToken.deploy(await owner.getAddress(), parseEther('1000000'));

        registry = await createPoolRegistry(await collector.getAddress(), twoHalfPercent);

        const diamondCuts = await getDiamondCuts([
            'MemberAccess',
            'Token',
            'BasePollProxy',
            'Withdraw',
            'WithdrawPoll',
            'WithdrawPollProxy',
            'RelayHubFacet',
            'DiamondCutFacet',
            'DiamondLoupeFacet',
            'OwnershipFacet',
        ]);

        withdraw = await assetPool(factory.deployAssetPool(diamondCuts, registry.address));
        await withdraw.addToken(token.address);
        await token.approve(withdraw.address, parseEther('1000'));
        await withdraw.deposit(parseEther('1000'));
        expect(await token.balanceOf(await collector.getAddress())).to.eq(parseEther('25'));
        await withdraw.setProposeWithdrawPollDuration(100);
    });
    it('Test proposeWithdraw', async function () {
        const ev = await events(withdraw.proposeWithdraw(parseEther('10'), await poolMember.getAddress()));
        expect(ev[1].args.member).to.eq(await withdraw.getMemberByAddress(await poolMember.getAddress()));

        withdrawTimestamp = (await ev[0].getBlock()).timestamp;
    });
    it('withdrawPoll storage', async function () {
        expect(await withdraw.getBeneficiary(1)).to.be.eq(
            await withdraw.getMemberByAddress(await poolMember.getAddress()),
        );
        expect(await withdraw.getAmount(1)).to.be.eq(parseEther('10'));
    });
    it('basepoll storage', async function () {
        expect(await withdraw.getStartTime(1)).to.be.eq(withdrawTimestamp);
        expect(await withdraw.getEndTime(1)).to.be.eq(withdrawTimestamp + 100);
        expect(await withdraw.getYesCounter(1)).to.be.eq(0);
        expect(await withdraw.getNoCounter(1)).to.be.eq(0);
        expect(await withdraw.getTotalVoted(1)).to.be.eq(0);
    });
    it('Verify current approval state', async function () {
        expect(await withdraw.withdrawPollApprovalState(1)).to.be.eq(false);
    });
    it('propose reward as non member', async function () {
        await expect(
            withdraw.connect(voter).proposeWithdraw(parseEther('20'), await owner.getAddress()),
        ).to.be.revertedWith('NOT_OWNER');
    });
    it('vote', async function () {
        voteTxTimestamp = await timestamp(withdraw.withdrawPollVote(1, true));
        expect(await withdraw.getYesCounter(1)).to.be.eq(1);
        expect(await withdraw.getNoCounter(1)).to.be.eq(0);
        expect(await withdraw.getTotalVoted(1)).to.be.eq(1);

        const vote = await withdraw.getVoteByAddress(1, owner.getAddress());
        expect(vote.time).to.be.eq(voteTxTimestamp);
        expect(vote.weight).to.be.eq(1);
        expect(vote.agree).to.be.eq(true);
    });
    it('finalize', async function () {
        expect(await token.balanceOf(await poolMember.getAddress())).to.eq(0);
        expect(await withdraw.getBalance()).to.eq(parseEther('975'));
        expect(await token.balanceOf(withdraw.address)).to.eq(parseEther('975'));

        await ethers.provider.send('evm_increaseTime', [180]);
        await expect(withdraw.withdrawPollFinalize(1)).to.emit(withdraw, 'WithdrawFeeCollected');
        expect(await token.balanceOf(await poolMember.getAddress())).to.eq(parseEther('10'));
        expect(await token.balanceOf(await collector.getAddress())).to.eq(parseEther('25.25'));
        expect(await token.balanceOf(withdraw.address)).to.eq(parseEther('964.75'));
        expect(await withdraw.getBalance()).to.eq(parseEther('964.75'));
    });
});

describe('05 - UnlimitedSupplyToken', function () {
    let withdraw;
    let poolMember;
    let token;

    before(async function () {
        [owner, voter, poolMember, collector] = await ethers.getSigners();
        const UnlimitedSupplyToken = await ethers.getContractFactory('UnlimitedSupplyToken');
        const diamondCuts = await getDiamondCuts([
            'MemberAccess',
            'Token',
            'BasePollProxy',
            'Withdraw',
            'WithdrawPoll',
            'WithdrawPollProxy',
            'RelayHubFacet',
            'DiamondCutFacet',
            'DiamondLoupeFacet',
            'OwnershipFacet',
        ]);

        registry = await createPoolRegistry(await collector.getAddress(), 0);
        withdraw = await assetPool(factory.deployAssetPool(diamondCuts, registry.address));
        token = await UnlimitedSupplyToken.deploy('Test Token', 'TST', [withdraw.address], await owner.getAddress());
        await withdraw.addToken(token.address);
        await withdraw.setProposeWithdrawPollDuration(100);
        await withdraw.addMember(await poolMember.getAddress());
        await withdraw.proposeWithdraw(parseEther('1'), await poolMember.getAddress());
        await withdraw.withdrawPollVote(1, true);
    });

    it('finalize', async function () {
        expect(await token.balanceOf(await poolMember.getAddress())).to.eq(0);
        expect(await withdraw.getBalance()).to.eq(0);
        expect(await token.balanceOf(withdraw.address)).to.eq(0);

        await ethers.provider.send('evm_increaseTime', [180]);
        await withdraw.withdrawPollFinalize(1);
        expect(await token.balanceOf(await poolMember.getAddress())).to.eq(parseEther('1'));

        expect(await withdraw.getBalance()).to.eq(0);
        expect(await token.balanceOf(withdraw.address)).to.eq(0);
    });
});
