import { expect } from 'chai';
import { BigNumber, Contract, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { getDiamondCuts, MANAGER_ROLE } from './utils';

describe('Smart Wallet', function () {
    let owner: any,
        user: Signer,
        user2: Signer,
        erc20: Contract,
        erc721: Contract,
        smartWallet: Contract,
        contractOwnerAddress: string,
        receiverAddress: string,
        transferAmount: BigNumber,
        tokenId: number;

    before(async function () {
        [owner, user, user2] = await ethers.getSigners();

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

        // mint a token
        await erc721.mint(smartWallet.address, 'tokenURI');
        expect(await erc721.ownerOf(tokenId)).to.equal(smartWallet.address);
    });

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
