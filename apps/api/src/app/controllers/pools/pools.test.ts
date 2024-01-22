import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import { Account } from 'web3-core';
import { isAddress } from 'web3-utils';
import { createWallet } from '@thxnetwork/api/util/jest/network';
import {
    userWalletPrivateKey2,
    tokenName,
    tokenSymbol,
    tokenTotalSupply,
    dashboardAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { getAbiForContractName, getByteCodeForContractName } from '@thxnetwork/api/services/ContractService';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { Contract } from 'web3-eth-contract';
import { getProvider } from '@thxnetwork/api/util/network';
import { poll } from '@thxnetwork/api/util/polling';
import { TWallet } from '@thxnetwork/common/lib/types/interfaces';

const user = request.agent(app);

describe('Default Pool', () => {
    let poolAddress: string, userWallet: Account, poolId: string, tokenContract: Contract, safe: TWallet;

    beforeAll(async () => {
        await beforeAllCallback();

        userWallet = createWallet(userWalletPrivateKey2);
        tokenContract = await TransactionService.deploy(
            getAbiForContractName('LimitedSupplyToken'),
            getByteCodeForContractName('LimitedSupplyToken'),
            [tokenName, tokenSymbol, userWallet.address, tokenTotalSupply],
            ChainId.Hardhat,
        );
    });

    afterAll(afterAllCallback);

    describe('POST /pools', () => {
        it('HTTP 201 (success)', (done) => {
            user.post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({
                    title: 'My Pool',
                })
                .expect((res: request.Response) => {
                    poolId = res.body._id;
                    expect(res.body.safe.address).toBeDefined();
                    safe = res.body.safe;
                    expect(res.body.settings.endDate).toBeDefined();
                    expect(res.body.settings.title).toBe('My Pool');
                    expect(res.body.settings.authenticationMethods).toBeDefined();
                    expect(res.body.settings.authenticationMethods.length).toBeGreaterThan(0);
                })
                .expect(201, done);
        });

        it('HTTP 200 (success)', async () => {
            // Wait for campaign safe to be deployed
            const { web3 } = getProvider(ChainId.Hardhat);
            await poll(
                () => web3.eth.getCode(safe.address),
                (data: string) => data === '0x',
                1000,
            );

            await user
                .get(`/v1/pools/${poolId}`)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect((res: request.Response) => {
                    expect(isAddress(res.body.safeAddress)).toBe(true);
                    poolAddress = res.body.safeAddress;
                })
                .expect(200);
        });
    });

    describe('Make deposit into pool', () => {
        it('Transfer erc20 to pool address', async () => {
            const tx = await tokenContract.methods
                .transfer(poolAddress, tokenTotalSupply)
                .send({ from: userWallet.address });

            const event: any = Object.values(tx.events).filter((e: any) => e.event === 'Transfer')[0];
            expect(event.returnValues.from).toEqual(userWallet.address);
            expect(event.returnValues.to).toEqual(poolAddress);
            expect(event.returnValues.value).toEqual(tokenTotalSupply);
        });

        it('Check pool balance', async () => {
            const balanceInWei = await tokenContract.methods.balanceOf(poolAddress).call();
            expect(tokenTotalSupply).toEqual(balanceInWei);
        });
    });

    describe('PATCH /pools/:id', () => {
        it('HTTP 200', (done) => {
            user.patch('/v1/pools/' + poolId)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    settings: {
                        title: 'My Pool 2',
                        isArchived: true,
                    },
                })
                .expect(({ body }: request.Response) => {
                    expect(body.settings.title).toBe('My Pool 2');
                    expect(body.settings.isArchived).toBe(true);
                })
                .expect(200, done);
        });
    });

    describe('DELETE /pools/:id', () => {
        it('HTTP 204', (done) => {
            user.delete('/v1/pools/' + poolId)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect(204, done);
        });
    });
});
