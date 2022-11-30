import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '../../types/enums';
import { dashboardAccessToken, tokenName, tokenSymbol } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { addMinutes } from '@thxnetwork/api/util/rewards';

const user = request.agent(app);

describe('Referral Rewards', () => {
    let poolId: string, tokenAddress: string, referralRewardId: string, referralReward: any;

    beforeAll(async () => {
        await beforeAllCallback();
    });

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
                tokenAddress = body.address;
            })
            .expect(201, done);
    });

    it('POST /pools', (done) => {
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

    it('POST /referral-rewards', (done) => {
        const expiryDate = addMinutes(new Date(), 30);
        const successUrl = 'http://www.google.com';
        user.post('/v1/referral-rewards/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title: 'Expiration date is next 30 min',
                description: 'Lorem ipsum dolor sit amet',
                amount: 100,
                platform: 0,
                expiryDate,
                rewardLimit: 0,
                claimAmount: 1,
                successUrl,
            })
            .expect((res: request.Response) => {
                expect(res.body.uuid).toBeDefined();
                expect(res.body.successUrl).toBe(successUrl);
                expect(res.body.amount).toBe(100);
                expect(new Date(res.body.expiryDate).getTime()).toBe(expiryDate.getTime());
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
                expect(res.body.results.length).toBe(1);
                expect(res.body.limit).toBe(10);
                expect(res.body.total).toBe(1);
            })
            .expect(200, done);
    });

    it('PATCH /referral-rewards/:id', (done) => {
        const title = 'Expiration date is next 60 min';
        const description = 'new description';
        const successUrl = 'http://thx.network';
        user.patch(`/v1/referral-rewards/${referralRewardId}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title,
                description,
                successUrl,
            })
            .expect((res: request.Response) => {
                expect(res.body.title).toEqual(title);
                expect(res.body.description).toEqual(description);
                expect(res.body.successUrl).toEqual(successUrl);
            })
            .expect(200, done);
    });

    it('DELETE /referral-rewards/:id', (done) => {
        user.delete(`/v1/referral-rewards/${referralRewardId}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(204, done);
    });
});
