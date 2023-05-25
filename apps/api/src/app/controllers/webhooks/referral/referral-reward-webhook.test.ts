import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import { dashboardAccessToken, widgetAccessToken2, sub2 } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';

const user = request.agent(app);

describe('Referral Rewards', () => {
    let poolId: string, referralRewardId: string, token: string;

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

    it('POST /referral-rewards', (done) => {
        const successUrl = 'http://www.google.com';
        user.post('/v1/referral-rewards/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title: 'Expiration date is next 30 min',
                description: 'Lorem ipsum dolor sit amet',
                amount: 100,
                successUrl,
            })
            .expect((res: request.Response) => {
                expect(res.body.uuid).toBeDefined();
                expect(res.body.token).toBeDefined();
                expect(res.body.successUrl).toBe(successUrl);
                expect(res.body.amount).toBe(100);
                referralRewardId = res.body._id;
                token = res.body.token;
            })
            .expect(201, done);
    });

    it('POST /referral/:token/qualify', (done) => {
        const code = Buffer.from(JSON.stringify({ sub: sub2 })).toString('base64');
        user.post(`/v1/webhook/referral/${token}/qualify`)
            .send({ code })
            .expect((res: request.Response) => {
                expect(res.body.referralRewardId).toBe(referralRewardId);
                expect(res.body.uuid).toBeDefined();
                expect(res.body.sub).toBe(sub2);
            })
            .expect(201, done);
    });

    it('GET /point_balance', (done) => {
        user.get(`/v1/point-balances`)

            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken2 })
            .send()
            .expect((res: request.Response) => {
                expect(Number(res.body.balance)).toBe(100);
            })
            .expect(200, done);
    });
});
