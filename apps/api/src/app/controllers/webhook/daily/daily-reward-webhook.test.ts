import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import { dashboardAccessToken, userWalletAddress2, widgetAccessToken2 } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { DailyReward, DailyRewardDocument } from '@thxnetwork/api/models/DailyReward';

const user = request.agent(app);

describe('Daily Rewards WebHooks', () => {
    let poolId: string, dailyReward: DailyRewardDocument;
    const eventName = 'test_event';

    beforeAll(beforeAllCallback);
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
                amounts: JSON.stringify([100]),
                eventName,
                index: 0,
            })
            .expect(async ({ body }: request.Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.eventName).toBeDefined();
                expect(body.amounts[0]).toBe(100);
                dailyReward = body;

                // Simulate Forest Knight migration where eventName === quest.uuid
                await DailyReward.findByIdAndUpdate(dailyReward._id, { eventName: dailyReward.uuid });
            })
            .expect(201, done);
    });

    it('POST /webhook/daily/:uuid', async () => {
        const { status } = await user.post(`/v1/webhook/daily/${dailyReward.uuid}`).send({
            address: userWalletAddress2,
        });
        expect(status).toBe(201);
    });

    it('GET /account to update identity', (done) => {
        user.get(`/v1/account`).set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken2 }).expect(200, done);
    });

    it('POST /quests/daily/:uuid/claim', (done) => {
        user.post(`/v1/quests/daily/${dailyReward._id}/claim`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken2 })
            .send()
            .expect(201, done);
    });

    it('POST /quests/daily/:uuid/claim should throw an error', (done) => {
        user.post(`/v1/quests/daily/${dailyReward._id}/claim`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken2 })
            .send()
            .expect(({ body }: request.Response) => {
                expect(body.error).toBe('Already completed within the last 24 hours.');
            })
            .expect(200, done);
    });
});
