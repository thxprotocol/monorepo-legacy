import request from 'supertest';
import app from '@thxnetwork/api/';
import { account, widgetAccessToken } from '@thxnetwork/api/util/jest/constants';
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
                .set({ Authorization: widgetAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.sub).toBe(account.sub);
                })
                .expect(200, done);
        });
    });
});
