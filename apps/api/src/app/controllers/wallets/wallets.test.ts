import request from 'supertest';
import app from '@thxnetwork/api/';
import { adminAccessToken, dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { Contract } from 'web3-eth-contract';
import { Account } from 'web3-core';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ChainId } from '@thxnetwork/api/types/enums';

const user = request.agent(app);

describe('Wallets', () => {
    let poolId: string, testToken: Contract, userWallet: Account;

    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    describe('POST /pools', () => {
        it('HTTP 200', (done) => {
            user.post('/v1/pools')
                .set({ Authorization: dashboardAccessToken })
                .send({
                    chainId: ChainId.Hardhat,
                    erc20tokens: [testToken.options.address],
                })
                .expect((res: request.Response) => {
                    poolId = res.body._id;
                })
                .expect(201, done);
        });
    });

    describe('POST /wallets', () => {
        it('HTTP 200', (done) => {
            user.post('/v1/wallets')
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .send({
                    chainId: ChainId.Hardhat,
                    erc20tokens: [testToken.options.address],
                })
                .expect((res: request.Response) => {
                    expect(res.body.poolId).toEqual(poolId);
                    expect(res.body.address).toBeDefined();
                })
                .expect(201, done);
        });
    });

    describe('GET /wallets', () => {
        it('HTTP 200 if OK', (done) => {
            user.get('/v1/wallets?page=1&limit=10')
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.results.length).toEqual(1);
                    expect(res.body.results[0].poolId).toEqual(poolId);
                    expect(res.body.results[0].address).toBeDefined();
                })
                .expect(200, done);
        });
    });
});
