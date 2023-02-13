import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/api/types/enums';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { PoolTransferDocument } from '@thxnetwork/api/models/PoolTransfer';

const user = request.agent(app);

describe('Pool Transfer', () => {
    let pool: AssetPoolDocument, poolTransfer: PoolTransferDocument;

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
                    expect(res.body.title).toBe(title);
                    expect(res.body.archived).toBe(false);
                })
                .expect(201, done);
        });
    });

    describe('POST /pool-transfers', () => {
        it('HTTP 201 (success)', (done) => {
            user.post(`/v1/pool-transfers`)
                .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': pool._id })
                .send({
                    poolId: pool._id,
                })
                .expect((res: request.Response) => {
                    console.log(res);
                    poolTransfer = res.body;
                    expect(poolTransfer.token).toBeDefined();
                    expect(poolTransfer.sub).toBeDefined();
                    expect(poolTransfer.expiry).toBeDefined();
                })
                .expect(201, done);
        });
    });

    describe('POST /pools/:id/transfer', () => {
        it('HTTP 201 (success)', (done) => {
            user.post(`/v1/pool/${pool._id}/transfers`)
                .set('Authorization', dashboardAccessToken)
                .send({ token: poolTransfer.token })
                .expect(200, done);
        });
        // Check pool sub and access
        it('HTTP 201 (success)', (done) => {
            user.get(`/v1/pool/${pool._id}/transfers`)
                .set('Authorization', dashboardAccessToken)
                .expect(({ body }: Response) => {
                    console.log(body);
                    //
                })
                .expect(200, done);
        });
    });
});
