import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '../../types/enums';
import { dashboardAccessToken, tokenName, tokenSymbol } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { addMinutes } from '@thxnetwork/api/util/rewards';

const user = request.agent(app);

describe('Rewards', () => {
    let poolId: string, tokenAddress: string, referralReward: any, pointReward: any, milestoneReward: any;

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
                referralReward = res.body;
            })
            .expect(201, done);
    });

    it('POST /point-rewards', (done) => {
        const expiryDate = addMinutes(new Date(), 30);
        const title = 'title';
        const description = 'description';
        const amount = '160';
        user.post('/v1/point-rewards/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title,
                description,
                amount,
                platform: 0,
                expiryDate,
                rewardLimit: 1,
                claimAmount: 1,
            })
            .expect((res: request.Response) => {
                expect(res.body.title).toBe(title);
                expect(res.body.description).toBe(description);
                expect(res.body.amount).toBe(amount);
                pointReward = res.body;
            })
            .expect(201, done);
    });

    it('POST /milestone-rewards', (done) => {
        const title = 'title';
        const description = 'description';
        const amount = '250';
        user.post('/v1/milestone-rewards/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title,
                description,
                amount,
            })
            .expect((res: request.Response) => {
                expect(res.body.title).toBe(title);
                expect(res.body.description).toBe(description);
                expect(String(res.body.amount)).toBe(amount);
                milestoneReward = res.body;
            })
            .expect(201, done);
    });

    it('GET /rewards', (done) => {
        user.get(`/v1/rewards`)
            .set({ 'X-PoolId': poolId })
            .expect((res: request.Response) => {
                expect(res.body.referralRewards.length).toBe(2);
                expect(res.body.referralRewards[1].uuid).toBe(referralReward.uuid);
                expect(res.body.pointRewards.length).toBe(2);
                expect(res.body.pointRewards[1].uuid).toBe(pointReward.uuid);
                expect(res.body.milestoneRewards.length).toBe(2);
                expect(res.body.milestoneRewards[1].uuid).toBe(milestoneReward.uuid);
            })
            .expect(200, done);
    });
});
