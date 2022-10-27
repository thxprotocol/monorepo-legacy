import { expect } from 'chai';
import { BigNumber, Contract, Signer } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import { MANAGER_ROLE } from './utils';

describe('SharedWallet TEST', function () {
    let owner: any,
        user: Signer,
        user2: Signer,
        user3: Signer,
        erc20: Contract,
        erc721: Contract,
        sharedWalletProxy: Contract,
        contractOwnerAddress: string,
        receiverAddress: string,
        transferAmount: BigNumber,
        tokenId: number;

    before(async function () {
        [owner, user, user2, user3] = await ethers.getSigners();

        contractOwnerAddress = await owner.getAddress();
        receiverAddress = await user.getAddress();
        transferAmount = ethers.utils.parseEther('1');
        tokenId = 1;

        const SharedWalletContract = await ethers.getContractFactory('SharedWallet');
        sharedWalletProxy = await upgrades.deployProxy(SharedWalletContract, [contractOwnerAddress]);
        await sharedWalletProxy.deployed();

        const MockERC20TokenContract = await ethers.getContractFactory('LimitedSupplyToken');
        erc20 = await MockERC20TokenContract.deploy(
            'ExampleERC20',
            'EX20',
            contractOwnerAddress,
            ethers.utils.parseEther('10'),
        );
        await erc20.deployed();

        const MockERC721Contract = await ethers.getContractFactory('NonFungibleToken');
        erc721 = await MockERC721Contract.deploy('ExampleERC721', 'EX721', 'baseURI', contractOwnerAddress);
        await erc721.deployed();

        // set the proxycontract as operator
        await erc721.setApprovalForAll(sharedWalletProxy.address, true);

        // mint a token
        await erc721.mint(contractOwnerAddress, 'tokenURI');
        expect(await erc721.ownerOf(tokenId)).to.equal(contractOwnerAddress);
    });

    it('Should approveERC20', async function () {
        await sharedWalletProxy.approveERC20(erc20.address, receiverAddress, transferAmount);
        expect(await erc20.allowance(sharedWalletProxy.address, receiverAddress)).to.equal(transferAmount);
    });

    it('Should transferERC20', async function () {
        await erc20.approve(sharedWalletProxy.address, transferAmount);
        await sharedWalletProxy.transferERC20(erc20.address, receiverAddress, transferAmount);
        expect(await erc20.balanceOf(receiverAddress)).to.equal(transferAmount);
    });

    it('Should NOT transferERC20', async function () {
        expect(
            sharedWalletProxy.connect(user3).transferERC20(erc20.address, receiverAddress, transferAmount),
        ).to.be.revertedWith('Caller is not a manager');

        await sharedWalletProxy.grantRole(MANAGER_ROLE, await user2.getAddress());

        expect(
            sharedWalletProxy.connect(user2).transferERC20(erc20.address, receiverAddress, transferAmount),
        ).to.be.revertedWith('INSUFFICIENT BALANCE');
    });

    it('Should approveERC721', async function () {
        await sharedWalletProxy.approveERC721(erc721.address, receiverAddress, tokenId);
        expect(await erc721.getApproved(tokenId)).to.equal(receiverAddress);
    });

    it('Should NOT transferERC721', async function () {
        await erc721.approve(sharedWalletProxy.address, tokenId);
        expect(
            sharedWalletProxy.connect(user3).transferERC721(erc721.address, receiverAddress, tokenId),
        ).to.be.revertedWith('Caller is not a manager');
    });

    it('Should transferERC721', async function () {
        await erc721.approve(sharedWalletProxy.address, tokenId);
        await sharedWalletProxy.transferERC721(erc721.address, receiverAddress, tokenId);
        expect(await erc721.ownerOf(tokenId)).to.equal(receiverAddress);
    });

    it('Should grant a Manager Role', async function () {
        await sharedWalletProxy.grantRole(MANAGER_ROLE, receiverAddress);
        expect(await sharedWalletProxy.hasRole(MANAGER_ROLE, receiverAddress)).to.equal(true);
    });

    it('Should NOT grant a Manager Role', async function () {
        await sharedWalletProxy.grantRole(MANAGER_ROLE, receiverAddress);
        expect(sharedWalletProxy.connect(user).grantRole(MANAGER_ROLE, receiverAddress)).to.be.revertedWith(
            'Ownable: caller is not the owner',
        );
    });

    it('Should revoke a Manager Role', async function () {
        await sharedWalletProxy.revokeRole(MANAGER_ROLE, receiverAddress);
        expect(await sharedWalletProxy.hasRole(MANAGER_ROLE, receiverAddress)).to.equal(false);
    });

    it('Should NOT revoke a Manager Role', async function () {
        await sharedWalletProxy.grantRole(MANAGER_ROLE, receiverAddress);
        expect(sharedWalletProxy.connect(user).revokeRole(MANAGER_ROLE, receiverAddress)).to.be.revertedWith(
            'Ownable: caller is not the owner',
        );
    });

    // it('Should upgrade the contract to Version 2', async function () {
    //     const SharedWalletContractV2 = await ethers.getContractFactory('SharedWalletV2');
    //     sharedWalletProxy = await upgrades.upgradeProxy(sharedWalletProxy, SharedWalletContractV2);
    //     expect(await sharedWalletProxy.isContractUpgraded()).to.equal(true);
    // });
});
