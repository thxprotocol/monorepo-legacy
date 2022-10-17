const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { constants } = require('ethers');
const { diamond, assetPool, getDiamondCuts, createPoolRegistry } = require('./utils.js');

const onePercent = ethers.BigNumber.from('10').pow(16);

describe('04 token', function () {
    let owner;
    let token, factory, registry, diamondCuts;

    before(async function () {
        [owner, collector] = await ethers.getSigners();
        registry = await createPoolRegistry(await collector.getAddress(), onePercent);
        factory = await diamond();
        diamondCuts = await getDiamondCuts([
            'MemberAccess',
            'Token',
            'DiamondCutFacet',
            'DiamondLoupeFacet',
            'OwnershipFacet',
        ]);

        token = await assetPool(factory.deployAssetPool(diamondCuts, registry.address));
        const ExampleToken = await ethers.getContractFactory('ExampleToken');
        erc20 = await ExampleToken.deploy(await owner.getAddress(), parseEther('1000000'));
    });
    it('Test token', async function () {
        expect(await token.getToken()).to.eq(constants.AddressZero);
        expect(await token.addToken(erc20.address));
        expect(await token.getToken()).to.eq(erc20.address);
    });
    it('Test registry', async function () {
        expect(await token.getPoolRegistry()).to.eq(registry.address);
        expect(await registry.feePercentage()).to.eq(onePercent);
        expect(await registry.feeCollector()).to.eq(await collector.getAddress());
    });
    it('Test set registry', async function () {
        expect(await token.setPoolRegistry(registry.address)).to.emit(registry, 'RegistryUpdated');
    });
    it('Test asset pool registration', async function () {
        // For ease of testing and lack of interface validation in solidity we misuse registry address here
        // Should only register actual pool addresses
        expect(await factory.isAssetPool(registry.address)).to.eq(false);
        expect(await factory.registerAssetPool(registry.address)).to.emit(factory, 'AssetPoolRegistered');
        expect(await factory.isAssetPool(registry.address)).to.eq(true);
    });
    it('Test deposit', async function () {
        expect(await token.getBalance()).to.eq(0);
        expect(await erc20.balanceOf(await collector.getAddress())).to.eq(0);
        expect(await erc20.balanceOf(token.address)).to.eq(0);

        await erc20.approve(token.address, constants.MaxUint256);
        await expect(token.deposit(parseEther('100'))).to.emit(token, 'DepositFeeCollected');
        expect(await token.getBalance()).to.eq(parseEther('99'));
        expect(await erc20.balanceOf(await collector.getAddress())).to.eq(parseEther('1'));
        expect(await erc20.balanceOf(token.address)).to.eq(parseEther('99'));
    });
});
