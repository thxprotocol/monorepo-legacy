import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import {
    dashboardAccessToken,
    userWalletAddress2,
    widgetAccessToken,
    widgetAccessToken2,
} from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { v4 } from 'uuid';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';

const user = request.agent(app);

describe('Milestone Rewards', () => {
    let pool: AssetPoolDocument, milestoneReward: any, claim: any;
    const eventName = v4();

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
                pool = res.body;
            })
            .expect(201, done);
    });

    it('POST /milestone-rewards', (done) => {
        user.post('/v1/milestone-rewards/')
            .set({ 'X-PoolId': pool._id, 'Authorization': dashboardAccessToken })
            .send({
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
                milestoneReward = res.body;
                await MilestoneReward.findByIdAndUpdate(milestoneReward._id, { eventName: milestoneReward.uuid });
            })
            .expect(201, done);
    });

    describe('Qualify and Claim', () => {
        it('POST /webhook/milestone/:token/claim', (done) => {
            user.post(`/v1/webhook/milestone/${milestoneReward.uuid}/claim`)
                .send({
                    address: userWalletAddress2,
                })
                .expect(201, done);
        });

        it('POST /webhook/milestone/:token/claim second time should also succeed', (done) => {
            user.post(`/v1/webhook/milestone/${milestoneReward.uuid}/claim`)
                .send({
                    address: userWalletAddress2,
                })
                .expect(201, done);
        });

        it('GET /account to update identity', (done) => {
            user.get(`/v1/account`)
                .set({ 'X-PoolId': pool._id, 'Authorization': widgetAccessToken2 })
                .expect(200, done);
        });

        it('POST /quests/custom/claims/:uuid/collect', (done) => {
            user.post(`/v1/quests/custom/claims/${milestoneReward.uuid}/collect`)
                .set({ 'X-PoolId': pool._id, 'Authorization': widgetAccessToken2 })
                .send()
                .expect(201, done);
        });
    });
});
