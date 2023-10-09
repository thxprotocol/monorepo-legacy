import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '@thxnetwork/types/enums';
import {
    dashboardAccessToken,
    sub2,
    tokenName,
    tokenSymbol,
    walletAccessToken3,
} from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';

const user = request.agent(app);

describe('Referral Rewards', () => {
    let poolId: string, referralRewardId: string, referralReward: any, referralRewardClaim: any;

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    it('POST /erc20', (done) => {
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
            })
            .expect(201, done);
    });

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send({ chainId: ChainId.Hardhat })
            .expect((res: request.Response) => {
                expect(isAddress(res.body.address)).toBe(true);
                poolId = res.body._id;
            })
            .expect(201, done);
    });

    it('POST /referral-rewards', (done) => {
        const successUrl = 'https://www.google.com';
        user.post('/v1/referral-rewards/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title: 'Expiration date is next 30 min',
                description: 'Lorem ipsum dolor sit amet',
                amount: 100,
                successUrl,
                index: 0,
            })
            .expect((res: request.Response) => {
                expect(res.body.uuid).toBeDefined();
                expect(res.body.successUrl).toBe(successUrl);
                expect(res.body.amount).toBe(100);
                referralRewardId = res.body._id;
                referralReward = res.body;
            })
            .expect(201, done);
    });

    it('GET /referral-rewards/:id', (done) => {
        user.get(`/v1/referral-rewards/${referralRewardId}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect((res: request.Response) => {
                expect(res.body.title).toEqual(referralReward.title);
                expect(res.body.description).toEqual(referralReward.description);
                expect(res.body.successUrl).toEqual(referralReward.successUrl);
            })
            .expect(200, done);
    });

    it('GET /referral-rewards', (done) => {
        user.get(`/v1/referral-rewards`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect((res: request.Response) => {
                expect(res.body.results.length).toBe(2);
                expect(res.body.limit).toBe(10);
                expect(res.body.total).toBe(2);
            })
            .expect(200, done);
    });

    it('PATCH /referral-rewards/:id', (done) => {
        const title = 'Invite quest title';
        const description = 'Invite quest description';
        const successUrl = 'https://thx.network';
        user.patch(`/v1/referral-rewards/${referralRewardId}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title,
                description,
                successUrl,
            })
            .expect((res: request.Response) => {
                console.log(res.body);
                expect(res.body.title).toEqual(title);
                expect(res.body.description).toEqual(description);
                expect(res.body.successUrl).toEqual(successUrl);
            })
            .expect(200, done);
    });

    it('POST /referral-rewards/:uuid/claims', (done) => {
        user.post(`/v1/referral-rewards/${referralReward.uuid}/claims`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                sub: sub2,
            })
            .expect((res: request.Response) => {
                expect(res.body.referralRewardId).toBe(referralRewardId);
                expect(res.body.uuid).toBeDefined();
                expect(res.body.sub).toBe(sub2);
                expect(res.body.isApproved).toBe(false);
                expect(res.body.poolId).toBe(poolId);
                referralRewardClaim = res.body;
            })
            .expect(201, done);
    });

    it('GET /referral-rewards/:uuid/claims', (done) => {
        user.get(`/v1/referral-rewards/${referralReward.uuid}/claims`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect((res: request.Response) => {
                expect(res.body.results.length).toBe(1);
                expect(res.body.results[0].isApproved).toBe(false);
                expect(res.body.results[0].email).toBeDefined();
                expect(res.body.results[0].createdAt).toBeDefined();
                expect(res.body.limit).toBe(10);
                expect(res.body.total).toBe(1);
            })
            .expect(200, done);
    });

    it('POST /referral-rewards/:uuid/claims/approve', (done) => {
        user.post(`/v1/referral-rewards/${referralReward.uuid}/claims/approve`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                claimUuids: [referralRewardClaim.uuid],
            })
            .expect((res: request.Response) => {
                expect(res.body[0].referralRewardId).toBe(referralRewardId);
                expect(res.body[0].uuid).toBeDefined();
                expect(res.body[0].sub).toBe(sub2);
                expect(res.body[0].isApproved).toBe(true);
                referralRewardClaim = res.body[0];
            })
            .expect(200, done);
    });

    it('GET /point-balances', (done) => {
        user.get(`/v1/point-balances`)
            .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken3 })
            .expect((res: request.Response) => {
                expect(res.body.balance).toBe(referralReward.amount);
            })
            .expect(200, done);
    });

    it('PATCH /referral-rewards/:uuid/claims/:id', (done) => {
        user.patch(`/v1/referral-rewards/${referralReward.uuid}/claims/${referralRewardClaim.uuid}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                isApproved: false,
            })
            .expect((res: request.Response) => {
                expect(res.body.referralRewardId).toBe(referralRewardId);
                expect(res.body.uuid).toBeDefined();
                expect(res.body.sub).toBe(sub2);
                expect(res.body.isApproved).toBe(false);
                referralRewardClaim = res.body;
            })
            .expect(200, done);
    });

    it('DELETE /referral-rewards/:id', (done) => {
        user.delete(`/v1/referral-rewards/${referralRewardId}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(204, done);
    });
});
