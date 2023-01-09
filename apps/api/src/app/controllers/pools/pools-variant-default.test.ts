import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/api/types/enums';
import { Account } from 'web3-core';
import { toWei, isAddress } from 'web3-utils';
import { createWallet } from '@thxnetwork/api/util/jest/network';
import {
    rewardWithdrawAmount,
    userWalletPrivateKey2,
    tokenName,
    tokenSymbol,
    tokenTotalSupply,
    dashboardAccessToken,
    walletAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { getByteCodeForContractName, getContract } from '@thxnetwork/api/config/contracts';
import { currentVersion } from '@thxnetwork/contracts/exports';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { ClaimDocument } from '@thxnetwork/api/types/TClaim';
import { ERC20PerkDocument } from '@thxnetwork/api/models/ERC20Perk';
import { addMinutes } from '@thxnetwork/api/util/rewards';
import { Contract } from 'web3-eth-contract';

const user = request.agent(app);

describe('Default Pool', () => {
    const title = 'Welcome Package';

    let poolAddress: string,
        erc20Id: string,
        userWallet: Account,
        poolId: string,
        tokenContract: Contract,
        reward: ERC20PerkDocument,
        claim: ClaimDocument;

    beforeAll(async () => {
        await beforeAllCallback();

        userWallet = createWallet(userWalletPrivateKey2);
    });

    afterAll(afterAllCallback);

    describe('Existing ERC20 contract', () => {
        it('TokenDeployed event', async () => {
            const { options } = getContract(ChainId.Hardhat, 'LimitedSupplyToken', currentVersion);
            tokenContract = await TransactionService.deploy(
                options.jsonInterface,
                getByteCodeForContractName('LimitedSupplyToken'),
                [tokenName, tokenSymbol, userWallet.address, tokenTotalSupply],
                ChainId.Hardhat,
            );
        });
        it('import token', (done) => {
            user.post('/v1/erc20/token')
                .set('Authorization', dashboardAccessToken)
                .send({
                    address: tokenContract.options.address,
                    chainId: ChainId.Hardhat,
                })
                .expect(({ body }: request.Response) => {
                    erc20Id = body._id;
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
                })
                .expect((res: request.Response) => {
                    poolId = res.body._id;
                    expect(res.body.archived).toBe(false);
                })
                .expect(201, done);
        });

        it('HTTP 200 (success)', (done) => {
            user.get(`/v1/pools/${poolId}`)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect((res: request.Response) => {
                    expect(isAddress(res.body.address)).toBe(true);
                    poolAddress = res.body.address;
                })
                .expect(200, done);
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

    describe('POST /erc20-perks/', () => {
        it('HTTP 302 when reward is added', (done) => {
            const expiryDate = addMinutes(new Date(), 30);
            user.post('/v1/erc20-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    title,
                    description: 'Lorem ipsum dolor sit amet',
                    amount: rewardWithdrawAmount,
                    platform: 0,
                    erc20Id,
                    expiryDate,
                    rewardLimit: 1,
                    claimAmount: 1,
                })
                .expect(async (res: request.Response) => {
                    expect(res.body._id).toBeDefined();
                    expect(res.body.claims[0].uuid).toBeDefined();
                    claim = res.body.claims[0];
                    reward = res.body;
                })
                .expect(201, done);
        });
    });

    describe('GET /erc20-perks/:id', () => {
        it('HTTP 200 when successful', (done) => {
            user.get('/v1/erc20-perks/' + reward._id)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect(200, done);
        });

        it('HTTP 404 if reward can not be found', (done) => {
            user.get('/v1/erc20-perks/62cf04437dff7cbc49e0c687')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect(404, done);
        });
    });

    describe('GET /erc20-perks/:id (after finalizing)', () => {
        it('HTTP 200 and return updated withdrawAmount and state 1', (done) => {
            user.get('/v1/erc20-perks/' + reward._id)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect(async (res: request.Response) => {
                    expect(res.body.title).toEqual(title);
                    expect(res.body.amount).toEqual(rewardWithdrawAmount);
                    expect(res.body.claims).toBeDefined();
                })
                .expect(200, done);
        });
    });

    describe('POST /erc20-perks/:id/collect', () => {
        it('HTTP 302 when tx is handled', async () => {
            await user
                .post(`/v1/claims/${claim.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect(200);
        });
    });

    describe('GET /pools/:address (after withdraw)', () => {
        it('Check pool balance', async () => {
            const balanceInWei = await tokenContract.methods.balanceOf(poolAddress).call();
            // Total supply - 1000 withdrawal - 2.5% = 25 withdraw fee
            expect(balanceInWei).toEqual(toWei('99998975'));
        });
    });

    describe('PATCH /pools/:id', () => {
        it('HTTP 200', (done) => {
            user.patch('/v1/pools/' + poolId)
                .set({ Authorization: dashboardAccessToken })
                .send({
                    archived: true,
                })
                .expect(({ body }: request.Response) => {
                    expect(body.archived).toBe(true);
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
