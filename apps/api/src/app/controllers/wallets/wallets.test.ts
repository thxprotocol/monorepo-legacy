import request from 'supertest';
import app from '@thxnetwork/api/';
import { walletAccessToken, sub2 } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ChainId } from '@thxnetwork/api/types/enums';
const user = request.agent(app);

describe('Wallets', () => {
    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    describe('POST /wallets', () => {
        it('HTTP 204', (done) => {
            user.post('/v1/wallets')
                .set({ Authorization: walletAccessToken })
                .send({
                    chainId: ChainId.Hardhat,
                })
                .expect((res: request.Response) => {
                    expect(res.body.sub).toEqual(sub2);
                    expect(res.body.address).toBeDefined();
                })
                .expect(201, done);
        });
    });

    describe('GET /wallets', () => {
        it('HTTP 200 if OK', (done) => {
            user.get('/v1/wallets?page=1&limit=10')
                .set({ Authorization: walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.results.length).toEqual(1);
                    expect(res.body.results[0].sub).toEqual(sub2);
                    expect(res.body.results[0].address).toBeDefined();
                })
                .expect(200, done);
        });
    });
});
