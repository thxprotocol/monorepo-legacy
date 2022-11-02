import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/api/types/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import {
    dashboardAccessToken,
    MaxUint256,
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
import Web3 from 'web3';
import { HARDHAT_RPC, PRIVATE_KEY } from '@thxnetwork/api/config/secrets';
import { getProvider } from '@thxnetwork/api/util/network';

const user = request.agent(app);

describe('ERC20Transfer', () => {
    let testToken: Contract, userWallet: Account, admin: Account;

    beforeAll(async () => {
        await beforeAllCallback();
        testToken = getContract(ChainId.Hardhat, 'LimitedSupplyToken');
        userWallet = createWallet(userWalletPrivateKey2);
        const { defaultAccount } = getProvider(ChainId.Hardhat);
        admin = { address: defaultAccount, privateKey: PRIVATE_KEY } as Account;
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
                .expect(201, done);
        });
    });

    describe('POST /erc20/transfer', () => {
        it('Increase user balance', async () => {
            const amount = toWei(String(100000));

            const receipt = await TransactionService.send(
                testToken.options.address,
                testToken.methods.transfer(userWallet.address, amount),
                ChainId.Hardhat,
            );

            const event = findEvent('Transfer', parseLogs(testToken.options.jsonInterface, receipt.logs));
            expect(event).toBeDefined();
        });

        it('Approve relayed transfer by pool', async () => {
            const web3 = new Web3(HARDHAT_RPC);

            const { methods } = new web3.eth.Contract(testToken.options.jsonInterface, testToken.options.address, {
                from: userWallet.address,
            });

            const receipt = await methods.approve(admin.address, MaxUint256).send({ from: userWallet.address });
            expect(receipt.events['Approval']).toBeDefined();
        });

        it('HTTP 201', (done) => {
            user.post('/v1/erc20/transfer')
                .set({ Authorization: walletAccessToken })
                .send({
                    erc20: testToken.options.address,
                    from: userWallet.address,
                    to: userWalletAddress2,
                    amount: '50',
                    chainId: ChainId.Hardhat,
                })
                .expect((res: request.Response) => {
                    expect(res.body.erc20).toEqual(testToken.options.address);
                    expect(res.body.from).toEqual(userWallet.address);
                    expect(res.body.to).toEqual(userWalletAddress2);
                    expect(res.body.chainId).toEqual(ChainId.Hardhat);
                    expect(res.body.transactionId).toBeDefined();
                })
                .expect(201, done);
        });
    });
});
