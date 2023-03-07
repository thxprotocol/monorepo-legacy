import { expect } from 'chai';
import { BigNumber, Contract, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { getDiamondCuts, MANAGER_ROLE } from './utils';
import { HashZero } from '@ethersproject/constants';

describe('Smart Wallet', function () {
    let owner: any,
        user: Signer,
        erc20: Contract,
        erc721: Contract,
        erc1155: Contract,
        smartWallet: Contract,
        contractOwnerAddress: string,
        receiverAddress: string,
        transferAmount: BigNumber,
        tokenId: number;

    before(async function () {
        [owner, user] = await ethers.getSigners();

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
        erc721 = await MockERC721Contract.deploy('ExampleERC721', 'EX721', 'ipfs://example.com/', contractOwnerAddress);
        await erc721.deployed();

        const MockERC1155Contract = await ethers.getContractFactory('THX_ERC1155');
        erc1155 = await MockERC1155Contract.deploy('ipfs://baseUri.com/', contractOwnerAddress);
        await erc1155.deployed();
    });

    it('Deploy', async function () {
        const DiamondFactory = await ethers.getContractFactory('Diamond');
        const { address } = await DiamondFactory.deploy(
            await getDiamondCuts(['AccessControlFacet', 'SharedWalletFacet']),
            [await owner.getAddress()],
        );
        smartWallet = await ethers.getContractAt('ISharedWallet', address);
        await smartWallet.setupRole(MANAGER_ROLE, await owner.getAddress());
    });

    it('Deposit', async function () {
        // Transfer erc20 into smart contract wallet
        await erc20.connect(owner).transfer(smartWallet.address, ethers.utils.parseEther('10'));

        // mint a erc721 token
        await erc721.mint(smartWallet.address, 'tokenURI');
        expect(await erc721.ownerOf(tokenId)).to.equal(smartWallet.address);

        // mint erc1155 tokens
        await erc1155.mint(smartWallet.address, '000', 2, HashZero);
        expect(await erc721.ownerOf(tokenId)).to.equal(smartWallet.address);

        await erc1155.mintBatch(smartWallet.address, ['111', '222'], [2, 2], HashZero);
        expect(await erc721.ownerOf(tokenId)).to.equal(smartWallet.address);
    });

    describe('ERC20', () => {
        it('approveERC20', async function () {
            await smartWallet.approveERC20(erc20.address, receiverAddress, transferAmount);
            expect(await erc20.allowance(smartWallet.address, receiverAddress)).to.equal(transferAmount);
        });

        it('approveERC20: NOT_MANAGER', async function () {
            await expect(
                smartWallet.connect(user).approveERC20(erc20.address, receiverAddress, transferAmount),
            ).to.be.revertedWith('NOT_MANAGER');
        });

        it('transferERC20', async function () {
            expect(await erc20.balanceOf(receiverAddress)).to.equal('0');
            await smartWallet.transferERC20(erc20.address, receiverAddress, transferAmount);
            expect(await erc20.balanceOf(receiverAddress)).to.equal(transferAmount);
        });

        it('transferERC20: NOT_MANAGER', async function () {
            await expect(
                smartWallet.connect(user).transferERC20(erc20.address, receiverAddress, transferAmount),
            ).to.be.revertedWith('NOT_MANAGER');
        });
    });

    describe('ERC721', () => {
        it('approveERC721 ', async function () {
            await smartWallet.approveERC721(erc721.address, receiverAddress, tokenId);
            expect(await erc721.getApproved(tokenId)).to.equal(receiverAddress);
        });

        it('approveERC721: NOT_MANAGER', async function () {
            await expect(
                smartWallet.connect(user).approveERC721(erc721.address, receiverAddress, tokenId),
            ).to.be.revertedWith('NOT_MANAGER');
        });

        it('transferERC721 ', async function () {
            await smartWallet.transferERC721(erc721.address, receiverAddress, tokenId);
            expect(await erc721.ownerOf(tokenId)).to.equal(receiverAddress);
        });

        it('transferERC721 NOT_MANAGER', async function () {
            await expect(
                smartWallet.connect(user).transferERC721(erc721.address, receiverAddress, tokenId),
            ).to.be.revertedWith('NOT_MANAGER');
        });
    });

    describe('ERC1155', () => {
        it('transferERC1155 ', async function () {
            await smartWallet.transferERC1155(erc1155.address, receiverAddress, '000', 1);
            expect(await erc1155.balanceOf(smartWallet.address, '000')).to.equal(1);
            expect(await erc1155.balanceOf(receiverAddress, '000')).to.equal(1);
        });

        it('batchTransferERC1155', async function () {
            await smartWallet.batchTransferERC1155(erc1155.address, receiverAddress, ['111', '222'], [1, 1]);
            expect(await erc1155.balanceOf(smartWallet.address, '111')).to.equal(1);
            expect(await erc1155.balanceOf(receiverAddress, '111')).to.equal(1);

            expect(await erc1155.balanceOf(smartWallet.address, '222')).to.equal(1);
            expect(await erc1155.balanceOf(receiverAddress, '222')).to.equal(1);
        });

        it('transferERC1155 NOT_MANAGER', async function () {
            await expect(
                smartWallet.connect(user).transferERC1155(erc1155.address, receiverAddress, '000', 1),
            ).to.be.revertedWith('NOT_MANAGER');
        });

        it('batchTransferERC1155 NOT_MANAGER', async function () {
            await expect(
                smartWallet.connect(user).batchTransferERC1155(erc1155.address, receiverAddress, ['111'], [1]),
            ).to.be.revertedWith('NOT_MANAGER');
        });
    });

    describe('Access Control', () => {
        it('grantRole: sender must be admin to grant', async function () {
            await expect(smartWallet.connect(user).grantRole(MANAGER_ROLE, receiverAddress)).to.be.revertedWith(
                'AccessControl: sender must be an admin to grant',
            );
        });

        it('grantRole: MANAGER_ROLE', async function () {
            await smartWallet.connect(owner).grantRole(MANAGER_ROLE, receiverAddress);
            expect(await smartWallet.hasRole(MANAGER_ROLE, receiverAddress)).to.equal(true);
        });

        it('transferERC721: granted MANAGER_ROLE', async function () {
            const tokenId = 2;

            await erc721.mint(smartWallet.address, 'tokenURI');
            expect(await erc721.ownerOf(tokenId)).to.equal(smartWallet.address);

            await smartWallet.connect(user).transferERC721(erc721.address, receiverAddress, tokenId);
            expect(await erc721.ownerOf(tokenId)).to.equal(receiverAddress);
        });

        it('revokeRole: MANAGER_ROLE', async function () {
            await smartWallet.revokeRole(MANAGER_ROLE, receiverAddress);
            expect(await smartWallet.hasRole(MANAGER_ROLE, receiverAddress)).to.equal(false);
        });

        it('transferERC721: revoked MANAGER_ROLE ', async function () {
            const tokenId = 3;

            await erc721.mint(smartWallet.address, 'tokenURI');
            expect(await erc721.ownerOf(tokenId)).to.equal(smartWallet.address);

            await expect(
                smartWallet.connect(user).transferERC721(erc721.address, receiverAddress, tokenId),
            ).to.be.revertedWith('NOT_MANAGER');

            expect(await erc721.ownerOf(tokenId)).to.equal(smartWallet.address);
        });
    });
});
