import request, { Response } from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import { dashboardAccessToken, sub2, widgetAccessToken2 } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';

const user = request.agent(app);

describe('Pool Subscription', () => {
    let pool: AssetPoolDocument;

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    describe('POST /pools', () => {
        it('HTTP 201 (success)', (done) => {
            const title = 'My Test Pool';
            user.post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId: ChainId.Hardhat,
                    title,
                })
                .expect((res: request.Response) => {
                    pool = res.body;
                    expect(res.body.settings.title).toBe(title);
                    expect(res.body.settings.isArchived).toBe(false);
                })
                .expect(201, done);
        });
    });

    describe('POST /pools/:id/subscription', () => {
        it('HTTP 201 (Created)', async () => {
            await user
                .post(`/v1/pools/${pool._id}/subscription`)
                .set({ 'Authorization': widgetAccessToken2, 'X-PoolId': pool._id })
                .expect(({ body }: Response) => {
                    expect(body.poolId).toBe(pool._id);
                    expect(body.sub).toBe(sub2);
                })
                .expect(201);
        });
    });

    describe('GET /pools/:id/subscription', () => {
        it('HTTP 200', (done) => {
            user.get(`/v1/pools/${pool._id}/subscription`)
                .set({ 'Authorization': widgetAccessToken2, 'X-PoolId': pool._id })
                .expect(({ body }: Response) => {
                    expect(body.poolId).toBe(pool._id);
                    expect(body.sub).toBe(sub2);
                })
                .expect(200, done);
        });
    });

    describe('DELETE /pools/:id/subscription', () => {
        it('HTTP 200', (done) => {
            user.delete(`/v1/pools/${pool._id}/subscription`)
                .set({ 'Authorization': widgetAccessToken2, 'X-PoolId': pool._id })
                .expect(204, done);
        });
    });

    describe('GET /pools/:id/subscription', () => {
        it('HTTP 200', (done) => {
            user.get(`/v1/pools/${pool._id}/subscription`)
                .set({ 'Authorization': widgetAccessToken2, 'X-PoolId': pool._id })
                .expect(({ body }: Response) => {
                    expect(body).toBe(null);
                })
                .expect(200, done);
        });
    });
});
