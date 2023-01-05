import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '../../types/enums';
import { dashboardAccessToken, walletAccessToken } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ClaimDocument } from '@thxnetwork/api/types/TClaim';
import { addMinutes } from '@thxnetwork/api/util/rewards';
import { createImage } from '@thxnetwork/api/util/jest/images';

const user = request.agent(app);

describe('ERC721 Perks', () => {
    let poolId: string, erc721metadataId: string, erc721ID: string, erc721Address: string, claims: any;
    const name = 'Planets of the Galaxy',
        symbol = 'GLXY',
        description = 'description',
        schema = [
            { name: 'color', propType: 'string', description: 'lorem ipsum' },
            { name: 'size', propType: 'string', description: 'lorem ipsum dolor sit' },
        ];

    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    describe('an NFT reward with withdrawLimit = 1 is claimed by wallet user A and then should not be claimed again throught he same claim URL by wallet user B', () => {
        let erc721Address: string;

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
            it('should create a Metadada', (done) => {
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
                        erc721metadataId = body._id;
                    })
                    .expect(201, done);
            });
        });
    });

    describe('A reward with limit is 0 (unlimited) and claim_one enabled to disabled', () => {
        let claim: ClaimDocument, erc721PerkId: string;

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

        it('POST /erc721-perks', (done) => {
            const expiryDate = addMinutes(new Date(), 30);
            const pointPrice = 200;
            const image = createImage();

            user.post('/v1/erc721-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .field({
                    title: 'Expiration date is next 30 min',
                    description: 'Lorem ipsum dolor sit amet',
                    platform: 0,
                    expiryDate: expiryDate.toString(),
                    rewardLimit: 1,
                    claimAmount: 1,
                    pointPrice,
                    erc721metadataIds: JSON.stringify([erc721metadataId]),
                    isPromoted: true,
                })
                .attach('file', image, {
                    filename: 'test.jpg',
                    contentType: 'image/jpg',
                })
                .expect((res: request.Response) => {
                    expect(res.body[0]._id).toBeDefined();
                    expect(res.body[0].image).toBeDefined();
                    expect(res.body[0].pointPrice).toBe(pointPrice);
                    expect(new Date(res.body[0].expiryDate).getDate()).toBe(expiryDate.getDate());
                    expect(res.body[0].isPromoted).toBe(true);
                    expect(res.body[0].claims.length).toBe(1);
                    expect(res.body[0].claims[0].uuid).toBeDefined();
                    claim = res.body[0].claims[0];
                    erc721PerkId = res.body[0]._id;
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
                        erc721metadataIds: JSON.stringify([erc721metadataId]),
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
                user.post(`/v1/claims/${claim.uuid}/collect`)
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
                    expect(res.body.results.length).toBe(1);
                    expect(res.body.results[0].claims).toBeDefined();
                    expect(res.body.limit).toBe(10);
                    expect(res.body.total).toBe(1);
                })
                .expect(200, done);
        });
    });

    describe('DELETE /erc721/:id/metadata/:metadataID', () => {
        it('should successfully delete erc721 metadata', (done) => {
            user.delete(`/v1/erc721/${erc721ID}/metadata/${erc721metadataId}`)
                .set('Authorization', dashboardAccessToken)
                .set('X-PoolId', poolId)
                .expect(200, done);
        });
    });
});
