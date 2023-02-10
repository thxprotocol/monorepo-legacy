import { expect } from 'chai';
import { Contract, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { deploy, deployFactory, deployRegistry, deployToken, getDiamondCuts, MINTER_ROLE } from './utils';

describe.only('ERC1155ProxyFacet', function () {
    let owner: Signer, collector: Signer, recipient: Signer, newOwner: Signer, diamond: Contract, erc1155: Contract;
    const ipfsURL = 'https://ipfs.io/ipfs/bafybeihjjkwdrxxjnuwevlqtqmh3iegcadc32sio4wmo7bv2gbf34qs34a/{id}.json';

    before(async function () {
        [owner, collector, recipient, newOwner] = await ethers.getSigners();

        const registry = await deployRegistry(await collector.getAddress(), '0');
        const factory = await deployFactory(await owner.getAddress(), registry.address);
        erc1155 = await deployToken('THX_ERC1155', [ipfsURL, await owner.getAddress()]);
        diamond = await deploy(
            factory,
            await getDiamondCuts(['RegistryProxyFacet', 'ERC1155ProxyFacet', 'ERC1155HolderProxyFacet']),
        );
        console.log('DIAMOND', diamond);
    });

    it('can read nft owner', async () => {
        expect(await erc1155.owner()).to.eq(await owner.getAddress());
    });

    it('can grant minter role to pool', async () => {
        expect(await erc1155.hasRole(MINTER_ROLE, diamond.address)).to.eq(false);
        await expect(erc1155.grantRole(MINTER_ROLE, diamond.address)).to.emit(erc1155, 'RoleGranted');
    });

    it('can mint erc1155', async () => {
        const id = 1;
        const amount = 2;
        const data: any[] = [];
        await expect(diamond.mintERC1155For(erc1155.address, diamond.address, id, amount)).to.emit(
            diamond,
            'ERC1155MintedSingle',
        );
        expect(await erc1155.balanceOf(diamond.address, id)).to.eq(1);
        //expect(await erc1155.tokenURI(1)).to.be;
    });

    // it('can NOT mint erc1155 if not owner', async () => {
    //     const id = 1;
    //     const amount = 2;
    //     await expect(diamond.connect(newOwner).mintFor(diamond.address, id, amount, erc1155.address)).to.revertedWith(
    //         'NOT_OWNER',
    //     );
    // });

    // it('can transfer nft ownership', async () => {
    //     await expect(diamond.transferFromERC1155(await newOwner.getAddress(), 1, erc1155.address)).to.emit(
    //         diamond,
    //         'ERC1155Transferred',
    //     );
    //     expect(await erc1155.balanceOf(await newOwner.getAddress())).to.eq(1);
    //     expect(await erc1155.balanceOf(diamond.address)).to.eq(0);
    // });
});
