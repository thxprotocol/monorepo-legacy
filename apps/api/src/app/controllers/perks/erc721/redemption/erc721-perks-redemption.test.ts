import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/api/types/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { dashboardAccessToken, sub, widgetAccessToken } from '@thxnetwork/api/util/jest/constants';
import { ERC721TokenState } from '@thxnetwork/api/types/TERC721';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import { alchemy } from '@thxnetwork/api/util/alchemy';
import { deployNFT, mockGetNftsForOwner } from '@thxnetwork/api/util/jest/nft';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Contract } from 'web3-eth-contract';
import { getProvider } from '@thxnetwork/api/util/network';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { addMinutes } from 'date-fns';
import { RewardConditionPlatform } from '@thxnetwork/types/enums/RewardConditionPlatform';
import { RewardConditionInteraction } from '@thxnetwork/types/enums/RewardConditionInteraction';
import { createImage } from '@thxnetwork/api/util/jest/images';
import { ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';

const user = request.agent(app);

describe('ERC721 Perks Redemtpion', () => {
    let erc721: ERC721Document,
        pool: AssetPoolDocument,
        nftContract: Contract,
        erc721Token: ERC721Document,
        perk: ERC721PerkDocument,
        balance: string,
        dailyReward: any,
        walletAddress: string;
    const chainId = ChainId.Hardhat,
        nftName = 'Test Collection',
        nftSymbol = 'TST';

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    it('POST /wallets', (done) => {
        user.post('/v1/wallets')
            .set({ Authorization: widgetAccessToken })
            .send({
                chainId: ChainId.Hardhat,
                sub,
                forceSync: true,
            })
            .expect((res: request.Response) => {
                expect(res.body.sub).toEqual(sub);
                expect(res.body.chainId).toEqual(ChainId.Hardhat);
                expect(res.body.address).toBeDefined();
                walletAddress = res.body.address;
            })
            .expect(201, done);
    });

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

    describe('Daily Rewards', () => {
        it('POST /daily-rewards', (done) => {
            const title = 'First Daily Reward';
            const description = 'description';
            const amount = 1500;
            user.post(`/v1/daily-rewards`)
                .set({ 'X-PoolId': pool._id, 'Authorization': dashboardAccessToken })
                .send({
                    title,
                    description,
                    amount,
                })
                .expect(({ body }: request.Response) => {
                    expect(body.uuid).toBeDefined();
                    expect(body.title).toBe(title);
                    expect(body.description).toBe(description);
                    expect(body.amount).toBe(amount.toString());
                    dailyReward = body;
                })
                .expect(201, done);
        });

        it('GET /daily-rewards/:id', (done) => {
            user.get(`/v1/daily-rewards/${dailyReward._id}`)
                .set({ 'X-PoolId': pool._id, 'Authorization': dashboardAccessToken })
                .expect(({ body }: request.Response) => {
                    expect(body.uuid).toBeDefined();
                    expect(body.title).toBe(dailyReward.title);
                    expect(body.description).toBe(dailyReward.description);
                    expect(body.amount).toBe(dailyReward.amount.toString());
                })
                .expect(200, done);
        });

        it('POST /rewards/daily/:uuid/claim', (done) => {
            user.post(`/v1/rewards/daily/${dailyReward.uuid}/claim`)
                .set({ 'X-PoolId': pool._id, 'Authorization': widgetAccessToken })
                .send({
                    sub,
                })
                .expect(201, done);
        });

        it('GET /point-balances', (done) => {
            user.get(`/v1/point-balances`)
                .set({ 'X-PoolId': pool._id, 'Authorization': widgetAccessToken })
                .expect(({ body }: request.Response) => {
                    expect(body.balance).toBe(dailyReward.amount.toString());
                    balance = body.balance;
                })
                .expect(200, done);
        });
    });

    describe('POST /erc721/import', () => {
        it('HTTP 201`', async () => {
            // Create 1 NFT collection
            nftContract = await deployNFT(nftName, nftSymbol);

            // Mint 1 token in the collection
            await TransactionService.sendAsync(
                nftContract.options.address,
                nftContract.methods.mint(pool.address, 'tokenuri.json'),
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
                    expect(body.erc721Tokens[0].recipient).toBe(pool.address);
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
                    expect(body.properties[0].name).toBe('name');
                    expect(body.properties[0].propType).toBe('string');
                    expect(body.properties[1].name).toBe('description');
                    expect(body.properties[1].propType).toBe('string');
                    expect(body.properties[2].name).toBe('image');
                    expect(body.properties[2].propType).toBe('image');
                    expect(body.totalSupply).toBe('1');
                    expect(body.owner).toBe(defaultAccount);
                    erc721 = body;
                })
                .expect(200, done);
        });
    });

    describe('POST /erc721-perks', () => {
        it('POST /erc721-perks', (done) => {
            const title = 'Lorem',
                description = 'Ipsum',
                expiryDate = addMinutes(new Date(), 30),
                pointPrice = 200,
                image = createImage(),
                platform = RewardConditionPlatform.Google,
                interaction = RewardConditionInteraction.YouTubeLike,
                content = 'videoid',
                rewardLimit = 0,
                claimAmount = 0,
                isPromoted = true;
            user.post('/v1/erc721-perks')
                .set({ 'X-PoolId': pool._id, 'Authorization': dashboardAccessToken })
                .attach('file', image, {
                    filename: 'test.jpg',
                    contentType: 'image/jpg',
                })
                .field({
                    title,
                    description,
                    image,
                    erc721Id: String(erc721._id),
                    erc721tokenId: erc721Token._id,
                    price: 0,
                    priceCurrency: 'USD',
                    pointPrice,
                    platform,
                    interaction,
                    content,
                    expiryDate: expiryDate.toString(),
                    rewardLimit,
                    claimAmount,
                    isPromoted,
                })
                .expect(({ body }: request.Response) => {
                    expect(body[0].uuid).toBeDefined();
                    expect(body[0].title).toBe(title);
                    expect(body[0].description).toBe(description);
                    expect(body[0].image).toBeDefined();
                    expect(body[0].pointPrice).toBe(pointPrice);
                    expect(body[0].platform).toBe(platform);
                    expect(body[0].interaction).toBe(interaction);
                    expect(body[0].content).toBe(content);
                    expect(new Date(body[0].expiryDate).getDate()).toBe(expiryDate.getDate());
                    expect(body[0].rewardLimit).toBe(rewardLimit);
                    expect(body[0].claimAmount).toBe(claimAmount);
                    expect(body[0].isPromoted).toBe(isPromoted);
                    expect(body[0].erc721).toBeDefined();
                    expect(body[0].erc721Id).toBe(erc721._id);
                    expect(body[0].erc721tokenId).toBe(erc721Token._id);
                    perk = body[0];
                })
                .expect(201, done);
        });
    });

    describe('POST /perks/erc721/:uuid/redemption', () => {
        it('POST /perks/erc721/:uuid/redemption', (done) => {
            user.post(`/v1/perks/erc721/${perk.uuid}/redemption`)
                .set({ 'X-PoolId': pool._id, 'Authorization': widgetAccessToken })
                .expect(({ body }: request.Response) => {
                    expect(body.erc721PerkPayment).toBeDefined();
                    expect(body.erc721PerkPayment.perkId).toBe(perk._id);
                    expect(body.erc721PerkPayment.poolId).toBe(pool._id);
                    expect(body.erc721Token).toBeDefined();
                    expect(body.erc721Token.sub).toBe(sub);
                    expect(body.erc721Token.erc721Id).toBe(erc721._id);
                    expect(body.erc721Token.state).toBe(ERC721TokenState.Transferred);
                    expect(body.erc721Token.recipient).toBe(walletAddress);
                    expect(body.erc721Token.tokenId).toBeDefined();
                })
                .expect(201, done);
        });

        it('GET /point-balances', (done) => {
            user.get(`/v1/point-balances`)
                .set({ 'X-PoolId': pool._id, 'Authorization': widgetAccessToken })
                .expect(({ body }: request.Response) => {
                    expect(body.balance).toBe((Number(balance) - perk.pointPrice).toString());
                })
                .expect(200, done);
        });
    });
});
