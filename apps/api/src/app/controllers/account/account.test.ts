import request from 'supertest';
import app from '@thxnetwork/api/';
import {
    account2,
    adminAccessToken,
    userEmail2,
    userPassword2,
    walletAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';

const user = request.agent(app);

describe('Account', () => {
    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    describe('POST /account', () => {
        it('HTTP 201', (done) => {
            user.post('/v1/account')
                .set({ Authorization: adminAccessToken })
                .send({
                    email: userEmail2,
                    password: userPassword2,
                })
                .expect((res: request.Response) => {
                    expect(res.body.sub).toBe(account2.sub);
                    expect(res.body.address).toBe(account2.address);
                })
                .expect(201, done);
        });
    });

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
