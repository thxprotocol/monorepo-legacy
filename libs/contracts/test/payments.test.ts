// SPDX-License-Identifier: MIT
import { ethers } from 'hardhat';
import { BigNumber, Contract } from 'ethers';
import { expect } from 'chai';
import { parseUnits } from 'ethers/lib/utils';

const deploy = async (contractName: string, args: any[]) => {
    const factory = await ethers.getContractFactory(contractName);
    return await factory.deploy(...args);
};

describe('PaymentSplitter', function () {
    const costsPerMonth = '500'; // Premium tier is 500 USDC per month
    let splitter: Contract, bpt: Contract, gauge: Contract, usdc: Contract, thx: Contract, registry: Contract;
    let owner: string, rewardDistributor: string, payee: string;

    before(async function () {
        const [signer1, signer2, signer3] = await ethers.getSigners();
        owner = await signer1.getAddress();
        rewardDistributor = await signer2.getAddress();
        payee = await signer3.getAddress();

        usdc = await deploy('USDC', [owner, parseUnits('1000000', 18).toString()]);
        thx = await deploy('THX', [owner, parseUnits('1000000', 18).toString()]);

        bpt = await deploy('BPT', [owner, parseUnits('1000000', 18).toString()]);
        gauge = await deploy('BPTGauge', [bpt.address]);

        const vault = await deploy('BalancerVault', [bpt.address, usdc.address, thx.address]);
        await bpt.setVault(vault.address);
        // Mock: Fill vault with 50% of the BPT supply to transfer upon joinPool
        await bpt.transfer(vault.address, parseUnits('500000', 18));

        registry = await deploy('THXRegistry', [
            usdc.address,
            payee, // Payout receiver
            rewardDistributor, // @dev We use an EOA here but it should be the VE RewardDistributor
            gauge.address,
        ]);
        splitter = await deploy('THXPaymentSplitter', [owner, registry.address]);
    });

    it('should return 0 if no payments made', async function () {
        const balance = await splitter.balanceOf(owner);
        expect(balance).to.equal(0);
    });

    it('should revert if not rate is set', async function () {
        expect(await splitter.rates(owner)).to.eq(0);
        await expect(splitter.deposit(owner, parseUnits(costsPerMonth, 'ether'))).to.be.revertedWith(
            'PaymentSplitter: !rate',
        );
    });

    it('should return rate per second if set', async function () {
        // @notice Real USDC.e contract has 6 decimals instead of 18
        const usdcPerMonthInWei = ethers.utils.parseUnits(costsPerMonth, 18);
        // Calculate the number of seconds in a month (we use 30 days for the sake of simplicity)
        const secondsPerMonth = 30 * 24 * 60 * 60;

        // Calculate the amount of USDC paid in wei per second.
        // @notice We loose a bit of precision here but this is acceptable
        const usdcPerSecond = usdcPerMonthInWei.div(secondsPerMonth);

        await splitter.setRate(owner, usdcPerSecond);

        // Assert for rate with precision loss due to devision
        expect(usdcPerSecond.mul(secondsPerMonth)).to.eq('499999999999999392000');

        expect(await splitter.rates(owner)).to.eq(usdcPerSecond);
    });

    it('should set payoutRate in registry', async function () {
        const [_signer1, _signer2, signer3] = await ethers.getSigners();
        const payoutRate = '3000';

        expect(await registry.getPayoutRate()).to.eq(0);

        // Can only be called by the payee. The param will be subject to snapshot votes in the future
        await expect(registry.setPayoutRate('10001')).to.be.revertedWith('THXRegistry: !payee');

        // Should revert if out of bounts. We allow for max 2 decimal percentages.
        await expect(registry.connect(signer3).setPayoutRate('10001')).to.be.revertedWith(
            'THXRegistry: payoutRate out of bounds',
        );

        await registry.connect(signer3).setPayoutRate(payoutRate);
        expect(await registry.getPayoutRate()).to.be.eq(payoutRate);
    });

    describe('should deposit to splitter', async function () {
        let payout: BigNumber;

        before(async function () {
            const amountDeposit = parseUnits(costsPerMonth, 18);
            const payoutRate = await registry.getPayoutRate();

            // Allow splitter contract to spend the amount
            await usdc.approve(splitter.address, amountDeposit);

            // Create a deposit for the amount
            await splitter.deposit(owner, amountDeposit);
            // Assert owner USDC balance (amount * payoutRate / 10000)
            payout = amountDeposit.mul(payoutRate).div(10000);
        });

        it('should forward payout to payee', async function () {
            expect(await registry.getPayee()).to.be.eq(payee);
            expect(payout).to.be.gt(0);
            expect(await usdc.balanceOf(payee)).to.be.eq(payout);
        });

        it('should forward remainder to reward distributor', async function () {
            const balance = await gauge.balanceOf(rewardDistributor);
            expect(balance).to.be.greaterThan(0);
        });

        it('should have 0 balance for token used', async function () {
            expect(await usdc.balanceOf(splitter.address)).to.be.eq(0);
            expect(await bpt.balanceOf(splitter.address)).to.be.eq(0);
            expect(await gauge.balanceOf(splitter.address)).to.be.eq(0);
        });
    });
});
