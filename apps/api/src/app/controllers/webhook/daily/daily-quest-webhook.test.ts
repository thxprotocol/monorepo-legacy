import request from 'supertest';
import app from '@thxnetwork/api/';
import { QuestVariant } from '@thxnetwork/common/enums';
import { account4, dashboardAccessToken, widgetAccessToken4 } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { QuestDailyDocument } from '@thxnetwork/api/models';
import { poll } from '@thxnetwork/api/util/polling';
import { Job } from '@thxnetwork/api/models/Job';
import { v4 } from 'uuid';

const user = request.agent(app);

describe('Daily Rewards WebHooks', () => {
    let poolId: string, dailyReward: QuestDailyDocument;
    const eventName = v4();

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
        user.post(`/v1/pools/${poolId}/quests/${QuestVariant.Daily}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                isPublished: true,
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
            })
            .expect(201, done);
    });

    it('POST /webhook/daily/:uuid', async () => {
        const { status } = await user.post(`/v1/webhook/daily/${eventName}`).send({
            address: account4.address,
        });
        expect(status).toBe(201);
    });

    it('GET /participant to update identity', async () => {
        const { status } = await user
            .get(`/v1/participants`)
            .query({ poolId })
            .set({ Authorization: widgetAccessToken4 });
        expect(status).toBe(200);
    });

    it('POST /quests/daily/:id/entries', async () => {
        const { status, body } = await user
            .post(`/v1/quests/daily/${dailyReward._id}/entries`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken4 })
            .send({ recaptcha: 'test' });
        expect(body.jobId).toBeDefined();
        expect(status).toBe(200);

        await poll(
            () => Job.findById(body.jobId),
            (job: any) => !job.lastRunAt,
            1000,
        );

        const job = await Job.findById(body.jobId);
        expect(job.lastRunAt).toBeDefined();
    });

    it('POST /quests/daily/:id/entries should throw an error', (done) => {
        user.post(`/v1/quests/daily/${dailyReward._id}/entries`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken4 })
            .send({ recaptcha: 'test' })
            .expect(({ body }: request.Response) => {
                expect(body.error).toBe('You have completed this quest within the last 24 hours.');
            })
            .expect(200, done);
    });
});
