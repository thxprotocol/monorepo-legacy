import request from 'supertest';
import app from '@thxnetwork/api/';
import { account2, walletAccessToken } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';

const user = request.agent(app);

describe('Account', () => {
    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    describe('GET /account/', () => {
        it('HTTP 200 if OK', (done) => {
            user.get('/v1/account/')
                .set({ Authorization: walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.address).toBe(account2.address);
                })
                .expect(200, done);
        });
    });

    describe('PATCH /account/', () => {
        it('HTTP 200 if OK', (done) => {
            user.patch('/v1/account/')
                .set({ Authorization: walletAccessToken })
                .send({ address: account2.address })
                .expect(303, done);
        });
    });
});
