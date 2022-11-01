import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/api/types/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import {
    dashboardAccessToken,
    userWalletAddress2,
    userWalletPrivateKey2,
    walletAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { getContract } from '@thxnetwork/api/config/contracts';
import { Contract } from 'web3-eth-contract';
import { toWei } from 'web3-utils';
import { Account } from 'web3-core';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { createWallet } from '@thxnetwork/api/util/jest/network';
import { findEvent, parseLogs } from '@thxnetwork/api/util/events';

const user = request.agent(app);

describe('ERC20Transfer', () => {
    let poolId: string, testToken: Contract, sender: string, userWallet: Account;

    beforeAll(async () => {
        await beforeAllCallback();
        testToken = getContract(ChainId.Hardhat, 'LimitedSupplyToken');
        userWallet = createWallet(userWalletPrivateKey2);
    });

    afterAll(afterAllCallback);

    describe('POST /pools', () => {
        it('HTTP 201', (done) => {
            user.post('/v1/pools')
                .set({ Authorization: dashboardAccessToken })
                .send({
                    chainId: ChainId.Hardhat,
                    erc20tokens: [testToken.options.address],
                })
                .expect((res: request.Response) => {
                    poolId = res.body._id;
                    sender = res.body.sub;
                })
                .expect(201, done);
        });
    });

    describe('POST /erc20/transfer', () => {
        it('Increase user balance', async () => {
            const amount = toWei(String(1000));

            const receipt = await TransactionService.send(
                testToken.options.address,
                testToken.methods.transfer(userWallet.address, amount),
                ChainId.Hardhat,
            );

            const event = findEvent('Transfer', parseLogs(testToken.options.jsonInterface, receipt.logs));
            expect(await testToken.methods.balanceOf(userWallet.address).call()).toBe(amount);
            expect(event).toBeDefined();
        });

        it('HTTP 201', (done) => {
            user.post('/v1/erc20/transfer')
                .set({ Authorization: walletAccessToken })
                .send({
                    poolId,
                    erc20token: testToken.options.address,
                    sender: sender,
                    receiver: userWalletAddress2,
                    amount: '50',
                })
                .expect((res: request.Response) => {
                    console.log('BODY', res.body);
                    poolId = res.body._id;
                    expect(res.body.erc20).toEqual(testToken.options.address);
                    expect(res.body.from).toEqual(sender);
                    expect(res.body.to).toEqual(userWalletAddress2);
                    expect(res.body.poolId).toEqual(poolId);
                    expect(res.body.transactionId).toBeDefined();
                })
                .expect(201, done);
        });
    });
});
