import request from 'supertest';
import app from '@thxnetwork/api/';
import { QuestVariant } from '@thxnetwork/types/enums';
import { dashboardAccessToken, userWalletAddress2, widgetAccessToken2 } from '@thxnetwork/api/util/jest/constants';
import { isAddress, toNumber } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { DailyReward, DailyRewardDocument } from '@thxnetwork/api/models/DailyReward';
import { poll } from '@thxnetwork/api/util/polling';
import { Job } from '@thxnetwork/api/models/Job';
import { TJob } from '@thxnetwork/common/lib/types';

const user = request.agent(app);

describe('Daily Rewards WebHooks', () => {
    let poolId: string, dailyReward: DailyRewardDocument;
    const eventName = 'test_event';

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send()
            .expect((res: request.Response) => {
                expect(isAddress(res.body.safeAddress)).toBe(true);
                poolId = res.body._id;
            })
            .expect(201, done);
    });

    it('POST /daily-rewards', (done) => {
        user.post(`/v1/pools/${poolId}/quests`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                variant: QuestVariant.Daily,
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

    it('POST /quests/daily/:uuid/claim', async () => {
        const { status, body } = await user
            .post(`/v1/quests/daily/${dailyReward._id}/claim`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken2 })
            .send();
        expect(body.jobId).toBeDefined();
        expect(status).toBe(200);

        await poll(
            () => Job.findById(body.jobId),
            (job: TJob) => !job.lastRunAt,
            1000,
        );

        const job = await Job.findById(body.jobId);
        expect(job.lastRunAt).toBeDefined();
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
