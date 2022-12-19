import request from 'supertest';
import app from '@thxnetwork/api/';
import {
    account2,
    adminAccessToken,
    dashboardAccessToken,
    userEmail2,
    userPassword2,
    walletAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { Contract } from 'web3-eth-contract';
import { ChainId } from '@thxnetwork/api/types/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { getContract } from '@thxnetwork/api/config/contracts';

const user = request.agent(app);

describe('Account', () => {
    let poolId: string, testToken: Contract, membershipID: string, userWalletAddress: string;

    beforeAll(async () => {
        await beforeAllCallback();

        testToken = getContract(ChainId.Hardhat, 'LimitedSupplyToken');
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

    describe('POST /account', () => {
        it('HTTP 201', (done) => {
            user.post('/v1/account')
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .send({
                    email: userEmail2,
                    password: userPassword2,
                })
                .expect((res: request.Response) => {
                    expect(res.body.sub).toBe(account2.sub);
                    expect(res.body.address).toBe(account2.address);

                    userWalletAddress = res.body.address;
                })
                .expect(201, done);
        });
    });

    describe('POST /members/:address', () => {
        it('HTTP 200 if OK', (done) => {
            user.post('/v1/members/')
                .send({ address: userWalletAddress })
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(200, done);
        });
    });

    describe('GET /members/:address', () => {
        it('HTTP 200 if OK', (done) => {
            user.get('/v1/members/' + userWalletAddress)
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(200, done);
        });
    });

    // describe('POST /gas_station/upgrade_address', () => {
    //     it('HTTP 200 if OK', (done) => {
    //         const nonce = '',
    //             call = '',
    //             sig = '';

    //         user.post('/v1/gas_station/upgrade_address')
    //             .set({ 'X-PoolId': poolId, Authorization: walletAccessToken })
    //             .send({
    //                 newAddress: '',
    //                 nonce,
    //                 call,
    //                 sig,
    //             })
    //             .expect(200, done);
    //     });
    // });

    describe('GET /account/', () => {
        it('HTTP 200 if OK', (done) => {
            user.get('/v1/account/')
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.address).toBe(account2.address);
                })
                .expect(200, done);
        });
    });

    describe('PATCH /account/', () => {
        it('HTTP 200 if OK', (done) => {
            user.patch('/v1/account/')
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .send({ address: account2.address })
                .expect(303, done);
        });
    });

    describe('GET /memberships/', () => {
        it('HTTP 200 if OK', (done) => {
            user.get('/v1/memberships/')
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect((res: request.Response) => {
                    membershipID = res.body[0]._id;
                })
                .expect(200, done);
        });
    });

    describe('GET /memberships/:id', () => {
        it('HTTP 200 if OK', (done) => {
            user.get('/v1/memberships/' + membershipID)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body._id).toBe(membershipID);
                    expect(res.body.poolId).toBe(poolId);
                    expect(res.body.chainId).toBe(ChainId.Hardhat);
                    expect(res.body.erc20Id).toBeDefined();
                })
                .expect(200, done);
        });
    });
});
