import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, DailyRewardClaimState } from '@thxnetwork/types/enums';
import { dashboardAccessToken, sub2, widgetAccessToken2 } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { DailyRewardDocument } from '@thxnetwork/api/models/DailyReward';
import WalletService from '@thxnetwork/api/services/WalletService';

const user = request.agent(app);

describe('Daily Rewards WebHooks', () => {
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
                limit: 0,
                isEnabledWebhookQualification: true,
                index: 0,
            })
            .expect(({ body }: request.Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.amounts[0]).toBe(100);
                dailyReward = body;
            })
            .expect(201, done);
    });

    it('POST /webhook/daily/:token', async () => {
        const wallet = await WalletService.findPrimary(sub2, ChainId.Hardhat);
        const { body, status } = await user.post(`/v1/webhook/daily/${dailyReward.uuid}`).send({
            address: wallet.address,
        });
        expect(body.dailyRewardId).toBe(dailyReward._id);
        expect(body.uuid).toBeDefined();
        expect(body.state).toBe(DailyRewardClaimState.Pending);
        expect(status).toBe(201);
    });

    it('POST /quests/daily/:uuid/claim', (done) => {
        user.post(`/v1/quests/daily/${dailyReward._id}/claim`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken2 })
            .send()
            .expect(({ body }: request.Response) => {
                expect(body.state).toBe(DailyRewardClaimState.Claimed);
            })
            .expect(201, done);
    });

    it('POST /quests/daily/:uuid/claim should throw an error', (done) => {
        user.post(`/v1/quests/daily/${dailyReward._id}/claim`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken2 })
            .send()
            .expect(({ body }: request.Response) => {
                expect(body.error.message).toBe('This reward is not claimable yet');
            })
            .expect(403, done);
    });
});
