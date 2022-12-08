import request, { Response } from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '../../types/enums';
import { dashboardAccessToken, walletAccessToken, walletAccessToken2 } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ClaimDocument } from '@thxnetwork/api/types/TClaim';
import { addMinutes } from '@thxnetwork/api/util/rewards';

const user = request.agent(app);
const user2 = request.agent(app);

describe('ERC721 Rewards', () => {
    let poolId: string, erc721metadataId: string;

    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    describe('an NFT reward with withdrawLimit = 1 is claimed by wallet user A and then should not be claimed again throught he same claim URL by wallet user B', () => {
        let erc721ID: string, erc721Address: string, claims: any;
        const name = 'Planets of the Galaxy',
            symbol = 'GLXY',
            description = 'description',
            schema = [
                { name: 'color', propType: 'string', description: 'lorem ipsum' },
                { name: 'size', propType: 'string', description: 'lorem ipsum dolor sit' },
            ];

        describe('POST /erc721', () => {
            it('should create an ERC721 and return contract details', (done) => {
                user.post('/v1/erc721')
                    .set('Authorization', dashboardAccessToken)
                    .send({
                        chainId: ChainId.Hardhat,
                        name,
                        symbol,
                        description,
                        schema,
                    })
                    .expect(({ body }: request.Response) => {
                        expect(body._id).toBeDefined();
                        expect(body.address).toBeDefined();
                        erc721ID = body._id;
                        erc721Address = body.address;
                    })
                    .expect(201, done);
            });
        });

        describe('POST /pools', () => {
            it('should create a POOL', (done) => {
                user.post('/v1/pools')
                    .set('Authorization', dashboardAccessToken)
                    .send({
                        chainId: ChainId.Hardhat,
                        erc20tokens: [],
                        erc721tokens: [erc721Address],
                    })
                    .expect(({ body }: request.Response) => {
                        expect(isAddress(body.address)).toBe(true);
                        expect(body.erc721Id).toBe(erc721ID);
                        poolId = body._id;
                    })
                    .expect(201, done);
            });
        });

        describe('POST /erc721/:id/metadata', () => {
            it('should create a Metadada and reward', (done) => {
                const value1 = 'blue',
                    value2 = 'small';

                user.post('/v1/erc721/' + erc721ID + '/metadata')
                    .set('Authorization', dashboardAccessToken)
                    .set('X-PoolId', poolId)
                    .send({
                        attributes: [
                            { key: schema[0].name, value: value1 },
                            { key: schema[1].name, value: value2 },
                        ],
                    })
                    .expect(({ body }: request.Response) => {
                        expect(body._id).toBeDefined();
                        expect(body.attributes[0].key).toBe(schema[0].name);
                        expect(body.attributes[1].key).toBe(schema[1].name);
                        expect(body.attributes[0].value).toBe(value1);
                        expect(body.attributes[1].value).toBe(value2);
                        claims = body.claims;
                        erc721metadataId = body._id;
                    })
                    .expect(201, done);
            });
        });

        describe('POST /claims/:id/collect', () => {
            it('should return a 200 and NFT minted', (done) => {
                user.post(`/v1/claims/${claims[0].id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.claim).toBeDefined();
                        expect(res.body.metadata).toBeDefined();
                        expect(res.body.erc721).toBeDefined();
                        expect(res.body.reward).toBeDefined();
                        expect(res.body.token).toBeDefined();
                    })
                    .expect(200, done);
            });
            it('should return 403 for claim from the same account', (done) => {
                user2
                    .post(`/v1/claims/${claims[0].id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                    .expect(({ body }: Response) => {
                        expect(body.error.message).toEqual("This reward has reached it's limit");
                    })
                    .expect(403, done);
            });
        });

        describe('POST /claims/:id/collect', () => {
            it('should return 403 for claim from another account', (done) => {
                user2
                    .post(`/v1/claims/${claims[0].id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                    .expect(({ body }: Response) => {
                        expect(body.error.message).toEqual("This reward has reached it's limit");
                    })
                    .expect(403, done);
            });
        });
    });

    describe('A reward with limit is 0 (unlimited) and claim_one enabled to disabled', () => {
        let claim: ClaimDocument, erc721PerkId: string;

        it('POST /erc721-perks', (done) => {
            const expiryDate = addMinutes(new Date(), 30);
            const pointPrice = 200;
            const image = 'http://myimage.com/1';
            user.post('/v1/erc721-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    title: 'Expiration date is next 30 min',
                    description: 'Lorem ipsum dolor sit amet',
                    erc721metadataId,
                    platform: 0,
                    expiryDate,
                    rewardLimit: 1,
                    claimAmount: 1,
                    pointPrice,
                    image,
                })
                .expect((res: request.Response) => {
                    expect(res.body._id).toBeDefined();
                    expect(res.body.pointPrice).toBe(pointPrice);
                    expect(res.body.image).toBe(image);
                    expect(res.body.claims.length).toBe(1);
                    expect(res.body.claims[0].id).toBeDefined();
                    claim = res.body.claims[0];
                    erc721PerkId = res.body._id;
                })
                .expect(201, done);
        });

        describe('PATCH /erc721-perks/:id', () => {
            it('Should return 200 when edit the reward', (done) => {
                const expiryDate = addMinutes(new Date(), 60);
                const title = 'Expiration date is next 60 min';
                user.patch(`/v1/erc721-perks/${erc721PerkId}`)
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        title,
                        description: 'Lorem ipsum dolor sit amet',
                        erc721metadataId,
                        platform: 0,
                        expiryDate,
                        rewardLimit: 0,
                        claimAmount: 1,
                    })
                    .expect((res: request.Response) => {
                        expect(res.body.title).toEqual(title);
                        expect(new Date(res.body.expiryDate).getTime()).toBe(expiryDate.getTime());
                    })
                    .expect(200, done);
            });
        });

        describe('POST /claims/:id/collect', () => {
            it('should return a 200 and NFT minted', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.claim).toBeDefined();
                        expect(res.body.metadata).toBeDefined();
                        expect(res.body.erc721).toBeDefined();
                        expect(res.body.reward).toBeDefined();
                        expect(res.body.token).toBeDefined();
                    })
                    .expect(200, done);
            });
        });
    });

    describe('GET /erc721-perks', () => {
        it('Should return a list of rewards', (done) => {
            user.get('/v1/erc721-perks')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })

                .expect((res: request.Response) => {
                    expect(res.body.results.length).toBe(2);
                    expect(res.body.results[0].claims).toBeDefined();
                    expect(res.body.limit).toBe(10);
                    expect(res.body.total).toBe(2);
                })
                .expect(200, done);
        });
    });
});
