import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { constants, Contract, Signer } from 'ethers';
import { getDiamondCuts, deployFactory, deployRegistry, deploy, deployToken } from './utils';
import { ethers } from 'hardhat';

const onePercent = ethers.BigNumber.from('10').pow(16);

describe('ERC20SwapFacet', function () {
    let owner: Signer,
        collector: Signer,
        bob: Signer,
        registry: Contract,
        diamond: Contract,
        erc20A: Contract,
        erc20B: Contract;

    before(async function () {
        [owner, collector, bob] = await ethers.getSigners();
        registry = await deployRegistry(await collector.getAddress(), String(onePercent));

        const factory = await deployFactory(await owner.getAddress(), registry.address);

        erc20A = await deployToken('LimitedSupplyToken', [
            'Test Token A',
            'TESTA',
            await owner.getAddress(),
            parseEther('1000000'),
        ]);
        erc20B = await deployToken('LimitedSupplyToken', [
            'Test Token B',
            'TESTB',
            await bob.getAddress(),
            parseEther('1000000'),
        ]);
        diamond = await deploy(
            factory,
            await getDiamondCuts(['RegistryProxyFacet', 'ERC20ProxyFacet', 'ERC20SwapFacet']),
            erc20A.address,
        );

        await erc20A.transfer(diamond.address, parseEther('1000000'));
    });

    it('Test set swap rule', async function () {
        const multiplier = 10;
        await expect(diamond.setSwapRule(erc20B.address, multiplier)).to.emit(diamond, 'ERC20SwapRuleUpdated');
        expect(await diamond.getSwapRule(erc20B.address)).to.eq(multiplier);
    });

    it('Test swap', async function () {
        // Approvals
        await erc20A.approve(diamond.address, constants.MaxUint256);
        await erc20B.connect(bob).approve(diamond.address, constants.MaxUint256);

        // Bob swaps 10 token in Alice her pool
        expect(await erc20B.balanceOf(await bob.getAddress())).to.eq(parseEther('1000000'));
        expect(await erc20B.balanceOf(await registry.feeCollector())).to.eq(parseEther('0'));
        await expect(diamond.swapFor(await bob.getAddress(), parseEther('10'), erc20B.address)).to.emit(
            diamond,
            'ERC20SwapFor',
        );
        expect(await erc20B.balanceOf(await bob.getAddress())).to.eq(parseEther('999990'));

        // Bob receives 100 token from the pools
        expect(await diamond.balanceOf(bob.getAddress())).to.eq(parseEther('100'));

        // The pool receives 9.9 ABC from Bob
        expect(await erc20B.balanceOf(diamond.address)).to.eq(parseEther('9.9'));

        //The FeeCollector receives 0.1 token2 from the pool (1%)
        expect(await erc20B.balanceOf(await registry.feeCollector())).to.eq(parseEther('0.1'));
    });
});
