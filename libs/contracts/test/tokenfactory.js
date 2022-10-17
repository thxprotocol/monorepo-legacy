const { expect } = require('chai');
const {
    createTokenFactory,
    nonFungibleTokenContract,
    limitedSupplyTokenContract,
    unlimitedSupplyTokenContract,
} = require('./utils');

describe('Unlimited Token factory', function () {
    let factory, owner, receiver;

    before(async function () {
        [owner, receiver] = await ethers.getSigners();
        factory = await createTokenFactory();
    });

    it('Limited Supply', async function () {
        const tokenContract = await limitedSupplyTokenContract(
            factory.deployLimitedSupplyToken('Test Token', 'TST', await owner.getAddress(), 1000),
        );

        expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(1000);
        expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(0);
        expect(await tokenContract.totalSupply()).to.eq(1000);
        expect(await tokenContract.symbol()).to.eq('TST');
        expect(await tokenContract.name()).to.eq('Test Token');
    });

    it('Unlimited Supply', async function () {
        const tokenContract = await unlimitedSupplyTokenContract(
            factory.deployUnlimitedSupplyToken(
                'Test Token',
                'TST',
                [await owner.getAddress()],
                await owner.getAddress(),
            ),
        );

        expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(0);
        expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(0);
        expect(await tokenContract.totalSupply()).to.eq(0);
        expect(await tokenContract.symbol()).to.eq('TST');
        expect(await tokenContract.name()).to.eq('Test Token');
    });

    describe('NFT', function () {
        const baseURI = 'https://metadata.thx.network';
        let tokenContract;

        it('deploy', async function () {
            tokenContract = await nonFungibleTokenContract(
                factory.deployNonFungibleToken('Test NFT', 'NFT', await owner.getAddress(), baseURI),
            );

            expect(await tokenContract.name()).to.eq('Test NFT');
            expect(await tokenContract.symbol()).to.eq('NFT');
            expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(0);
            expect(await tokenContract.totalSupply()).to.eq(0);
            expect(await tokenContract.baseURI()).to.eq(baseURI);
        });
        it('mint', async function () {
            const path = '/tokenuri/0.json';

            expect(tokenContract.connect(receiver).mint(await receiver.getAddress(), path)).to.revertedWith(
                'ONLY_OWNER',
            );
            expect(tokenContract.mint(await receiver.getAddress(), path)).to.emit(tokenContract, 'Transfer');

            expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(1);
            expect(await tokenContract.totalSupply()).to.eq(1);
            expect(await tokenContract.tokenURI(1)).to.eq(baseURI + path);
        });
        it('transfer', async function () {
            expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(0);
            expect(tokenContract.connect(receiver).approve(await owner.getAddress(), 1)).to.emit(
                tokenContract,
                'Approval',
            );
            expect(
                tokenContract.connect(receiver).transferFrom(await receiver.getAddress(), await owner.getAddress(), 1),
            ).to.emit(tokenContract, 'Transfer');
            expect(await tokenContract.balanceOf(await owner.getAddress())).to.eq(1);
            expect(await tokenContract.balanceOf(await receiver.getAddress())).to.eq(0);
        });
    });
});
