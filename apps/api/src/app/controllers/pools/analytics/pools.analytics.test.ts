import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '@thxnetwork/types/enums';
import {
    tokenName,
    tokenSymbol,
    dashboardAccessToken,
    sub2,
    widgetAccessToken,
    userWalletAddress2,
    sub,
    account,
    account2,
} from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { addMinutes } from '@thxnetwork/api/util/rewards';
import { fromWei, isAddress, toWei } from 'web3-utils';
import nock from 'nock';
import { AUTH_URL } from '@thxnetwork/api/config/secrets';

const user = request.agent(app);

describe('Pool Analytics', () => {
    let pointReward: any,
        referralReward: any,
        referralReward2: any,
        referralRewardClaim: any,
        referralRewardClaim2: any,
        milestoneReward: any,
        milestoneRewardClaim: any,
        perkUuid: string,
        erc20Id: string,
        poolId: string;

    const totalSupply = toWei('100000');

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    describe('Create ERC20 Token', () => {
        it('POST /erc20', (done) => {
            user.post('/v1/erc20')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId: ChainId.Hardhat,
                    name: tokenName,
                    symbol: tokenSymbol,
                    type: ERC20Type.Limited,
                    totalSupply,
                })
                .expect(({ body }: request.Response) => {
                    expect(isAddress(body.address)).toBe(true);
                    erc20Id = body._id;
                })
                .expect(201, done);
        });
    });

    describe('Pool Analytics', () => {
        it('POST /pools', (done) => {
            user.post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId: ChainId.Hardhat,
                    title: 'My Pool',
                })
                .expect((res: request.Response) => {
                    poolId = res.body._id;
                    expect(res.body.settings.title).toBe('My Pool');
                    expect(res.body.settings.isArchived).toBe(false);
                })
                .expect(201, done);
        });
        describe('Create 2 Referral Rewards, claim and approve', () => {
            it('POST /referral-rewards', (done) => {
                const successUrl = 'http://www.google.com';
                user.post('/v1/referral-rewards/')
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        title: 'Referral Reward 1',
                        amount: 100,
                        successUrl,
                        index: 0,
                    })
                    .expect((res: request.Response) => {
                        referralReward = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /rewards/referral/:uuid/claim', (done) => {
                user.post(`/v1/rewards/referral/${referralReward.uuid}/claim`)
                    .set({ 'X-PoolId': poolId })
                    .send({ sub: sub2 })
                    .expect((res: request.Response) => {
                        expect(res.body.sub).toBe(sub2);
                        referralRewardClaim = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /referral-rewards/:uuid/claims/approve', (done) => {
                user.post(`/v1/referral-rewards/${referralReward.uuid}/claims/approve`)
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        claimUuids: [referralRewardClaim.uuid],
                    })
                    .expect(200, done);
            });

            it('POST /referral-rewards', (done) => {
                const successUrl = 'http://www.google.com';
                user.post('/v1/referral-rewards/')
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        title: 'Referral Reward 2',
                        amount: 50,
                        successUrl,
                        index: 0,
                    })
                    .expect((res: request.Response) => {
                        referralReward2 = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /referral-rewards/:uuid/claims', (done) => {
                user.post(`/v1/rewards/referral/${referralReward2.uuid}/claim`)
                    .set({ 'X-PoolId': poolId })
                    .send({ sub: sub2 })
                    .expect((res: request.Response) => {
                        expect(res.body.sub).toBe(sub2);
                        referralRewardClaim2 = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /referral-rewards/:uuid/claims/approve', (done) => {
                user.post(`/v1/referral-rewards/${referralReward2.uuid}/claims/approve`)
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        claimUuids: [referralRewardClaim2.uuid],
                    })
                    .expect(200, done);
            });
        });

        describe('Create 2 Points Rewards and claim', () => {
            it('POST /point-rewards', (done) => {
                const expiryDate = addMinutes(new Date(), 30);
                const title = 'Point Reward 1';
                const description = 'description';
                const amount = '10';
                user.post('/v1/point-rewards/')
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        title,
                        description,
                        amount,
                        platform: 0,
                        expiryDate,
                        limit: 1,
                        claimAmount: 1,
                        index: 0,
                    })
                    .expect((res: request.Response) => {
                        pointReward = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /rewards/points/:id/claim', (done) => {
                user.post(`/v1/rewards/points/${pointReward._id}/claim`)
                    .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                    .expect(201, done);
            });

            it('POST /point-rewards', (done) => {
                const expiryDate = addMinutes(new Date(), 30);
                const title = 'Point Reward 2';
                const description = 'description';
                const amount = '20';
                user.post('/v1/point-rewards/')
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        title,
                        description,
                        amount,
                        platform: 0,
                        expiryDate,
                        limit: 1,
                        claimAmount: 1,
                        index: 0,
                    })
                    .expect((res: request.Response) => {
                        pointReward = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /rewards/points/:uuid/claim', (done) => {
                user.post(`/v1/rewards/points/${pointReward._id}/claim`)
                    .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                    .expect(201, done);
            });
        });

        describe('Create 1 Milestone, claim and collect', () => {
            it('POST /milestone-rewards', (done) => {
                user.post('/v1/milestone-rewards/')
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        title: 'Expiration date is next 30 min',
                        description: 'Lorem ipsum dolor sit amet',
                        amount: 1000,
                        index: 0,
                    })
                    .expect((res: request.Response) => {
                        milestoneReward = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /webhook/milestone/:token/claim', (done) => {
                user.post(`/v1/webhook/milestone/${milestoneReward.uuid}/claim`)
                    .send({
                        address: userWalletAddress2,
                    })
                    .expect((res: request.Response) => {
                        expect(res.body.milestoneRewardId).toBe(milestoneReward._id);
                        expect(res.body.uuid).toBeDefined();
                        milestoneRewardClaim = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /milestones/claims/:uuid/collect', (done) => {
                user.post(`/v1/rewards/milestones/claims/${milestoneRewardClaim.uuid}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                    .send({
                        address: userWalletAddress2,
                    })
                    .expect((res: request.Response) => {
                        expect(res.body.isClaimed).toBe(true);
                    })
                    .expect(201, done);
            });
        });

        describe('Create 1 ERC20Perk, and redeeem', () => {
            it('POST /pools/:id/topup', (done) => {
                const amount = fromWei(totalSupply, 'ether'); // 100 eth
                user.post(`/v1/pools/${poolId}/topup`)
                    .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': poolId })
                    .send({ erc20Id: erc20Id, amount })
                    .expect(200, done);
            });
            it('POST /erc20-perks', (done) => {
                const expiryDate = addMinutes(new Date(), 30);
                const image = 'http://myimage.com/1';

                user.post('/v1/erc20-perks/')
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        erc20Id: erc20Id,
                        title: 'Receive 500 TST tokens',
                        description: 'Lorem ipsum dolor sit amet.',
                        image,
                        amount: 1,
                        limit: 0,
                        pointPrice: 5,
                        expiryDate,
                    })
                    .expect((res: request.Response) => {
                        expect(res.body.uuid).toBeDefined();
                        perkUuid = res.body.uuid;
                        perk = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /perks/erc20/:uuid/redemption', (done) => {
                user.post(`/v1/perks/erc20/${perkUuid}/redemption`)
                    .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.withdrawal).toBeDefined();
                        expect(res.body.erc20PerkPayment).toBeDefined();
                        expect(res.body.erc20PerkPayment.poolId).toBe(poolId);
                    })
                    .expect(201, done);
            });
        });
        describe('Generate Analitycs', () => {
            beforeAll(async () => {
                nock(`${AUTH_URL}/account?subs=${sub},${sub2}`)
                    .persist()
                    .get(/.*?/)
                    .reply(200, () => {
                        return [account, account2];
                    });
            });
            it('GET /pools/:id/analytics', (done) => {
                const oneDay = 86400000; // one day in milliseconds
                const endDate = new Date();

                endDate.setHours(0, 0, 0, 0);
                const startDate = new Date(new Date(endDate).getTime() - oneDay * 14);
                endDate.setHours(23, 59, 59, 0);

                user.get(`/v1/pools/${poolId}/analytics?startDate=${startDate}&endDate=${endDate}`)
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .expect(({ body }: request.Response) => {
                        expect(body.referralRewards.length).toBe(1);
                        expect(body.referralRewards[0].totalClaimPoints).toBe(150);
                        expect(body.pointRewards.length).toBe(1);
                        expect(body.pointRewards[0].totalClaimPoints).toBe(30);
                        expect(body.milestoneRewards.length).toBe(1);
                        expect(body.milestoneRewards[0].totalClaimPoints).toBe(1000);
                        expect(body.erc20Perks.length).toBe(1);
                        expect(body.erc20Perks[0].totalAmount).toBe(5);
                    })

                    .expect(200, done);
            });

            it('GET /pools/:id/analytics/leaderboard', (done) => {
                user.get(`/v1/pools/${poolId}/analytics/leaderboard`)
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .expect(({ body }: request.Response) => {
                        expect(body.length).toBe(3);
                        expect(body[0].score).toBe(1000); // Missing referral claims
                        expect(body[1].score).toBe(150); // Missing referral claims
                    })
                    .expect(200, done);
            });

            it('GET /pools/:id/analytics/metrics', (done) => {
                user.get(`/v1/pools/${poolId}/analytics/metrics`)
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .expect(({ body }: request.Response) => {
                        expect(body.claims).toBe(0);
                        expect(body.erc20Perks).toEqual({ total: 1, payments: 1, totalAmount: 5 });
                        expect(body.referralRewards).toEqual({ total: 3, claims: 2, totalClaimPoints: 150 });
                        expect(body.pointRewards).toEqual({ total: 3, claims: 2, totalClaimPoints: 30 });
                        expect(body.milestoneRewards).toEqual({ total: 2, claims: 1, totalClaimPoints: 1000 });
                    })
                    .expect(200, done);
            });
        });
    });
});
