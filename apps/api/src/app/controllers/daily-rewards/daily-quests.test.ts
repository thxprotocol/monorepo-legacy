import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import { dashboardAccessToken, widgetAccessToken } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { DailyRewardDocument } from '@thxnetwork/api/models/DailyReward';

const user = request.agent(app);

describe('Daily Rewards', () => {
    let poolId: string, dailyReward: DailyRewardDocument;

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
            })
            .expect((res: request.Response) => {
                expect(res.body.settings.isArchived).toBe(false);
                poolId = res.body._id;
            })
            .expect(201, done);
    });

    it('POST /daily-rewards', (done) => {
        const title = 'First Daily Reward';
        const description = 'description',
            amounts = [1500],
            infoLinks = [
                { label: 'Link 1', url: 'https://example1.com' },
                { label: 'Link 2', url: 'https://example2.com' },
            ],
            index = 0;

        user.post(`/v1/daily-rewards`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title,
                description,
                amounts: JSON.stringify(amounts),
                infoLinks: JSON.stringify(infoLinks),
                index,
            })
            .expect(({ body }: request.Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.title).toBe(title);
                expect(body.description).toBe(description);
                expect(body.infoLinks[0].url).toBe(infoLinks[0].url);
                expect(body.infoLinks[0].url).toBe(infoLinks[0].url);
                expect(body.infoLinks[1].label).toBe(infoLinks[1].label);
                expect(body.infoLinks[1].label).toBe(infoLinks[1].label);
                expect(body.amounts[0]).toBe(amounts[0]);
                dailyReward = body;
            })
            .expect(201, done);
    });

    it('GET /daily-rewards/:id', (done) => {
        user.get(`/v1/daily-rewards/${dailyReward._id}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(({ body }: request.Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.title).toBe(dailyReward.title);
                expect(body.description).toBe(dailyReward.description);
                expect(body.amounts[0]).toBe(dailyReward.amounts[0]);
            })
            .expect(200, done);
    });

    it('GET /daily-rewards/', (done) => {
        user.get(`/v1/daily-rewards`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(({ body }: request.Response) => {
                expect(body.results.length).toBe(1);
                expect(body.results[0].uuid).toBeDefined();
                expect(body.results[0].title).toBe(dailyReward.title);
                expect(body.results[0].description).toBe(dailyReward.description);
                expect(body.results[0].amounts[0]).toBe(dailyReward.amounts[0]);
                expect(body.total).toBe(1);
            })
            .expect(200, done);
    });

    it('PATCH /daily-rewards/:id', (done) => {
        const amounts = [2000],
            infoLinks = [
                { label: 'Link 2', url: 'https://example2.com' },
                { label: 'Link 2', url: 'https://example2.com' },
            ];
        user.patch(`/v1/daily-rewards/${dailyReward._id}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({ amounts: JSON.stringify(amounts), infoLinks: JSON.stringify(infoLinks) })
            .expect(({ body }: request.Response) => {
                expect(body.amounts[0]).toBe(amounts[0]);
                expect(body.infoLinks[0].url).toBe(infoLinks[0].url);
                expect(body.infoLinks[0].url).toBe(infoLinks[0].url);
                expect(body.infoLinks[1].label).toBe(infoLinks[1].label);
                expect(body.infoLinks[1].label).toBe(infoLinks[1].label);
                dailyReward = body;
            })
            .expect(200, done);
    });

    it('POST /quests/daily/:uuid/claim', (done) => {
        user.post(`/v1/quests/daily/${dailyReward._id}/claim`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .send()
            .expect(201, done);
    });

    it('GET /point-balances', (done) => {
        user.get(`/v1/point-balances`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .expect(({ body }: request.Response) => {
                expect(body.balance).toBe(dailyReward.amounts[0]);
            })
            .expect(200, done);
    });

    it('POST /quests/daily/:uuid/claim should throw an error', (done) => {
        user.post(`/v1/quests/daily/${dailyReward._id}/claim`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .send()
            .expect(({ body }: request.Response) => {
                expect(body.error).toBe('Already completed within the last 24 hours.');
            })
            .expect(200, done);
    });

    it('DELETE /daily-rewards/:id', (done) => {
        user.delete(`/v1/daily-rewards/${dailyReward._id}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(204, done);
    });
});
