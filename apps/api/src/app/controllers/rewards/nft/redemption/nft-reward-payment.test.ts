import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { account, dashboardAccessToken, sub, widgetAccessToken } from '@thxnetwork/api/util/jest/constants';
import { ERC721TokenState, TAccount } from '@thxnetwork/types/interfaces';
import { ERC721, ERC721Document } from '@thxnetwork/api/models/ERC721';
import { alchemy } from '@thxnetwork/api/util/alchemy';
import { deployERC721, mockGetNftsForOwner } from '@thxnetwork/api/util/jest/erc721';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Contract } from 'web3-eth-contract';
import { getProvider } from '@thxnetwork/api/util/network';
import { addMinutes } from 'date-fns';
import { createImage } from '@thxnetwork/api/util/jest/images';
import { ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { poll } from '@thxnetwork/api/util/polling';
import { ERC721Token, ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import SafeService from '@thxnetwork/api/services/SafeService';

const user = request.agent(app);

describe('NFT Reward Payment', () => {
    let erc721: ERC721Document,
        pool: AssetPoolDocument,
        nftContract: Contract,
        erc721Token: ERC721Document,
        perk: ERC721PerkDocument,
        wallet: WalletDocument;

    const chainId = ChainId.Hardhat,
        nftName = 'Test Collection',
        nftSymbol = 'TST';

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    describe('POST /pools', () => {
        it('HTTP 201', (done) => {
            user.post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({ chainId })
                .expect((res: request.Response) => {
                    pool = res.body;
                })
                .expect(201, done);
        });
    });

    describe('POST /erc721/import', () => {
        it('HTTP 201`', async () => {
            // Create 1 NFT collection
            nftContract = await deployERC721(nftName, nftSymbol);

            // Mint 1 token in the collection
            await TransactionService.sendAsync(
                nftContract.options.address,
                nftContract.methods.mint(pool.safeAddress, 'tokenuri.json'),
                chainId,
            );

            // Mock Alchemy SDK return value for getNftsForOwner
            jest.spyOn(alchemy.nft, 'getNftsForOwner').mockImplementation(() =>
                Promise.resolve(mockGetNftsForOwner(nftContract.options.address, nftName, nftSymbol) as any),
            );

            // Run the import for the deployed contract address
            await user
                .post('/v1/erc721/import')
                .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': pool._id })
                .send({ chainId, contractAddress: nftContract.options.address })
                .expect(({ body }: request.Response) => {
                    expect(body.erc721._id).toBeDefined();
                    expect(body.erc721.address).toBe(nftContract.options.address);
                    expect(body.erc721Tokens).toBeDefined();
                    expect(body.erc721Tokens.length).toBe(1);
                    expect(body.erc721Tokens[0].sub).toBeUndefined();
                    expect(body.erc721Tokens[0].erc721Id).toBe(body.erc721._id);
                    expect(body.erc721Tokens[0].state).toBe(ERC721TokenState.Minted);
                    expect(body.erc721Tokens[0].recipient).toBe(pool.safeAddress);
                    expect(body.erc721Tokens[0].tokenId).toBeDefined();
                    expect(body.erc721Tokens[0].metadataId).toBeDefined();
                    erc721 = body.erc721;
                    erc721Token = body.erc721Tokens[0];
                })
                .expect(201);
        });
    });

    describe('GET /erc721/:id', () => {
        const { defaultAccount } = getProvider(chainId);

        it('HTTP 200', (done) => {
            user.get(`/v1/erc721/${erc721._id}`)
                .set('Authorization', dashboardAccessToken)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.chainId).toBe(chainId);
                    expect(body.sub).toBe(sub);
                    expect(body.name).toBe(nftName);
                    expect(body.symbol).toBe(nftSymbol);
                    expect(body.address).toBe(nftContract.options.address);
                    expect(body.totalSupply).toBe('1');
                    expect(body.owner).toBe(defaultAccount);
                    erc721 = body;
                })
                .expect(200, done);
        });
    });

    describe('POST /erc721-perks', () => {
        it('POST /erc721-perks', (done) => {
            const expiryDate = addMinutes(new Date(), 30);
            const image = createImage();
            const config = {
                title: 'Lorem',
                description: 'Lorem ipsum',
                erc721Id: String(erc721._id),
                tokenId: String(erc721Token._id),
                price: 0,
                priceCurrency: 'USD',
                pointPrice: 200,
                expiryDate: new Date(expiryDate).toISOString(),
                limit: 0,
                claimAmount: 0,
                isPromoted: true,
            };
            user.post('/v1/erc721-perks')
                .set({ 'X-PoolId': pool._id, 'Authorization': dashboardAccessToken })
                .attach('file', image, {
                    filename: 'test.jpg',
                    contentType: 'image/jpg',
                })
                .field(config)
                .expect(({ body }: request.Response) => {
                    expect(body[0].uuid).toBeDefined();
                    expect(body[0].title).toBe(config.title);
                    expect(body[0].description).toBe(config.description);
                    expect(body[0].image).toBeDefined();
                    expect(body[0].pointPrice).toBe(config.pointPrice);
                    expect(new Date(body[0].expiryDate).getDate()).toBe(expiryDate.getDate());
                    expect(body[0].limit).toBe(config.limit);
                    expect(body[0].claimAmount).toBe(config.claimAmount);
                    expect(body[0].isPromoted).toBe(config.isPromoted);
                    expect(body[0].erc721Id).toBe(erc721._id);
                    expect(body[0].nft).toBeDefined();
                    expect(body[0].tokenId).toBe(erc721Token._id);
                    perk = body[0];
                })
                .expect(201, done);
        });
    });

    describe('POST /rewards/nft/:uuid/redemption', () => {
        const balance = 500;
        let erc721TokenId;

        beforeAll(async () => {
            wallet = await SafeService.findPrimary(sub, ChainId.Hardhat);
            // Add some points for the subs wallet
            await PointBalanceService.add(pool as AssetPoolDocument, account as TAccount, 500);
        });

        it('POST /rewards/nft/:uuid/redemption', (done) => {
            user.post(`/v1/rewards/nft/${perk.uuid}/redemption`)
                .set({ 'X-PoolId': pool._id, 'Authorization': widgetAccessToken })
                .expect(({ body }: request.Response) => {
                    expect(body.erc721PerkPayment).toBeDefined();
                    expect(body.erc721PerkPayment.perkId).toBe(perk._id);
                    expect(body.erc721PerkPayment.poolId).toBe(pool._id);
                    expect(body.erc721Token).toBeDefined();
                    expect(body.erc721Token.state).toBe(ERC721TokenState.Transferring);
                    expect(body.erc721Token.erc721Id).toBe(erc721._id);
                    expect(body.erc721Token.tokenId).toBeDefined();
                    erc721TokenId = body.erc721Token._id;
                })
                .expect(201, done);
        });

        it('Wait for sub to change', async () => {
            await poll(
                () => ERC721Token.findById(erc721TokenId),
                (token: ERC721TokenDocument) => token.sub !== sub,
                1000,
            );
            const token = await ERC721Token.findById(erc721TokenId);
            expect(token.sub).toBe(sub);
            expect(token.recipient).toBe(wallet.address);
            expect(token.sub).toBe(sub);
        });

        it('GET /point-balances', (done) => {
            user.get(`/v1/point-balances`)
                .set({ 'X-PoolId': pool._id, 'Authorization': widgetAccessToken })
                .expect(({ body }: request.Response) => {
                    expect(body.balance).toBe(Number(balance) - perk.pointPrice);
                })
                .expect(200, done);
        });

        it('Wait for ownerOf', async () => {
            const { contract } = await ERC721.findById(perk.erc721Id);
            const safe = await SafeService.findPrimary(sub, ChainId.Hardhat);

            await poll(
                async () => (await ERC721Token.findById(erc721TokenId)).tokenId,
                (result: any) => result.length,
                1000,
            );

            const owner = await contract.methods.ownerOf(1).call();
            expect(owner).toEqual(safe.address);
        });
    });
});
