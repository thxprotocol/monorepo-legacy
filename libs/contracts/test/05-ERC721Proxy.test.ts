import { expect } from 'chai';
import { Contract, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { deploy, deployFactory, deployRegistry, deployToken, getDiamondCuts, ADDRESS_ZERO, MINTER_ROLE } from './utils';

describe('ERC721ProxyFacet', function () {
    let owner: Signer, collector: Signer, recipient: Signer, newOwner: Signer, diamond: Contract, erc721: Contract;
    const baseUrl = 'https://www.example.com/metadata/';

    before(async function () {
        [owner, collector, recipient, newOwner] = await ethers.getSigners();

        const registry = await deployRegistry(await collector.getAddress(), '0');
        const factory = await deployFactory(await owner.getAddress(), registry.address);
        erc721 = await deployToken('NonFungibleToken', [
            'Test Collectible',
            'TEST-NFT',
            baseUrl,
            await owner.getAddress(),
        ]);
        diamond = await deploy(
            factory,
            await getDiamondCuts(['RegistryProxyFacet', 'ERC721ProxyFacet']),
            ADDRESS_ZERO,
            erc721.address,
        );
    });

    it('can read nft owner', async () => {
        expect(await erc721.owner()).to.eq(await owner.getAddress());
    });

    it('can not set erc721 contract again', async () => {
        await expect(diamond.setERC721(erc721.address)).to.revertedWith('INIT');
        expect(await diamond.getERC721()).to.eq(erc721.address);
    });

    it('can grant minter role to pool', async () => {
        expect(await erc721.hasRole(MINTER_ROLE, diamond.address)).to.eq(false);
        await expect(erc721.grantRole(MINTER_ROLE, diamond.address)).to.emit(erc721, 'RoleGranted');
    });

    it('can NOT mint erc721 if not owner', async () => {
        const uri = '1234567890.json';
        await expect(diamond.connect(newOwner).mintFor(await recipient.getAddress(), uri)).to.revertedWith('NOT_OWNER');
    });

    it('can mint erc721 from the pool', async () => {
        const uri = '1234567890.json';
        await expect(diamond.mintFor(await recipient.getAddress(), uri)).to.emit(diamond, 'ERC721Minted');
        expect(await erc721.balanceOf(await recipient.getAddress())).to.eq(1);
        expect(await erc721.tokenURI(1)).to.eq(baseUrl + uri);
    });

    it('can transfer nft ownership', async () => {
        await expect(erc721.transferOwnership(await newOwner.getAddress())).to.emit(erc721, 'OwnershipTransferred');
    });
});
