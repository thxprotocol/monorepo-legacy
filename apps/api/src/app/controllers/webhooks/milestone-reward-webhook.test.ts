import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import { dashboardAccessToken, userWalletAddress2, widgetAccessToken } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';

const user = request.agent(app);

describe('Milestone Rewards', () => {
    let poolId: string, milestoneReward: any, claim: any;

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

    it('POST /milestone-rewards', (done) => {
        user.post('/v1/milestone-rewards/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title: 'Expiration date is next 30 min',
                description: 'Lorem ipsum dolor sit amet',
                amount: 100,
                limit: 0,
            })
            .expect((res: request.Response) => {
                expect(res.body.uuid).toBeDefined();
                expect(res.body.amount).toBe(100);
                milestoneReward = res.body;
            })
            .expect(201, done);
    });

    it('POST /webhook/milestone/:token/claim', (done) => {
        user.post(`/v1/webhook/milestone/${milestoneReward.uuid}/claim`)
            .send({
                address: userWalletAddress2,
            })
            .expect((res: request.Response) => {
                expect(res.body.milestoneRewardId).toBe(milestoneReward._id);
                expect(res.body.uuid).toBeDefined();
                claim = res.body;
            })
            .expect(201, done);
    });

    it('POST /milestones/claims/:uuid/collect', (done) => {
        user.post(`/v1/rewards/milestones/claims/${claim.uuid}/collect`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .send({
                address: userWalletAddress2,
            })
            .expect((res: request.Response) => {
                expect(res.body.isClaimed).toBe(true);
            })
            .expect(201, done);
    });
});
