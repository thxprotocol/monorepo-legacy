import request from 'supertest';
import app from '@thxnetwork/api/';
import { walletAccessToken, sub2 } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ChainId } from '@thxnetwork/api/types/enums';
const user = request.agent(app);

describe('Wallets', () => {
    let walletId;
    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    describe('POST /wallets', () => {
        it('HTTP 201', (done) => {
            user.post('/v1/wallets')
                .set({ Authorization: walletAccessToken })
                .send({
                    chainId: ChainId.Hardhat,
                    sub: sub2,
                    forceSync: true,
                })
                .expect((res: request.Response) => {
                    expect(res.body.sub).toEqual(sub2);
                    expect(res.body.chainId).toEqual(ChainId.Hardhat);
                    expect(res.body.address).toBeDefined();
                    walletId = res.body._id;
                })
                .expect(201, done);
        });
    });

    describe('GET /wallets', () => {
        it('HTTP 200 if OK', (done) => {
            user.get(`/v1/wallets?chainId=${ChainId.Hardhat}&sub=${sub2}`)
                .set({ Authorization: walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.length).toEqual(1);
                    expect(res.body[0].sub).toEqual(sub2);
                    expect(res.body[0].chainId).toEqual(ChainId.Hardhat);
                    expect(res.body[0].address).toBeDefined();
                })
                .expect(200, done);
        });
    });

    describe('GET /wallets/:id', () => {
        it('HTTP 200 if OK', (done) => {
            user.get(`/v1/wallets/${walletId}`)
                .set({ Authorization: walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.sub).toEqual(sub2);
                    expect(res.body.chainId).toEqual(ChainId.Hardhat);
                    expect(res.body.address).toBeDefined();
                })
                .expect(200, done);
        });
    });
});
