import app from '@thxnetwork/api/app';
import request, { Response } from 'supertest';
import { Account } from 'web3-core';
import { isAddress, toWei, fromWei } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ChainId, ERC20Type } from '@thxnetwork/api/types/enums';
import { createWallet } from '@thxnetwork/api/util/jest/network';
import { findEvent, parseLogs } from '@thxnetwork/api/util/events';
import {
    adminAccessToken,
    dashboardAccessToken,
    MaxUint256,
    tokenName,
    tokenSymbol,
    userWalletPrivateKey2,
    walletAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { AmountExceedsAllowanceError, InsufficientBalanceError } from '@thxnetwork/api/util/errors';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { getContractFromName } from '@thxnetwork/api/config/contracts';
import { getProvider } from '@thxnetwork/api/util/network';
import { BigNumber } from 'ethers';
import { PromotionDocument } from '@thxnetwork/api/models/Promotion';

const http = request.agent(app);

describe('Deposits', () => {
    let poolId: string,
        poolAddress: string,
        promotion: PromotionDocument,
        userWallet: Account,
        tokenAddress: string,
        testToken: Contract;

    const value = 'XX78WEJ1219WZ';
    const price = 10;
    const title = 'The promocode title shown in wallet';
    const description = 'Longer form for a description of the usage';

    afterAll(afterAllCallback);

    beforeAll(async () => {
        await beforeAllCallback();

        userWallet = createWallet(userWalletPrivateKey2);
    });

    it('Create token', (done) => {
        http.post('/v1/erc20')
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
                testToken = getContractFromName(ChainId.Hardhat, 'LimitedSupplyToken', tokenAddress);
            })
            .expect(201, done);
    });

    it('Create pool', (done) => {
        http.post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
                erc20tokens: [tokenAddress],
            })
            .expect((res: request.Response) => {
                expect(isAddress(res.body.address)).toBe(true);
                poolId = res.body._id;
                poolAddress = res.body.address;
            })
            .expect(201, done);
    });

    it('Add member', (done) => {
        http.post('/v1/members')
            .set({ 'Authorization': adminAccessToken, 'X-PoolId': poolId })
            .send({
                address: userWallet.address,
            })
            .expect(200, done);
    });

    it('Create promo code', (done) => {
        http.post('/v1/promotions')
            .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': poolId })
            .send({
                price,
                value,
                title,
                description,
            })
            .expect(({ body }: Response) => {
                expect(body._id).toBeDefined();
                expect(body.price).toEqual(price);
                expect(body.value).toEqual(value);
                expect(body.title).toEqual(title);
                expect(body.description).toEqual(description);
                promotion = body;
            })
            .expect(201, done);
    });

    describe('Create Deposit', () => {
        it('GET /promotions/:id', (done) => {
            http.get('/v1/promotions/' + promotion._id)
                .set({ 'Authorization': walletAccessToken, 'X-PoolId': poolId })
                .expect(({ body }: Response) => {
                    expect(body.id).toEqual(promotion._id);
                    expect(body.value).toEqual('');
                    expect(body.price).toEqual(price);
                    expect(body.title).toEqual(title);
                    expect(body.description).toEqual(description);
                })
                .expect(200, done);
        });

        it('POST /deposits 400 Bad Request', async () => {
            await http
                .post('/v1/deposits')
                .set({ 'Authorization': walletAccessToken, 'X-PoolId': poolId })
                .send({ item: promotion._id })
                .expect(({ body }: Response) => {
                    expect(body.error.message).toEqual(new InsufficientBalanceError().message);
                })
                .expect(400);
        });

        it('Increase user balance', async () => {
            const amount = toWei(String(price));
            const receipt = await TransactionService.send(
                testToken.options.address,
                testToken.methods.transfer(userWallet.address, amount),
                ChainId.Hardhat,
            );
            const event = findEvent('Transfer', parseLogs(testToken.options.jsonInterface, receipt.logs));
            expect(await testToken.methods.balanceOf(userWallet.address).call()).toBe(amount);
            // expect(tx.state).toBe(TransactionState.Mined);
            expect(event).toBeDefined();
        });

        it('POST /deposits 400 Bad Request', async () => {
            await http
                .post('/v1/deposits')
                .set({ 'Authorization': walletAccessToken, 'X-PoolId': poolId })
                .send({ item: promotion._id })
                .expect(({ body }: Response) => {
                    expect(body.error.message).toEqual(new AmountExceedsAllowanceError().message);
                })
                .expect(400);
        });

        it('Approve for infinite amount', async () => {
            const tx = await testToken.methods.approve(poolAddress, MaxUint256).send({ from: userWallet.address });
            const event: any = Object.values(tx.events).filter((e: any) => e.event === 'Approval')[0];
            expect(event.returnValues.owner).toEqual(userWallet.address);
            expect(event.returnValues.spender).toEqual(poolAddress);
            expect(event.returnValues.value).toEqual(String(MaxUint256));
        });

        it('POST /deposits 200 OK', async () => {
            await http
                .post('/v1/deposits')
                .set({ 'Authorization': walletAccessToken, 'X-PoolId': poolId })
                .send({ item: promotion._id })
                .expect(200);
        });

        it('GET /promotions/:id', (done) => {
            http.get('/v1/promotions/' + promotion._id)
                .set({ 'Authorization': walletAccessToken, 'X-PoolId': poolId })
                .expect(({ body }: Response) => {
                    expect(body.value).toEqual(value);
                })
                .expect(200, done);
        });
    });

    describe('Create Asset Pool Deposit', () => {
        const { defaultAccount } = getProvider(ChainId.Hardhat);
        const totalSupply = fromWei('200000000000000000000', 'ether'); // 200 eth

        it('Create token', (done) => {
            http.post('/v1/erc20')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId: ChainId.Hardhat,
                    name: 'LIMITED SUPPLY TOKEN',
                    symbol: 'LIM',
                    type: ERC20Type.Limited,
                    totalSupply: totalSupply,
                })
                .expect(async ({ body }: request.Response) => {
                    expect(isAddress(body.address)).toBe(true);
                    tokenAddress = body.address;
                    testToken = getContractFromName(ChainId.Hardhat, 'LimitedSupplyToken', tokenAddress);
                    const adminBalance: BigNumber = await testToken.methods.balanceOf(defaultAccount).call();
                    expect(fromWei(String(adminBalance), 'ether')).toBe(totalSupply);
                })
                .expect(201, done);
        });

        it('Create pool', (done) => {
            http.post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId: ChainId.Hardhat,
                    erc20tokens: [tokenAddress],
                })
                .expect(async (res: request.Response) => {
                    expect(isAddress(res.body.address)).toBe(true);
                    poolAddress = res.body.address;
                    poolId = res.body._id;
                    const adminBalance: BigNumber = await testToken.methods.balanceOf(defaultAccount).call();
                    const poolBalance: BigNumber = await testToken.methods.balanceOf(poolAddress).call();
                    expect(String(poolBalance)).toBe('0');
                    expect(fromWei(String(adminBalance), 'ether')).toBe(totalSupply);
                })
                .expect(201, done);
        });

        it('POST /deposits/admin/ 200 OK', (done) => {
            const amount = fromWei('100000000000000000000', 'ether'); // 100 eth
            http.post(`/v1/pools/${poolId}/topup`)
                .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': poolId })
                .send({ amount })
                .expect(async () => {
                    const adminBalance: BigNumber = await testToken.methods.balanceOf(defaultAccount).call();
                    const poolBalance: BigNumber = await testToken.methods.balanceOf(poolAddress).call();
                    expect(String(poolBalance)).toBe('100000000000000000000'); // 100 eth - protocol fee = 97.5 eth
                    expect(String(adminBalance)).toBe('100000000000000000000'); // 100 eth
                })
                .expect(200, done);
        });
    });
});
