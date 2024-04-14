import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/common/enums';
import { isAddress } from 'web3-utils';
import { timeTravel } from '@thxnetwork/api/util/jest/network';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { getProvider } from '@thxnetwork/api/util/network';
import { poll } from '@thxnetwork/api/util/polling';

const user = request.agent(app);

describe('Default Pool', () => {
    let poolId: string, safe: { address: string };

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    describe('POST /pools', () => {
        it('HTTP 201 (success)', async () => {
            const { body, status } = await user
                .post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({ title: 'My Pool', chainId: ChainId.Hardhat });
            expect(status).toBe(201);
            poolId = body._id;
            expect(body.safe.address).toBeDefined();
            safe = body.safe;
            expect(body.settings.title).toBe('My Pool');
        });

        it('HTTP 200 (multisig deployed)', async () => {
            // Wait for campaign safe to be deployed
            const { web3 } = getProvider(ChainId.Hardhat);
            await poll(
                () => web3.eth.getCode(safe.address),
                (data: string) => data === '0x',
                1000,
            );

            await user
                .get(`/v1/pools/${poolId}`)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect((res: request.Response) => {
                    expect(isAddress(res.body.safeAddress)).toBe(true);
                })
                .expect(200);
        });
    });

    // describe('GET /pools/:id (post trial)', () => {
    //     it('HTTP 403 after 2 weeks', async () => {
    //         // Skip 2 weeks
    //         await timeTravel(60 * 60 * 24 * 14);

    //         await user
    //             .get('/v1/pools/' + poolId)
    //             .set({ Authorization: dashboardAccessToken })
    //             .expect(403);
    //     });
    // });

    describe('PATCH /pools/:id', () => {
        it('HTTP 200', (done) => {
            user.patch('/v1/pools/' + poolId)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    settings: {
                        title: 'My Pool 2',
                        isArchived: true,
                    },
                })
                .expect(({ body }: request.Response) => {
                    expect(body.settings.title).toBe('My Pool 2');
                    expect(body.settings.isArchived).toBe(true);
                })
                .expect(200, done);
        });
    });

    describe('DELETE /pools/:id', () => {
        it('HTTP 204', (done) => {
            user.delete('/v1/pools/' + poolId)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect(204, done);
        });
    });
});
