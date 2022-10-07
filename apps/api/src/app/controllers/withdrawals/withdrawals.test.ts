import request from 'supertest';
import app from '@thxnetwork/api/app';
import { toWei, isAddress } from 'web3-utils';
import { ERC20Type, ChainId, WithdrawalState } from '@thxnetwork/api/types/enums';
import {
    adminAccessToken,
    dashboardAccessToken,
    rewardWithdrawAmount,
    sub2,
    tokenName,
    tokenSymbol,
    userWalletPrivateKey2,
    walletAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { Account } from 'web3-core';
import { createWallet } from '@thxnetwork/api/util/jest/network';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';

const user = request.agent(app);

describe('Propose Withdrawal', () => {
    let withdrawalDocumentId: number, tokenAddress: string, userWallet: Account, poolId: string;

    beforeAll(async () => {
        await beforeAllCallback();

        userWallet = createWallet(userWalletPrivateKey2);
    });

    afterAll(afterAllCallback);

    describe('POST /erc20', () => {
        it('HTTP 201 (success)', (done) => {
            user.post('/v1/erc20')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId: ChainId.Hardhat,
                    name: tokenName,
                    symbol: tokenSymbol,
                    type: ERC20Type.Unlimited,
                    totalSupply: 0,
                })
                .expect(({ body }: request.Response) => {
                    expect(isAddress(body.address)).toBe(true);
                    tokenAddress = body.address;
                })
                .expect(201, done);
        });
    });
    describe('POST /pools', () => {
        it('HTTP 201 (success)', (done) => {
            user.post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId: ChainId.Hardhat,
                    erc20tokens: [tokenAddress],
                })
                .expect((res: request.Response) => {
                    expect(isAddress(res.body.address)).toBe(true);
                    poolId = res.body._id;
                })
                .expect(201, done);
        });

        it('HTTP 200 (success)', (done) => {
            user.get('/v1/pools/' + poolId)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send()
                .expect((res: request.Response) => {
                    expect(isAddress(res.body.erc20.address)).toBe(true);
                })
                .expect(200, done);
        });

        it('HTTP 200 when member is added', (done) => {
            user.post('/v1/members/')
                .send({ address: userWallet.address })
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(200, done);
        });
    });

    describe('POST /withdrawals', () => {
        it('HTTP 201 after proposing a withdrawal', (done) => {
            user.post('/v1/withdrawals')
                .send({
                    member: userWallet.address,
                    amount: rewardWithdrawAmount,
                })
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(({ body }: request.Response) => {
                    expect(body._id).toBeDefined();
                    expect(body.sub).toEqual(sub2);
                    expect(body.amount).toEqual(rewardWithdrawAmount);
                    expect(body.state).toEqual(WithdrawalState.Withdrawn);
                    expect(body.createdAt).toBeDefined();
                    expect(body.unlockDate).not.toBe(undefined);

                    withdrawalDocumentId = body._id;
                })
                .expect(201, done);
        });
    });

    describe('DELETE /withdrawals/:id', () => {
        it('HTTP 204', (done) => {
            user.delete('/v1/withdrawals/' + withdrawalDocumentId)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect(204, done);
        });
    });

    describe('GET /pools/:id (totalSupply)', () => {
        it('HTTP 200 state OK', (done) => {
            user.get('/v1/pools/' + poolId)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.erc20.poolBalance).toBe('0');
                    expect(res.body.erc20.name).toBe(tokenName);
                    expect(res.body.erc20.symbol).toBe(tokenSymbol);
                    expect(res.body.erc20.totalSupply).toBe(toWei('1025')); // 1000 token reward + 25 protocol fee
                })
                .expect(200, done);
        });
    });
});
