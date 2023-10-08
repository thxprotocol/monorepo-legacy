import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type, RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/enums';
import { dashboardAccessToken, tokenName, tokenSymbol } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';

const user = request.agent(app);

describe('Quests', () => {
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
        const successUrl = 'http://www.google.com';
        const isPublished = true;
        user.post('/v1/referral-rewards/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title: 'Expiration date is next 30 min',
                description: 'Lorem ipsum dolor sit amet',
                amount: 100,
                successUrl,
                isPublished,
                index: 0,
            })
            .expect((res: request.Response) => {
                expect(res.body.uuid).toBeDefined();
                expect(res.body.successUrl).toBe(successUrl);
                expect(res.body.amount).toBe(100);
                expect(res.body.isPublished).toBe(isPublished);
                referralReward = res.body;
            })
            .expect(201, done);
    });

    it('POST /point-rewards', (done) => {
        const title = 'title';
        const description = 'description';
        const amount = 160;
        const index = 0;
        const isPublished = true;

        user.post('/v1/point-rewards/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title,
                description,
                amount,
                platform: RewardConditionPlatform.Twitter,
                interaction: RewardConditionInteraction.TwitterFollow,
                content: '123123',
                limit: 1,
                isPublished,
                index,
            })
            .expect((res: request.Response) => {
                expect(res.body.title).toBe(title);
                expect(res.body.description).toBe(description);
                expect(res.body.amount).toBe(amount);
                expect(res.body.isPublished).toBe(isPublished);
                pointReward = res.body;
            })
            .expect(201, done);
    });

    it('POST /milestone-rewards', (done) => {
        const title = 'title';
        const description = 'description';
        const amount = 250;
        const index = 0;
        const isPublished = true;
        user.post('/v1/milestone-rewards/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title,
                description,
                amount,
                index,
                isPublished,
            })
            .expect((res: request.Response) => {
                expect(res.body.title).toBe(title);
                expect(res.body.description).toBe(description);
                expect(res.body.amount).toBe(amount);
                expect(res.body.isPublished).toBe(isPublished);
                milestoneReward = res.body;
            })
            .expect(201, done);
    });

    it('GET /quests', (done) => {
        user.get(`/v1/quests`)
            .set({ 'X-PoolId': poolId })
            .expect((res: request.Response) => {
                // expect(res.body.daily[res.body.daily.length - 1].uuid).toBe(dailyReward._id);
                expect(res.body.invite[res.body.invite.length - 1]._id).toBe(referralReward._id);
                expect(res.body.social[res.body.social.length - 1]._id).toBe(pointReward._id);
                expect(res.body.custom[res.body.custom.length - 1]._id).toBe(milestoneReward._id);
            })
            .expect(200, done);
    });
});
