import request from 'supertest';
import app from '@thxnetwork/api/';
import { v4 } from 'uuid';
import { QuestVariant } from '@thxnetwork/common/enums';
import { dashboardAccessToken, userWalletAddress2, widgetAccessToken2 } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { PoolDocument, QuestCustom } from '@thxnetwork/api/models';

const user = request.agent(app);

describe('Quests Custom ', () => {
    let pool: PoolDocument, customQuest: TQuestCustom;
    const eventName = v4();

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send()
            .expect((res: request.Response) => {
                expect(isAddress(res.body.safeAddress)).toBe(true);
                pool = res.body;
            })
            .expect(201, done);
    });

    it('POST /pools/:id/quests', (done) => {
        user.post(`/v1/pools/${pool._id}/quests/${QuestVariant.Custom}`)
            .set({ Authorization: dashboardAccessToken })
            .send({
                variant: QuestVariant.Custom,
                title: 'Expiration date is next 30 min',
                description: 'Lorem ipsum dolor sit amet',
                amount: 100,
                limit: 1,
                index: 0,
                eventName,
            })
            .expect(async (res: request.Response) => {
                expect(res.body.uuid).toBeDefined();
                expect(res.body.amount).toBe(100);
                customQuest = res.body;
                await QuestCustom.findByIdAndUpdate(customQuest._id, { eventName: customQuest.uuid });
            })
            .expect(201, done);
    });

    describe('Qualify (to be deprecated)', () => {
        it('POST /webhook/milestone/:token/claim', (done) => {
            user.post(`/v1/webhook/milestone/${customQuest.uuid}/claim`)
                .send({
                    address: userWalletAddress2,
                })
                .expect(201, done);
        });

        it('POST /webhook/milestone/:token/claim second time should also succeed', (done) => {
            user.post(`/v1/webhook/milestone/${customQuest.uuid}/claim`)
                .send({
                    address: userWalletAddress2,
                })
                .expect(201, done);
        });
    });

    describe('Collect', () => {
        it('GET /account to update identity', (done) => {
            user.get(`/v1/account`)
                .set({ 'X-PoolId': pool._id, 'Authorization': widgetAccessToken2 })
                .expect(200, done);
        });

        it('POST /quests/custom/:id/entries', async () => {
            const { status } = await user
                .post(`/v1/quests/custom/${customQuest._id}/entries`)
                .set({ 'X-PoolId': pool._id, 'Authorization': widgetAccessToken2 })
                .send({ recaptcha: 'test' });
            expect(status).toBe(200);
        });
    });
});
