import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { BigNumber, constants, Contract, Signer } from 'ethers';
import { getDiamondCuts, filterEvents, deployRegistry, deployFactory, deploy, deployToken } from './utils';
import { ethers } from 'hardhat';

const onePercent = ethers.BigNumber.from('10').pow(16);

describe('ERC20ProxyFacet', function () {
    let owner: Signer, collector: Signer, recipient: Signer, diamond: Contract, erc20: Contract, registry: Contract;
    const name = 'Test Token',
        symbol = 'TEST',
        totalSupply = parseEther('1000000');

    before(async function () {
        [owner, collector, recipient] = await ethers.getSigners();
        registry = await deployRegistry(await collector.getAddress(), String(onePercent));

        const factory = await deployFactory(await owner.getAddress(), registry.address);
        erc20 = await deployToken('LimitedSupplyToken', [name, symbol, await owner.getAddress(), totalSupply]);
        diamond = await deploy(factory, await getDiamondCuts(['RegistryProxyFacet', 'ERC20ProxyFacet']), erc20.address);
    });
    it('setERC20', async function () {
        await expect(diamond.setERC20(erc20.address)).to.emit(diamond, 'ERC20ProxyUpdated');
    });
    it('setERC20 for new token reverts', async function () {
        const newERC20 = await deployToken('LimitedSupplyToken', [name, symbol, await owner.getAddress(), totalSupply]);
        await expect(diamond.setERC20(newERC20.address)).to.be.revertedWith('ADDRESS_INIT');
    });
    it('transferFrom', async function () {
        expect(await diamond.balanceOf(diamond.address)).to.eq(0);

        await erc20.approve(diamond.address, constants.MaxUint256);
        await expect(
            diamond.transferFrom(await owner.getAddress(), await recipient.getAddress(), parseEther('100')),
        ).to.emit(diamond, 'ERC20ProxyTransferFrom');

        expect(await diamond.balanceOf(await recipient.getAddress())).to.eq(parseEther('100'));
    });
    it('transferFromMany', async function () {
        const ownerBalance: BigNumber = await diamond.balanceOf(await owner.getAddress());
        const recipientBalance: BigNumber = await diamond.balanceOf(await recipient.getAddress());

        expect(await diamond.balanceOf(await recipient.getAddress())).to.eq(parseEther('100'));

        const tx = await diamond.transferFromMany(
            [await owner.getAddress(), await owner.getAddress()],
            [await recipient.getAddress(), await recipient.getAddress()],
            [parseEther('5'), parseEther('15')],
        );
        const events = filterEvents((await tx.wait()).events, 'ERC20ProxyTransferFrom');

        expect(events.length).to.eq(2);
        expect(await diamond.balanceOf(await owner.getAddress())).to.eq(ownerBalance.sub(parseEther('20')));
        expect(await diamond.balanceOf(await recipient.getAddress())).to.eq(recipientBalance.add(parseEther('20')));
    });

    it('totalSupply()', async function () {
        expect(await diamond.totalSupply()).to.eq(totalSupply);
        expect(await diamond.totalSupply()).to.eq(await erc20.totalSupply());
    });
    it('name()', async function () {
        expect(await diamond.name()).to.eq(name);
        expect(await diamond.name()).to.eq(await erc20.name());
    });
    it('symbol()', async function () {
        expect(await diamond.symbol()).to.eq(symbol);
        expect(await diamond.symbol()).to.eq(await erc20.symbol());
    });
    it('balanceOf()', async function () {
        expect(await diamond.balanceOf(await owner.getAddress())).to.eq(
            await erc20.balanceOf(await owner.getAddress()),
        );
        expect(await diamond.balanceOf(await recipient.getAddress())).to.eq(
            await erc20.balanceOf(await recipient.getAddress()),
        );
    });
});
