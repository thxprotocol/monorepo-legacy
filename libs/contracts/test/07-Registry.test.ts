import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { Contract, Signer } from 'ethers';
import { getDiamondCuts, deployFactory, deploy, deployToken } from './utils';
import { ethers } from 'hardhat';

const onePercent = ethers.BigNumber.from('10').pow(16);

describe('RegistryFacet', function () {
    let owner: Signer, collector: Signer, registry: Contract;

    before(async function () {
        [owner, collector] = await ethers.getSigners();
    });

    it('Deploy Registry', async function () {
        const DiamondFactory = await ethers.getContractFactory('Diamond');
        const { address } = await DiamondFactory.deploy(await getDiamondCuts(['RegistryFacet']), [
            await owner.getAddress(),
        ]);
        registry = await ethers.getContractAt('IRegistry', address);
        await registry.initialize(await collector.getAddress(), String(onePercent));
        expect(await registry.feeCollector()).to.eq(await collector.getAddress());
        expect(await registry.feePercentage()).to.eq(String(onePercent));
    });

    describe('RegistryProxyFacet', function () {
        let diamond: Contract;

        it('Deploy RegistryProxy', async function () {
            const factory = await deployFactory(await owner.getAddress(), registry.address);
            const erc20 = await deployToken('LimitedSupplyToken', [
                'Test Token',
                'TEST',
                await owner.getAddress(),
                parseEther('1000000'),
            ]);
            diamond = await deploy(
                factory,
                await getDiamondCuts(['RegistryProxyFacet', 'ERC20ProxyFacet']),
                erc20.address,
            );
        });

        it('getRegistry()', async function () {
            expect(await diamond.getRegistry()).to.eq(registry.address);
            expect(await registry.feePercentage()).to.eq(onePercent);
            expect(await registry.feeCollector()).to.eq(await collector.getAddress());
        });

        it('setRegistry()', async function () {
            await expect(diamond.setRegistry(registry.address)).to.emit(diamond, 'RegistryProxyUpdated');
        });
    });
});
