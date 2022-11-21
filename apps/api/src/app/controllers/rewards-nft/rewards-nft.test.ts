import request, { Response } from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '../../types/enums';
import { dashboardAccessToken, walletAccessToken, walletAccessToken2 } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { getRewardNftConfiguration } from '@thxnetwork/api/controllers/rewards-utils';
import { ClaimDocument } from '@thxnetwork/api/types/TClaim';
import { ERC721TokenState } from '@thxnetwork/api/types/TERC721';

const user = request.agent(app);
const user2 = request.agent(app);

describe('RewardNft Claim', () => {
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
                const title = 'NFT title 1',
                    description = 'NFT description 1',
                    value1 = 'blue',
                    value2 = 'small';

                user.post('/v1/erc721/' + erc721ID + '/metadata')
                    .set('Authorization', dashboardAccessToken)
                    .set('X-PoolId', poolId)
                    .send({
                        title,
                        description,
                        attributes: [
                            { key: schema[0].name, value: value1 },
                            { key: schema[1].name, value: value2 },
                        ],
                    })
                    .expect(({ body }: request.Response) => {
                        expect(body._id).toBeDefined();
                        expect(body.title).toBe(title);
                        expect(body.description).toBe(description);
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
                        expect(res.body._id).toBeDefined();
                        expect(res.body.state).toBe(ERC721TokenState.Minted);
                    })
                    .expect(200, done);
            });
        });

        describe('POST /claims/:id/collect', () => {
            it('should NOT allows to collect again the same claim', (done) => {
                user2
                    .post(`/v1/claims/${claims[0].id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                    .expect(({ body }: Response) => {
                        expect(body.error.message).toEqual('This NFT has already been claimed');
                    })
                    .expect(403, done);
            });
        });
    });

    describe('A reward with limit is 0 (unlimited) and claim_one disabled to enabled', () => {
        let claim: ClaimDocument, rewardNftId: string;

        it('Create reward', (done) => {
            user.post('/v1/rewards-nft/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send(getRewardNftConfiguration('claim-one-is-disabled', erc721metadataId))
                .expect((res: request.Response) => {
                    console.log('RES BODY', res.body);
                    expect(res.body.id).toBeDefined();
                    expect(res.body.claims).toBeDefined();
                    expect(res.body.claims.length).toBe(1);
                    expect(res.body.claims[0].id).toBeDefined();
                    claim = res.body.claims[0];
                    rewardNftId = res.body.id;
                })
                .expect(201, done);
        });

        describe('PATCH /rewards-nft/:id', () => {
            it('Should return 200 when edit the claim', (done) => {
                console.log('rewardNftId', rewardNftId);
                user.patch(`/v1/rewards-nft/${rewardNftId}`)
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send(getRewardNftConfiguration('claim-one-is-enabled', erc721metadataId))
                    .expect((res: request.Response) => {
                        expect(res.body.isClaimOnce).toEqual(true);
                        console.log('BODYYYYY', res.body);
                    })
                    .expect(200, done);
            });
        });

        describe('POST /claims/:id/collect', () => {
            it('should return a 200 and NFT minted', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body._id).toBeDefined();
                        expect(res.body.state).toBe(ERC721TokenState.Minted);
                    })
                    .expect(200, done);
            });
        });
    });

    describe('A token reward with an expiration date set to t plus 30 minute', () => {
        let claim: ClaimDocument;
        it('Create reward', (done) => {
            user.post('/v1/rewards-nft/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send(getRewardNftConfiguration('expiration-date-is-next-30-min', erc721metadataId))
                .expect((res: request.Response) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.claims).toBeDefined();
                    expect(res.body.claims[0].id).toBeDefined();
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });

        describe('POST /v1/claims/:id/collect', () => {
            describe('POST /claims/:id/collect', () => {
                it('should return a 200 and NFT minted', (done) => {
                    user.post(`/v1/claims/${claim.id}/collect`)
                        .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                        .expect((res: request.Response) => {
                            expect(res.body._id).toBeDefined();
                            expect(res.body.state).toBe(ERC721TokenState.Minted);
                        })
                        .expect(200, done);
                });
            });
        });
    });

    describe('A token reward with an expiration date set to t minus 30 minute', () => {
        let claim: ClaimDocument;
        it('Create reward', (done) => {
            user.post('/v1/rewards-nft/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send(getRewardNftConfiguration('expiration-date-is-previous-30-min', erc721metadataId))
                .expect((res: request.Response) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.claims).toBeDefined();
                    expect(res.body.claims[0].id).toBeDefined();
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });

        describe('POST /v1/claims/:id/collect', () => {
            it('should return a 403', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect(403, done);
            });
        });
    });
});
