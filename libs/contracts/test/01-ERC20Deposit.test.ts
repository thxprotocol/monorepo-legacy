import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { constants, Contract, Signer } from 'ethers';
import { getDiamondCuts, deployRegistry, deployFactory, deploy, deployToken } from './utils';
import { ethers } from 'hardhat';

const onePercent = ethers.BigNumber.from('10').pow(16);

describe('ERC20DepositFacet', function () {
    let owner: Signer, collector: Signer, diamond: Contract, erc20: Contract;

    before(async function () {
        [owner, collector] = await ethers.getSigners();

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
            await getDiamondCuts(['RegistryProxyFacet', 'ERC20ProxyFacet', 'ERC20DepositFacet']),
            erc20.address,
        );
    });

    it('Test deposit', async function () {
        expect(await diamond.balanceOf(await collector.getAddress())).to.eq(0);

        await erc20.approve(diamond.address, constants.MaxUint256);
        const tx = diamond.depositFrom(await owner.getAddress(), parseEther('100'));

        await expect(tx).to.emit(diamond, 'ERC20DepositFeeCollected');
        await expect(tx).to.emit(diamond, 'ERC20DepositFrom');

        expect(await diamond.balanceOf(diamond.address)).to.eq(parseEther('99'));
        expect(await diamond.balanceOf(await collector.getAddress())).to.eq(parseEther('1'));
    });
});
