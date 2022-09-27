import request from 'supertest';
import app from '@thxnetwork/api/app';
import { createWallet, voter } from '@thxnetwork/api/util/jest/network';
import { adminAccessToken, dashboardAccessToken, userWalletPrivateKey2 } from '@thxnetwork/api/util/jest/constants';
import { Contract } from 'web3-eth-contract';
import { Account } from 'web3-core';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { getContract } from '@thxnetwork/api/config/contracts';
import { ChainId } from '@thxnetwork/api/types/enums';

const user = request.agent(app);

describe('Members', () => {
    let poolId: string, testToken: Contract, userWallet: Account;

    beforeAll(async () => {
        await beforeAllCallback();

        testToken = getContract(ChainId.Hardhat, 'LimitedSupplyToken');
        userWallet = createWallet(userWalletPrivateKey2);
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

    describe('GET /members/:address', () => {
        it('HTTP 404 if not found', (done) => {
            user.get('/v1/members/' + voter.address)
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(404, done);
        });
    });

    describe('POST /members/:address', () => {
        it('HTTP 200 if OK', (done) => {
            user.post('/v1/members/')
                .send({ address: userWallet.address })
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(200, done);
        });
    });

    describe('GET /members/:address (after added)', () => {
        it('HTTP 200 if OK', (done) => {
            user.get('/v1/members/' + userWallet.address)
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(200, done);
        });
    });

    describe('GET /members', () => {
        it('HTTP 200 if OK', (done) => {
            user.get('/v1/members?page=1&limit=10')
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.results.length).toEqual(1);
                    expect(res.body.results[0].address).toBe(userWallet.address);
                })
                .expect(200, done);
        });
    });

    describe('DELETE /members/:address', () => {
        it('HTTP 200 if OK', (done) => {
            user.delete('/v1/members/' + userWallet.address)
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(204, done);
        });
    });

    describe('GET /members/:address (after DELETE)', () => {
        it('HTTP 404 if not found', (done) => {
            user.get('/v1/members/' + userWallet.address)
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(404, done);
        });
    });

    describe('GET /members (after DELETE)', () => {
        it('HTTP 200 if OK', (done) => {
            user.get('/v1/members?page=1&limit=10')
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.results.length).toEqual(0);
                })
                .expect(200, done);
        });
    });
});
