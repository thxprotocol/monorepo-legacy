const { expect } = require('chai');
const { parseEther } = require('ethers/lib/utils');
const { unlimitedSupplyTokenContract, createTokenFactory } = require('./utils');

describe('Unlimited Token', function () {
    let token;

    before(async function () {
        [owner, receiver, outsider] = await ethers.getSigners();

        const factory = await createTokenFactory();
        token = await unlimitedSupplyTokenContract(
            factory.deployUnlimitedSupplyToken('Test Token', 'TST', [], await owner.getAddress()),
        );
    });

    it('Cannot mint when not in minter list', async () => {
        await expect(token.transfer(await receiver.getAddress(), parseEther('1000'))).to.be.revertedWith(
            'ERC20: transfer amount exceeds balance',
        );
    });

    it('Admin able to add new address to minter list', async () => {
        const recept = await token.connect(owner).addMinter(await owner.getAddress());
        expect(recept).to.not.be.undefined;
    });

    it('Non-admin not able to add new address to minter list', async () => {
        await expect(token.connect(outsider).addMinter(await owner.getAddress())).to.be.reverted;
    });

    it('Initial state', async function () {
        expect(await token.balanceOf(await owner.getAddress())).to.eq(0);
        expect(await token.balanceOf(await receiver.getAddress())).to.eq(0);
    });
    it('Send', async function () {
        await token.transfer(await receiver.getAddress(), parseEther('1000'));
        expect(await token.balanceOf(await owner.getAddress())).to.eq(0);
        expect(await token.balanceOf(await receiver.getAddress())).to.eq(parseEther('1000'));
    });
    it('Return', async function () {
        await token.connect(receiver).transfer(await owner.getAddress(), parseEther('1000'));
        expect(await token.balanceOf(await owner.getAddress())).to.eq(parseEther('1000'));
        expect(await token.balanceOf(await receiver.getAddress())).to.eq(0);
    });

    it('Resend', async function () {
        await token.transfer(await receiver.getAddress(), parseEther('1000'));
        expect(await token.balanceOf(await owner.getAddress())).to.eq(parseEther('1000'));
        expect(await token.balanceOf(await receiver.getAddress())).to.eq(parseEther('1000'));
    });

    it('Admin able to remove an address from minter list', async () => {
        await token.connect(owner).removeMinter(await owner.getAddress());
        await expect(token.transfer(await receiver.getAddress(), parseEther('10000'))).to.be.revertedWith(
            'ERC20: transfer amount exceeds balance',
        );
    });
});
