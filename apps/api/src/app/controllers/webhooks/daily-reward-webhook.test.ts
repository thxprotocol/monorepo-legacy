import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, DailyRewardClaimState } from '@thxnetwork/types/enums';
import { dashboardAccessToken, sub2, userWalletAddress2, widgetAccessToken } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';

const user = request.agent(app);

describe('Daily Rewards WebHooks', () => {
    let poolId: string, dailyReward: any;

    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
            })
            .expect((res: request.Response) => {
                expect(isAddress(res.body.address)).toBe(true);
                poolId = res.body._id;
            })
            .expect(201, done);
    });

    it('POST /daily-rewards', (done) => {
        user.post('/v1/daily-rewards/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title: 'Expiration date is next 30 min',
                description: 'Lorem ipsum dolor sit amet',
                amount: 100,
                limit: 0,
                isEnabledWebhookQualification: true,
            })
            .expect(({ body }: request.Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.amount).toBe(100);
                dailyReward = body;
            })
            .expect(201, done);
    });

    it('POST /webhook/daily/:token', (done) => {
        user.post(`/v1/webhook/daily/${dailyReward.uuid}`)
            .send({
                address: userWalletAddress2,
            })
            .expect(({ body }: request.Response) => {
                expect(body.dailyRewardId).toBe(dailyReward._id);
                expect(body.uuid).toBeDefined();
                expect(body.state).toBe(DailyRewardClaimState.Pending);
            })
            .expect(201, done);
    });

    it('POST /rewards/daily/:uuid/claim', (done) => {
        user.post(`/v1/rewards/daily/${dailyReward.uuid}/claim`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .send({
                sub2,
            })
            .expect(({ body }: request.Response) => {
                expect(body.state).toBe(DailyRewardClaimState.Claimed);
            })
            .expect(201, done);
    });
});
