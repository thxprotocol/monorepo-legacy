import { Contract, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { MINTER_ROLE, deployFactory, deployRegistry, getDiamondCuts, deployToken, ADDRESS_ZERO } from './utils';
import { parseEther } from 'ethers/lib/utils';

describe('FactoryFacet', function () {
    let registry: Contract, factory: Contract, owner: Signer, collector: Signer, recipient: Signer;

    before(async function () {
        [owner, collector, recipient] = await ethers.getSigners();
        registry = await deployRegistry(await collector.getAddress(), '0');
        factory = await deployFactory(await owner.getAddress(), registry.address);
    });

    describe('ERC20 Limited', async function () {
        const name = 'Test Token',
            symbol = 'TEST',
            totalSupply = parseEther('1000');
        let erc20: Contract;

        before(async function () {
            erc20 = await deployToken('LimitedSupplyToken', [name, symbol, await owner.getAddress(), totalSupply]);
        });

        it('deployERC20()', async function () {
            const diamondCuts = await getDiamondCuts(['RegistryProxyFacet', 'ERC20ProxyFacet']);
            await expect(factory.deploy(diamondCuts, erc20.address, ADDRESS_ZERO)).to.emit(factory, 'DiamondDeployed');
        });
    });

    describe('ERC20 Unlimited', async function () {
        let erc20: Contract;

        before(async function () {
            erc20 = await deployToken('UnlimitedSupplyToken', ['Test Token', 'TEST', await owner.getAddress()]);
        });

        it('deployERC20()', async function () {
            const diamondCuts = await getDiamondCuts(['RegistryProxyFacet', 'ERC20ProxyFacet']);
            await expect(factory.deploy(diamondCuts, erc20.address, ADDRESS_ZERO)).to.emit(factory, 'DiamondDeployed');
        });

        it('recipient should fail if no minter and no balance', async () => {
            await expect(erc20.connect(recipient).transfer(await owner.getAddress(), 1)).to.be.revertedWith(
                'ERC20: transfer amount exceeds balance',
            );
        });

        it('owner should transfer if minter and no balance', async () => {
            await expect(erc20.transfer(await recipient.getAddress(), 1)).to.emit(erc20, 'Transfer');
        });

        it('recipient should transfer balance', async () => {
            await expect(erc20.connect(recipient).transfer(await owner.getAddress(), 1)).to.emit(erc20, 'Transfer');
        });

        it('owner should grant minter role', async () => {
            expect(await erc20.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(false);
            await expect(erc20.grantRole(MINTER_ROLE, await recipient.getAddress())).to.emit(erc20, 'RoleGranted');
            expect(await erc20.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(true);
        });

        it('recipient should transfer and not fail', async () => {
            expect(await erc20.balanceOf(await recipient.getAddress())).to.eq(0);
            expect(await erc20.balanceOf(await owner.getAddress())).to.eq(1);
            await expect(erc20.connect(recipient).transfer(await owner.getAddress(), 1)).to.emit(erc20, 'Transfer');
            expect(await erc20.balanceOf(await recipient.getAddress())).to.eq(0);
            expect(await erc20.balanceOf(await owner.getAddress())).to.eq(2);
        });

        it('owner should revoke minter role', async () => {
            expect(await erc20.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(true);
            await expect(erc20.revokeRole(MINTER_ROLE, await recipient.getAddress())).to.emit(erc20, 'RoleRevoked');
            expect(await erc20.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(false);
            expect(await erc20.balanceOf(await recipient.getAddress())).to.eq(0);
            await expect(erc20.connect(recipient).transfer(await owner.getAddress(), 1)).to.be.revertedWith(
                'ERC20: transfer amount exceeds balance',
            );
        });
    });

    describe('NFT', function () {
        const name = 'Test Non Fungible Token',
            symbol = 'TST-NFT',
            baseURI = 'https://api.thx.network/v1/metadata/',
            uri = '123456789123';
        let erc721: Contract;

        before(async function () {
            erc721 = await deployToken('NonFungibleToken', [name, symbol, baseURI, await owner.getAddress()]);
        });

        it('deployERC20()', async function () {
            const diamondCuts = await getDiamondCuts(['RegistryProxyFacet', 'ERC721ProxyFacet']);
            await expect(factory.deploy(diamondCuts, ADDRESS_ZERO, erc721.address)).to.emit(factory, 'DiamondDeployed');
        });

        it('Initial state', async () => {
            expect(await erc721.balanceOf(await owner.getAddress())).to.eq(0);
            expect(await erc721.totalSupply()).to.eq(0);
            expect(await erc721.name()).to.eq(name);
            expect(await erc721.symbol()).to.eq(symbol);
        });

        it('mint', async function () {
            await expect(erc721.connect(recipient).mint(await recipient.getAddress(), uri)).to.revertedWith(
                'NOT_MINTER',
            );
            await expect(erc721.mint(await recipient.getAddress(), uri)).to.emit(erc721, 'Transfer');

            expect(await erc721.balanceOf(await recipient.getAddress())).to.eq(1);
            expect(await erc721.totalSupply()).to.eq(1);
            expect(await erc721.tokenURI(1)).to.eq(baseURI + uri);
        });

        it('transfer', async function () {
            expect(await erc721.balanceOf(await owner.getAddress())).to.eq(0);
            expect(erc721.connect(recipient).approve(await owner.getAddress(), 1)).to.emit(erc721, 'Approval');
            expect(
                erc721.connect(recipient).transferFrom(await recipient.getAddress(), await owner.getAddress(), 1),
            ).to.emit(erc721, 'Transfer');
            expect(await erc721.balanceOf(await owner.getAddress())).to.eq(1);
            expect(await erc721.balanceOf(await recipient.getAddress())).to.eq(0);
        });

        it('owner should grant minter role', async () => {
            expect(await erc721.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(false);
            await expect(erc721.grantRole(MINTER_ROLE, await recipient.getAddress())).to.emit(erc721, 'RoleGranted');
            expect(await erc721.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(true);
        });

        it('recipient should mint and not fail', async () => {
            expect(await erc721.balanceOf(await recipient.getAddress())).to.eq(0);
            expect(await erc721.balanceOf(await owner.getAddress())).to.eq(1);
            await expect(erc721.connect(recipient).mint(await owner.getAddress(), uri)).to.emit(erc721, 'Transfer');
            expect(await erc721.balanceOf(await recipient.getAddress())).to.eq(0);
            expect(await erc721.balanceOf(await owner.getAddress())).to.eq(2);
        });

        it('owner should revoke minter role', async () => {
            expect(await erc721.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(true);
            await expect(erc721.revokeRole(MINTER_ROLE, await recipient.getAddress())).to.emit(erc721, 'RoleRevoked');
            expect(await erc721.hasRole(MINTER_ROLE, await recipient.getAddress())).to.eq(false);
            expect(await erc721.balanceOf(await recipient.getAddress())).to.eq(0);
            await expect(erc721.connect(recipient).mint(await owner.getAddress(), uri)).to.be.revertedWith(
                'NOT_MINTER',
            );
        });
    });
});
