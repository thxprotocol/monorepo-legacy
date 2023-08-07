import request from 'supertest';
import app from '@thxnetwork/api/';
import { widgetAccessToken, sub, widgetAccessToken2 } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ChainId } from '@thxnetwork/types/enums';
import { currentVersion } from '@thxnetwork/contracts/exports';

const user = request.agent(app);

describe('Wallets', () => {
    let walletId;

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    describe('GET /wallets', () => {
        it('HTTP 200 if OK', (done) => {
            user.get(`/v1/wallets?chainId=${ChainId.Hardhat}`)
                .set({ Authorization: widgetAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.length).toEqual(1);
                    expect(res.body[0].sub).toEqual(sub);
                    expect(res.body[0].chainId).toEqual(ChainId.Hardhat);
                    expect(res.body[0].address).toBeDefined();
                    expect(res.body[0].version).toBe(currentVersion);
                    walletId = res.body[0]._id;
                })
                .expect(200, done);
        });
    });

    describe('GET /wallets/:id', () => {
        it('HTTP 200 if OK', (done) => {
            user.get(`/v1/wallets/${walletId}`)
                .set({ Authorization: widgetAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.sub).toEqual(sub);
                    expect(res.body.chainId).toEqual(ChainId.Hardhat);
                    expect(res.body.address).toBeDefined();
                })
                .expect(200, done);
        });
    });

    describe('GET /wallets/:id', () => {
        it('HTTP 403 if OK', (done) => {
            user.get(`/v1/wallets/${walletId}`).set({ Authorization: widgetAccessToken2 }).expect(403, done);
        });
    });
});
