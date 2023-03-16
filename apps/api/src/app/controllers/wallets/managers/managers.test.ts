import request from 'supertest';
import app from '@thxnetwork/api/';
import { walletAccessToken, sub2, userWalletAddress2 } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ChainId } from '@thxnetwork/types/enums';
const user = request.agent(app);

describe('WalletManagers', () => {
    let walletId: string;
    let walletManagerId: string;

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

    describe('POST /wallets/:id/managers/', () => {
        it('HTTP 204', (done) => {
            user.post(`/v1/wallets/${walletId}/managers`)
                .set({ Authorization: walletAccessToken })
                .send({
                    address: userWalletAddress2,
                })
                .expect((res: request.Response) => {
                    expect(res.body.walletId).toEqual(walletId);
                    expect(res.body.address).toEqual(userWalletAddress2);
                })
                .expect(201, done);
        });
    });

    describe('GET /wallets/:id/managers/', () => {
        it('HTTP 200 if OK', (done) => {
            user.get(`/v1/wallets/${walletId}/managers`)
                .set({ Authorization: walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.length).toEqual(1);
                    expect(res.body[0].walletId).toEqual(walletId);
                    expect(res.body[0].address).toEqual(userWalletAddress2);
                    walletManagerId = res.body[0]._id;
                })
                .expect(200, done);
        });
    });

    describe('DELETE /wallets/managers/:id', () => {
        it('HTTP 204 if OK', (done) => {
            user.delete(`/v1/wallets/managers/${walletManagerId}`)
                .set({ Authorization: walletAccessToken })
                .expect(204, done);
        });
    });

    describe('GET /wallets/:id/managers/', () => {
        it('HTTP 200 if OK', (done) => {
            user.get(`/v1/wallets/${walletId}/managers`)
                .set({ Authorization: walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.length).toEqual(0);
                })
                .expect(200, done);
        });
    });
});
