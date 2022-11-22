import request, { Response } from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '../../types/enums';
import {
    dashboardAccessToken,
    tokenName,
    tokenSymbol,
    walletAccessToken,
    walletAccessToken2,
} from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { WithdrawalState } from '@thxnetwork/api/types/enums';
import { getRewardConfiguration } from '@thxnetwork/api/controllers/rewards-utils';
import { ClaimDocument } from '@thxnetwork/api/types/TClaim';
import { ERC721TokenState } from '@thxnetwork/api/types/TERC721';

const user = request.agent(app);
const user2 = request.agent(app);

describe('RewardToken Claim', () => {
    let poolId: string, withdrawalDocumentId: string, tokenAddress: string;

    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    it('Create ERC20', (done) => {
        user.post('/v1/erc20')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
                name: tokenName,
                symbol: tokenSymbol,
                type: ERC20Type.Unlimited,
                totalSupply: 0,
            })
            .expect(({ body }: request.Response) => {
                expect(isAddress(body.address)).toBe(true);
                tokenAddress = body.address;
            })
            .expect(201, done);
    });

    it('Create Asset Pool', (done) => {
        user.post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
                erc20tokens: [tokenAddress],
            })
            .expect((res: request.Response) => {
                expect(isAddress(res.body.address)).toBe(true);
                poolId = res.body._id;
            })
            .expect(201, done);
    });

    describe('A reward with limit is 0 (unlimited) and claim_one disabled', () => {
        let claim: ClaimDocument;
        it('Create reward', (done) => {
            user.post('/v1/rewards-token/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send(getRewardConfiguration('no-limit-and-claim-one-disabled'))
                .expect((res: request.Response) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.claims).toBeDefined();
                    expect(res.body.claims.length).toBe(1);
                    expect(res.body.claims[0].id).toBeDefined();
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });

        describe('POST /rewards-token/:id/claim', () => {
            it('should return a 200 and withdrawal id', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body._id).toBeDefined();
                        expect(res.body.state).toEqual(WithdrawalState.Withdrawn);

                        withdrawalDocumentId = res.body._id;
                    })
                    .expect(200, done);
            });

            it('should return Withdrawn state', (done) => {
                user.get(`/v1/withdrawals/${withdrawalDocumentId}`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.state).toEqual(WithdrawalState.Withdrawn);
                    })
                    .expect(200, done);
            });

            it('should return a 200 for this second claim', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect(200, done);
            });
        });
    });

    describe('A reward with limit is 1 and claim_once disabled', () => {
        let claim: ClaimDocument;

        it('Create reward', (done) => {
            user.post('/v1/rewards-token/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send(getRewardConfiguration('one-limit-and-claim-one-disabled'))
                .expect((res: request.Response) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.claims).toBeDefined();
                    expect(res.body.claims[0].id).toBeDefined();
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });

        describe('POST /v1/claims/:id/collect', () => {
            it('should return a 200 and withdrawal id', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body._id).toBeDefined();
                        expect(res.body.state).toEqual(WithdrawalState.Withdrawn);

                        withdrawalDocumentId = res.body._id;
                    })
                    .expect(200, done);
            });

            it('should return Withdrawn state', (done) => {
                user.get(`/v1/withdrawals/${withdrawalDocumentId}`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.state).toEqual(WithdrawalState.Withdrawn);
                    })
                    .expect(200, done);
            });

            it('should return a 403 for this second claim', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect(403, done);
            });
        });
    });

    describe('A token reward with an expiration date set to t plus 30 minute', () => {
        let claim: ClaimDocument;
        it('Create reward', (done) => {
            user.post('/v1/rewards-token/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send(getRewardConfiguration('expiration-date-is-next-30-min'))
                .expect((res: request.Response) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.claims).toBeDefined();
                    expect(res.body.claims[0].id).toBeDefined();
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });

        describe('POST /v1/claims/:id/collect', () => {
            it('should return a 200 and withdrawal id', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body._id).toBeDefined();
                        expect(res.body.state).toEqual(WithdrawalState.Withdrawn);

                        withdrawalDocumentId = res.body._id;
                    })
                    .expect(200, done);
            });

            it('should return Withdrawn state', (done) => {
                user.get(`/v1/withdrawals/${withdrawalDocumentId}`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.state).toEqual(WithdrawalState.Withdrawn);
                    })
                    .expect(200, done);
            });
        });
    });

    describe('A token reward with an expiration date set to t minus 30 minute', () => {
        let claim: ClaimDocument;
        it('Create reward', (done) => {
            user.post('/v1/rewards-token/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send(getRewardConfiguration('expiration-date-is-previous-30-min'))
                .expect((res: request.Response) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.claims).toBeDefined();
                    expect(res.body.claims[0].id).toBeDefined();
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });

        describe('POST /v1/claims/:id/collect', () => {
            it('should return a 403 and withdrawal id', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect(403, done);
            });
        });
    });

    describe('A token reward with claim once enabled', () => {
        let claim: ClaimDocument;
        it('Create reward', (done) => {
            user.post('/v1/rewards-token/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send(getRewardConfiguration('claim-one-is-enabled'))
                .expect((res: request.Response) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.claims).toBeDefined();
                    expect(res.body.claims[0].id).toBeDefined();
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });

        describe('POST /v1/claims/:id/collect', () => {
            it('should return a 200 and withdrawal id', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body._id).toBeDefined();
                        expect(res.body.state).toEqual(WithdrawalState.Withdrawn);

                        withdrawalDocumentId = res.body._id;
                    })
                    .expect(200, done);
            });

            it('should return Withdrawn state', (done) => {
                user.get(`/v1/withdrawals/${withdrawalDocumentId}`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.state).toEqual(WithdrawalState.Withdrawn);
                    })
                    .expect(200, done);
            });

            it('should return a 403 for this second claim', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect(403, done);
            });
        });
    });

    describe('A token reward with claim once disabled', () => {
        let claim: ClaimDocument;
        it('Create reward', (done) => {
            user.post('/v1/rewards-token/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send(getRewardConfiguration('claim-one-is-disabled'))
                .expect((res: request.Response) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.claims).toBeDefined();
                    expect(res.body.claims[0].id).toBeDefined();
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });

        describe('POST /v1/claims/:id/collect', () => {
            it('should return a 200 and withdrawal id', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body._id).toBeDefined();
                        expect(res.body.state).toEqual(WithdrawalState.Withdrawn);

                        withdrawalDocumentId = res.body._id;
                    })
                    .expect(200, done);
            });

            it('should return Withdrawn state', (done) => {
                user.get(`/v1/withdrawals/${withdrawalDocumentId}`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.state).toEqual(WithdrawalState.Withdrawn);
                    })
                    .expect(200, done);
            });

            it('should return a 200 for this second claim', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect(200, done);
            });
        });
    });

    describe('Edit a token reward with claim once disabled to enabled', () => {
        let id = '';
        it('Create reward', (done) => {
            user.post('/v1/rewards-token/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send(getRewardConfiguration('claim-one-is-disabled'))
                .expect((res: request.Response) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.claims).toBeDefined();
                    expect(res.body.claims[0].id).toBeDefined();
                    id = res.body.id;
                })
                .expect(201, done);
        });

        describe('PATCH /rewards-token/:id', () => {
            it('Should return 200 when edit the claim', (done) => {
                user.patch(`/v1/rewards-token/${id}`)
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send(getRewardConfiguration('claim-one-is-enabled'))
                    .expect((res: request.Response) => {
                        expect(res.body.rewardBase.isClaimOnce).toEqual(true);
                    })
                    .expect(200, done);
            });
        });
    });

    describe('GET /rewards-nft', () => {
        it('Should return a list of rewards', (done) => {
            user.get('/v1/rewards-token')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })

                .expect((res: request.Response) => {
                    expect(res.body.results.length).toBe(7);
                    expect(res.body.results[0].claims).toBeDefined();
                    expect(res.body.limit).toBe(10);
                })
                .expect(200, done);
        });
    });
});
