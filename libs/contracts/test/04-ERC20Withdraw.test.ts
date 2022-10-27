import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { constants, Contract, Signer } from 'ethers';
import { getDiamondCuts, deployRegistry, deployFactory, deploy, deployToken } from './utils';
import { ethers } from 'hardhat';

const onePercent = ethers.BigNumber.from('10').pow(16);

describe('ERC20WithdrawFacet', function () {
    let owner: Signer, collector: Signer, recipient: Signer, diamond: Contract, erc20: Contract;

    before(async function () {
        [owner, collector, recipient] = await ethers.getSigners();

        const registry = await deployRegistry(await collector.getAddress(), String(onePercent));
        const factory = await deployFactory(await owner.getAddress(), registry.address);
        erc20 = await deployToken('LimitedSupplyToken', [
            'Test Token',
            'TEST',
            await owner.getAddress(),
            parseEther('1000000'),
        ]);
        diamond = await deploy(
            factory,
            await getDiamondCuts(['RegistryProxyFacet', 'ERC20ProxyFacet', 'ERC20WithdrawFacet']),
            erc20.address,
        );
        await erc20.transfer(diamond.address, parseEther('100'));
    });

    it('withdrawFor', async function () {
        expect(await diamond.balanceOf(diamond.address)).to.eq(parseEther('100'));
        expect(await diamond.balanceOf(await collector.getAddress())).to.eq(0);
        expect(await diamond.balanceOf(await recipient.getAddress())).to.eq(0);

        const tx = diamond.withdrawFor(await recipient.getAddress(), parseEther('10'));

        await expect(tx).to.emit(diamond, 'ERC20WithdrawFeeCollected');
        await expect(tx).to.emit(diamond, 'ERC20WithdrawFor');

        expect(await diamond.balanceOf(diamond.address)).to.eq(parseEther('89.9'));
        expect(await diamond.balanceOf(await collector.getAddress())).to.eq(parseEther('0.1'));
        expect(await diamond.balanceOf(await recipient.getAddress())).to.eq(parseEther('10'));
    });
});
