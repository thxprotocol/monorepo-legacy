import request from 'supertest';
import app from '@thxnetwork/api/';
import { widgetAccessToken, sub, userWalletPrivateKey } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ChainId, ERC20Type, NFTVariant } from '@thxnetwork/types/enums';
import { isAddress, toWei } from 'web3-utils';
import WalletService from '@thxnetwork/api/services/WalletService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { Wallet } from 'ethers';
import { ERC20Token } from '@thxnetwork/api/models/ERC20Token';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import { ERC721TokenState } from '@thxnetwork/types/interfaces';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
import { IPFS_BASE_URL } from '@thxnetwork/api/config/secrets';
import { poll } from '@thxnetwork/api/util/polling';

const user = request.agent(app);

describe('Account Wallet', () => {
    beforeAll(() => beforeAllCallback({ skipWalletCreation: true }));
    afterAll(afterAllCallback);

    let safeAddress, thxWallet, erc20, erc721, erc721Token;

    it('Create wallet', async () => {
        thxWallet = await WalletService.create({ sub, chainId: ChainId.Hardhat, forceSync: true });
    });

    it('Create ERC20', async () => {
        erc20 = await ERC20Service.deploy({
            name: 'THX Network (POS)',
            symbol: 'THX',
            totalSupply: toWei('10000000'),
            chainId: ChainId.Hardhat,
            type: ERC20Type.Limited,
            sub,
        });

        await TransactionService.sendAsync(
            erc20.contract.options.address,
            erc20.contract.methods.transfer(thxWallet.address, toWei('10')),
            ChainId.Hardhat,
            true,
            { type: 'transferFromCallBack', args: { erc20Id: String(erc20._id) } },
        );
        await ERC20Service.createERC20Token(erc20, sub);
        await ERC20Token.create({
            sub,
            erc20Id: erc20._id,
            walletId: thxWallet._id,
        });

        expect(await erc20.contract.methods.balanceOf(thxWallet.address).call()).toBe(toWei('10'));
    });

    it('Create ERC721', async () => {
        erc721 = await ERC721Service.deploy({
            sub,
            name: 'THX NFT',
            symbol: 'THX-NFT',
            chainId: ChainId.Hardhat,
            variant: NFTVariant.ERC721,
            baseURL: 'https://www.example.com',
        });
        const tokenUri = '/metadata/1.json';
        const metadata = await ERC721Metadata.create({
            erc721Id: String(erc721._id),
            name: 'Token Silver',
            image: IPFS_BASE_URL + 'abcdef',
            imageUrl: 'https://image.com/image.jpg',
            description: 'Lorem ipsum dolor sit amet',
            externalUrl: 'https://example.com',
        });

        await TransactionService.sendAsync(
            erc721.contract.options.address,
            erc721.contract.methods.mint(thxWallet.address, tokenUri),
            ChainId.Hardhat,
            true,
            { type: 'transferFromCallBack', args: { erc20Id: String(erc20._id) } },
        );

        erc721Token = await ERC721Token.create({
            sub,
            walletId: thxWallet._id,
            erc721Id: erc721._id,
            metadataId: metadata._id,
            tokenUri: erc721.baseURL + tokenUri,
            state: ERC721TokenState.Transferred,
            tokenId: 1,
            recipient: thxWallet.address,
        });

        expect(await erc721.contract.methods.ownerOf('1').call()).toBe(thxWallet.address);
    });

    it('GET /account', async () => {
        const { body, status } = await user.get('/v1/account').set({ Authorization: widgetAccessToken });
        expect(body.sub).toBe(sub);
        expect(status).toBe(200);
    });

    it('PATCH /account', async () => {
        const authRequestMessage = 'test';
        const authRequestSignature = await (async () => {
            const wallet = new Wallet(userWalletPrivateKey);
            return await wallet.signMessage(authRequestMessage);
        })();
        const { status, body } = await user
            .patch(`/v1/account`)
            .set({ Authorization: widgetAccessToken })
            .send({ authRequestMessage, authRequestSignature });

        expect(body).toBeDefined();
        expect(status).toBe(200);
    });

    it('GET /account/wallet', (done) => {
        user.get(`/v1/account/wallet?chainId=${ChainId.Hardhat}`)
            .set({ Authorization: widgetAccessToken })
            .expect((res: request.Response) => {
                const safe = res.body.find((wallet) => wallet.safeVersion);
                safeAddress = safe.address;
                expect(isAddress(safeAddress)).toBeTruthy();
            })
            .expect(200, done);
    });

    it('GET /erc20/token', (done) => {
        user.get(`/v1/erc20/token?chainId=${ChainId.Hardhat}`)
            .set({ Authorization: widgetAccessToken })
            .expect((res: request.Response) => {
                console.log(res.body);
                expect(res.body.length).toBe(1);
                expect(res.body[0].migrationBalance).toBe(toWei('10'));
            })
            .expect(200, done);
    });

    it('GET /erc721/token', (done) => {
        user.get(`/v1/erc721/token?chainId=${ChainId.Hardhat}`)
            .set({ Authorization: widgetAccessToken })
            .expect((res: request.Response) => {
                expect(res.body.length).toBe(1);
                expect(res.body[0].recipient).toBe(thxWallet.address);
            })
            .expect(200, done);
    });

    it('POST /account/wallet/migrate (erc20Id)', (done) => {
        user.post(`/v1/account/wallet/migrate`)
            .set({ Authorization: widgetAccessToken })
            .send({
                erc20Id: erc20._id,
            })
            .expect(200, done);
    });

    it('Poll', async () => {
        await poll(
            erc20.contract.methods.balanceOf(safeAddress).call,
            (result: string) => result !== toWei('10'),
            1000,
        );
        expect(await erc20.contract.methods.balanceOf(safeAddress).call()).toBe(toWei('10'));
    });
    it('POST /account/wallet/migrate (erc721Id)', (done) => {
        user.post(`/v1/account/wallet/migrate`)
            .set({ Authorization: widgetAccessToken })
            .send({
                erc721TokenId: erc721Token._id,
            })
            .expect(200, done);
    });

    it('Poll', async () => {
        await poll(erc721.contract.methods.ownerOf(1).call, (result: string) => result !== safeAddress, 1000);
        expect(await erc721.contract.methods.ownerOf(1).call()).toBe(safeAddress);
    });

    it('GET /erc20/token', (done) => {
        user.get(`/v1/erc20/token?chainId=${ChainId.Hardhat}`)
            .set({ Authorization: widgetAccessToken })
            .expect(async (res: request.Response) => {
                expect(await erc20.contract.methods.balanceOf(safeAddress).call()).toBe(toWei('10'));
                expect(Number(res.body[0].walletBalance)).toBe(10);
            })
            .expect(200, done);
    });

    it('GET /erc721/token', (done) => {
        user.get(`/v1/erc721/token?chainId=${ChainId.Hardhat}`)
            .set({ Authorization: widgetAccessToken })
            .expect(async (res: request.Response) => {
                expect(await erc721.contract.methods.ownerOf(1).call()).toBe(safeAddress);
                expect(res.body[0].recipient).toBe(safeAddress);
            })
            .expect(200, done);
    });
});
