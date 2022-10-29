import { expect } from 'chai';
import { BigNumber, Contract, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { getDiamondCuts, MANAGER_ROLE } from './utils';

describe('Smart Wallet', function () {
    let owner: any,
        user: Signer,
        user2: Signer,
        user3: Signer,
        erc20: Contract,
        erc721: Contract,
        smartWallet: Contract,
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

        // mint a token
        await erc721.mint(contractOwnerAddress, 'tokenURI');
        expect(await erc721.ownerOf(tokenId)).to.equal(contractOwnerAddress);
    });

    it('Deploy Smart Wallet', async function () {
        const DiamondFactory = await ethers.getContractFactory('Diamond');
        const { address } = await DiamondFactory.deploy(
            await getDiamondCuts(['AccessControlFacet', 'SharedWalletFacet']),
            [await owner.getAddress()],
        );
        smartWallet = await ethers.getContractAt('ISharedWallet', address);
        await smartWallet.setupRole(MANAGER_ROLE, await owner.getAddress());

        // set the proxycontract as operator
        await erc721.setApprovalForAll(smartWallet.address, true);
    });

    it('Should approveERC20', async function () {
        await smartWallet.approveERC20(erc20.address, receiverAddress, transferAmount);
        expect(await erc20.allowance(smartWallet.address, receiverAddress)).to.equal(transferAmount);
    });

    it('Should transferERC20', async function () {
        await erc20.approve(smartWallet.address, transferAmount);
        await smartWallet.transferERC20(erc20.address, receiverAddress, transferAmount);
        expect(await erc20.balanceOf(receiverAddress)).to.equal(transferAmount);
    });

    it('Should NOT transferERC20', async function () {
        expect(
            smartWallet.connect(user3).transferERC20(erc20.address, receiverAddress, transferAmount),
        ).to.be.revertedWith('Caller is not a manager');

        await smartWallet.connect(owner).grantRole(MANAGER_ROLE, await user2.getAddress());
        expect(
            smartWallet.connect(user2).transferERC20(erc20.address, receiverAddress, transferAmount),
        ).to.be.revertedWith('INSUFFICIENT BALANCE');
    });

    it('Should approveERC721', async function () {
        await smartWallet.approveERC721(erc721.address, receiverAddress, tokenId);
        expect(await erc721.getApproved(tokenId)).to.equal(receiverAddress);
    });

    it('Should NOT transferERC721', async function () {
        await erc721.approve(smartWallet.address, tokenId);
        expect(smartWallet.connect(user3).transferERC721(erc721.address, receiverAddress, tokenId)).to.be.revertedWith(
            'Caller is not a manager',
        );
    });

    it('Should transferERC721', async function () {
        await erc721.approve(smartWallet.address, tokenId);
        await smartWallet.transferERC721(erc721.address, receiverAddress, tokenId);
        expect(await erc721.ownerOf(tokenId)).to.equal(receiverAddress);
    });

    it('Should grant a Manager Role', async function () {
        await smartWallet.grantRole(MANAGER_ROLE, receiverAddress);
        expect(await smartWallet.hasRole(MANAGER_ROLE, receiverAddress)).to.equal(true);
    });

    it('Should NOT grant a Manager Role', async function () {
        await smartWallet.grantRole(MANAGER_ROLE, receiverAddress);
        expect(smartWallet.connect(user).grantRole(MANAGER_ROLE, receiverAddress)).to.be.revertedWith(
            'Ownable: caller is not the owner',
        );
    });

    it('Should revoke a Manager Role', async function () {
        await smartWallet.revokeRole(MANAGER_ROLE, receiverAddress);
        expect(await smartWallet.hasRole(MANAGER_ROLE, receiverAddress)).to.equal(false);
    });

    it('Should NOT revoke a Manager Role', async function () {
        await smartWallet.grantRole(MANAGER_ROLE, receiverAddress);
        expect(smartWallet.connect(user).revokeRole(MANAGER_ROLE, receiverAddress)).to.be.revertedWith(
            'Ownable: caller is not the owner',
        );
    });
});
